import { supabase } from '../lib/supabase';

export type Review = {
    id: string;
    contract_id: string;
    reviewer_id: string;
    reviewed_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
};

export const reviewService = {
    async createReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
        const { data, error } = await supabase
            .from('reviews')
            .insert({
                ...review,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('reviewed_id', review.reviewed_id);

        const allReviews = reviews || [];

        const totalSum = allReviews.reduce((sum, r) => sum + r.rating, 0);

        const avgRating = allReviews.length > 0
            ? totalSum / allReviews.length
            : 0;

        await supabase
            .from('craftsman_profiles')
            .update({
                rating_avg: avgRating,
                total_jobs: supabase.rpc('increment', { x: 1 })
            })
            .eq('user_id', review.reviewed_id);

        return data;
    },

    async getReviewsForCraftsman(craftsmanId: string): Promise<Review[]> {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
        *,
        reviewer:profiles!reviewer_id (
          full_name,
          avatar_url
        )
      `)
            .eq('reviewed_id', craftsmanId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
};