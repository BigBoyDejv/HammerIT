import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type CraftsmanProfile = Database['public']['Tables']['craftsman_profiles']['Row'];

export const craftsmanService = {
    // Všetci remeselníci
    async getAllCraftsmen(filters?: {
        specialization?: string;
        minRate?: number;
        maxRate?: number;
        verified?: boolean;
    }) {
        let query = supabase
            .from('craftsman_profiles')
            .select(`
        *,
        user:profiles!user_id (
          full_name,
          avatar_url,
          phone,
          bio
        )
      `);

        if (filters?.specialization) {
            query = query.contains('specialization', [filters.specialization]);
        }
        if (filters?.minRate) {
            query = query.gte('hourly_rate', filters.minRate);
        }
        if (filters?.maxRate) {
            query = query.lte('hourly_rate', filters.maxRate);
        }
        if (filters?.verified !== undefined) {
            query = query.eq('verified', filters.verified);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    // Detail remeselníka
    async getCraftsmanById(userId: string) {
        const { data, error } = await supabase
            .from('craftsman_profiles')
            .select(`
        *,
        user:profiles!user_id (*),
        reviews:reviews!reviewed_id (
          rating,
          comment,
          created_at,
          reviewer:profiles!reviewer_id (
            full_name,
            avatar_url
          )
        )
      `)
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data;
    },

    // Aktualizovať profil remeselníka
    async updateProfile(userId: string, updates: Partial<CraftsmanProfile>) {
        const { data, error } = await supabase
            .from('craftsman_profiles')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Top remeselníci podľa hodnotenia
    async getTopCraftsmen(limit: number = 10) {
        const { data, error } = await supabase
            .from('craftsman_profiles')
            .select(`
        *,
        user:profiles!user_id (full_name, avatar_url)
      `)
            .order('rating_avg', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }
};