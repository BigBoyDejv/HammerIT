import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  RefreshCw,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  MapPin,
  MessageSquare,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function MyRequestsPage() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<any[]>([]);
    const [contracts, setContracts] = useState<any[]>([]);
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('');

    const isClient = profile?.role === 'client';

    // Nastaviť počiatočný tab podľa roly
    useEffect(() => {
        if (activeTab === '') {
            setActiveTab(isClient ? 'open' : 'offers');
        }
    }, [isClient, activeTab]);

    const loadData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Dopyty (len klient)
            if (isClient) {
                const { data: jobData } = await supabase
                    .from('job_requests')
                    .select('*, job_offers(count)')
                    .eq('client_id', user.id)
                    .order('created_at', { ascending: false });
                setJobs(jobData || []);
            } else {
                // 1b. Ponuky (len remeselník)
                const { data: offerData } = await supabase
                    .from('job_offers')
                    .select('*, job:job_requests(*, client:profiles!client_id(full_name, avatar_url))')
                    .eq('craftsman_id', user.id)
                    .order('created_at', { ascending: false });
                setOffers(offerData || []);
            }

            // 2. Zmluvy (obaja)
            const roleColumn = isClient ? 'client_id' : 'craftsman_id';
            const { data: contractData } = await supabase
                .from('contracts')
                .select(`
                    *,
                    job:job_requests(*),
                    craftsman:profiles!contracts_craftsman_id_fkey(full_name, avatar_url),
                    client:profiles!contracts_client_id_fkey(full_name, avatar_url)
                `)
                .eq(roleColumn, user.id)
                .order('created_at', { ascending: false });
            setContracts(contractData || []);

        } catch (error) {
            console.error('Error loading activity data:', error);
        } finally {
            setLoading(false);
        }
    }, [user, isClient]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const counts = {
        open: jobs.filter(j => j.status === 'open').length,
        offers: offers.filter(o => o.status === 'pending').length,
        in_progress: contracts.filter(c => c.status === 'active' || c.status === 'pending_confirmation' || c.status === 'disputed').length,
        completed: contracts.filter(c => c.status === 'completed').length
    };

    const SkeletonCard = () => (
        <div className="bg-white dark:bg-slate-900 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 dark:border-white/5 animate-pulse space-y-4">
            <div className="h-6 w-2/3 bg-gray-100 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-20 w-full bg-gray-50 dark:bg-slate-800/50 rounded-2xl"></div>
        </div>
    );

    const JobRequestCard = ({ job }: { job: any }) => (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 dark:border-white/5 shadow-2xl shadow-navy-900/5 hover:shadow-coral-500/10 transition-all group relative overflow-hidden"
            onClick={() => navigate(`/jobs/${job.id}`)}
        >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-coral-500 transition-colors line-clamp-2">
                        {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-1 rounded-full bg-navy-900 text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-navy-900/20">
                            <FileText className="w-2.5 h-2.5 md:w-3 md:h-3" /> Čaká na ponuky
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-start sm:items-end w-full sm:w-auto mt-2 sm:mt-0">
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rozpočet</p>
                    <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-none">
                        {job.budget_min === job.budget_max ? `${job.budget_min}€` : `${job.budget_min}-${job.budget_max}€`}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-coral-100 dark:bg-coral-500/10 rounded-lg md:rounded-xl flex items-center justify-center text-coral-600 dark:text-coral-400">
                        <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                            Ponuky
                        </p>
                        <p className="text-[11px] md:text-xs font-bold text-gray-900 dark:text-white leading-none truncate">
                            {job.job_offers?.[0]?.count || 0} reakcií
                        </p>
                    </div>
                </div>
                <div className="flex justify-end items-center min-w-0">
                    <div className="text-right min-w-0">
                        <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Lokalita</p>
                        <div className="flex items-center justify-end gap-1 text-[11px] md:text-xs font-bold text-gray-900 dark:text-white truncate">
                            <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 text-coral-500 shrink-0" />
                            <span className="truncate">{job.location.split(',')[0]}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const SentOfferCard = ({ offer }: { offer: any }) => (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 dark:border-white/5 shadow-2xl shadow-navy-900/5 hover:shadow-coral-500/10 transition-all group relative overflow-hidden"
            onClick={() => navigate(`/jobs/${offer.job_request_id}`)}
        >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-coral-500 transition-colors line-clamp-2">
                        {offer.job?.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                        {offer.status === 'pending' ? (
                            <span className="px-2 py-1 rounded-full bg-amber-500 text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-amber-500/20">
                                <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" /> Čaká na vyjadrenie
                            </span>
                        ) : (
                            <span className="px-2 py-1 rounded-full bg-red-500 text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-red-500/20">
                                <AlertCircle className="w-2.5 h-2.5 md:w-3 md:h-3" /> Zamietnuté klientom
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-start sm:items-end w-full sm:w-auto mt-2 sm:mt-0">
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Vaša cena</p>
                    <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-none">{offer.price}€</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-navy-900 rounded-lg md:rounded-xl flex items-center justify-center text-white text-xs md:text-sm font-black shrink-0">
                        {offer.job?.client?.full_name?.charAt(0) || 'K'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                            Klient
                        </p>
                        <p className="text-[11px] md:text-xs font-bold text-gray-900 dark:text-white leading-none truncate">
                            {offer.job?.client?.full_name}
                        </p>
                    </div>
                </div>
                <div className="flex justify-end items-center min-w-0">
                    <div className="text-right min-w-0">
                        <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Trvanie</p>
                        <div className="flex items-center justify-end gap-1 text-[11px] md:text-xs font-bold text-gray-900 dark:text-white truncate">
                            <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 text-coral-500 shrink-0" />
                            <span className="truncate">{offer.estimated_duration}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-coral-500 hidden md:block">
                <ArrowRight className="w-8 h-8" />
            </div>
        </motion.div>
    );

    const ContractCard = ({ contract }: { contract: any }) => (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 dark:border-white/5 shadow-2xl shadow-navy-900/5 hover:shadow-coral-500/10 transition-all group relative overflow-hidden"
            onClick={() => navigate(`/contracts/${contract.id}`)}
        >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-coral-500 transition-colors line-clamp-2">
                        {contract.job?.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                        {contract.status === 'active' && (
                            <span className="px-2 py-1 rounded-full bg-amber-500 text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-amber-500/20">
                                <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" /> Prebieha
                            </span>
                        )}
                        {contract.status === 'pending_confirmation' && (
                            <span className="px-2 py-1 rounded-full bg-blue-500 text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-blue-500/20">
                                <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" /> Čaká na potvrdenie
                            </span>
                        )}
                        {contract.status === 'completed' && (
                            <span className="px-2 py-1 rounded-full bg-emerald-500 text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                                <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" /> Dokončené
                            </span>
                        )}
                        {contract.status === 'disputed' && (
                            <span className="px-2 py-1 rounded-full bg-red-500 text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-red-500/20">
                                <AlertCircle className="w-2.5 h-2.5 md:w-3 md:h-3" /> Reklamácia
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-start sm:items-end w-full sm:w-auto mt-2 sm:mt-0">
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cena</p>
                    <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-none">{contract.final_price}€</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-navy-900 rounded-lg md:rounded-xl flex items-center justify-center text-white text-xs md:text-sm font-black shrink-0">
                        {(isClient ? contract.craftsman?.full_name : contract.client?.full_name)?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                            {isClient ? 'Remeselník' : 'Klient'}
                        </p>
                        <p className="text-[11px] md:text-xs font-bold text-gray-900 dark:text-white leading-none truncate">
                            {isClient ? contract.craftsman?.full_name : contract.client?.full_name}
                        </p>
                    </div>
                </div>
                <div className="flex justify-end items-center min-w-0">
                    <div className="text-right min-w-0">
                        <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Lokalita</p>
                        <div className="flex items-center justify-end gap-1 text-[11px] md:text-xs font-bold text-gray-900 dark:text-white truncate">
                            <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 text-coral-500 shrink-0" />
                            <span className="truncate">{contract.job?.location.split(',')[0]}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 pb-32">
            <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-white/5 pt-20 md:pt-12 pb-8 md:pb-16 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-1 md:space-y-4">
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-1 md:mb-4">
                                Moje <span className="text-coral-500">{isClient ? 'zakázky' : 'práce'}</span>
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm md:text-base max-w-xl">
                                {isClient 
                                    ? 'Správa vašich dopytov a prebiehajúcich prác na jednom mieste.'
                                    : 'Sledujte svoje odoslané ponuky a aktívne zákazky.'
                                }
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {isClient ? (
                                <Link to="/jobs/new" className="flex-1 md:flex-none px-6 md:px-8 py-3 md:py-4 bg-navy-900 dark:bg-coral-500 text-white rounded-2xl md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3">
                                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                                    <span className="whitespace-nowrap">Nový dopyt</span>
                                </Link>
                            ) : (
                                <Link to="/jobs" className="flex-1 md:flex-none px-6 md:px-8 py-3 md:py-4 bg-navy-900 dark:bg-coral-500 text-white rounded-2xl md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3">
                                    <Zap className="w-4 h-4 md:w-5 md:h-5" />
                                    <span className="whitespace-nowrap">Hľadať zákazky</span>
                                </Link>
                            )}
                            <button onClick={loadData} className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl md:rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-400 hover:text-coral-500 transition-colors bg-gray-50 dark:bg-white/5">
                                <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar mt-8 md:mt-12 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                        {[
                            ...(isClient ? [{ id: 'open', label: 'Dopyty', count: counts.open, icon: FileText }] : [{ id: 'offers', label: 'Moje ponuky', count: counts.offers, icon: Zap }]),
                            { id: 'in_progress', label: 'V procese', count: counts.in_progress, icon: Clock },
                            { id: 'completed', label: 'História', count: counts.completed, icon: CheckCircle }
                        ].map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as string)}
                                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                                        isActive 
                                        ? 'bg-navy-900 text-white shadow-xl shadow-navy-900/20 translate-y-[-2px]' 
                                        : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100'
                                    }`}
                                >
                                    <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-coral-500' : ''}`} />
                                    {tab.label}
                                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] md:text-[10px] ${isActive ? 'bg-white/10' : 'bg-gray-200 dark:bg-slate-700'}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        {activeTab === 'open' && isClient && (
                            jobs.filter(j => j.status === 'open').length === 0 ? (
                                <EmptyState title="Žiadne otvorené dopyty" msg="Momentálne nemáte žiadne dopyty čakajúce na ponuky." />
                            ) : (
                                jobs.filter(j => j.status === 'open').map(job => (
                                    <JobRequestCard key={job.id} job={job} />
                                ))
                            )
                        )}

                        {activeTab === 'offers' && !isClient && (
                            offers.length === 0 ? (
                                <EmptyState title="Zatiaľ žiadne ponuky" msg="Ešte ste neposlali žiadnu ponuku na prácu." />
                            ) : (
                                offers.map(offer => (
                                    <SentOfferCard key={offer.id} offer={offer} />
                                ))
                            )
                        )}

                        {activeTab === 'in_progress' && (
                            contracts.filter(c => c.status !== 'completed' && c.status !== 'cancelled').length === 0 ? (
                                <EmptyState title="Žiadne aktívne práce" msg="Momentálne neprebiehajú žiadne práce." />
                            ) : (
                                contracts.filter(c => c.status !== 'completed' && c.status !== 'cancelled').map(contract => (
                                    <ContractCard key={contract.id} contract={contract} />
                                ))
                            )
                        )}

                        {activeTab === 'completed' && (
                            contracts.filter(c => c.status === 'completed').length === 0 ? (
                                <EmptyState title="História je prázdna" msg="Zatiaľ nemáte žiadne dokončené práce." />
                            ) : (
                                contracts.filter(c => c.status === 'completed').map(contract => (
                                    <ContractCard key={contract.id} contract={contract} />
                                ))
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function EmptyState({ title, msg }: { title: string, msg: string }) {
    return (
        <div className="col-span-full py-16 md:py-20 bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-white/5 text-center flex flex-col items-center shadow-sm px-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 dark:bg-slate-800 rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-6 text-4xl">📭</div>
            <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto">{msg}</p>
        </div>
    );
}
