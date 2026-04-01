import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
    Search, MessageCircle, MapPin, Euro, Calendar, 
    Clock, ArrowRight, CheckCircle, AlertCircle, 
    XCircle, ShieldCheck, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Contract {
  id: string;
  job_request_id: string;
  craftsman_id: string;
  client_id: string;
  final_price: number;
  status: 'active' | 'completed' | 'cancelled' | 'disputed';
  payment_status: 'pending' | 'paid' | 'refunded';
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  job?: { title: string; description: string; location: string };
  craftsman?: { full_name: string; avatar_url: string | null };
  client?: { full_name: string; avatar_url: string | null };
}

const fetchContracts = async (role: 'client' | 'craftsman', userId: string): Promise<Contract[]> => {
  const column = role === 'client' ? 'client_id' : 'craftsman_id';
  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      job:job_requests(title, description, location),
      craftsman:profiles!contracts_craftsman_id_fkey(full_name, avatar_url),
      client:profiles!contracts_client_id_fkey(full_name, avatar_url)
    `)
    .eq(column, userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Contract[];
};

const SkeletonCard = () => (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 animate-pulse space-y-6">
        <div className="flex justify-between items-start">
            <div className="h-6 w-2/3 bg-gray-100 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-6 w-20 bg-gray-100 dark:bg-slate-800 rounded-full"></div>
        </div>
        <div className="h-4 w-full bg-gray-50 dark:bg-slate-800/50 rounded-lg"></div>
        <div className="h-4 w-5/6 bg-gray-50 dark:bg-slate-800/50 rounded-lg"></div>
        <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="h-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg"></div>
            <div className="h-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg"></div>
            <div className="h-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg"></div>
        </div>
    </div>
);

export function ContractsPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user && profile) loadContracts();
  }, [user, profile]);

  const loadContracts = async () => {
    if (!user || !profile) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchContracts(profile.role, user.id);
      setContracts(data);
    } catch (err) {
      console.error('Error loading contracts:', err);
      setError('Nepodarilo sa načítať zmluvy.');
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchesTab = activeTab === 'active' ? c.status === 'active' : c.status === 'completed';
      const matchesSearch = 
        c.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.craftsman?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [contracts, activeTab, searchQuery]);

  const counts = {
    active: contracts.filter(c => c.status === 'active').length,
    completed: contracts.filter(c => c.status === 'completed').length
  };

  const getStatusBadge = (status: Contract['status']) => {
    const map = {
      active: { label: 'Prebieha', icon: Clock, classes: 'bg-amber-500 text-white shadow-amber-500/20' },
      completed: { label: 'Dokončená', icon: CheckCircle, classes: 'bg-emerald-500 text-white shadow-emerald-500/20' },
      cancelled: { label: 'Zrušená', icon: XCircle, classes: 'bg-red-500 text-white shadow-red-500/20' },
      disputed: { label: 'Spor', icon: AlertCircle, classes: 'bg-orange-500 text-white shadow-orange-500/20' },
    };
    const { label, icon: Icon, classes } = map[status] || map.active;
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${classes} shadow-lg`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
  };

  const getPaymentBadge = (ps: Contract['payment_status']) => {
    const map = {
      paid: { label: 'Zaplatené', icon: ShieldCheck, classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
      pending: { label: 'Čaká na platbu', icon: Clock, classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
      refunded: { label: 'Vrátené', icon: Info, classes: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    };
    const { label, icon: Icon, classes } = map[ps] || map.pending;
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${classes}`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
      {/* Header */}
      <header className="mb-12 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Moje zmluvy</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Spravujte svoje aktívne projekty a históriu prác.</p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-coral-500 transition-colors" />
          <input 
            type="text"
            placeholder="Hľadať zmluvu alebo meno..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 pl-12 pr-4 py-4 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-coral-500 transition-all shadow-xl shadow-navy-900/5 placeholder:text-gray-400"
          />
        </div>
      </header>

      {error && (
        <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 flex items-center gap-3 font-bold text-sm"
        >
          <AlertCircle className="w-5 h-5" />
          {error}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-10">
        {(['active', 'completed'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all overflow-hidden ${
                        isActive 
                        ? 'text-white' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                >
                        {isActive && (
                            <motion.div 
                                layoutId="activeTab"
                                className="absolute inset-0 bg-gradient-to-tr from-coral-500 to-coral-600"
                                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                            />
                        )}
                    <span className="relative z-10 flex items-center gap-2">
                        {tab === 'active' ? 'Aktívne' : 'Dokončené'}
                        <span className={`px-2 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-slate-700'}`}>
                            {counts[tab]}
                        </span>
                    </span>
                </button>
            );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filteredContracts.length === 0 ? (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-50 dark:border-white/5 shadow-2xl text-center px-12"
        >
          <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8 text-4xl">
            {activeTab === 'active' ? '📂' : '🏆'}
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
            {searchQuery ? 'Nenašli sme žiadne zhody' : (activeTab === 'active' ? 'Zatiaľ žiadne aktívne zmluvy' : 'Zatiaľ žiadne dokončené zmluvy')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-md mx-auto">
            {searchQuery 
                ? 'Skúste upraviť vyhľadávanie alebo zmeňte filtre.' 
                : (activeTab === 'active' 
                    ? 'Vaše aktívne projekty sa zobrazia tu po prijatí ponuky a podpísaní zmluvy.' 
                    : 'História vašich úspešných spoluprác sa bude nachádzať na tomto mieste.')
            }
          </p>
        </motion.div>
      ) : (
        <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'active' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredContracts.map((contract) => (
                <motion.div 
                    key={contract.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-50 dark:border-white/5 shadow-2xl shadow-navy-900/5 hover:shadow-coral-500/10 transition-all group overflow-hidden flex flex-col justify-between"
                >
                    <div className="space-y-6">
                        {/* Header Row */}
                        <div className="flex justify-between items-start gap-4">
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-coral-500 transition-colors">
                                    {contract.job?.title ?? 'Neznáma práca'}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    {getStatusBadge(contract.status)}
                                    {getPaymentBadge(contract.payment_status)}
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-2">
                                <button 
                                    onClick={() => navigate(`/messages?user=${profile?.role === 'client' ? contract.craftsman_id : contract.client_id}`)}
                                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-coral-500 bg-gray-50 dark:bg-slate-800 rounded-xl hover:scale-110 active:scale-95 transition-all"
                                    title="Poslať správu"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        {contract.job?.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium line-clamp-2 md:line-clamp-3">
                                {contract.job.description}
                            </p>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-50 dark:border-white/5">
                            {[
                                { icon: MapPin, label: 'Lokalita', value: contract.job?.location.split(',')[0] ?? '?' },
                                { icon: Euro, label: 'Cena', value: `${contract.final_price}€` },
                                { icon: Calendar, label: 'Založené', value: new Date(contract.created_at).toLocaleDateString('sk-SK') },
                            ].map((item, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <item.icon className="w-3 h-3" />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item.label}</span>
                                    </div>
                                    <p className="text-xs font-black text-gray-900 dark:text-white">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Profiles Row */}
                        <div className="flex items-center justify-between pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg">
                                    {(profile?.role === 'client' ? contract.craftsman?.full_name : contract.client?.full_name)?.charAt(0) ?? '?'}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                        {profile?.role === 'client' ? 'Remeselník' : 'Klient'}
                                    </p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white">
                                        {profile?.role === 'client' ? contract.craftsman?.full_name : contract.client?.full_name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <Link 
                            to={`/contracts/${contract.id}`} 
                            className="flex-1 bg-gray-50 dark:bg-slate-800 hover:bg-coral-500 hover:text-white dark:hover:bg-coral-500 dark:hover:text-white border border-transparent dark:border-white/5 p-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all"
                        >
                            Detail zmluvy
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <button 
                            onClick={() => navigate(`/messages?user=${profile?.role === 'client' ? contract.craftsman_id : contract.client_id}`)}
                            className="sm:hidden w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 p-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest text-gray-600 dark:text-white"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Poslať správu
                        </button>
                    </div>
                </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}