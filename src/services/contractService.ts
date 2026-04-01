import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { notificationService } from './notificationService';

type ContractInsert = Database['public']['Tables']['contracts']['Insert'];

export const contractService = {
    // Vytvoriť kontrakt z ponuky
    async createContractFromOffer(jobRequestId: string, offerId: string) {
        const { data: offer, error: offerError } = await supabase
            .from('job_offers')
            .select('*, job_request:job_requests(*)')
            .eq('id', offerId)
            .single();

        if (offerError) throw offerError;

        const contract: ContractInsert = {
            job_request_id: jobRequestId,
            craftsman_id: offer.craftsman_id,
            client_id: offer.job_request.client_id,
            final_price: offer.price,
            status: 'active',
            payment_status: 'pending'
        };

        const { data, error } = await supabase
            .from('contracts')
            .insert(contract)
            .select()
            .single();

        if (error) throw error;

        await supabase.from('job_offers').update({ status: 'accepted' }).eq('id', offerId);
        await supabase.from('job_requests').update({ status: 'in_progress' }).eq('id', jobRequestId);

        await notificationService.createNotification({
            user_id: contract.craftsman_id,
            type: 'contract',
            title: 'Nová zmluva vytvorená 🎉',
            message: `Vaša ponuka na prácu "${offer.job_request.title}" bola prijatá. Môžete začať!`,
            data: { job_id: jobRequestId, contract_id: data.id },
            link: `/contracts/${data.id}`
        });

        return data;
    },

    // Remeselník nahlási prácu ako hotovú (čaká na potvrdenie od klienta)
    async reportFinished(contractId: string) {
        const { data: contract, error: fetchError } = await supabase
            .from('contracts')
            .select('*, job:job_requests(title)')
            .eq('id', contractId)
            .single();

        if (fetchError) throw fetchError;

        const { data, error } = await supabase
            .from('contracts')
            .update({ status: 'pending_confirmation' })
            .eq('id', contractId)
            .select()
            .single();

        if (error) throw error;

        await notificationService.createNotification({
            user_id: data.client_id,
            type: 'contract',
            title: 'Práca je nahlásená ako hotová 🛠️',
            message: `Remeselník dokončil prácu "${contract.job.title}". Prosím, skontrolujte ju a potvrďte.`,
            data: { contract_id: contractId },
            link: `/contracts/${contractId}`
        });

        return data;
    },

    // Klient potvrdí dokončenie práce
    async confirmFinished(contractId: string) {
        const { data: contract, error: fetchError } = await supabase
            .from('contracts')
            .select('*, job:job_requests(title)')
            .eq('id', contractId)
            .single();

        if (fetchError) throw fetchError;

        const { data, error } = await supabase
            .from('contracts')
            .update({ status: 'completed', completed_at: new Date().toISOString() })
            .eq('id', contractId)
            .select()
            .single();

        if (error) throw error;

        // Aktualizovať prácu na dokončenú
        await supabase.from('job_requests').update({ status: 'completed' }).eq('id', data.job_request_id);

        await notificationService.createNotification({
            user_id: data.craftsman_id,
            type: 'contract',
            title: 'Práca bola potvrdená! ✅',
            message: `Klient potvrdil dokončenie práce "${contract.job.title}". Gratulujeme!`,
            data: { contract_id: contractId },
            link: `/contracts/${contractId}`
        });

        return data;
    },

    // Klient nahlási problém (Reklamácia)
    async raiseDispute(contractId: string, reason: string) {
        const { data: contract, error: fetchError } = await supabase
            .from('contracts')
            .select('*, job:job_requests(title)')
            .eq('id', contractId)
            .single();

        if (fetchError) throw fetchError;

        const { data, error } = await supabase
            .from('contracts')
            .update({ status: 'disputed' })
            .eq('id', contractId)
            .select()
            .single();

        if (error) throw error;

        await notificationService.createNotification({
            user_id: data.craftsman_id,
            type: 'contract',
            title: 'Reklamácia k práci ⚠️',
            message: `Klient nahlásil problém s prácou "${contract.job.title}". Dôvod: ${reason}`,
            data: { contract_id: contractId },
            link: `/contracts/${contractId}`
        });

        return data;
    },

    async getMyContractsAsClient(clientId: string) {
        const { data, error } = await supabase
            .from('contracts')
            .select(`*, job:job_requests (*), craftsman:profiles!craftsman_id (full_name, avatar_url, phone)`)
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getMyContractsAsCraftsman(craftsmanId: string) {
        const { data, error } = await supabase
            .from('contracts')
            .select(`*, job:job_requests (*), client:profiles!client_id (full_name, avatar_url, phone)`)
            .eq('craftsman_id', craftsmanId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }
};