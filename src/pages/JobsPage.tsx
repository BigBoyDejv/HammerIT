import { LoadingSpinner } from '../components/LoadingSpinner';
// src/pages/JobsPage.tsx (pridaj craftsmanId do volania)
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { jobService } from '../services';
import JobCard from '../components/JobCard';

export function JobsPage() {
    const { user, profile } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        location: '',
        minBudget: '',
        maxBudget: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            // Pre remeselníka posielame jeho ID na filtrovanie prác, na ktoré už reagoval
            const craftsmanId = profile?.role === 'craftsman' ? user?.id : undefined;
            const data = await jobService.getAllJobs({
                status: 'open',
                category: filters.category || undefined,
                location: filters.location || undefined,
                minBudget: filters.minBudget ? Number(filters.minBudget) : undefined,
                maxBudget: filters.maxBudget ? Number(filters.maxBudget) : undefined,
                craftsmanId  // <-- PRIDANÉ
            });
            setJobs(data || []);
        } catch (error) {
            console.error('Chyba pri načítaní prác:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = async () => {
        setLoading(true);
        try {
            const craftsmanId = profile?.role === 'craftsman' ? user?.id : undefined;
            const data = await jobService.getAllJobs({
                status: 'open',
                category: filters.category || undefined,
                location: filters.location || undefined,
                minBudget: filters.minBudget ? Number(filters.minBudget) : undefined,
                maxBudget: filters.maxBudget ? Number(filters.maxBudget) : undefined,
                craftsmanId  // <-- PRIDANÉ
            });
            setJobs(data || []);
        } catch (error) {
            console.error('Chyba pri filtrovaní:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setFilters({ category: '', location: '', minBudget: '', maxBudget: '' });
        fetchJobs();
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ponuky prác</h1>
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
                <div className="filter-section animate-fade-in bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-1">Kategória</label>
                            <input
                                type="text"
                                placeholder="Hľadať kategóriu..."
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-1">Lokalita</label>
                            <input
                                type="text"
                                placeholder="Mesto, kraj..."
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-1">Min cena</label>
                            <input
                                type="number"
                                placeholder="€"
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                                value={filters.minBudget}
                                onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-1">Max cena</label>
                            <input
                                type="number"
                                placeholder="€"
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                                value={filters.maxBudget}
                                onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-50 dark:border-gray-700">
                        <button onClick={handleFilter} className="btn-primary py-2.5 px-8 flex-1 sm:flex-none">
                            Filtrovať práce
                        </button>
                        <button onClick={resetFilters} className="btn-secondary py-2.5 px-8 flex-1 sm:flex-none dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                            Resetovať filtre
                        </button>
                    </div>
                </div>
            )}

            {jobs.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 italic">Nenašli sa žiadne dostupné práce</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>
            )}
        </div>
    );
}