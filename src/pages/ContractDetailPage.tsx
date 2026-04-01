import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Euro, Calendar, ArrowLeft, CheckCircle, Clock, MessageCircle, Star, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
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
    const [hasReviewed, setHasReviewed] = useState(false);

    useEffect(() => {
        if (id) loadContract();
    }, [id]);

    const loadContract = async () => {
        try {
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

            // Skontrolovať, či už používateľ zahlasoval
            const { data: existingReview } = await supabase
                .from('reviews')
                .select('id')
                .eq('contract_id', id)
                .eq('reviewer_id', user?.id)
                .maybeSingle();

            if (existingReview) {
                setHasReviewed(true);
            }
        } catch (error) {
            console.error('Error loading contract:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: any) => {
        const confirmMsg = newStatus === 'pending_confirmation' 
            ? 'Nahlásiť túto prácu ako hotovú a požiadať klienta o potvrdenie?' 
            : newStatus === 'completed'
            ? 'Potvrdiť, že práca je dokončená v poriadku?'
            : 'Nahlásiť nespokojnosť s vykonanou prácou?';
        
        if (!confirm(confirmMsg)) return;

        setCompleting(true);
        try {
            const { error } = await supabase
                .from('contracts')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            
            await loadContract();
            if (newStatus === 'completed') {
                setShowReview(true);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Nepodarilo sa aktualizovať stav zmluvy');
        } finally {
            setCompleting(false);
        }
    };

    const handleSubmitReview = async () => {
        try {
            const { error } = await supabase
                .from('reviews')
                .insert({
                    contract_id: id,
                    reviewer_id: user!.id,
                    reviewed_id: isClient ? contract.craftsman_id : contract.client_id,
                    rating: review.rating,
                    comment: review.comment
                });

            if (error) throw error;
            alert('Ďakujeme za vaše hodnotenie!');
            setHasReviewed(true);
            setShowReview(false);
            await loadContract();
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
    const isCraftsman = profile?.role === 'craftsman';
    const isActive = contract.status === 'active';
    const isPendingConfirmation = contract.status === 'pending_confirmation';
    const isCompleted = contract.status === 'completed';
    const isDisputed = contract.status === 'disputed';

    // Remeselník môže nahlásiť prácu ako hotovú len ak je zmluva aktívna
    const canMarkFinished = isActive && isCraftsman;
    // Zákazník môže potvrdiť dokončenie len ak je v stave čakajúcom na potvrdenie
    const canConfirmCompletion = isPendingConfirmation && isClient;
    // Hodnotiť môžu obaja len po úplnom dokončení (completed) ak ešte nehodnotili
    const canReview = isCompleted && !hasReviewed;

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
            <div className={`rounded-2xl p-5 mb-8 flex items-center justify-between border shadow-sm ${
                isCompleted ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-400' :
                isPendingConfirmation ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-900 dark:text-blue-400' :
                isDisputed ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-900 dark:text-red-400' :
                'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-400'
            }`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isCompleted ? 'bg-emerald-100 dark:bg-emerald-500/20' :
                        isPendingConfirmation ? 'bg-blue-100 dark:bg-blue-500/20' :
                        isDisputed ? 'bg-red-100 dark:bg-red-500/20' :
                        'bg-amber-100 dark:bg-amber-500/20'
                    }`}>
                        {isCompleted ? <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> :
                         isPendingConfirmation ? <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" /> :
                         isDisputed ? <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" /> :
                         <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-0.5">Stav objednávky</p>
                        <p className="text-lg font-black tracking-tight leading-none">
                            {isCompleted ? 'Práca bola dokončená' :
                             isPendingConfirmation ? 'Práca ohlásená ako hotová' :
                             isDisputed ? 'Prebieha riešenie problému' :
                             'Práca prebieha'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Cena spolu</p>
                    <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                        {contract.final_price}€
                    </span>
                </div>
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
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl shadow-navy-900/5 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">Dostupné akcie</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Správa zmluvného vzťahu</p>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <Link to={`/messages?user=${isClient ? contract.craftsman_id : contract.client_id}`} className="flex-1 md:flex-none px-6 py-3 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
                            <MessageCircle className="w-4 h-4" /> Napísať správu
                        </Link>
                        
                        {canMarkFinished && (
                            <button
                                onClick={() => handleStatusUpdate('pending_confirmation')}
                                disabled={completing}
                                className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {completing ? '...' : 'Nahlásiť ako hotové'}
                                <CheckCircle className="w-5 h-5" />
                            </button>
                        )}

                        {canConfirmCompletion && (
                            <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => handleStatusUpdate('completed')}
                                    disabled={completing}
                                    className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    Áno, všetko je v poriadku
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('disputed')}
                                    disabled={completing}
                                    className="flex-1 md:flex-none px-8 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded-xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
                                >
                                    Nie, nie som spokojný
                                </button>
                            </div>
                        )}

                        {canReview && !showReview && (
                            <button
                                onClick={() => setShowReview(true)}
                                className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-coral-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                Ohodnotiť {isClient ? 'remeselníka' : 'zákazníka'}
                                <Star className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Form */}
            {showReview && canReview && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-navy-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden"
                >
                    <Star className="absolute -top-10 -right-10 w-48 h-48 text-white/5 rotate-12" />
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black tracking-tight mb-2">Ohodnoťte spoluprácu</h2>
                        <p className="text-white/60 mb-8 font-medium">Vaša spätná väzba pomáha budovať komunitu HammerIt.</p>
                        
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Vaše hodnotenie</label>
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReview({ ...review, rating: star })}
                                            className="group relative transition-transform active:scale-90"
                                        >
                                            <Star className={`w-12 h-12 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-white/10'}`} />
                                            {star === review.rating && (
                                                <motion.div layoutId="star-glow" className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Komentár</label>
                                <textarea
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-sm font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-coral-500 transition-all resize-none shadow-inner"
                                    placeholder={isClient ? "Aké boli vaše skúsenosti s remeselníkom..." : "Aké boli vaše skúsenosti so zákazníkom..."}
                                    value={review.comment}
                                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                />
                            </div>
                            <button 
                                onClick={handleSubmitReview} 
                                className="w-full bg-gradient-to-r from-coral-500 to-coral-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-coral-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all text-sm uppercase tracking-widest"
                            >
                                Odoslať hodnotenie
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {hasReviewed && (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-10 rounded-[3rem] border border-emerald-500/20 text-center">
                    <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-tight">Hodnotenie odoslané</h3>
                    <p className="text-emerald-700/60 dark:text-emerald-400/60 max-w-sm mx-auto font-medium mt-2">
                        Ďakujeme za vašu recenziu. Pomohli ste tak ostatným používateľom pri rozhodovaní.
                    </p>
                </div>
            )}
        </div>
    );
}