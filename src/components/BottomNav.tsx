import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, User, ClipboardList, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export function BottomNav() {
    const location = useLocation();
    const { user, profile } = useAuth();
    const { unreadCount: notificationCount } = useNotifications();
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [pendingOffers, setPendingOffers] = useState(0);

    // Identify auth pages
    const isAuthPage = location.pathname.includes('/auth/login') || location.pathname.includes('/auth/register');

    useEffect(() => {
        if (!user) return;
        fetchBadges();

        const sub = supabase
            .channel('bottom-nav-badges')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, fetchBadges)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, fetchBadges)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'job_offers' }, fetchBadges)
            .subscribe();

        return () => { sub.unsubscribe(); };
    }, [user, profile]);

    const fetchBadges = async () => {
        if (!user) return;

        // Unread messages
        const { data: convs } = await supabase
            .from('conversations')
            .select('id')
            .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);

        if (convs?.length) {
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .in('conversation_id', convs.map(c => c.id))
                .neq('sender_id', user.id)
                .is('read_at', null);
            setUnreadMessages(count || 0);
        }

        // Pending offers (craftsman only)
        if (profile?.role === 'craftsman') {
            const { count } = await supabase
                .from('job_offers')
                .select('*', { count: 'exact', head: true })
                .eq('craftsman_id', user.id)
                .eq('status', 'pending');
            setPendingOffers(count || 0);
        }
    };

    if (isAuthPage || !user) return null;

    const clientItems = [
        { path: '/dashboard', icon: Home, label: 'Domov', badge: 0 },
        { path: '/jobs', icon: Search, label: 'Práce', badge: 0 },
        { path: '/notifications', icon: Bell, label: 'Notif.', badge: notificationCount },
        { path: '/messages', icon: MessageSquare, label: 'Správy', badge: unreadMessages },
        { path: '/profile', icon: User, label: 'Profil', badge: 0 },
    ];

    const craftsmanItems = [
        { path: '/dashboard', icon: Home, label: 'Domov', badge: 0 },
        { path: '/jobs', icon: Search, label: 'Hľadať', badge: 0 },
        { path: '/notifications', icon: Bell, label: 'Notif.', badge: notificationCount },
        { path: '/my-offers', icon: ClipboardList, label: 'Ponuky', badge: pendingOffers },
        { path: '/messages', icon: MessageSquare, label: 'Správy', badge: unreadMessages },
    ];

    const items = profile?.role === 'craftsman' ? craftsmanItems : clientItems;

    return (
        <div className="bottom-nav md:hidden px-2">
            <div className="flex justify-around items-center">
                {items.map((item) => {
                    const isActive =
                        location.pathname === item.path ||
                        (item.path === '/dashboard' && location.pathname === '/');
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="relative flex-1 flex flex-col items-center py-2 z-10 outline-none"
                        >
                            {/* Animated Floating Circle Background */}
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-indicator"
                                    className="absolute -top-4 w-12 h-12 bg-gradient-to-tr from-coral-500 to-coral-400 rounded-full shadow-lg shadow-coral-500/40 border-[4px] border-white dark:border-gray-900 z-0"
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 25
                                    }}
                                />
                            )}
                            
                            {/* Animated Icon Container */}
                            <motion.div 
                                className="relative flex items-center justify-center w-12 h-10 z-10"
                                animate={{ 
                                    y: isActive ? -20 : 0,
                                    scale: isActive ? 1.1 : 1
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                {item.label === 'Profil' ? (
                                    <div className={`w-6 h-6 rounded-full overflow-hidden flex items-center justify-center transition-all ${isActive ? 'ring-2 ring-white shadow-md' : 'ring-1 ring-gray-300 dark:ring-gray-600 grayscale opacity-70'}`}>
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Profil" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                                {profile?.full_name?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Icon 
                                        className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} 
                                        strokeWidth={isActive ? 2.5 : 2} 
                                        size={24}
                                    />
                                )}
                                {item.badge > 0 && (
                                    <span className={`absolute ${isActive ? '-top-1 -right-1' : 'top-1 right-2'} min-w-[16px] h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-sm transition-all duration-300 ${isActive ? 'bg-amber-400 border-2 border-coral-500' : 'bg-coral-500 border-2 border-white dark:border-gray-900'}`}>
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </motion.div>
                            
                            {/* Label */}
                            <motion.span 
                                animate={{
                                    y: isActive ? 4 : 0,
                                    opacity: isActive ? 1 : 0.7,
                                    scale: isActive ? 1 : 0.95
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className={`text-[10px] sm:text-xs origin-top transition-colors duration-300 ${isActive ? 'text-coral-500 font-bold' : 'text-gray-400 dark:text-gray-500 font-medium'}`}
                            >
                                {item.label}
                            </motion.span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}