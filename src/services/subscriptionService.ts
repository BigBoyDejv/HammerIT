import { supabase } from '../lib/supabase';

export interface Subscription {
  id: string;
  user_id: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled';
  trial_start: string;
  trial_end: string;
  current_period_end: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export const subscriptionService = {
  async getSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
    return data;
  },

  checkAccess(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    
    const now = new Date();
    
    // Status-based checks
    if (subscription.status === 'active') return true;
    
    if (subscription.status === 'trialing') {
      return new Date(subscription.trial_end) > now;
    }
    
    // For canceled/past_due, we only check the end date of current period
    if (['canceled', 'past_due'].includes(subscription.status)) {
      return new Date(subscription.current_period_end) > now;
    }
    
    return false;
  },

  async activateSubscription(userId: string): Promise<void> {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const { error } = await supabase
      .from('subscriptions')
      .upsert({ 
        user_id: userId,
        status: 'active', 
        current_period_end: nextMonth.toISOString() 
      }, { onConflict: 'user_id' });

    if (error) throw error;
  }
};
