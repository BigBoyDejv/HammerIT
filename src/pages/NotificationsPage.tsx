import { useNotifications } from '../contexts/NotificationContext';
import { NotificationsList } from '../components/NotificationsList';
import { CheckSquare, Filter, Bell, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export function NotificationsPage() {
    const { notifications, unreadCount, markAllAsRead, loading } = useNotifications();

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
            {/* Header section */}
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                        Notifikácie
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-coral-500 uppercase tracking-widest">
                            {unreadCount} neprečítaných
                        </span>
                        <div className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            {notifications.length} celkovo
                        </span>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => markAllAsRead()}
                        disabled={unreadCount === 0 || loading}
                        className="flex-1 md:flex-none px-6 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest text-[#191970] dark:text-cyan-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl shadow-navy-900/5 group"
                    >
                        <CheckSquare className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                        Označiť všetko
                    </button>
                    <button
                        className="px-6 py-4 bg-navy-900 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-navy-900/20"
                    >
                        <Settings className="w-5 h-5" />
                        Nastavenia
                    </button>
                </div>
            </motion.header>

            {/* List container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-50 dark:border-white/5 shadow-2xl shadow-navy-900/5 overflow-hidden"
            >
                <div className="p-8 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-coral-500" />
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Centrum upozornení</h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-coral-500 transition-colors cursor-pointer">
                        <Filter className="w-4 h-4" />
                        Filtrovať
                    </div>
                </div>

                <NotificationsList 
                    notifications={notifications} 
                    loading={loading}
                />
                
                {notifications.length > 20 && (
                     <div className="p-8 bg-gray-50/50 dark:bg-slate-800/30 text-center border-t border-gray-50 dark:border-white/5">
                        <button className="px-8 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-lg">
                            Načítať ďalšie
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
