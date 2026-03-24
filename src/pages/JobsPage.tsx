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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#191970]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Ponuky prác</h1>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn-outline flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    {showFilters ? 'Skryť filter' : 'Zobraziť filter'}
                </button>
            </div>

            {showFilters && (
                <div className="filter-section animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Kategória"
                            className="form-input"
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Lokalita"
                            className="form-input"
                            value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Min cena (€)"
                            className="form-input"
                            value={filters.minBudget}
                            onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Max cena (€)"
                            className="form-input"
                            value={filters.maxBudget}
                            onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button onClick={handleFilter} className="btn-primary">
                            Filtrovať
                        </button>
                        <button onClick={resetFilters} className="btn-secondary">
                            Reset
                        </button>
                    </div>
                </div>
            )}

            {jobs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Žiadne práce</h3>
                    <p className="text-gray-500">Momentálne nie sú žiadne dostupné pracovné ponuky.</p>
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