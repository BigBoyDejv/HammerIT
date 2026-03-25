import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, User, ClipboardList } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function BottomNav() {
    const location = useLocation();
    const { user, profile } = useAuth();
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [pendingOffers, setPendingOffers] = useState(0);

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

    const clientItems = [
        { path: '/dashboard', icon: Home, label: 'Domov', badge: 0 },
        { path: '/jobs', icon: Search, label: 'Práce', badge: 0 },
        { path: '/messages', icon: MessageSquare, label: 'Správy', badge: unreadMessages },
        { path: '/profile', icon: User, label: 'Profil', badge: 0 },
    ];

    const craftsmanItems = [
        { path: '/dashboard', icon: Home, label: 'Domov', badge: 0 },
        { path: '/jobs', icon: Search, label: 'Hľadať', badge: 0 },
        { path: '/my-offers', icon: ClipboardList, label: 'Ponuky', badge: pendingOffers },
        { path: '/messages', icon: MessageSquare, label: 'Správy', badge: unreadMessages },
        { path: '/profile', icon: User, label: 'Profil', badge: 0 },
    ];

    const items = profile?.role === 'craftsman' ? craftsmanItems : clientItems;

    return (
        <div className="bottom-nav md:hidden safe-area-pb">
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
                            className={`nav-item tap-scale relative ${isActive ? 'active' : ''}`}
                        >
                            <div className="relative">
                                <Icon className="nav-icon" strokeWidth={isActive ? 2.5 : 1.75} />
                                {item.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-coral-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-sm">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </div>
                            <span className="nav-label">{item.label}</span>

                            {/* Active indicator dot */}
                            {isActive && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-coral-500 rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}