// src/services/offerService.ts
import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';

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
        // 1. Ak existuje predchádzajúca zamietnutá ponuka, odstránime ju, aby sme umožnili novú
        await supabase
            .from('job_offers')
            .delete()
            .eq('job_request_id', offer.job_request_id)
            .eq('craftsman_id', offer.craftsman_id)
            .eq('status', 'rejected');

        // 2. Vytvoriť novú ponuku
        const { data, error } = await supabase
            .from('job_offers')
            .insert({
                ...offer,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // Všetko ostatné v try-catch pre stabilitu UI
        try {
            const { data: job } = await supabase
                .from('job_requests')
                .select('*, client:profiles!client_id(*)')
                .eq('id', offer.job_request_id)
                .single();

            const { data: craftsman } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', offer.craftsman_id)
                .single();

            if (job && craftsman) {
                await notificationService.createNotification({
                    user_id: job.client_id,
                    type: 'offer',
                    title: 'Nová ponuka na vašu prácu',
                    message: `${craftsman.full_name} poslal ponuku na prácu "${job.title}" za ${offer.price}€`,
                    data: { job_id: offer.job_request_id, offer_id: data.id, craftsman_name: craftsman.full_name },
                    link: `/jobs/${offer.job_request_id}`
                });

                const [p1, p2] = [offer.craftsman_id, job.client_id].sort();
                let { data: conversation } = await supabase
                    .from('conversations')
                    .select('*')
                    .eq('participant_1', p1)
                    .eq('participant_2', p2)
                    .maybeSingle();

                if (!conversation) {
                    const { data: newConv } = await supabase
                        .from('conversations')
                        .insert({ participant_1: p1, participant_2: p2, last_message_at: new Date().toISOString() })
                        .select()
                        .single();
                    conversation = newConv;
                }

                if (conversation) {
                    await supabase
                        .from('messages')
                        .insert({
                            conversation_id: conversation.id,
                            sender_id: offer.craftsman_id,
                            content: `🎯 Poslal som ponuku na vašu prácu "${job.title}": ${offer.price}€, odhadovaný čas: ${offer.estimated_duration}\n\n📝 Správa: ${offer.message}`
                        });
                }
            }
        } catch (err) {
            console.error('Background tasks failed:', err);
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

        const { data, error } = await supabase
            .from('job_offers')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        if (status === 'accepted') {
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

            await supabase
                .from('job_requests')
                .update({ status: 'in_progress' })
                .eq('id', offer.job_request_id);

            await notificationService.createNotification({
                user_id: offer.craftsman_id,
                type: 'contract',
                title: 'Ponuka prijatá! 🎉',
                message: `Klient prijal vašu ponuku na prácu "${offer.job_request.title}". Môžete začať pracovať!`,
                data: { job_id: offer.job_request_id, offer_id: id },
                link: `/contracts`
            });

            await notificationService.createNotification({
                user_id: clientId || offer.job_request.client_id,
                type: 'contract',
                title: 'Zmluva vytvorená',
                message: `Prijali ste ponuku od ${offer.craftsman.full_name}. Zmluva bola vytvorená.`,
                data: { job_id: offer.job_request_id, craftsman_name: offer.craftsman.full_name },
                link: `/contracts`
            });

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
        else if (status === 'rejected') {
            try {
                await notificationService.createNotification({
                    user_id: offer.craftsman_id,
                    type: 'offer',
                    title: 'Ponuka zamietnutá',
                    message: `Klient zamietol vašu ponuku na prácu "${offer.job_request.title}"`,
                    data: { job_id: offer.job_request_id },
                    link: `/jobs/${offer.job_request_id}`
                });
            } catch (notifErr) {
                console.error('Error sending rejection notification:', notifErr);
            }
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