import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
    CheckCircle, Clock, Send, MessageCircle, ArrowLeft, 
    MapPin, Euro, Calendar, 
    AlertCircle, Sparkles, TrendingUp, ShieldCheck, Tag, Loader2, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Database } from '../lib/database.types';
import { offerService } from '../services/offerService';
import { SEO } from '../components/SEO';

type JobRow = Database['public']['Tables']['job_requests']['Row'];
type OfferRow = Database['public']['Tables']['job_offers']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface Offer extends OfferRow {
    craftsman?: Pick<ProfileRow, 'full_name' | 'avatar_url' | 'phone'> | null;
}

interface Job extends JobRow {
    client?: Pick<ProfileRow, 'full_name' | 'avatar_url'> | null;
    job_offers?: Offer[];
}

const fetchJob = async (id: string): Promise<Job | null> => {
    const { data, error } = await supabase
        .from('job_requests')
        .select(`
            *,
            client:profiles!job_requests_client_id_fkey(full_name, avatar_url),
            job_offers(
                id, price, estimated_duration, message, status, craftsman_id, created_at, updated_at, job_request_id,
                craftsman:profiles!job_offers_craftsman_id_fkey(full_name, avatar_url, phone)
            )
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as unknown as Job;
};

export function JobDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user, profile: currentUserProfile } = useAuth();
    const navigate = useNavigate();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [offerForm, setOfferForm] = useState({ price: '', duration: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) loadJob();
    }, [id]);

    const loadJob = async (silent = false) => {
        if (!id) return;
        if (!silent) setLoading(true);
        setError(null);
        try {
            const data = await fetchJob(id);
            setJob(data);
        } catch (err) {
            console.error(err);
            setError('Nepodarilo sa načítať detaily dopytu.');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleOfferSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !id || !job) return;

        const activeOffer = job.job_offers?.find(o => o.craftsman_id === user.id && (o.status === 'pending' || o.status === 'accepted'));
        if (activeOffer) return;

        setSubmitting(true);
        try {
            await offerService.createOffer({
                job_request_id: id,
                craftsman_id: user.id,
                price: Number(offerForm.price),
                estimated_duration: offerForm.duration,
                message: offerForm.message,
                status: 'pending'
            });

            setOfferForm({ price: '', duration: '', message: '' });
            await loadJob(true); // Silent reload
        } catch (err: any) {
            console.error(err);
            alert('Chyba pri odosielaní ponuky: ' + (err.message || 'Nepodarilo sa pripojiť k serveru'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleOfferAction = async (offerId: string, action: 'accepted' | 'rejected') => {
        setActionLoading(offerId);

        try {
            await offerService.updateOfferStatus(offerId, action, user!.id);
            await loadJob(true); // Silent reload
            window.dispatchEvent(new CustomEvent('refresh-offers'));
        } catch (err: any) {
            console.error(err);
            alert('Chyba pri aktualizácii statusu: ' + (err.message || 'Nepodarilo sa pripojiť k serveru'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleAcceptOffer = async (acceptedOfferId: string) => {
        if (!confirm('Naozaj chcete prijať túto ponuku? Ostatné ponuky budú zamietnuté.')) return;

        const pendingOffers = job?.job_offers?.filter(o => o.status === 'pending') || [];

        for (const offer of pendingOffers) {
            if (offer.id === acceptedOfferId) {
                await handleOfferAction(offer.id, 'accepted');
            } else {
                await offerService.updateOfferStatus(offer.id, 'rejected');
            }
        }

        await loadJob();
        window.dispatchEvent(new CustomEvent('refresh-offers'));
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="bg-gray-100 dark:bg-slate-800 rounded-[3rem] h-96 animate-pulse" />
        </div>
    );

    if (error || !job) return (
        <div className="text-center py-24">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-2xl font-black text-gray-900 dark:text-white mb-4">
                {error ?? 'Práca nebola nájdená.'}
            </p>
            <Link to="/jobs" className="btn-primary inline-flex">
                Späť na zoznam
            </Link>
        </div>
    );

    const isMyJob = job.client_id === user?.id;
    const existingOffer = job.job_offers?.find(o => o.craftsman_id === user?.id);
    
    // Ponuka sa považuje za "existujúcu" len ak je čakajúca alebo prijatá. 
    // Ak je zamietnutá, remeselník môže poslať novú.
    const isOfferActive = existingOffer && (existingOffer.status === 'pending' || existingOffer.status === 'accepted');
    const canSubmitOffer = currentUserProfile?.role === 'craftsman' && !isMyJob && job.status === 'open' && !isOfferActive;

    const getStatusInfo = () => {
        const statusMap = {
            open: { text: 'Otvorený dopyt', classes: 'bg-emerald-500 text-white shadow-emerald-500/20', icon: Sparkles },
            in_progress: { text: 'V realizácii', classes: 'bg-amber-500 text-white shadow-amber-500/20', icon: Clock },
            completed: { text: 'Dokončené', classes: 'bg-gray-500 text-white shadow-gray-500/20', icon: CheckCircle }
        };
        return statusMap[job.status as keyof typeof statusMap] || statusMap.open;
    };

    const status = getStatusInfo();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
            <SEO 
                title={job.title} 
                description={job.description} 
                ogType="job" 
                canonical={`/jobs/${job.id}`}
            />
            {/* Header / Navigation */}
            <header className="mb-12 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <Link to="/jobs" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-coral-500 font-bold transition-all mb-4">
                        <ArrowLeft className="w-4 h-4" /> Späť na dopyty
                    </Link>
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{job.title}</h1>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 ${status.classes} shadow-lg`}>
                            <status.icon className="w-3.5 h-3.5" />
                            {status.text}
                        </div>
                    </div>
                </div>
                
                {isMyJob && job.status === 'open' && (
                    <div className="flex gap-3">
                        <button className="px-6 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-2xl font-bold text-gray-600 dark:text-white shadow-sm hover:scale-105 transition-all">
                            Upraviť
                        </button>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Information Column */}
                <div className="lg:col-span-2 space-y-12">
                    
                    {/* Main Detail Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-12 border border-gray-100 dark:border-white/5 shadow-2xl shadow-navy-900/5 space-y-10"
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            {[
                                { icon: Tag, label: 'Kategória', value: job.category },
                                { icon: MapPin, label: 'Mesto', value: job.location.split(',')[0] },
                                { icon: Euro, label: 'Rozpočet', value: `${job.budget_min ?? '?'}€ - ${job.budget_max ?? '?'}€` },
                                { icon: Calendar, label: 'Dátum', value: job.created_at ? new Date(job.created_at).toLocaleDateString('sk-SK') : '–' },
                            ].map((item, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <item.icon className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item.label}</span>
                                    </div>
                                    <p className="text-sm font-black text-gray-900 dark:text-white">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight underline decoration-coral-500 decoration-4 underline-offset-8">Podrobný popis</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed whitespace-pre-wrap">
                                {job.description}
                            </p>
                        </div>

                        {job.client && (
                            <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center text-white font-black text-xl shadow-xl bg-gradient-to-tr from-navy-800 to-black transition-all group-hover/avatar:rotate-6">
                                        {job.client.avatar_url ? (
                                            <img src={job.client.avatar_url} alt={job.client.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{job.client.full_name?.charAt(0) ?? 'K'}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Zverejnil zákazník</p>
                                        <p className="font-black text-gray-900 dark:text-white">{job.client.full_name}</p>
                                    </div>
                                </div>
                                {!isMyJob && (
                                    <button 
                                        onClick={() => navigate(`/messages?user=${job.client_id}`)}
                                        className="w-12 h-12 flex items-center justify-center text-coral-500 bg-coral-50 dark:bg-coral-900/20 rounded-2xl hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <MessageCircle className="w-6 h-6" />
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* Offers Section */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                {isMyJob ? 'Prijaté ponuky' : 'Ostatné ponuky'}
                                <span className="ml-3 text-sm font-black text-coral-500 uppercase">({job.job_offers?.length || 0})</span>
                            </h2>
                        </div>

                        {!job.job_offers?.length ? (
                            <div className="p-20 bg-gray-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5 text-center px-12">
                                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">⏳</div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Čakáme na prvú ponuku</h3>
                                <p className="text-gray-500 font-medium">Buďte druhý a zareagujte na tento dopyt hneď teraz.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {job.job_offers.map((offer) => (
                                    <motion.div 
                                        key={offer.id}
                                        initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                                        className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border ${
                                            offer.status === 'accepted' 
                                            ? 'border-emerald-500/50 bg-emerald-500/5 shadow-emerald-500/10' 
                                            : offer.status === 'rejected'
                                            ? 'border-red-500/20 bg-red-500/5 opacity-80'
                                            : 'border-gray-50 dark:border-white/5 shadow-sm'
                                        } shadow-2xl shadow-navy-900/5`}
                                    >
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center text-white font-black text-xl shadow-xl bg-gradient-to-tr from-coral-500 to-coral-600">
                                                    {offer.craftsman?.avatar_url ? (
                                                        <img src={offer.craftsman.avatar_url} alt={offer.craftsman.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{offer.craftsman?.full_name?.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-black text-gray-900 dark:text-white">{offer.craftsman?.full_name}</p>
                                                        {offer.status === 'accepted' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                                        {offer.status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs font-black text-coral-500 uppercase tracking-widest">{offer.price} €</span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {offer.estimated_duration}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {isMyJob && offer.status === 'pending' && (
                                                <div className="flex gap-2 w-full md:w-auto">
                                                    <button 
                                                        onClick={() => handleAcceptOffer(offer.id)}
                                                        disabled={actionLoading === offer.id}
                                                        className="flex-1 md:flex-none px-6 py-3 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg"
                                                    >
                                                        {actionLoading === offer.id ? 'Spracúvam...' : 'Prijať ponuku'}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOfferAction(offer.id, 'rejected')}
                                                        disabled={actionLoading === offer.id}
                                                        className="flex-1 md:flex-none px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-black text-xs uppercase rounded-xl hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
                                                    >
                                                        {actionLoading === offer.id ? '...' : 'Odmietnuť'}
                                                    </button>
                                                </div>
                                            )}

                                            {offer.status === 'accepted' && (
                                                <span className="px-6 py-3 bg-emerald-500/10 text-emerald-600 font-black text-[10px] uppercase tracking-widest rounded-xl">
                                                    Prijatá ponuka
                                                </span>
                                            )}
                                            {offer.status === 'rejected' && (
                                                <span className="px-6 py-3 bg-red-500/10 text-red-600 font-black text-[10px] uppercase tracking-widest rounded-xl">
                                                    Odmietnutá
                                                </span>
                                            )}
                                        </div>
                                        {offer.message && (
                                            <div className="mt-6 p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl italic text-sm text-gray-600 dark:text-gray-300 border-l-4 border-coral-500">
                                                "{offer.message}"
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-8">
                        
                        {/* Summary Widget */}
                        <div className="bg-navy-900 rounded-[3rem] p-10 text-white space-y-8 relative overflow-hidden">
                            <Euro className="absolute -top-4 -right-4 w-32 h-32 text-white/5 rotate-12" />
                            
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-coral-500" /> Cenové rozpätie
                                </p>
                                <div className="text-4xl font-black tracking-tight underline decoration-coral-500 decoration-8 underline-offset-[12px]">
                                    {job.budget_min}€ - {job.budget_max}€
                                </div>
                            </div>

                            <div className="space-y-6 pt-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-white/40 uppercase tracking-widest">Lokalita</span>
                                    <span className="text-sm font-black flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-coral-500" /> {job.location.split(',')[0]}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-white/40 uppercase tracking-widest">Zaplatíte</span>
                                    <span className="text-sm font-black flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Po dokončení
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Special Actions / Form */}
                        <AnimatePresence>
                            {canSubmitOffer && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-gray-100 dark:border-white/5 shadow-2xl space-y-8"
                                >
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Odoslať ponuku</h3>
                                    
                                    <form onSubmit={handleOfferSubmit} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vaša cena (€)</label>
                                                <input 
                                                    type="number" required
                                                    className="w-full bg-gray-50 dark:bg-slate-800 border-none p-5 rounded-2xl text-lg font-black text-gray-900 dark:text-white focus:ring-2 focus:ring-coral-500 transition-all"
                                                    placeholder="0"
                                                    value={offerForm.price}
                                                    onChange={e => setOfferForm({ ...offerForm, price: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Odhad času</label>
                                                <input 
                                                    type="text" required
                                                    className="w-full bg-gray-50 dark:bg-slate-800 border-none p-5 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-coral-500 transition-all"
                                                    placeholder="napr. 3 pracovné dni"
                                                    value={offerForm.duration}
                                                    onChange={e => setOfferForm({ ...offerForm, duration: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Správa pre klienta</label>
                                                <textarea 
                                                    required rows={4}
                                                    className="w-full bg-gray-50 dark:bg-slate-800 border-none p-5 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-coral-500 transition-all resize-none"
                                                    placeholder="Dobrý deň, o prácu mám záujem..."
                                                    value={offerForm.message}
                                                    onChange={e => setOfferForm({ ...offerForm, message: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            type="submit" disabled={submitting}
                                            className="w-full bg-gradient-to-tr from-coral-500 to-coral-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-coral-500/25 flex items-center justify-center gap-3 active:scale-95 transition-all"
                                        >
                                            {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5" />}
                                            Odoslať dopyt
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Already Offered / Pending Status */}
                        {isOfferActive && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] p-8 border border-emerald-500/20 text-center">
                                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                                <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-400">Ponuka odoslaná</h4>
                                <p className="text-xs font-medium text-emerald-700/80 dark:text-emerald-400/80 mt-2">
                                    Vašu ponuku sme úspešne doručili klientovi. O jeho vyjadrení vás budeme informovať.
                                </p>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    );
}