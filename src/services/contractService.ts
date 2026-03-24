import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Contract = Database['public']['Tables']['contracts']['Row'];
type ContractInsert = Database['public']['Tables']['contracts']['Insert'];

export { craftsmanService } from './craftsmanService';
export { jobService } from './jobService';
export { offerService } from './offerService';
export { messageService } from './messageService';

export const contractService = {
    // Vytvoriť kontrakt z ponuky
    async createContractFromOffer(jobRequestId: string, offerId: string) {
        // Najprv získať ponuku
        const { data: offer, error: offerError } = await supabase
            .from('job_offers')
            .select('*, job_request:job_requests(*)')
            .eq('id', offerId)
            .single();

        if (offerError) throw offerError;

        // Vytvoriť kontrakt
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

        // Aktualizovať stav ponuky
        await supabase
            .from('job_offers')
            .update({ status: 'accepted' })
            .eq('id', offerId);

        // Aktualizovať stav práce
        await supabase
            .from('job_requests')
            .update({ status: 'in_progress' })
            .eq('id', jobRequestId);

        return data;
    },

    // Moje kontrakty (ako klient)
    async getMyContractsAsClient(clientId: string) {
        const { data, error } = await supabase
            .from('contracts')
            .select(`
        *,
        job:job_requests (*),
        craftsman:profiles!craftsman_id (
          full_name,
          avatar_url,
          phone
        )
      `)
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Moje kontrakty (ako remeselník)
    async getMyContractsAsCraftsman(craftsmanId: string) {
        const { data, error } = await supabase
            .from('contracts')
            .select(`
        *,
        job:job_requests (*),
        client:profiles!client_id (
          full_name,
          avatar_url,
          phone
        )
      `)
            .eq('craftsman_id', craftsmanId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Dokončiť kontrakt
    async completeContract(id: string) {
        const { data, error } = await supabase
            .from('contracts')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Aktualizovať prácu
        await supabase
            .from('job_requests')
            .update({ status: 'completed' })
            .eq('id', data.job_request_id);

        return data;
    }
};