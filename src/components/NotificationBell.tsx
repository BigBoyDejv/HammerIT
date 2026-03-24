// src/components/NotificationBell.tsx
import { useState, useEffect } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificationService, Notification } from '../services/notificationService';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // Načítať notifikácie
    const loadNotifications = async () => {
        if (!user) return;
        try {
            const data = await notificationService.getNotifications(user.id);
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    // Počiatočné načítanie
    useEffect(() => {
        loadNotifications();
    }, [user]);

    // Real-time subskripcia na nové notifikácie
    useEffect(() => {
        if (!user) return;

        const subscription = supabase
            .channel(`notifications:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    const newNotification = payload.new as Notification;
                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    // Event listener pre manuálne refresh (ak treba)
    useEffect(() => {
        if (!user) return;

        const handleRefresh = () => {
            loadNotifications();
        };

        window.addEventListener('refresh-notifications', handleRefresh);
        return () => {
            window.removeEventListener('refresh-notifications', handleRefresh);
        };
    }, [user]);

    const markAsRead = async (id: string) => {
        await notificationService.markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        await notificationService.markAllAsRead(user!.id);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'message': return '💬';
            case 'offer': return '📋';
            case 'contract': return '📄';
            case 'review': return '⭐';
            default: return '🔔';
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Notifikácie"
            >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral-500 text-white text-xs rounded-full flex items-center justify-center shadow-md">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop pre mobile */}
                    <div
                        className="fixed inset-0 z-40 md:hidden"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fade-in">
                        {/* Hlavička */}
                        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">Notifikácie</h3>
                            {notifications.length > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-coral-500 hover:text-coral-600 flex items-center gap-1"
                                >
                                    <CheckCheck className="w-3 h-3" />
                                    Označiť všetky
                                </button>
                            )}
                        </div>

                        {/* Zoznam notifikácií */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-gray-500 text-sm">
                                    <Bell className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                                    <p>Žiadne notifikácie</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <Link
                                        key={notif.id}
                                        to={notif.link || '#'}
                                        onClick={() => {
                                            markAsRead(notif.id);
                                            setIsOpen(false);
                                        }}
                                        className={`block p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${!notif.read ? 'bg-coral-50/30 border-l-4 border-l-coral-500' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="text-xl">{getIcon(notif.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(notif.created_at).toLocaleDateString('sk-SK', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            {!notif.read && (
                                                <div className="w-2 h-2 bg-coral-500 rounded-full mt-1" />
                                            )}
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* Pätička */}
                        {notifications.length > 0 && (
                            <div className="p-2 border-t border-gray-100">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full text-center text-xs text-gray-400 hover:text-gray-500 py-1"
                                >
                                    Zavrieť
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}