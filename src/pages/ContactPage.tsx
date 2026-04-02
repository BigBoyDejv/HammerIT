import { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supportService } from '../services/supportService';
import { motion, AnimatePresence } from 'framer-motion';

export function ContactPage() {
    const { user, profile } = useAuth();
    const [formData, setFormData] = useState({
        subject: 'support',
        message: '',
        full_name: profile?.full_name || '',
        email: user?.email || ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            await supportService.createSupportTicket({
                full_name: formData.full_name,
                email: formData.email,
                subject: formData.subject,
                message: formData.message,
                user_id: user?.id
            });
            setStatus('success');
            setFormData(prev => ({ ...prev, message: '' }));
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pb-32 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-4">Kontaktujte nás</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                    Sme tu pre vás. Či už ide o otázku k zákazke alebo technický problém, náš tím vám odpovie čo najskôr.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Contact Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-xl shadow-navy-900/5">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8">Kde nás nájdete</h2>
                        <ul className="space-y-6">
                            {[
                                { icon: Mail, label: 'Email', value: 'info@hammerit.sk', color: 'text-coral-500', bg: 'bg-coral-50 dark:bg-coral-950/30' },
                                { icon: Phone, label: 'Telefón', value: '+421 900 123 456', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
                                { icon: MapPin, label: 'Adresa', value: 'Hlavná 1, 811 01 Bratislava', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' }
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-4 group">
                                    <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-navy-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                        <MessageSquare className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 rotate-12 transition-transform group-hover:scale-110" />
                        <h3 className="text-xl font-black mb-4 relative z-10">Zaujíma vás niečo?</h3>
                        <p className="text-white/60 font-medium mb-6 relative z-10">Mnoho odpovedí nájdete aj v našom centre pomoci.</p>
                        <a href="/how-it-works" className="inline-flex items-center gap-2 text-coral-400 font-black text-sm uppercase tracking-widest hover:text-coral-300 transition-colors relative z-10">
                            Prejsť do FAQ
                        </a>
                    </div>
                </div>

                {/* Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-12 border border-gray-100 dark:border-white/5 shadow-2xl shadow-navy-900/5">
                        <AnimatePresence mode="wait">
                            {status === 'success' ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Správa odoslaná!</h3>
                                    <p className="text-gray-500 font-medium mb-8">Vašu požiadavku sme prijali. Náš tím vás bude kontaktovať hneď, ako to bude možné.</p>
                                    <button 
                                        onClick={() => setStatus('idle')}
                                        className="btn-primary inline-flex"
                                    >
                                        Poslať ďalšiu správu
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Vaše meno</label>
                                            <input 
                                                type="text" required
                                                className="w-full bg-gray-50 dark:bg-slate-800 border-none p-5 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-coral-500 transition-all shadow-sm"
                                                placeholder="Napr. Jozef Mrkva"
                                                value={formData.full_name}
                                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">E-mailová adresa</label>
                                            <input 
                                                type="email" required
                                                className="w-full bg-gray-50 dark:bg-slate-800 border-none p-5 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-coral-500 transition-all shadow-sm"
                                                placeholder="jozef@email.sk"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Predmet správy</label>
                                        <select 
                                            className="w-full bg-gray-50 dark:bg-slate-800 border-none p-5 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-coral-500 transition-all shadow-sm"
                                            value={formData.subject}
                                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        >
                                            <option value="support">Technická podpora</option>
                                            <option value="billing">Fakturácia a platby</option>
                                            <option value="bug">Nahlásenie chyby</option>
                                            <option value="suggestion">Návrh na vylepšenie</option>
                                            <option value="other">Iné</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Vaša správa</label>
                                        <textarea 
                                            required rows={6}
                                            className="w-full bg-gray-50 dark:bg-slate-800 border-none p-5 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-coral-500 transition-all shadow-sm resize-none"
                                            placeholder="Opíšte vašu požiadavku čo najpodrobnejšie..."
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
                                        <p className="text-xs text-gray-400 font-medium italic">
                                            Odoslaním súhlasíte so spracovaním osobných údajov.
                                        </p>
                                        <button 
                                            type="submit"
                                            disabled={status === 'submitting'}
                                            className="w-full sm:w-auto bg-gradient-to-tr from-coral-500 to-coral-600 text-white font-black px-10 py-5 rounded-[2rem] shadow-xl shadow-coral-500/25 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {status === 'submitting' ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <Send className="w-5 h-5" />
                                            )}
                                            Odoslať správu
                                        </button>
                                    </div>

                                    {status === 'error' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold"
                                        >
                                            <AlertCircle className="w-5 h-5" />
                                            Ups! Nepodarilo sa odoslať správu. Skúste to prosím neskôr.
                                        </motion.div>
                                    )}
                                </form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
