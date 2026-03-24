// src/services/craftsmanService.ts
import { supabase } from '../lib/supabase';

interface CraftsmanFilters {
    specialization?: string;
    minRate?: number;
    maxRate?: number;
    verified?: boolean;
}

export const craftsmanService = {
    async getAllCraftsmen(filters?: CraftsmanFilters) {
        let query = supabase
            .from('craftsman_profiles')
            .select(`
        *,
        user:profiles!craftsman_profiles_user_id_fkey(full_name, avatar_url, phone, bio)
      `);

        if (filters?.specialization) {
            query = query.contains('specialization', [filters.specialization]);
        }
        if (filters?.minRate !== undefined) {
            query = query.gte('hourly_rate', filters.minRate);
        }
        if (filters?.maxRate !== undefined) {
            query = query.lte('hourly_rate', filters.maxRate);
        }
        if (filters?.verified) {
            query = query.eq('verified', true);
        }

        const { data, error } = await query.order('rating_avg', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getCraftsmanById(userId: string) {
        const { data, error } = await supabase
            .from('craftsman_profiles')
            .select(`
        *,
        user:profiles!craftsman_profiles_user_id_fkey(full_name, avatar_url, phone, bio)
      `)
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data;
    },

    async updateCraftsmanProfile(userId: string, updates: {
        specialization?: string[];
        hourly_rate?: number;
        years_experience?: number;
    }) {
        const { data, error } = await supabase
            .from('craftsman_profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};