import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { craftsmanService } from '../services';
import { 
    Filter, X, Star, CheckCircle, ArrowRight, 
    Sparkles, ShieldCheck, Briefcase, TrendingUp 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
                <div className="h-12 w-48 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-80 bg-gray-100 dark:bg-gray-800/50 rounded-[2.5rem]" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pt-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        Hľadať remeselníka
                        <Sparkles className="w-6 h-6 text-amber-400" />
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Nájdite overených profesionálov pre váš projekt</p>
                </div>
                
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`btn-outline flex items-center gap-2 group transition-all duration-300 ${showFilters ? 'bg-navy-900 text-white border-navy-900' : ''}`}
                >
                    {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                    <span className="font-bold">{showFilters ? 'Zavrieť filter' : 'Filtrovať výsledky'}</span>
                </button>
            </div>

            <AnimatePresence>
                {showFilters && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-10"
                    >
                        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 shadow-2xl shadow-navy-900/5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Kategória</label>
                                    <select
                                        className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-coral-500 transition-all"
                                        value={filters.specialization}
                                        onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                                    >
                                        <option value="">Všetky práce</option>
                                        {allSpecializations.map(spec => (
                                            <option key={spec} value={spec}>{spec}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Min. cena (€/h)</label>
                                    <input
                                        type="number"
                                        placeholder="Napr. 10"
                                        className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-coral-500 transition-all"
                                        value={filters.minRate}
                                        onChange={(e) => setFilters({ ...filters, minRate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Max. cena (€/h)</label>
                                    <input
                                        type="number"
                                        placeholder="Napr. 50"
                                        className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-coral-500 transition-all"
                                        value={filters.maxRate}
                                        onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center gap-4 h-[54px] px-4 bg-gray-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-all group" onClick={() => setFilters({ ...filters, verified: !filters.verified })}>
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${filters.verified ? 'bg-coral-500 border-coral-500' : 'border-gray-200 dark:border-gray-600'}`}>
                                        {filters.verified && <CheckCircle className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Iba overení</span>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
                                <button onClick={handleFilter} className="flex-1 bg-gradient-to-tr from-coral-500 to-coral-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-coral-500/20 active:scale-[0.98] transition-all">
                                    Aktualizovať výsledky
                                </button>
                                <button onClick={resetFilters} className="sm:px-10 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold py-4 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all">
                                    Zrušiť
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {craftsmen.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20 bg-gray-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-white/5"
                >
                    <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                        🔍
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Žiadni remeselníci sa nenašli</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto">
                        Skúste upraviť parametre vášho filtra alebo zmeniť kategóriu vyhľadávania.
                    </p>
                    <button onClick={resetFilters} className="mt-8 text-coral-500 font-black border-b-2 border-coral-500 hover:text-coral-600 transition-all">
                        Zobraziť všetkých
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {craftsmen.map((craftsman, idx) => (
                        <motion.div 
                            key={craftsman.id} 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: (idx % 3) * 0.1 }}
                            className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-gray-100 dark:border-white/5 p-8"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-br from-navy-800 to-black rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-navy-900/10 group-hover:rotate-6 transition-transform">
                                        {craftsman.user.full_name?.charAt(0) || 'R'}
                                    </div>
                                    {craftsman.verified && (
                                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white dark:border-slate-900">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl">
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                        <span className="font-black text-amber-700 dark:text-amber-400 text-sm">{craftsman.rating_avg.toFixed(1)}</span>
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{craftsman.total_jobs} prác</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-coral-500 transition-colors leading-tight">
                                        {craftsman.user.full_name}
                                    </h3>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                                        <Briefcase className="w-3 h-3" /> {craftsman.years_experience}r. skúseností
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {craftsman.specialization.slice(0, 3).map((spec, idx) => (
                                        <span key={idx} className="text-[10px] font-black uppercase tracking-widest bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/5">
                                            {spec}
                                        </span>
                                    ))}
                                </div>

                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 font-medium leading-relaxed">
                                    {craftsman.user.bio || 'Máme viacročné skúsenosti v odbore a zakladáme si na kvalite a spokojnosti našich klientov.'}
                                </p>
                                
                                {/* Footer: Price & CTA */}
                                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hodinová sadzba</p>
                                            <p className="text-3xl font-black text-gray-900 dark:text-white mt-0.5">
                                                {craftsman.hourly_rate}<span className="text-base font-bold text-gray-400 ml-1">€/hod</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-coral-50 dark:bg-coral-900/10 px-3 py-1.5 rounded-xl border border-coral-100/50 dark:border-coral-800/50">
                                            <TrendingUp className="w-3.5 h-3.5 text-coral-500" />
                                            <span className="text-[10px] font-black text-coral-600 dark:text-coral-400 uppercase tracking-widest">Dostupný</span>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/craftsmen/${craftsman.user_id}`}
                                        className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-tr from-navy-800 to-navy-900 dark:from-coral-500 dark:to-coral-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-navy-900/10 dark:shadow-coral-500/20 group/btn hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        <span className="tracking-tight">Zobraziť profil</span>
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}