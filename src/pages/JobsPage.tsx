import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { jobService } from '../services';
import JobCard from '../components/JobCard';
import { 
  Search, 
  MapPin, 
  Euro, 
  Filter, 
  X, 
  RotateCcw, 
  Briefcase, 
  LayoutGrid,
  List
} from 'lucide-react';

const CATEGORIES = [
  'Elektrikár', 
  'Murár', 
  'Maliar', 
  'Inštalatér', 
  'Podlahár', 
  'Stavebné práce', 
  'Záhradník', 
  'Strechár'
];

export function JobsPage() {
    const { user, profile } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filters, setFilters] = useState({
        category: '',
        location: '',
        minBudget: '',
        maxBudget: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [resultsCount, setResultsCount] = useState(0);

    // Debounced location search
    const [debouncedLocation, setDebouncedLocation] = useState(filters.location);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedLocation(filters.location);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.location]);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const craftsmanId = profile?.role === 'craftsman' ? user?.id : undefined;
            const data = await jobService.getAllJobs({
                status: 'open',
                category: filters.category || undefined,
                location: debouncedLocation || undefined,
                minBudget: filters.minBudget ? Number(filters.minBudget) : undefined,
                maxBudget: filters.maxBudget ? Number(filters.maxBudget) : undefined,
                craftsmanId
            });
            setJobs(data || []);
            setResultsCount(data?.length || 0);
        } catch (error) {
            console.error('Chyba pri načítaní prác:', error);
        } finally {
            setLoading(false);
        }
    }, [profile?.role, user?.id, filters.category, debouncedLocation, filters.minBudget, filters.maxBudget]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const resetFilters = () => {
        setFilters({ category: '', location: '', minBudget: '', maxBudget: '' });
    };

    // Skeleton Loader Component
    const SkeletonCard = () => (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
            <div className="flex justify-between mb-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4"></div>
            </div>
            <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-1/3 mb-6"></div>
            <div className="space-y-3 mb-6">
                <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-full"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-full"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-4/5"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="h-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg"></div>
                <div className="h-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg"></div>
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900/50 pb-20">
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 pt-28 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-50 dark:bg-coral-500/10 border border-coral-100 dark:border-coral-500/20 text-coral-600 dark:text-coral-400 text-xs font-bold uppercase tracking-wider mb-3">
                                <Briefcase className="w-3 h-3" />
                                <span>Voľné zákazky</span>
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                Nájdite svoju <span className="gradient-text">ďalšiu prácu</span>
                            </h1>
                            <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">
                                Prehliadajte overené dopyty od klientov z celého Slovenska.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl shadow-inner">
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
                                onClick={() => setShowFilters(true)}
                                className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-coral-500/20"
                            >
                                <Filter className="w-5 h-5" />
                                <span>Filter</span>
                                {Object.values(filters).filter(Boolean).length > 0 && (
                                    <span className="ml-1 bg-white text-coral-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                                        {Object.values(filters).filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Count & Current Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Nájdených <span className="text-gray-900 dark:text-white font-black">{resultsCount}</span> výsledkov
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                        {filters.category && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 shadow-sm">
                                {filters.category}
                                <button onClick={() => setFilters({...filters, category: ''})} className="hover:text-coral-500 transition-colors"><X className="w-3 h-3" /></button>
                            </span>
                        )}
                        {filters.location && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 shadow-sm">
                                {filters.location}
                                <button onClick={() => setFilters({...filters, location: ''})} className="hover:text-coral-500 transition-colors"><X className="w-3 h-3" /></button>
                            </span>
                        )}
                        {(filters.minBudget || filters.maxBudget) && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 shadow-sm">
                                {filters.minBudget || 0}€ - {filters.maxBudget || '∞'}€
                                <button onClick={() => setFilters({...filters, minBudget: '', maxBudget: ''})} className="hover:text-coral-500 transition-colors"><X className="w-3 h-3" /></button>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Jobs Grid/List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                        {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in ring-1 ring-black/5 dark:ring-white/5">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700/50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-gray-600">
                            <Search className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Nič sme nenašli</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-10 font-medium">
                            Skúste upraviť filtre alebo zmeniť lokalitu vyhľadávania, aby ste našli viac ponúk.
                        </p>
                        <button 
                            onClick={resetFilters}
                            className="btn-secondary inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold shadow-sm"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Resetovať filtre
                        </button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "max-w-3xl mx-auto space-y-6"}>
                        {jobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile Filter Drawer / Desktop Filter Modal */}
            {showFilters && (
                <div className="fixed inset-0 z-[60] flex items-center justify-end">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                        onClick={() => setShowFilters(false)}
                    />
                    <div className="relative w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-slide-right border-l border-gray-100 dark:border-gray-800">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 z-10 sticky top-0">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
                                <Filter className="w-6 h-6 text-coral-500" />
                                Filtre
                            </h2>
                            <button 
                                onClick={() => setShowFilters(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
                            {/* Category selector */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                                    <Briefcase className="w-3 h-3" />
                                    Kategória prác
                                </label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setFilters({ ...filters, category: filters.category === cat ? '' : cat })}
                                            className={`px-3 py-3 rounded-xl text-xs font-bold transition-all border ${
                                                filters.category === cat 
                                                ? 'bg-coral-500 border-coral-500 text-white shadow-lg shadow-coral-500/30' 
                                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-coral-300 hover:text-coral-500'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Location input */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                                    <MapPin className="w-3 h-3" />
                                    Lokalita
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Mesto alebo kraj..."
                                        className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all font-semibold text-sm"
                                        value={filters.location}
                                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-coral-500 transition-colors" />
                                </div>
                            </div>

                            {/* Budget range */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                                    <Euro className="w-3 h-3" />
                                    Rozpočet (€)
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 relative">
                                        <input
                                            type="number"
                                            placeholder="Od"
                                            className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 transition-all font-semibold text-sm"
                                            value={filters.minBudget}
                                            onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
                                        />
                                    </div>
                                    <div className="h-0.5 w-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                    <div className="flex-1 relative">
                                        <input
                                            type="number"
                                            placeholder="Do"
                                            className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 transition-all font-semibold text-sm"
                                            value={filters.maxBudget}
                                            onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 z-10 sticky bottom-0 flex gap-4">
                            <button 
                                onClick={resetFilters}
                                className="flex-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset
                            </button>
                            <button 
                                onClick={() => setShowFilters(false)}
                                className="flex-[2] bg-gradient-to-r from-coral-500 to-coral-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-coral-500/25 hover:shadow-coral-500/40 hover:translate-y-[-2px] active:translate-y-[0px] transition-all text-sm uppercase tracking-wider"
                            >
                                Zobraziť výsledky
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}