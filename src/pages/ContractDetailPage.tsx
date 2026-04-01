import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Calendar, ArrowLeft, CheckCircle, Clock, MessageCircle, Star, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { contractService } from '../services/contractService';

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

    const handleStatusUpdate = async (action: 'report' | 'confirm' | 'dispute') => {
        let confirmMsg = '';
        if (action === 'report') confirmMsg = 'Nahlásiť túto prácu ako hotovú a požiadať klienta o potvrdenie?';
        else if (action === 'confirm') confirmMsg = 'Potvrdiť, že práca je dokončená v poriadku?';
        else if (action === 'dispute') confirmMsg = 'Nahlásiť nespokojnosť s vykonanou prácou?';
        
        if (!confirm(confirmMsg)) return;

        setCompleting(true);
        try {
            if (action === 'report') {
                await contractService.reportFinished(id!);
            } else if (action === 'confirm') {
                await contractService.confirmFinished(id!);
                setShowReview(true);
            } else if (action === 'dispute') {
                const reason = prompt('Uveďte prosím krátky dôvod nespokojnosti:');
                if (!reason) {
                    setCompleting(false);
                    return;
                }
                await contractService.raiseDispute(id!, reason);
            }
            
            await loadContract();
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

    if (loading) return <div className="flex justify-center items-center h-64"><div className="spinner"></div></div>;

    if (!contract) return (
        <div className="glass-card p-12 text-center bg-card dark:bg-slate-800/40 border border-gray-100 dark:border-gray-700/50">
            <p className="text-gray-500 dark:text-gray-400">Zmluva nebola nájdená</p>
            <Link to="/contracts" className="btn-gradient inline-flex mt-4">Späť na zmluvy</Link>
        </div>
    );

    const isClient = profile?.role === 'client';
    const isCraftsman = profile?.role === 'craftsman';
    const isActive = contract.status === 'active';
    const isPendingConfirmation = contract.status === 'pending_confirmation';
    const isCompleted = contract.status === 'completed';
    const isDisputed = contract.status === 'disputed';

    const canMarkFinished = isActive && isCraftsman;
    const canConfirmCompletion = isPendingConfirmation && isClient;
    const canReview = isCompleted && !hasReviewed;

    return (
        <div className="max-w-4xl mx-auto pb-32 animate-fade-in">
            <button
                onClick={() => navigate('/contracts')}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors mb-6 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Späť na zmluvy
            </button>

            {/* Status Banner */}
            <div className={`rounded-[2.5rem] p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center justify-between border shadow-2xl shadow-navy-900/5 ${
                isCompleted ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-400' :
                isPendingConfirmation ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-900 dark:text-blue-400' :
                isDisputed ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-900 dark:text-red-400' :
                'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-400'
            }`}>
                <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg ${
                        isCompleted ? 'bg-white dark:bg-emerald-500/20 text-emerald-600' :
                        isPendingConfirmation ? 'bg-white dark:bg-blue-500/20 text-blue-600' :
                        isDisputed ? 'bg-white dark:bg-red-500/20 text-red-600' :
                        'bg-white dark:bg-amber-500/20 text-amber-600'
                    }`}>
                        {isCompleted ? <CheckCircle className="w-8 h-8" /> :
                         isPendingConfirmation ? <Clock className="w-8 h-8" /> :
                         isDisputed ? <AlertCircle className="w-8 h-8" /> :
                         <Clock className="w-8 h-8" />}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Aktuálny stav projektu</p>
                        <p className="text-xl md:text-2xl font-black tracking-tighter">
                            {isCompleted ? 'Dielo dokončené' :
                             isPendingConfirmation ? 'Čaká na potvrdenie' :
                             isDisputed ? 'Prebieha reklamácia' :
                             'Zákazka v realizácii'}
                        </p>
                    </div>
                </div>
                <div className="mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-current/10 md:pl-8 flex flex-col items-center md:items-end w-full md:w-auto">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 leading-none">Dohodnutá odmena</p>
                    <span className="text-3xl font-black">{contract.final_price}€</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-navy-900/5 border border-gray-100 dark:border-white/5">
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">{contract.job?.title}</h1>
                        
                        <div className="flex flex-wrap gap-6 mb-10 text-sm font-bold text-gray-400">
                             <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-coral-500" /> {contract.job?.location.split(',')[0]}</span>
                             <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-coral-500" /> {new Date(contract.created_at).toLocaleDateString('sk-SK')}</span>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Popis zákazky</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium text-lg whitespace-pre-wrap">{contract.job?.description}</p>
                        </div>
                    </div>

                    {/* Action Panel */}
                    <div className="bg-navy-900 p-8 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                        <ShieldAlert className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 -rotate-12" />
                        <h2 className="text-2xl font-black tracking-tight mb-2">Správa spolupráce</h2>
                        <p className="text-white/60 mb-8 font-medium">Aktualizujte stav práce alebo komunikujte s partnerom.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                            <Link to={`/messages?user=${isClient ? contract.craftsman_id : contract.client_id}`} className="flex items-center justify-center gap-3 px-6 py-5 bg-white/10 hover:bg-white/20 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all">
                                <MessageCircle className="w-5 h-5" /> Chat
                            </Link>
                            
                            {canMarkFinished && (
                                <button
                                    onClick={() => handleStatusUpdate('report')}
                                    disabled={completing}
                                    className="px-6 py-5 bg-coral-500 hover:bg-coral-600 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-coral-500/30 flex items-center justify-center gap-2"
                                >
                                    {completing ? '...' : 'Mám hotovo'}
                                    <CheckCircle className="w-5 h-5" />
                                </button>
                            )}

                            {canConfirmCompletion && (
                                <>
                                    <button
                                        onClick={() => handleStatusUpdate('confirm')}
                                        disabled={completing}
                                        className="px-6 py-5 bg-emerald-500 hover:bg-emerald-600 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                                    >
                                        Potvrdiť dokončenie
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('dispute')}
                                        disabled={completing}
                                        className="px-6 py-5 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all border border-red-500/50"
                                    >
                                        Reklamovať
                                    </button>
                                </>
                            )}

                            {canReview && !showReview && (
                                <button
                                    onClick={() => setShowReview(true)}
                                    className="px-6 py-5 bg-yellow-500 hover:bg-yellow-600 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2"
                                >
                                    Ohodnotiť <Star className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Participant Cards */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Zúčastnené strany</p>
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-navy-100 dark:bg-navy-500/20 flex items-center justify-center text-navy-600 font-black text-xl">
                                    {contract.client?.full_name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Klient</p>
                                    <p className="font-black text-gray-900 dark:text-white">{contract.client?.full_name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-coral-100 dark:bg-coral-500/20 flex items-center justify-center text-coral-600 font-black text-xl">
                                    {contract.craftsman?.full_name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Remeselník</p>
                                    <p className="font-black text-gray-900 dark:text-white">{contract.craftsman?.full_name}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Review Block (after submission) */}
                    {hasReviewed && (
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-8 rounded-[2.5rem] border border-emerald-500/20 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-emerald-500 shadow-sm">
                                <Star className="w-6 h-6 fill-current" />
                            </div>
                            <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-400 uppercase">Hodnotenie hotové</h4>
                             <p className="text-[11px] text-emerald-700/60 dark:text-emerald-400/60 font-bold mt-1">Vaša recenzia je zverejnená!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Review Overlay */}
            {showReview && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="fixed inset-0 z-[100] bg-navy-950/90 backdrop-blur-xl flex items-center justify-center p-4"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 md:p-14 relative shadow-2xl overflow-hidden"
                    >
                        <button onClick={() => setShowReview(false)} className="absolute top-8 right-8 text-gray-400 hover:text-coral-500"><AlertCircle className="w-8 h-8 rotate-45" /></button>
                        
                        <div className="text-center space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Ako ste boli spokojní?</h2>
                                <p className="text-gray-500 font-medium">Vaše hodnotenie pomáha ostatným používateľom.</p>
                            </div>

                            <div className="flex justify-center gap-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} onClick={() => setReview({ ...review, rating: star })} className="transition-transform active:scale-90">
                                        <Star className={`w-12 h-12 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-slate-800'}`} />
                                    </button>
                                ))}
                            </div>

                            <textarea
                                rows={4}
                                className="w-full bg-gray-50 dark:bg-slate-800 border-none p-6 rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-coral-500 transition-all resize-none"
                                placeholder="Napíšte krátky komentár..."
                                value={review.comment}
                                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                            />

                            <button 
                                onClick={handleSubmitReview}
                                className="w-full bg-coral-500 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-coral-500/25 uppercase tracking-widest text-sm hover:bg-coral-600 transition-all"
                            >
                                Odoslať hodnotenie
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}