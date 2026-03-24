// src/pages/MyOffersPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Clock, CheckCircle, XCircle, Eye, MapPin, Euro, Briefcase, RefreshCw } from 'lucide-react';

interface Offer {
    id: string;
    job_request_id: string;
    price: number;
    estimated_duration: string;
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    job: {
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
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

    const loadOffers = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('job_offers')
                .select(`
                    *,
                    job:job_requests!job_offers_job_request_id_fkey(
                        id,
                        title,
                        description,
                        location,
                        category,
                        budget_min,
                        budget_max,
                        status,
                        client:profiles!job_requests_client_id_fkey(
                            full_name,
                            avatar_url
                        )
                    )
                `)
                .eq('craftsman_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOffers(data || []);
        } catch (error) {
            console.error('Error loading offers:', error);
        } finally {
            setLoading(false);
        }
    };

    // Počiatočné načítanie
    useEffect(() => {
        loadOffers();
    }, [user]);

    // Real-time subskripcia na zmeny v ponukách
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
                () => {
                    console.log('Offer changed, reloading...');
                    loadOffers();
                }
            )
            .subscribe();

        // Event listener pre manuálne refresh (z iných komponentov)
        const handleRefresh = () => {
            loadOffers();
        };
        window.addEventListener('refresh-offers', handleRefresh);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('refresh-offers', handleRefresh);
        };
    }, [user]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'accepted':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return { text: 'Čaká na schválenie', class: 'bg-yellow-100 text-yellow-800' };
            case 'accepted':
                return { text: 'Prijatá ✓', class: 'bg-green-100 text-green-800' };
            case 'rejected':
                return { text: 'Zamietnutá ✗', class: 'bg-red-100 text-red-800' };
            default:
                return { text: status, class: 'bg-gray-100 text-gray-800' };
        }
    };

    const filteredOffers = offers.filter(offer =>
        filter === 'all' ? true : offer.status === filter
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Moje ponuky</h1>
                    <p className="text-gray-500 mt-1">Prehľad všetkých vašich ponúk na práce</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => loadOffers()}
                        className="btn-outline text-sm py-2 px-3 flex items-center gap-1"
                        title="Obnoviť"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Obnoviť
                    </button>
                    <Link to="/jobs" className="btn-outline text-sm">
                        🔍 Prehliadať práce
                    </Link>
                </div>
            </div>

            {/* Filtre */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {[
                    { value: 'all', label: 'Všetky', count: offers.length },
                    { value: 'pending', label: 'Čakajúce', count: offers.filter(o => o.status === 'pending').length },
                    { value: 'accepted', label: 'Prijaté', count: offers.filter(o => o.status === 'accepted').length },
                    { value: 'rejected', label: 'Zamietnuté', count: offers.filter(o => o.status === 'rejected').length }
                ].map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value as any)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === tab.value
                            ? 'bg-coral-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {filteredOffers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                    <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Žiadne ponuky</h3>
                    <p className="text-gray-500">
                        {filter === 'all'
                            ? 'Zatiaľ ste neodoslali žiadnu ponuku.'
                            : filter === 'pending'
                                ? 'Nemáte žiadne čakajúce ponuky.'
                                : filter === 'accepted'
                                    ? 'Nemáte žiadne prijaté ponuky.'
                                    : 'Nemáte žiadne zamietnuté ponuky.'}
                    </p>
                    <Link to="/jobs" className="btn-gradient inline-flex mt-6">
                        Prehliadať práce
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOffers.map((offer) => {
                        const status = getStatusText(offer.status);
                        return (
                            <div key={offer.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
                                <div className="p-5">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <h2 className="text-xl font-semibold text-gray-900">
                                                    {offer.job?.title}
                                                </h2>
                                                <span className={`text-xs px-2 py-1 rounded-full ${status.class} flex items-center gap-1`}>
                                                    {getStatusIcon(offer.status)}
                                                    <span>{status.text}</span>
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                                {offer.job?.description}
                                            </p>

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="w-4 h-4" /> {offer.job?.category}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" /> {offer.job?.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Euro className="w-4 h-4" /> {offer.job?.budget_min}€ - {offer.job?.budget_max}€
                                                </span>
                                            </div>

                                            {/* Tvoja ponuka */}
                                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                                <p className="text-sm font-medium text-gray-700 mb-1">Tvoja ponuka:</p>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xl font-bold text-coral-500">{offer.price}€</span>
                                                    <span className="text-sm text-gray-500">⏱️ {offer.estimated_duration}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">"{offer.message}"</p>
                                            </div>

                                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                                                    {offer.job?.client?.full_name?.charAt(0) || 'K'}
                                                </div>
                                                <span className="text-sm text-gray-500">Klient: {offer.job?.client?.full_name}</span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(offer.created_at).toLocaleDateString('sk-SK')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 min-w-[100px]">
                                            <Link
                                                to={`/jobs/${offer.job_request_id}`}
                                                className="btn-primary text-sm py-2 px-3 flex items-center justify-center gap-1"
                                            >
                                                <Eye className="w-4 h-4" /> Detail
                                            </Link>
                                            {offer.status === 'accepted' && (
                                                <Link
                                                    to="/messages"
                                                    className="btn-outline text-sm py-2 px-3 flex items-center justify-center gap-1"
                                                >
                                                    💬 Správa
                                                </Link>
                                            )}
                                            {offer.status === 'rejected' && (
                                                <Link
                                                    to={`/jobs/${offer.job_request_id}`}
                                                    className="btn-outline text-sm py-2 px-3 flex items-center justify-center gap-1"
                                                >
                                                    🔄 Poslať novú ponuku
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}