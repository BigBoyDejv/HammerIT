import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
    Star, Mail, Phone, MessageCircle, CheckCircle, ArrowLeft, 
    ShieldCheck, MapPin, TrendingUp, Award, Image as ImageIcon,
    ChevronRight, Calendar, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

export function CraftsmanProfilePage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [craftsman, setCraftsman] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<any[]>([]);
    const [showContact, setShowContact] = useState(false);

    useEffect(() => {
        if (id) loadCraftsman();
    }, [id]);

    const loadCraftsman = async () => {
        try {
            const { data: craftsmanData, error: craftsmanError } = await supabase
                .from('craftsman_profiles')
                .select(`
                    *,
                    user:profiles!craftsman_profiles_user_id_fkey(
                        id,
                        full_name,
                        avatar_url,
                        phone,
                        bio,
                        email
                    )
                `)
                .eq('user_id', id)
                .single();

            if (craftsmanError) throw craftsmanError;
            setCraftsman(craftsmanData);

            const { data: reviewsData } = await supabase
                .from('reviews')
                .select(`
                    *,
                    reviewer:profiles!reviewer_id(
                        full_name,
                        avatar_url
                    )
                `)
                .eq('reviewed_id', id)
                .order('created_at', { ascending: false });

            setReviews(reviewsData || []);
        } catch (error) {
            console.error('Error loading craftsman:', error);
        } finally {
            setLoading(false);
        }
    };

    const startConversation = async () => {
        if (!user) {
            navigate('/auth/login');
            return;
        }

        try {
            const [participant_1, participant_2] = [user.id, id!].sort();

            let { data: conversation } = await supabase
                .from('conversations')
                .select('id')
                .eq('participant_1', participant_1)
                .eq('participant_2', participant_2)
                .maybeSingle();

            if (!conversation) {
                const { data: newConversation } = await supabase
                    .from('conversations')
                    .insert({ participant_1, participant_2, last_message_at: new Date().toISOString() })
                    .select()
                    .single();
                conversation = newConversation;
            }

            navigate(`/messages?user=${id}`);
        } catch (error) {
            console.error('Error starting conversation:', error);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-12 animate-pulse">
                    <div className="lg:w-2/3 space-y-8">
                        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-[3rem]" />
                        <div className="h-40 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem]" />
                        <div className="h-64 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem]" />
                    </div>
                    <div className="lg:w-1/3">
                        <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-[3rem] sticky top-24" />
                    </div>
                </div>
            </div>
        );
    }

    if (!craftsman) {
        return (
            <div className="text-center py-20 px-8">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">👤</div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Remeselník nebol nájdený</h2>
                <Link to="/craftsmen" className="text-coral-500 font-bold hover:underline inline-block mt-4 flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Späť na zoznam
                </Link>
            </div>
        );
    }

    const isOwnProfile = user?.id === craftsman.user_id;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
            {/* Back Button */}
            <Link to="/craftsmen" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-coral-500 font-bold transition-all mb-8 mt-4">
                <ArrowLeft className="w-4 h-4" /> Späť na remeselníkov
            </Link>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Main Content Column */}
                <div className="lg:w-2/3 space-y-12">
                    
                    {/* Hero Section */}
                    <div className="relative group">
                        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[3rem] p-8 sm:p-12 border border-gray-100 dark:border-white/5 shadow-2xl shadow-navy-900/5">
                            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                <div className="relative">
                                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] overflow-hidden flex items-center justify-center text-white text-6xl font-black shadow-2xl transition-transform group-hover:scale-105 duration-500 bg-gradient-to-br from-navy-800 to-black">
                                        {craftsman.user?.avatar_url ? (
                                            <img src={craftsman.user.avatar_url} alt={craftsman.user.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{craftsman.user?.full_name?.charAt(0) || 'R'}</span>
                                        )}
                                    </div>
                                    {craftsman.verified && (
                                        <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-lg border-[6px] border-white dark:border-slate-900">
                                            <ShieldCheck className="w-7 h-7" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="space-y-1">
                                        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                                            {craftsman.user?.full_name}
                                        </h1>
                                        <p className="text-lg font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <Award className="w-5 h-5 text-amber-500" /> {craftsman.years_experience} rokov profesionálnej praxe
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-2xl group/stat transition-colors hover:bg-amber-100">
                                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                            <span className="font-black text-amber-700 dark:text-amber-400">{craftsman.rating_avg?.toFixed(1) || 'Nový'}</span>
                                            <span className="text-xs font-bold text-amber-600/60 dark:text-amber-400/60">({craftsman.total_jobs || 0} recenzií)</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-2xl">
                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                            <span className="font-black text-emerald-700 dark:text-emerald-400">{craftsman.total_jobs || 0} zákaziek</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight underline decoration-coral-500 decoration-4 underline-offset-8">O mne</h2>
                        </div>
                        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 font-medium leading-relaxed whitespace-pre-wrap">
                            {craftsman.user?.bio || 'Tento remeselník zatiaľ nepridal žiadny podrobný popis o svojej práci a skúsenostiach.'}
                        </div>
                    </div>

                    {/* Specialization Tags */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Špecializácie</h2>
                        <div className="flex flex-wrap gap-3">
                            {craftsman.specialization?.map((spec: string, idx: number) => (
                                <motion.div 
                                    key={idx} 
                                    whileHover={{ scale: 1.05 }}
                                    className="px-6 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-black text-gray-700 dark:text-gray-200 shadow-sm flex items-center gap-2 group cursor-default"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-coral-500 group-hover:scale-150 transition-transform" />
                                    {spec}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Portfolio / Gallery */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Portfólio prác</h2>
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{craftsman.portfolio?.length || 0} fotiek</span>
                        </div>
                        
                        {craftsman.portfolio && craftsman.portfolio.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {craftsman.portfolio.map((img: string, idx: number) => (
                                    <motion.div 
                                        key={idx} 
                                        whileHover={{ scale: 1.02 }}
                                        className="aspect-video rounded-[2rem] overflow-hidden border-2 border-gray-50 dark:border-white/5 shadow-xl group relative cursor-pointer"
                                        onClick={() => window.open(img, '_blank')}
                                    >
                                        <img src={img} alt={`Práca ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <ImageIcon className="text-white w-10 h-10" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 rounded-[3rem] bg-gray-50 dark:bg-slate-900/50 border-2 border-dashed border-gray-200 dark:border-white/5 text-center px-12">
                                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm shadow-navy-900/5 text-3xl">🏗️</div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Budujeme galériu</h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Tento remeselník zatiaľ nepridal žiadne vizuálne ukážky svojich projektov.</p>
                            </div>
                        )}
                    </div>

                    {/* Reviews Feed */}
                    <div className="space-y-8 pt-8 px-1">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Hodnotenia</h2>
                            {!isOwnProfile && (
                                <button className="flex items-center gap-2 text-coral-500 font-black text-sm group">
                                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Napísať recenziu
                                </button>
                            )}
                        </div>

                        {reviews.length === 0 ? (
                            <div className="p-12 text-center bg-gray-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-gray-100 dark:border-white/5 italic text-gray-500">
                                Zatiaľ nie sú dostupné žiadne recenzie.
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {reviews.map((review) => (
                                    <motion.div 
                                        key={review.id} 
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-gray-50 dark:border-white/5 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center text-white font-black text-xl bg-gradient-to-tr from-coral-500 to-coral-600">
                                                    {review.reviewer?.avatar_url ? (
                                                        <img src={review.reviewer.avatar_url} alt={review.reviewer.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{review.reviewer?.full_name?.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 dark:text-white">{review.reviewer?.full_name}</p>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200 dark:text-gray-700'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {new Date(review.created_at).toLocaleDateString('sk-SK')}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed italic">"{review.comment}"</p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Sidebar Column */}
                <div className="lg:w-1/3">
                    <div className="sticky top-24 space-y-8">
                        
                        {/* Action Card */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-10 border border-gray-100 dark:border-white/5 shadow-2xl shadow-navy-900/5 space-y-8"
                        >
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Hodinová sadzba
                                </p>
                                <div className="flex items-end gap-2">
                                    <span className="text-5xl font-black text-gray-900 dark:text-white leading-none">
                                        {craftsman.hourly_rate || 'Dohoda'}
                                    </span>
                                    {craftsman.hourly_rate && <span className="text-xl font-bold text-gray-400 dark:text-gray-500 mb-1">€/hod</span>}
                                </div>
                            </div>

                            {craftsman.transport_rate && (
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-coral-500" />
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Doprava</span>
                                    </div>
                                    <span className="font-black text-gray-900 dark:text-white">{craftsman.transport_rate} €/km</span>
                                </div>
                            )}

                            {!isOwnProfile && (
                                <div className="space-y-4">
                                    <button 
                                        onClick={startConversation}
                                        className="w-full bg-gradient-to-tr from-coral-500 to-coral-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-coral-500/25 flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:brightness-110"
                                    >
                                        <MessageCircle className="w-6 h-6" /> Poslať správu
                                    </button>
                                    <button className="w-full bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all">
                                        Požiadať o cenu
                                    </button>
                                </div>
                            )}

                            {/* Contact Box */}
                            <div className="pt-8 border-t border-gray-100 dark:border-white/5 space-y-6">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Informácie</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => !showContact && setShowContact(true)}>
                                        <div className="w-12 h-12 bg-navy-50 dark:bg-navy-900/40 rounded-2xl flex items-center justify-center text-navy-600 dark:text-coral-400 group-hover:scale-110 transition-transform">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Telefón</p>
                                            <p className="font-black text-gray-900 dark:text-white">
                                                {showContact ? (craftsman.user?.phone || 'Nedostupné') : craftsman.user?.phone?.replace(/\d(?=\d{3})/g, '•')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => !showContact && setShowContact(true)}>
                                        <div className="w-12 h-12 bg-navy-50 dark:bg-navy-900/40 rounded-2xl flex items-center justify-center text-navy-600 dark:text-coral-400 group-hover:scale-110 transition-transform">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                                            <p className="font-black text-gray-900 dark:text-white truncate">
                                                {showContact ? craftsman.user?.email : '••••••••@••••.••'}
                                            </p>
                                        </div>
                                    </div>

                                    {!showContact && (
                                        <button 
                                            onClick={() => setShowContact(true)}
                                            className="w-full mt-2 text-[10px] font-black text-coral-500 uppercase tracking-widest border border-coral-200 dark:border-coral-900/50 py-3 rounded-xl hover:bg-coral-50 dark:hover:bg-coral-900/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            Zobraziť kontakt <ChevronRight className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Safety Tip Card */}
                        <div className="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-[3rem] p-8 border border-emerald-500/20">
                            <div className="flex items-center gap-3 mb-4">
                                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase text-[10px] tracking-widest">Bezpečnosť nadovšetko</span>
                            </div>
                            <p className="text-sm font-medium text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">
                                Plaťte postupne po dokončení kontrolných bodov. Seriózny remeselník nikdy nevyžaduje 100 % platby vopred.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}