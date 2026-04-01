import { supabase } from '../lib/supabase';

export type NotificationType = 'message' | 'offer' | 'contract' | 'verification' | 'review';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    data: any; // jsonb metadata
    read: boolean;
    link: string | null; // Keep link for backward compatibility/quick use
    created_at: string;
}

export const notificationService = {
    // Vytvoriť notifikáciu (často volané zo serverových funkcií alebo po dôležitých akciách)
    async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read'>): Promise<Notification> {
        const { error } = await supabase
            .from('notifications')
            .insert({
                ...notification,
                read: false,
                created_at: new Date().toISOString()
            });

        if (error) {
            console.error('❌ Error creating notification:', error);
            throw error;
        }
        
        // Vrátime "falošný" objekt, keďže reálny bol vložený, ale RLS nám ho nedovolí prečítať späť
        return {
            ...notification,
            id: 'temp-id-' + Math.random(),
            read: false,
            created_at: new Date().toISOString()
        } as Notification;
    },

    // Získať notifikácie pre používateľa s pagináciou
    async getNotifications(userId: string, limit: number = 20, offset: number = 0): Promise<Notification[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return data || [];
    },

    // Označiť jednu ako prečítanú
    async markAsRead(notificationId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId);

        if (error) throw error;
    },

    // Označiť všetky ako prečítané
    async markAllAsRead(userId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false);

        if (error) throw error;
    },

    // Počet neprečítaných
    async getUnreadCount(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('read', false);

        if (error) throw error;
        return count || 0;
    },

    // Real-time subskripcia
    subscribeToNotifications(userId: string, onNotification: (notification: Notification) => void) {
        const subscription = supabase
            .channel(`user-notifications:${userId}`)
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

    // Vymazať
    async deleteNotification(notificationId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);

        if (error) throw error;
    }
};