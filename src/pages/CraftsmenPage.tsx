import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { craftsmanService } from '../services';

interface Craftsman {
    id: string;
    user_id: string;
    specialization: string[];
    hourly_rate: number | null;
    years_experience: number;
    verified: boolean;
    rating_avg: number;
    total_jobs: number;
    user: {
        full_name: string;
        avatar_url: string | null;
        phone: string | null;
        bio: string | null;
    };
}

export function CraftsmenPage() {
    const [craftsmen, setCraftsmen] = useState<Craftsman[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        specialization: '',
        minRate: '',
        maxRate: '',
        verified: false
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchCraftsmen();
    }, []);

    const fetchCraftsmen = async () => {
        setLoading(true);
        try {
            const data = await craftsmanService.getAllCraftsmen() as Craftsman[];
            setCraftsmen(data || []);
        } catch (error) {
            console.error('Chyba pri načítaní remeselníkov:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = async () => {
        setLoading(true);
        try {
            const data = await craftsmanService.getAllCraftsmen({
                specialization: filters.specialization || undefined,
                minRate: filters.minRate ? Number(filters.minRate) : undefined,
                maxRate: filters.maxRate ? Number(filters.maxRate) : undefined,
                verified: filters.verified || undefined
            }) as Craftsman[];
            setCraftsmen(data || []);
        } catch (error) {
            console.error('Chyba pri filtrovaní:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setFilters({ specialization: '', minRate: '', maxRate: '', verified: false });
        fetchCraftsmen();
    };

    const allSpecializations = [
        'Elektrikár', 'Murár', 'Maliar', 'Inštalatér',
        'Podlahár', 'Stavebné práce', 'Záhradník', 'Strechár'
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#191970] dark:border-coral-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Remeselníci</h1>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn-outline flex items-center gap-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    {showFilters ? 'Skryť filter' : 'Zobraziť filter'}
                </button>
            </div>

            {showFilters && (
                <div className="filter-section animate-fade-in bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select
                            className="form-select bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                            value={filters.specialization}
                            onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                        >
                            <option value="">Všetky kategórie</option>
                            {allSpecializations.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Min hodinová sadzba (€)"
                            className="form-input bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            value={filters.minRate}
                            onChange={(e) => setFilters({ ...filters, minRate: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Max hodinová sadzba (€)"
                            className="form-input bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            value={filters.maxRate}
                            onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                        />
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={filters.verified}
                                onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                                className="w-4 h-4 text-coral-500 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Len overení</span>
                        </label>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button onClick={handleFilter} className="btn-primary">Filtrovať</button>
                        <button onClick={resetFilters} className="btn-secondary dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Reset</button>
                    </div>
                </div>
            )}

            {craftsmen.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 italic">Nenašli sa žiadni remeselníci</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {craftsmen.map((craftsman) => (
                        <div key={craftsman.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-700">
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-navy-600 to-navy-700 dark:from-navy-700 dark:to-navy-800 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm">
                                            {craftsman.user.full_name?.charAt(0) || 'R'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                                {craftsman.user.full_name}
                                            </h3>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-yellow-500 dark:text-yellow-400">★</span>
                                                <span className="text-sm text-gray-600 dark:text-gray-300">{craftsman.rating_avg.toFixed(1)}</span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">({craftsman.total_jobs})</span>
                                                {craftsman.verified && (
                                                    <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-0.5 rounded-full">
                                                        Overený
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {craftsman.specialization.slice(0, 2).map((spec, idx) => (
                                            <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                                                {spec}
                                            </span>
                                        ))}
                                        {craftsman.specialization.length > 2 && (
                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                                                +{craftsman.specialization.length - 2}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                        {craftsman.user.bio || 'Žiadny popis'}
                                    </p>
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <div>
                                            <span className="text-2xl font-bold text-navy-600 dark:text-coral-400">{craftsman.hourly_rate}€</span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">/hod</span>
                                        </div>
                                        <Link
                                            to={`/craftsmen/${craftsman.user_id}`}
                                            className="btn-primary text-sm"
                                        >
                                            Zobraziť profil
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}