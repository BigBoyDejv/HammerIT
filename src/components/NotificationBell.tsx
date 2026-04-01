import { useState, useRef, useEffect } from 'react';
import { Bell, CheckSquare, Settings, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationsList } from './NotificationsList';

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAllAsRead, loading } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                    isOpen 
                    ? 'bg-navy-900 text-white shadow-xl shadow-navy-900/20' 
                    : 'bg-white dark:bg-slate-900 text-gray-400 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-100 dark:border-white/5'
                }`}
            >
                <Bell className={`w-5 h-5 transition-transform duration-500 ${isOpen ? 'rotate-12 scale-110' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-coral-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="absolute right-0 mt-3 w-[360px] sm:w-[420px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-navy-900/40 border border-gray-100 dark:border-white/5 overflow-hidden z-50 origin-top-right backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-6 pb-2 flex justify-between items-center border-b border-gray-50 dark:border-white/5">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                                Notifikácie
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => markAllAsRead()}
                                    title="Označiť všetko ako prečítané"
                                    className="p-2.5 rounded-xl text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                                >
                                    <CheckSquare className="w-5 h-5" />
                                </button>
                                <Link
                                    to="/settings/notifications"
                                    onClick={() => setIsOpen(false)}
                                    className="p-2.5 rounded-xl text-gray-400 hover:text-coral-500 hover:bg-coral-50 dark:hover:bg-coral-500/10 transition-all"
                                >
                                    <Settings className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>

                        {/* List Area */}
                        <div className="max-h-[480px] overflow-y-auto">
                            <NotificationsList 
                                notifications={notifications.slice(0, 10)} 
                                loading={loading}
                                onClose={() => setIsOpen(false)}
                            />
                        </div>

                        {/* Footer */}
                        <Link
                            to="/notifications"
                            onClick={() => setIsOpen(false)}
                            className="block p-5 bg-gray-50 dark:bg-slate-800/80 hover:bg-coral-500 hover:text-white dark:hover:bg-coral-500 transition-all text-center text-xs font-black uppercase tracking-widest text-[#191970] dark:text-cyan-400"
                        >
                            <span className="flex items-center justify-center gap-2">
                                Zobraziť všetky notifikácie
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}