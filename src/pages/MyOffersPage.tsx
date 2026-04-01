import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { offerService } from '../services/offerService';
import { supabase } from '../lib/supabase';
import { OfferCard } from '../components/OfferCard';
import { OfferTabs } from '../components/OfferTabs';
import { 
  Briefcase, 
  Search, 
  RotateCcw, 
  Clock, 
  CheckCircle, 
  XCircle,
  LayoutGrid,
  List,
  RefreshCw,
  Zap,
  Tag
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Offer {
    id: string;
    job_request_id: string;
    price: number;
    estimated_duration: string;
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    job?: {
        id: string;
        title: string;
        description: string;
        location: string;
        category: string;
        budget_min: number;
        budget_max: number;
        status: string;
        client: {
            full_name: string;
            avatar_url: string | null;
        };
    };
}

export function MyOffersPage() {
    const { user } = useAuth();
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

    const loadOffers = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await offerService.getMyOffers(user.id);
            setOffers(data as Offer[] || []);
        } catch (error) {
            console.error('Error loading offers:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadOffers();
    }, [loadOffers]);

    // Real-time subscription
    useEffect(() => {
        if (!user) return;

        const subscription = supabase
            .channel(`offers:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'job_offers',
                    filter: `craftsman_id=eq.${user.id}`
                },
                () => loadOffers()
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user, loadOffers]);

    const filteredOffers = offers.filter(offer =>
        filter === 'all' ? true : offer.status === filter
    );

    const tabs = [
        { value: 'all', label: 'Všetky', count: offers.length },
        { value: 'pending', label: 'Čakajúce', count: offers.filter(o => o.status === 'pending').length },
        { value: 'accepted', label: 'Prijaté', count: offers.filter(o => o.status === 'accepted').length },
        { value: 'rejected', label: 'Zamietnuté', count: offers.filter(o => o.status === 'rejected').length }
    ];

    // Skeleton Loader Component
    const SkeletonOfferCard = () => (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
            <div className="flex justify-between mb-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4"></div>
            </div>
            <div className="flex gap-2 mb-6">
                <div className="h-5 bg-gray-100 dark:bg-gray-700/50 rounded w-20"></div>
                <div className="h-5 bg-gray-100 dark:bg-gray-700/50 rounded w-24"></div>
            </div>
            <div className="h-32 bg-gray-50 dark:bg-gray-900 rounded-2xl mb-6"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900/50 pb-24">
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 pt-28 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-3">
                                <Zap className="w-3 h-3" />
                                <span>Moja aktivita</span>
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                Moje <span className="gradient-text">ponuky</span>
                            </h1>
                            <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">
                                Sledujte stav svojich reakcií na dopyty v reálnom čase.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl shadow-inner ring-1 ring-black/5 dark:ring-white/5">
                                <button 
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm text-coral-500' : 'text-gray-400'}`}
                                >
                                    <LayoutGrid className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-coral-500' : 'text-gray-400'}`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                            <button
                                onClick={loadOffers}
                                className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700"
                                title="Obnoviť"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Obnoviť</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                {/* Tabs / Filters Component */}
                <OfferTabs 
                    tabs={tabs} 
                    activeTab={filter} 
                    onTabChange={(val) => setFilter(val as any)} 
                />

                {/* Main Content Area */}
                {loading ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
                        {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonOfferCard key={i} />)}
                    </div>
                ) : filteredOffers.length === 0 ? (
                    <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in ring-1 ring-black/5 dark:ring-white/5">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700/50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-gray-600">
                           {filter === 'pending' ? <Clock className="w-12 h-12" /> : filter === 'accepted' ? <CheckCircle className="w-12 h-12" /> : filter === 'rejected' ? <XCircle className="w-12 h-12" /> : <Search className="w-12 h-12" />}
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Žiadne ponuky {filter !== 'all' ? `v kategórii "${tabs.find(t => t.value === filter)?.label}"` : ''}</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-10 font-medium">
                            {filter === 'all' 
                                ? 'Zatiaľ ste neposlali žiadnu ponuku. Začnite hľadaním zaujímavých prác vo vašom okolí.'
                                : `Momentálne nemáte žiadne ponuky so stavom ${tabs.find(t => t.value === filter)?.label.toLowerCase()}.`}
                        </p>
                        <Link 
                            to="/jobs"
                            className="btn-primary inline-flex items-center gap-3 px-10 py-4 rounded-xl font-black shadow-xl shadow-coral-500/30 active:scale-95 transition-all text-sm uppercase tracking-[0.1em]"
                        >
                            <Search className="w-5 h-5" />
                            Prehliadať práce
                        </Link>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "max-w-3xl mx-auto space-y-8"}>
                        {filteredOffers.map((offer) => (
                            <div key={offer.id} className="animate-fade-in transition-all duration-300">
                                <OfferCard offer={offer} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}