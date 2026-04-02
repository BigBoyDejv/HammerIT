import { useState } from 'react';
import { CheckCircle, Zap, Shield, Rocket, Clock, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { subscriptionService } from '../services/subscriptionService';

export function BillingPage() {
    const { user, subscription, refreshSubscription } = useAuth();
    const [loading, setLoading] = useState(false);

    const isTrialing = subscription?.status === 'trialing';
    const isActive = subscription?.status === 'active';
    const trialEnd = subscription?.trial_end ? new Date(subscription.trial_end) : null;
    const now = new Date();
    const daysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 3600 * 24))) : 0;

    const handleSubscribe = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await subscriptionService.activateSubscription(user.id);
            await refreshSubscription();
            alert('Gratulujeme! HammerIT Premium bol úspešne aktivovaný (Testovací režim).');
        } catch (err) {
            console.error('Subscription error:', err);
            alert('Nastala chyba pri aktivácii.');
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        { icon: Zap, text: 'Neobmedzené reakcie na zákazky' },
        { icon: Shield, text: 'Odznak OVERENÝ PROFESIONÁL' },
        { icon: Rocket, text: 'Prednostné zobrazenie v zozname' },
        { icon: Clock, text: 'Okamžité notifikácie o nových dopytoch' },
    ];

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pb-32 animate-fade-in font-sans">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-4 leading-tight">
                    Získajte <span className="gradient-text">viac zákaziek</span> s HammerIT Premium
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                    Investujte do svojho rastu. Jedna získaná zákazka vám zaplatí predplatné na niekoľko mesiacov dopredu.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Status Column */}
                <div className="space-y-8">
                    {isTrialing && (
                        <div className="bg-coral-50 dark:bg-coral-500/10 border border-coral-200 dark:border-coral-500/20 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-coral-500/5">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-coral-500/20 rounded-2xl flex items-center justify-center text-coral-600 shadow-sm">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Aktuálne využívate TRIAL</h3>
                                    <p className="text-gray-600 dark:text-coral-200/60 font-medium mb-6 leading-relaxed">
                                        Váš bezplatný prístup končí o <span className="text-coral-600 dark:text-coral-400 font-black">{daysLeft} dní</span>. Po tomto termíne bude pre reakcie na ponuky potrebné aktívne predplatné.
                                    </p>
                                    <div className="w-full bg-gray-200 dark:bg-coral-900/40 h-2 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(daysLeft / 14) * 100}%` }}
                                            className="h-full bg-coral-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isActive && (
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-emerald-500/5">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-emerald-900 dark:text-white mb-2 tracking-tight">Máte HammerIT PREMIUM</h3>
                                    <p className="text-emerald-700 dark:text-emerald-400/60 font-medium leading-relaxed">
                                        Váš prístup je plne aktívny do {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('sk-SK') : 'neuvedené'}. Môžete bez obmedzení reagovať na všetky ponuky.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6 pl-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Prečo prejsť na Premium?</h4>
                        {benefits.map((b, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-50 dark:border-white/5 flex items-center justify-center text-emerald-500 transition-transform group-hover:scale-110">
                                    <b.icon className="w-5 h-5" />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 font-bold">{b.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pricing Card */}
                <div className="relative">
                    <div className="absolute -top-12 -right-12 w-64 h-64 bg-coral-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                    
                    <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-14 shadow-2xl border border-gray-100 dark:border-white/5 text-center overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                             <div className="bg-coral-500 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-coral-500/20 translate-x-4 -rotate-12">Najobľúbenejšie</div>
                        </div>

                        <div className="mb-10">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 mt-4 tracking-tight">Mesačné predplatné</h3>
                            <div className="flex items-center justify-center gap-1">
                                <span className="text-5xl font-black text-gray-900 dark:text-white">10€</span>
                                <span className="text-gray-400 font-bold self-end mb-2">/mesiac</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-12">
                            {['Plný prístup k dopytom', 'Profil bez reklám', 'Žiadne provízie zo zisku', 'Zrušenie kedykoľvek'].map((item, i) => (
                                <li key={i} className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" /> {item}
                                </li>
                            ))}
                        </ul>

                        <button 
                            onClick={handleSubscribe}
                            disabled={loading || isActive}
                            className="w-full bg-gradient-to-tr from-coral-500 to-coral-600 text-white font-black py-6 rounded-[2.5rem] shadow-xl shadow-coral-500/25 flex items-center justify-center gap-3 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                        >
                            <CreditCard className="w-5 h-5" />
                            {isActive ? 'Predplatné je aktívne' : 'Aktivovať prístup'}
                        </button>
                        
                        <p className="mt-6 text-xs text-gray-400 font-medium">
                            Bezpečné platby cez Stripe. Možnosť zrušenia kedykoľvek v portáli.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
