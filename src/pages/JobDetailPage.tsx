// src/pages/JobDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { notificationService } from '../services/notificationService';
import { messageService } from '../services/messageService';
import { CheckCircle, XCircle, Clock, Send, MessageCircle, ArrowLeft, RefreshCw } from 'lucide-react';
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

    // Vytvoriť konverzáciu
    const createConversation = async (userId1: string, userId2: string) => {
        const [participant_1, participant_2] = [userId1, userId2].sort();

        const { data: existing, error: checkError } = await supabase
            .from('conversations')
            .select('id')
            .eq('participant_1', participant_1)
            .eq('participant_2', participant_2)
            .maybeSingle();

        if (existing) return existing.id;

        const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert({ participant_1, participant_2, last_message_at: new Date().toISOString() })
            .select()
            .single();

        if (createError) throw createError;
        return newConv.id;
    };

    // handleOfferSubmit - použi offerService
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
            // POUŽI offerService namiesto priameho volania
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

    // Prijať/zamietnuť ponuku
    const handleOfferAction = async (offerId: string, action: 'accepted' | 'rejected') => {
        setActionLoading(offerId);

        try {
            // POUŽI offerService namiesto priameho volania
            const result = await offerService.updateOfferStatus(offerId, action, user!.id);

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

    // Prijať ponuku a zamietnuť ostatné
    const handleAcceptOffer = async (acceptedOfferId: string) => {
        if (!confirm('Naozaj chcete prijať túto ponuku? Ostatné ponuky budú zamietnuté.')) return;

        const pendingOffers = job?.job_offers?.filter(o => o.status === 'pending') || [];

        for (const offer of pendingOffers) {
            if (offer.id === acceptedOfferId) {
                await handleOfferAction(offer.id, 'accepted');
            } else {
                await supabase
                    .from('job_offers')
                    .update({ status: 'rejected' })
                    .eq('id', offer.id);
            }
        }

        await loadJob();
        window.dispatchEvent(new CustomEvent('refresh-offers'));
    };

    // Go back funkcia
    const goBack = () => {
        navigate(-1);
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#191970]" />
        </div>
    );

    if (error || !job) return (
        <div className="text-center py-12 text-gray-500">
            {error ?? 'Práca nebola nájdená.'}{' '}
            <Link to="/jobs" className="text-[#191970] underline">Späť na zoznam</Link>
        </div>
    );

    const isMyJob = job.client_id === user?.id;
    const existingOffer = job.job_offers?.find(o => o.craftsman_id === user?.id);
    const alreadyOffered = !!existingOffer;
    const canSubmitOffer = profile?.role === 'craftsman' && !isMyJob && job.status === 'open' && !alreadyOffered;
    const canResubmitOffer = profile?.role === 'craftsman' && !isMyJob && job.status === 'open' && existingOffer?.status === 'rejected';
    const isPending = existingOffer?.status === 'pending';

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Back button */}
            <button
                onClick={goBack}
                className="flex items-center gap-2 text-gray-500 hover:text-coral-500 transition-colors group mb-4"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Späť
            </button>

            {/* Job detail */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ml-4 shrink-0 ${job.status === 'open' ? 'bg-green-100 text-green-800' :
                        job.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                        {job.status === 'open' ? 'Otvorená' : job.status === 'in_progress' ? 'Prebieha' : 'Dokončená'}
                    </span>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                    {[
                        { icon: '📁', text: job.category },
                        { icon: '📍', text: job.location },
                        { icon: '💰', text: `${job.budget_min ?? '?'}€ – ${job.budget_max ?? '?'}€` },
                        { icon: '📅', text: job.created_at ? new Date(job.created_at).toLocaleDateString('sk-SK') : '–' },
                    ].map(({ icon, text }) => (
                        <span key={`${icon}-${text}`} className="bg-gray-100 px-3 py-1.5 rounded-lg text-sm text-gray-700">
                            {icon} {text}
                        </span>
                    ))}
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Popis práce</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
                </div>

                {job.client && (
                    <div className="border-t pt-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#191970] rounded-full flex items-center justify-center text-white font-semibold">
                            {job.client.full_name?.charAt(0) ?? 'K'}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Klient</p>
                            <p className="font-medium text-gray-900">{job.client.full_name}</p>
                            {!isMyJob && (
                                <button
                                    onClick={() => navigate(`/messages?user=${job.client_id}`)}
                                    className="text-xs text-coral-500 hover:underline flex items-center gap-1 mt-1"
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
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Ponuky remeselníkov
                        {!!job.job_offers?.length && (
                            <span className="ml-2 text-lg font-normal text-gray-500">
                                ({job.job_offers.length})
                            </span>
                        )}
                    </h2>

                    {!job.job_offers?.length ? (
                        <p className="text-gray-500 text-center py-6 text-sm">Zatiaľ žiadne ponuky.</p>
                    ) : (
                        <div className="space-y-4">
                            {job.job_offers.map((offer) => (
                                <div key={offer.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-[#191970] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                    {offer.craftsman?.full_name?.charAt(0) ?? 'R'}
                                                </div>
                                                <p className="font-semibold text-gray-900">
                                                    {offer.craftsman?.full_name ?? '–'}
                                                </p>
                                                {offer.status === 'pending' && (
                                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Čaká na schválenie</span>
                                                )}
                                            </div>
                                            <p className="text-2xl font-bold text-[#191970]">{offer.price}€</p>
                                            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Odhad: {offer.estimated_duration ?? '–'}
                                            </p>
                                            <p className="text-gray-700 mt-2 text-sm">{offer.message}</p>
                                        </div>

                                        <div className="flex flex-col gap-2 items-end shrink-0">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {offer.status === 'pending' ? 'Čaká' :
                                                    offer.status === 'accepted' ? 'Prijatá' : 'Zamietnutá'}
                                            </span>

                                            {offer.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAcceptOffer(offer.id)}
                                                        disabled={actionLoading === offer.id}
                                                        className="btn-gradient text-sm py-1.5 px-3 flex items-center gap-1"
                                                    >
                                                        <CheckCircle className="w-3 h-3" />
                                                        {actionLoading === offer.id ? '...' : 'Prijať'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleOfferAction(offer.id, 'rejected')}
                                                        disabled={actionLoading === offer.id}
                                                        className="py-1.5 px-3 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors flex items-center gap-1"
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
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {canResubmitOffer ? 'Poslať novú ponuku' : 'Odoslať ponuku'}
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                        {canResubmitOffer
                            ? 'Vaša predchádzajúca ponuka bola zamietnutá. Môžete poslať novú ponuku s upravenou cenou.'
                            : 'Po odoslaní dostane klient notifikáciu a vytvorí sa konverzácia.'}
                    </p>

                    {isPending && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <p className="text-yellow-800 font-medium">⏳ Čaká na schválenie</p>
                            <p className="text-yellow-700 text-sm mt-1">
                                Vaša ponuka bola odoslaná. Čakáte na rozhodnutie klienta.
                            </p>
                            <Link to="/my-offers" className="inline-block mt-2 text-sm text-coral-500 hover:underline">
                                Zobraziť všetky ponuky →
                            </Link>
                        </div>
                    )}

                    {!isPending && (
                        <form onSubmit={handleOfferSubmit} className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Cena (€) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        className="form-input"
                                        value={offerForm.price}
                                        onChange={(e) => setOfferForm({ ...offerForm, price: e.target.value })}
                                        placeholder="850"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Odhadovaný čas *</label>
                                    <input
                                        type="text"
                                        required
                                        className="form-input"
                                        value={offerForm.duration}
                                        onChange={(e) => setOfferForm({ ...offerForm, duration: e.target.value })}
                                        placeholder="3 dni, 1 týždeň..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Správa pre klienta *</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="form-textarea"
                                    value={offerForm.message}
                                    onChange={(e) => setOfferForm({ ...offerForm, message: e.target.value })}
                                    placeholder="Popíšte čo ponúkate, kedy môžete začať..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary w-full flex items-center justify-center gap-2"
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