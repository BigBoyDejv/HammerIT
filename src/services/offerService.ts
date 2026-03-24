// src/services/offerService.ts
import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';
import { messageService } from './messageService';

export type Offer = {
    id: string;
    job_request_id: string;
    craftsman_id: string;
    price: number;
    estimated_duration: string | null;
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    craftsman?: {
        full_name: string;
        avatar_url: string | null;
        phone: string | null;
    };
};

export const offerService = {
    async createOffer(offer: Omit<Offer, 'id' | 'created_at'>): Promise<Offer> {
        const { data, error } = await supabase
            .from('job_offers')
            .insert({
                ...offer,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // 2. Získať informácie o práci a klientovi
        const { data: job } = await supabase
            .from('job_requests')
            .select('*, client:profiles!client_id(*)')
            .eq('id', offer.job_request_id)
            .single();

        // 3. Získať informácie o remeselníkovi
        const { data: craftsman } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', offer.craftsman_id)
            .single();

        // 4. Vytvoriť notifikáciu pre klienta
        await notificationService.createNotification({
            user_id: job.client_id,
            type: 'offer',
            title: 'Nová ponuka na vašu prácu',
            message: `${craftsman?.full_name} poslal ponuku na prácu "${job.title}" za ${offer.price}€`,
            link: `/jobs/${offer.job_request_id}`
        });

        // 5. Automaticky vytvoriť konverzáciu a poslať správu
        const [participant_1, participant_2] = [offer.craftsman_id, job.client_id].sort();

        let { data: conversation } = await supabase
            .from('conversations')
            .select('*')
            .eq('participant_1', participant_1)
            .eq('participant_2', participant_2)
            .maybeSingle();

        if (!conversation) {
            const { data: newConversation } = await supabase
                .from('conversations')
                .insert({ participant_1, participant_2, last_message_at: new Date().toISOString() })
                .select()
                .single();
            conversation = newConversation;
        }

        // Poslať automatickú správu
        if (conversation) {
            await supabase
                .from('messages')
                .insert({
                    conversation_id: conversation.id,
                    sender_id: offer.craftsman_id,
                    content: `🎯 Poslal som ponuku na vašu prácu "${job.title}": ${offer.price}€, odhadovaný čas: ${offer.estimated_duration}\n\n📝 Správa: ${offer.message}`
                });
        }

        return data;
    },

    async updateOfferStatus(id: string, status: 'pending' | 'accepted' | 'rejected', clientId?: string): Promise<Offer> {
        const { data: offer, error: fetchError } = await supabase
            .from('job_offers')
            .select('*, job_request:job_requests(*), craftsman:profiles!craftsman_id(*)')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // 2. Aktualizovať stav ponuky
        const { data, error } = await supabase
            .from('job_offers')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // 3. Ak je ponuka prijatá, vytvoriť kontrakt
        if (status === 'accepted') {
            // Vytvoriť kontrakt
            const { error: contractError } = await supabase
                .from('contracts')
                .insert({
                    job_request_id: offer.job_request_id,
                    craftsman_id: offer.craftsman_id,
                    client_id: clientId || offer.job_request.client_id,
                    final_price: offer.price,
                    status: 'active',
                    payment_status: 'pending',
                    started_at: new Date().toISOString()
                });

            if (contractError) throw contractError;

            // Aktualizovať stav práce
            await supabase
                .from('job_requests')
                .update({ status: 'in_progress' })
                .eq('id', offer.job_request_id);

            // Notifikácia pre remeselníka
            await notificationService.createNotification({
                user_id: offer.craftsman_id,
                type: 'contract',
                title: 'Ponuka prijatá! 🎉',
                message: `Klient prijal vašu ponuku na prácu "${offer.job_request.title}". Môžete začať pracovať!`,
                link: `/contracts`
            });

            // Notifikácia pre klienta
            await notificationService.createNotification({
                user_id: clientId || offer.job_request.client_id,
                type: 'contract',
                title: 'Zmluva vytvorená',
                message: `Prijali ste ponuku od ${offer.craftsman.full_name}. Zmluva bola vytvorená.`,
                link: `/contracts`
            });

            // Vytvoriť konverzáciu a poslať správu
            const [participant_1, participant_2] = [offer.craftsman_id, clientId || offer.job_request.client_id].sort();

            let { data: conversation } = await supabase
                .from('conversations')
                .select('*')
                .eq('participant_1', participant_1)
                .eq('participant_2', participant_2)
                .maybeSingle();

            if (!conversation) {
                const { data: newConversation } = await supabase
                    .from('conversations')
                    .insert({ participant_1, participant_2, last_message_at: new Date().toISOString() })
                    .select()
                    .single();
                conversation = newConversation;
            }

            if (conversation) {
                await supabase
                    .from('messages')
                    .insert({
                        conversation_id: conversation.id,
                        sender_id: clientId || offer.job_request.client_id,
                        content: `✅ Vaša ponuka na prácu "${offer.job_request.title}" bola PRIJATÁ! Môžete začať pracovať. Zmluva bola vytvorená.`
                    });
            }
        }
        // 4. Ak je ponuka zamietnutá
        else if (status === 'rejected') {
            await notificationService.createNotification({
                user_id: offer.craftsman_id,
                type: 'offer',
                title: 'Ponuka zamietnutá',
                message: `Klient zamietol vašu ponuku na prácu "${offer.job_request.title}"`,
                link: `/jobs/${offer.job_request_id}`
            });
        }

        return data;
    },

    async getOffersForJob(jobRequestId: string): Promise<Offer[]> {
        const { data, error } = await supabase
            .from('job_offers')
            .select(`
                *,
                craftsman:profiles!craftsman_id (
                    full_name,
                    avatar_url,
                    phone
                )
            `)
            .eq('job_request_id', jobRequestId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getMyOffers(craftsmanId: string): Promise<Offer[]> {
        const { data, error } = await supabase
            .from('job_offers')
            .select(`
                *,
                job:job_requests!job_offers_job_request_id_fkey(
                    id,
                    title,
                    description,
                    location,
                    category,
                    budget_min,
                    budget_max,
                    status,
                    client:profiles!job_requests_client_id_fkey(
                        full_name,
                        avatar_url
                    )
                )
            `)
            .eq('craftsman_id', craftsmanId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }




};