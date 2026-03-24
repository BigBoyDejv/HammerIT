// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobService, contractService } from '../services';
import { Briefcase, Clock, CheckCircle, Plus, Search, MessageSquare, Settings } from 'lucide-react';

export function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && user) loadStats();
  }, [profile, user]);

  const loadStats = async () => {
    try {
      if (profile?.role === 'client') {
        const jobs = await jobService.getMyJobs(user!.id);
        setStats({
          total: jobs?.length ?? 0,
          active: jobs?.filter((j: any) => j.status === 'in_progress').length ?? 0,
          completed: jobs?.filter((j: any) => j.status === 'completed').length ?? 0,
        });
      } else {
        const contracts = await contractService.getMyContractsAsCraftsman(user!.id);
        setStats({
          total: contracts?.length ?? 0,
          active: contracts?.filter((c: any) => c.status === 'active').length ?? 0,
          completed: contracts?.filter((c: any) => c.status === 'completed').length ?? 0,
        });
      }
    } catch (err) {
      console.error('loadStats error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#191970]" />
      </div>
    );
  }

  const statCards = [
    {
      label: profile?.role === 'client' ? 'Moje práce' : 'Moje zákazky',
      value: stats.total,
      icon: <Briefcase className="h-6 w-6" />,
      color: 'text-[#191970]',
      bg: 'bg-blue-50',
    },
    {
      label: 'Aktívne',
      value: stats.active,
      icon: <Clock className="h-6 w-6" />,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Dokončené',
      value: stats.completed,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Vitajte, {profile?.full_name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {profile?.role === 'client' ? 'Zákazník' : 'Remeselník'} · {user?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">{card.label}</span>
              <div className={`${card.bg} ${card.color} p-2 rounded-lg`}>
                {card.icon}
              </div>
            </div>
            <div className={`text-4xl font-bold ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Rýchle akcie</h2>
        <div className="flex flex-wrap gap-3">
          {profile?.role === 'client' ? (
            <Link to="/jobs/new" className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" /> Nová práca
            </Link>
          ) : (
            <Link to="/jobs" className="btn-primary flex items-center gap-2">
              <Search className="h-4 w-4" /> Prehliadať práce
            </Link>
          )}
          <Link to="/messages" className="btn-outline flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Správy
          </Link>
          <Link to="/profile" className="btn-outline flex items-center gap-2">
            <Settings className="h-4 w-4" /> Upraviť profil
          </Link>
        </div>
      </div>
    </div>
  );
}