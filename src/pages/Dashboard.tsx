import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { jobService, contractService, offerService } from '../services';

export function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadStats();
    }
  }, [profile]);

  const loadStats = async () => {
    try {
      if (profile?.role === 'client') {
        const jobs = await jobService.getMyJobs(user!.id);
        setStats({
          total: jobs?.length || 0,
          active: jobs?.filter((j: any) => j.status === 'in_progress').length || 0,
          completed: jobs?.filter((j: any) => j.status === 'completed').length || 0
        });
      } else if (profile?.role === 'craftsman') {
        const contracts = await contractService.getMyContractsAsCraftsman(user!.id);
        setStats({
          total: contracts?.length || 0,
          active: contracts?.filter((c: any) => c.status === 'active').length || 0,
          completed: contracts?.filter((c: any) => c.status === 'completed').length || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Vitajte, {profile?.full_name}! 👋
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="dashboard-card">
          <div className="dashboard-card-number">{stats.total}</div>
          <div className="dashboard-card-title">
            {profile?.role === 'client' ? 'Moje práce' : 'Moje zákazky'}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-number text-yellow-600">{stats.active}</div>
          <div className="dashboard-card-title">Aktívne</div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-number text-green-600">{stats.completed}</div>
          <div className="dashboard-card-title">Dokončené</div>
        </div>
      </div>

      {/* Rýchle akcie */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Rýchle akcie</h2>
        <div className="flex gap-4">
          {profile?.role === 'client' ? (
            <a href="/jobs/new" className="btn-primary">
              + Nová práca
            </a>
          ) : (
            <a href="/jobs" className="btn-primary">
              🔍 Prehliadať práce
            </a>
          )}
          <a href="/messages" className="btn-outline">
            💬 Správy
          </a>
          <a href="/profile/edit" className="btn-outline">
            ⚙️ Upraviť profil
          </a>
        </div>
      </div>
    </div>
  );
}