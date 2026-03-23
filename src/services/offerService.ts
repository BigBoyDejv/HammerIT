import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type JobOffer = Database['public']['Tables']['job_offers']['Row'];
type OfferInsert = Database['public']['Tables']['job_offers']['Insert'];

export const offerService = {
    // Vytvoriť ponuku
    async createOffer(offer: OfferInsert) {
        const { data, error } = await supabase
            .from('job_offers')
            .insert(offer)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Ponuky pre prácu
    async getOffersForJob(jobRequestId: string) {
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
        return data;
    },

    // Moje ponuky (pre remeselníka)
    async getMyOffers(craftsmanId: string) {
        const { data, error } = await supabase
            .from('job_offers')
            .select(`
        *,
        job:job_requests (
          title,
          description,
          location,
          client:profiles!client_id (
            full_name,
            avatar_url
          )
        )
      `)
            .eq('craftsman_id', craftsmanId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Aktualizovať stav ponuky
    async updateOfferStatus(id: string, status: 'pending' | 'accepted' | 'rejected') {
        const { data, error } = await supabase
            .from('job_offers')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};