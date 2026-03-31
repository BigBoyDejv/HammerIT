import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { contractService } from '../services';
import { MapPin, Euro, Calendar, User, ArrowLeft, CheckCircle, Clock, MessageCircle, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ContractDetailPage() {
    const { id } = useParams();
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [contract, setContract] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [review, setReview] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        if (id) loadContract();
    }, [id]);

    const loadContract = async () => {
        try {
            // TODO: implementovať getContractById v contractService
            const { data, error } = await supabase
                .from('contracts')
                .select(`
          *,
          job:job_requests (*),
          client:profiles!client_id (*),
          craftsman:profiles!craftsman_id (*)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setContract(data);
        } catch (error) {
            console.error('Error loading contract:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!confirm('Naozaj chcete označiť túto zmluvu ako dokončenú?')) return;

        setCompleting(true);
        try {
            await contractService.completeContract(id!);
            setShowReview(true);
        } catch (error) {
            console.error('Error completing contract:', error);
            alert('Nepodarilo sa dokončiť zmluvu');
        } finally {
            setCompleting(false);
        }
    };

    const handleSubmitReview = async () => {
        try {
            // TODO: implementovať createReview v reviewService
            const { error } = await supabase
                .from('reviews')
                .insert({
                    contract_id: id,
                    reviewer_id: user!.id,
                    reviewed_id: profile?.role === 'client' ? contract.craftsman_id : contract.client_id,
                    rating: review.rating,
                    comment: review.comment
                });

            if (error) throw error;
            alert('Ďakujeme za vaše hodnotenie!');
            navigate('/contracts');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Nepodarilo sa odoslať hodnotenie');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="glass-card p-12 text-center bg-card dark:bg-slate-800/40 border border-gray-100 dark:border-gray-700/50">
                <p className="text-gray-500 dark:text-gray-400">Zmluva nebola nájdená</p>
                <Link to="/contracts" className="btn-gradient inline-flex mt-4">Späť na zmluvy</Link>
            </div>
        );
    }

    const isClient = profile?.role === 'client';
    const isActive = contract.status === 'active';
    const canComplete = isActive && ((isClient && contract.payment_status === 'paid') || !isClient);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <button
                onClick={() => navigate('/contracts')}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors mb-6 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Späť na zmluvy
            </button>

            {/* Status Banner */}
            <div className={`rounded-xl p-4 mb-6 flex items-center justify-between border ${contract.status === 'active'
                ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-400'
                : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-400'
                }`}>
                <div className="flex items-center gap-3">
                    {contract.status === 'active' ? (
                        <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    ) : (
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <span className="font-bold">
                        {contract.status === 'active' ? 'Prebieha' : 'Dokončená'}
                    </span>
                </div>
                <span className={`badge ${contract.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                    {contract.payment_status === 'paid' ? 'Zaplatené' : 'Čaká na platbu'}
                </span>
            </div>

            {/* Contract Details */}
            <div className="glass-card p-6 mb-6 bg-card dark:bg-slate-800/40 border border-gray-100 dark:border-gray-700/50">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{contract.job?.title}</h1>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {contract.job?.location}</span>
                    <span className="flex items-center gap-1.5"><Euro className="w-4 h-4" /> {contract.final_price}€</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(contract.created_at).toLocaleDateString('sk-SK')}</span>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Popis práce:</h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{contract.job?.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Klient:</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-navy-500 rounded-full flex items-center justify-center text-white">
                                {contract.client?.full_name?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{contract.client?.full_name}</p>
                                <Link to={`/messages?user=${contract.client_id}`} className="text-xs text-coral-500 dark:text-coral-400 hover:underline flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" /> Napísať správu
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Remeselník:</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-coral-500 rounded-full flex items-center justify-center text-white">
                                {contract.craftsman?.full_name?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{contract.craftsman?.full_name}</p>
                                <Link to={`/craftsmen/${contract.craftsman_id}`} className="text-xs text-coral-500 dark:text-coral-400 hover:underline">
                                    Zobraziť profil
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            {isActive && (
                <div className="glass-card p-6 bg-card dark:bg-slate-800/40 border border-gray-100 dark:border-gray-700/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Akcie</h2>
                    <div className="flex flex-wrap gap-4">
                        <Link to={`/messages?contract=${contract.id}`} className="btn-outline flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" /> Diskusia
                        </Link>
                        {canComplete && (
                            <button
                                onClick={handleComplete}
                                disabled={completing}
                                className="btn-gradient flex items-center gap-2"
                            >
                                {completing ? 'Spracúvam...' : 'Označiť ako dokončené'}
                                <CheckCircle className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Review Form */}
            {showReview && (
                <div className="glass-card p-6 mt-6 bg-card dark:bg-slate-800/40 border border-gray-100 dark:border-gray-700/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ohodnotiť prácu</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Hodnotenie</label>
                            <div className="flex gap-2 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReview({ ...review, rating: star })}
                                        className="focus:outline-none"
                                    >
                                        <Star className={`w-8 h-8 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Komentár</label>
                            <textarea
                                rows={3}
                                className="input-modern"
                                placeholder="Napíšte svoje skúsenosti s remeselníkom..."
                                value={review.comment}
                                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                            />
                        </div>
                        <button onClick={handleSubmitReview} className="btn-gradient w-full">
                            Odoslať hodnotenie
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}