// src/services/jobService.ts
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type JobRequest = Database['public']['Tables']['job_requests']['Row'];
type JobInsert = Database['public']['Tables']['job_requests']['Insert'];
type JobUpdate = Database['public']['Tables']['job_requests']['Update'];

export type Job = JobRequest & {
    client?: {
        full_name: string;
        avatar_url: string | null;
    };
};

export type JobFilters = {
    category?: string;
    location?: string;
    minBudget?: number;
    maxBudget?: number;
    status?: string;
    craftsmanId?: string; // Pre filtrovanie prác pre remeselníka
};

export const jobService = {
    // Všetky práce (s filtrami)
    async getAllJobs(filters?: JobFilters) {
        let query = supabase
            .from('job_requests')
            .select(`
                *,
                client:profiles!client_id (
                    full_name,
                    avatar_url
                )
            `)
            .order('created_at', { ascending: false });

        if (filters?.category) {
            query = query.eq('category', filters.category);
        }
        if (filters?.location) {
            query = query.ilike('location', `%${filters.location}%`);
        }
        if (filters?.minBudget) {
            query = query.gte('budget_min', filters.minBudget);
        }
        if (filters?.maxBudget) {
            query = query.lte('budget_max', filters.maxBudget);
        }
        if (filters?.status) {
            query = query.eq('status', filters.status);
        } else {
            query = query.eq('status', 'open');
        }

        const { data, error } = await query;
        if (error) throw error;

        let jobs = data || [];

        // Ak je prihlásený remeselník, odfiltrujeme práce, na ktoré už reagoval
        if (filters?.craftsmanId && jobs.length > 0) {
            // Získať všetky ponuky tohto remeselníka
            const { data: offers } = await supabase
                .from('job_offers')
                .select('job_request_id, status')
                .eq('craftsman_id', filters.craftsmanId);

            if (offers && offers.length > 0) {
                // Vytvoriť mapu prác s ponukami
                const jobOfferMap = new Map();
                offers.forEach(offer => {
                    jobOfferMap.set(offer.job_request_id, offer.status);
                });

                // Filtrovať práce:
                // - Ak má pending alebo accepted ponuku, práca sa nezobrazí
                // - Ak má rejected ponuku, práca sa zobrazí (môže poslať novú)
                jobs = jobs.filter(job => {
                    const offerStatus = jobOfferMap.get(job.id);
                    return offerStatus !== 'pending' && offerStatus !== 'accepted';
                });
            }
        }

        return jobs;
    },

    // Jedna práca
    async getJobById(id: string) {
        const { data, error } = await supabase
            .from('job_requests')
            .select(`
                *,
                client:profiles!client_id (*),
                offers:job_offers (
                    *,
                    craftsman:profiles!craftsman_id (
                        full_name,
                        avatar_url
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Vytvoriť prácu
    async createJob(job: JobInsert) {
        const { data, error } = await supabase
            .from('job_requests')
            .insert(job)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Aktualizovať prácu
    async updateJob(id: string, updates: JobUpdate) {
        const { data, error } = await supabase
            .from('job_requests')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Moje práce (pre klienta)
    async getMyJobs(userId: string) {
        const { data, error } = await supabase
            .from('job_requests')
            .select('*')
            .eq('client_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
};