import React from 'react';
import { NotificationItem } from './NotificationItem';
import { Notification } from '../services/notificationService';
import { motion, AnimatePresence } from 'framer-motion';
import { BellOff } from 'lucide-react';

interface NotificationsListProps {
    notifications: Notification[];
    loading?: boolean;
    onClose?: () => void;
}

export function NotificationsList({ notifications, loading, onClose }: NotificationsListProps) {
    if (loading) {
        return (
            <div className="flex flex-col gap-4 p-5">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-2xl shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-1/3" />
                            <div className="h-4 bg-gray-50 dark:bg-slate-800/50 rounded w-full" />
                        </div>
                    </div>
                ))}
                <div className="text-center py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Načítavam...</div>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center space-y-6">
                <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-3xl shadow-xl shadow-navy-900/5">
                    🔕
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-none uppercase">Žiadne notifikácie</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Momentálne nemáte žiadne nové správy ani upozornenia.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-800">
            <AnimatePresence initial={false} mode="popLayout">
                {notifications.map((notification, idx) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                    >
                        <NotificationItem 
                            notification={notification} 
                            onClose={onClose}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
