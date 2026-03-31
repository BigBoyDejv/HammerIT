import { supabase } from '../lib/supabase';
export { notificationService as createNotification } from './notificationService';

export type Notification = {
  id: string;
  user_id: string;
  type: 'message' | 'offer' | 'contract' | 'review';
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  created_at: string;
};

export const notificationService = {
  // Vytvoriť notifikáciu
  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  subscribeToNotifications(userId: string, onNotification: (notification: Notification) => void) {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          onNotification(payload.new as Notification);
        }
      )
      .subscribe();

    return subscription;
  }
};