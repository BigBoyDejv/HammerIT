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
      active: { label: 'Prebieha', cls: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Dokončená', cls: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Zrušená', cls: 'bg-red-100 text-red-800' },
      disputed: { label: 'Spor', cls: 'bg-orange-100 text-orange-800' },
    };
    const { label, cls } = map[status];
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>{label}</span>;
  };

  const paymentBadge = (ps: Contract['payment_status']) => {
    const map: Record<Contract['payment_status'], { label: string; cls: string }> = {
      paid: { label: 'Zaplatené', cls: 'bg-green-100 text-green-800' },
      pending: { label: 'Čaká na platbu', cls: 'bg-yellow-100 text-yellow-800' },
      refunded: { label: 'Vrátené', cls: 'bg-gray-100 text-gray-600' },
    };
    const { label, cls } = map[ps];
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>{label}</span>;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#191970]" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Moje zmluvy</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {(['active', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-4 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-[#191970] text-[#191970]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'active' ? 'Aktívne' : 'Dokončené'}{' '}
            ({contracts.filter(c => tab === 'active' ? c.status === 'active' : c.status === 'completed').length})
          </button>
        ))}
      </div>

      {filteredContracts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Žiadne zmluvy</h3>
          <p className="text-gray-500 text-sm">
            {activeTab === 'active'
              ? 'Momentálne nemáte žiadne aktívne zmluvy.'
              : 'Momentálne nemáte žiadne dokončené zmluvy.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((contract) => (
            <div key={contract.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {contract.job?.title ?? 'Neznáma práca'}
                    </h3>
                    {statusBadge(contract.status)}
                    {paymentBadge(contract.payment_status)}
                  </div>

                  {contract.job?.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {contract.job.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <span>📍 {contract.job?.location ?? 'Neznáma lokalita'}</span>
                    <span>💰 {contract.final_price}€</span>
                    <span>📅 {new Date(contract.created_at).toLocaleDateString('sk-SK')}</span>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    {profile?.role === 'client' ? (
                      <p className="text-sm text-gray-500">
                        Remeselník: <span className="font-medium text-gray-900">{contract.craftsman?.full_name ?? '–'}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Klient: <span className="font-medium text-gray-900">{contract.client?.full_name ?? '–'}</span>
                      </p>
                    )}
                  </div>
                </div>

                <Link to={`/contracts/${contract.id}`} className="btn-outline shrink-0">
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