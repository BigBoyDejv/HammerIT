// src/services/notificationService.ts
import { supabase } from '../lib/supabase';

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

    // Získať notifikácie pre používateľa
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

    // Označiť notifikáciu ako prečítanú
    async markAsRead(notificationId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId);

        if (error) throw error;
    },

    // Označiť všetky notifikácie ako prečítané
    async markAllAsRead(userId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false);

        if (error) throw error;
    },

    // Získať počet neprečítaných notifikácií
    async getUnreadCount(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('read', false);

        if (error) throw error;
        return count || 0;
    },

    // Subskripcia na nové notifikácie (real-time)
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
    },

    // Vymazať notifikáciu
    async deleteNotification(notificationId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);

        if (error) throw error;
    },

    // Vymazať všetky prečítané notifikácie
    async deleteReadNotifications(userId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', userId)
            .eq('read', true);

        if (error) throw error;
    }
};