import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationService, Notification } from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadNotifications = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        console.log('🔔 NotificationContext: Fetching for user', user.id);
        try {
            const [data, count] = await Promise.all([
                notificationService.getNotifications(user.id),
                notificationService.getUnreadCount(user.id)
            ]);
            console.log(`🔔 NotificationContext: Loaded ${data.length} notifications, ${count} unread`);
            setNotifications(data);
            setUnreadCount(count);
        } catch (err) {
            console.error('❌ NotificationContext: Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadNotifications();
            
            // Subskripcia na real-time notifikácie
            console.log('🔔 NotificationContext: Starting real-time subscription...');
            const sub = notificationService.subscribeToNotifications(user.id, (newNotif) => {
                console.log('🔔 NotificationContext: New notification received!', newNotif);
                
                setNotifications(prev => {
                    // Ak už taká notifikácia v zozname je (napr. z loadNotifications), nepridávame ju
                    if (prev.some(n => n.id === newNotif.id)) return prev;
                    return [newNotif, ...prev];
                });
                setUnreadCount(prev => prev + 1);
                
                // Opätovné načítanie pre zosynchronizovanie
                loadNotifications();
            });

            return () => {
                console.log('🔔 NotificationContext: Cleaning up subscription');
                sub.unsubscribe();
            };
        } else {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
        }
    }, [user, loadNotifications]);

    const markAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        try {
            await notificationService.markAllAsRead(user.id);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            unreadCount, 
            loading, 
            markAsRead, 
            markAllAsRead,
            refreshNotifications: loadNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
