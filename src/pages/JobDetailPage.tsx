// src/pages/JobDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Clock, Send, MessageCircle, ArrowLeft } from 'lucide-react';
import type { Database } from '../lib/database.types';
import { offerService } from '../services/offerService';

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
    const { user, profile } = useAuth();
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

    const loadJob = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchJob(id);
            setJob(data);
        } catch (err) {
            console.error(err);
            setError('Nepodarilo sa načítať prácu.');
        } finally {
            setLoading(false);
        }
    };

    const handleOfferSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !id || !job) return;

        const alreadyOffered = job.job_offers?.some(o => o.craftsman_id === user.id);
        if (alreadyOffered) {
            alert('Už ste odoslali ponuku na túto prácu.');
            return;
        }

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
            await loadJob();
            alert('Ponuka bola odoslaná! Klient dostane notifikáciu.');
        } catch (err) {
            console.error(err);
            alert('Nepodarilo sa odoslať ponuku');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOfferAction = async (offerId: string, action: 'accepted' | 'rejected') => {
        setActionLoading(offerId);

        try {
            await offerService.updateOfferStatus(offerId, action, user!.id);

            if (action === 'accepted') {
                alert('Ponuka bola prijatá! Zmluva bola vytvorená.');
            } else {
                alert('Ponuka bola zamietnutá');
            }

            await loadJob();
            window.dispatchEvent(new CustomEvent('refresh-offers'));
        } catch (err) {
            console.error(err);
            alert('Nepodarilo sa aktualizovať ponuku');
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

    const goBack = () => {
        navigate(-1);
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#191970] dark:border-coral-500" />
        </div>
    );

    if (error || !job) return (
        <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
                {error ?? 'Práca nebola nájdená.'}
            </p>
            <Link to="/jobs" className="text-coral-500 hover:text-coral-600 dark:text-coral-400 dark:hover:text-coral-300 underline">
                Späť na zoznam
            </Link>
        </div>
    );

    const isMyJob = job.client_id === user?.id;
    const existingOffer = job.job_offers?.find(o => o.craftsman_id === user?.id);
    const alreadyOffered = !!existingOffer;
    const canSubmitOffer = profile?.role === 'craftsman' && !isMyJob && job.status === 'open' && !alreadyOffered;
    const canResubmitOffer = profile?.role === 'craftsman' && !isMyJob && job.status === 'open' && existingOffer?.status === 'rejected';
    const isPending = existingOffer?.status === 'pending';

    const getStatusBadge = () => {
        const statusMap = {
            open: { text: 'Otvorená', classes: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
            in_progress: { text: 'Prebieha', classes: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' },
            completed: { text: 'Dokončená', classes: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' }
        };
        const status = statusMap[job.status as keyof typeof statusMap] || statusMap.open;
        return (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.classes}`}>
                {status.text}
            </span>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in px-4 sm:px-6 lg:px-8">
            {/* Back button */}
            <button
                onClick={goBack}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors group mb-4"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Späť
            </button>

            {/* Job detail */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
                    {getStatusBadge()}
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                    {[
                        { icon: '📁', text: job.category },
                        { icon: '📍', text: job.location },
                        { icon: '💰', text: `${job.budget_min ?? '?'}€ – ${job.budget_max ?? '?'}€` },
                        { icon: '📅', text: job.created_at ? new Date(job.created_at).toLocaleDateString('sk-SK') : '–' },
                    ].map(({ icon, text }) => (
                        <span key={`${icon}-${text}`} className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                            {icon} {text}
                        </span>
                    ))}
                </div>

                <div className="mb-6">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Popis práce</h2>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{job.description}</p>
                </div>

                {job.client && (
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-navy-600 to-navy-700 dark:from-navy-700 dark:to-navy-800 rounded-full flex items-center justify-center text-white font-semibold">
                            {job.client.full_name?.charAt(0) ?? 'K'}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{job.client.full_name}</p>
                            {!isMyJob && (
                                <button
                                    onClick={() => navigate(`/messages?user=${job.client_id}`)}
                                    className="text-xs text-coral-500 dark:text-coral-400 hover:underline flex items-center gap-1 mt-1"
                                >
                                    <MessageCircle className="w-3 h-3" /> Napísať správu
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Offers — len pre vlastníka jobu */}
            {isMyJob && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Ponuky remeselníkov
                        {!!job.job_offers?.length && (
                            <span className="ml-2 text-lg font-normal text-gray-500 dark:text-gray-400">
                                ({job.job_offers.length})
                            </span>
                        )}
                    </h2>

                    {!job.job_offers?.length ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-6 text-sm">Zatiaľ žiadne ponuky.</p>
                    ) : (
                        <div className="space-y-4">
                            {job.job_offers.map((offer) => (
                                <div key={offer.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                                    <div className="flex justify-between items-start gap-4 flex-wrap">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <div className="w-8 h-8 bg-gradient-to-br from-navy-600 to-navy-700 dark:from-navy-700 dark:to-navy-800 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                    {offer.craftsman?.full_name?.charAt(0) ?? 'R'}
                                                </div>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {offer.craftsman?.full_name ?? '–'}
                                                </p>
                                                {offer.status === 'pending' && (
                                                    <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs px-2 py-0.5 rounded-full">
                                                        Čaká na schválenie
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-2xl font-bold text-navy-600 dark:text-coral-400">{offer.price}€</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Odhad: {offer.estimated_duration ?? '–'}
                                            </p>
                                            <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">{offer.message}</p>
                                        </div>

                                        <div className="flex flex-col gap-2 items-end shrink-0">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${offer.status === 'pending'
                                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                                    : offer.status === 'accepted'
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                                }`}>
                                                {offer.status === 'pending' ? 'Čaká' :
                                                    offer.status === 'accepted' ? 'Prijatá' : 'Zamietnutá'}
                                            </span>

                                            {offer.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAcceptOffer(offer.id)}
                                                        disabled={actionLoading === offer.id}
                                                        className="bg-gradient-to-r from-coral-500 to-coral-600 text-white text-sm py-1.5 px-3 rounded-lg hover:from-coral-600 hover:to-coral-700 transition-all flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        <CheckCircle className="w-3 h-3" />
                                                        {actionLoading === offer.id ? '...' : 'Prijať'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleOfferAction(offer.id, 'rejected')}
                                                        disabled={actionLoading === offer.id}
                                                        className="py-1.5 px-3 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        <XCircle className="w-3 h-3" />
                                                        Zamietnuť
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Submit offer — remeselník */}
            {(canSubmitOffer || canResubmitOffer) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {canResubmitOffer ? 'Poslať novú ponuku' : 'Odoslať ponuku'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {canResubmitOffer
                            ? 'Vaša predchádzajúca ponuka bola zamietnutá. Môžete poslať novú ponuku s upravenou cenou.'
                            : 'Po odoslaní dostane klient notifikáciu a vytvorí sa konverzácia.'}
                    </p>

                    {isPending && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                            <p className="text-yellow-800 dark:text-yellow-300 font-medium">⏳ Čaká na schválenie</p>
                            <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                                Vaša ponuka bola odoslaná. Čakáte na rozhodnutie klienta.
                            </p>
                            <Link to="/my-offers" className="inline-block mt-2 text-sm text-coral-500 dark:text-coral-400 hover:underline">
                                Zobraziť všetky ponuky →
                            </Link>
                        </div>
                    )}

                    {!isPending && (
                        <form onSubmit={handleOfferSubmit} className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Cena (€) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                                        value={offerForm.price}
                                        onChange={(e) => setOfferForm({ ...offerForm, price: e.target.value })}
                                        placeholder="850"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Odhadovaný čas *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                                        value={offerForm.duration}
                                        onChange={(e) => setOfferForm({ ...offerForm, duration: e.target.value })}
                                        placeholder="3 dni, 1 týždeň..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Správa pre klienta *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all resize-y"
                                    value={offerForm.message}
                                    onChange={(e) => setOfferForm({ ...offerForm, message: e.target.value })}
                                    placeholder="Popíšte čo ponúkate, kedy môžete začať..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-coral-500 to-coral-600 text-white font-medium py-3 rounded-lg hover:from-coral-600 hover:to-coral-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Odosielam...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        {canResubmitOffer ? 'Poslať novú ponuku' : 'Odoslať ponuku'}
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}