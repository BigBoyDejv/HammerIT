import { createContext, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface RealtimeContextType {
    refreshMessages: () => void;
    refreshNotifications: () => void;
    refreshOffers: () => void;
    refreshContracts: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    // Eventy pre manuálne refreshovanie
    const refreshMessages = () => {
        window.dispatchEvent(new CustomEvent('refresh-messages'));
    };

    const refreshNotifications = () => {
        window.dispatchEvent(new CustomEvent('refresh-notifications'));
    };

    const refreshOffers = () => {
        window.dispatchEvent(new CustomEvent('refresh-offers'));
    };

    const refreshContracts = () => {
        window.dispatchEvent(new CustomEvent('refresh-contracts'));
    };

    // Globálne real-time subskripcie
    useEffect(() => {
        if (!user) return;

        // Subskripcia na nové správy
        const messageSubscription = supabase
            .channel('global-messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=in.(select id from conversations where participant_1='${user.id}' or participant_2='${user.id}')`
                },
                () => {
                    refreshMessages();
                }
            )
            .subscribe();

        // Subskripcia na zmeny v notifikáciách
        const notificationSubscription = supabase
            .channel('global-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                () => {
                    refreshNotifications();
                }
            )
            .subscribe();

        // Subskripcia na zmeny v ponukách
        const offerSubscription = supabase
            .channel('global-offers')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'job_offers',
                    filter: `craftsman_id=eq.${user.id}`
                },
                () => {
                    refreshOffers();
                }
            )
            .subscribe();

        return () => {
            messageSubscription.unsubscribe();
            notificationSubscription.unsubscribe();
            offerSubscription.unsubscribe();
        };
    }, [user]);

    return (
        <RealtimeContext.Provider value={{
            refreshMessages,
            refreshNotifications,
            refreshOffers,
            refreshContracts
        }}>
            {children}
        </RealtimeContext.Provider>
    );
}

export function useRealtime() {
    const context = useContext(RealtimeContext);
    if (context === undefined) {
        throw new Error('useRealtime must be used within a RealtimeProvider');
    }
    return context;
}