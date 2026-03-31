// src/pages/ContractsPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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

export function ContractsPage() {
  const { user, profile } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

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

  const filteredContracts = contracts.filter(c =>
    activeTab === 'active' ? c.status === 'active' : c.status === 'completed'
  );

  const statusBadge = (status: Contract['status']) => {
    const map: Record<Contract['status'], { label: string; cls: string }> = {
      active: { label: 'Prebieha', cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
      completed: { label: 'Dokončená', cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      cancelled: { label: 'Zrušená', cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
      disputed: { label: 'Spor', cls: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
    };
    const { label, cls } = map[status];
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>{label}</span>;
  };

  const paymentBadge = (ps: Contract['payment_status']) => {
    const map: Record<Contract['payment_status'], { label: string; cls: string }> = {
      paid: { label: 'Zaplatené', cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      pending: { label: 'Čaká na platbu', cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
      refunded: { label: 'Vrátené', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
    };
    const { label, cls } = map[ps];
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>{label}</span>;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#191970] dark:border-coral-500" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-fade-in px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Moje zmluvy</h1>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        {(['active', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === tab
                ? 'border-b-2 border-[#191970] dark:border-coral-500 text-[#191970] dark:text-coral-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            {tab === 'active' ? 'Aktívne' : 'Dokončené'}{' '}
            ({contracts.filter(c => tab === 'active' ? c.status === 'active' : c.status === 'completed').length})
          </button>
        ))}
      </div>

      {filteredContracts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Žiadne zmluvy</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {activeTab === 'active'
              ? 'Momentálne nemáte žiadne aktívne zmluvy.'
              : 'Momentálne nemáte žiadne dokončené zmluvy.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((contract) => (
            <div key={contract.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {contract.job?.title ?? 'Neznáma práca'}
                    </h3>
                    {statusBadge(contract.status)}
                    {paymentBadge(contract.payment_status)}
                  </div>

                  {contract.job?.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {contract.job.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {contract.job?.location ?? 'Neznáma lokalita'}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {contract.final_price}€
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(contract.created_at).toLocaleDateString('sk-SK')}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                    {profile?.role === 'client' ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Remeselník: <span className="font-medium text-gray-900 dark:text-white">{contract.craftsman?.full_name ?? '–'}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Klient: <span className="font-medium text-gray-900 dark:text-white">{contract.client?.full_name ?? '–'}</span>
                      </p>
                    )}
                  </div>
                </div>

                <Link to={`/contracts/${contract.id}`} className="btn-outline shrink-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500">
                  Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}