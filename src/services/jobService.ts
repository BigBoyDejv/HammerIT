import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type JobRequest = Database['public']['Tables']['job_requests']['Row'];
type JobInsert = Database['public']['Tables']['job_requests']['Insert'];
type JobUpdate = Database['public']['Tables']['job_requests']['Update'];

export const jobService = {
    // Všetky práce (s filtrami)
    async getAllJobs(filters?: {
        category?: string;
        location?: string;
        minBudget?: number;
        maxBudget?: number;
        status?: string;
    }) {
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
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
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