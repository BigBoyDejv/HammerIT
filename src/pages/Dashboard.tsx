// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobService, contractService } from '../services';
import { Briefcase, TrendingUp, CheckCircle, Sparkles, ArrowRight, Wrench, MessageSquare, Star, Clock, MapPin, Euro } from 'lucide-react';
import { JobCardModern } from '../components/JobCardModern';

export function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (profile) loadData(); }, [profile]);

  const loadData = async () => {
    try {
      if (profile?.role === 'client') {
        const jobs = await jobService.getMyJobs(user!.id);
        setStats({
          total: jobs?.length || 0,
          active: jobs?.filter((j: any) => j.status === 'in_progress').length || 0,
          completed: jobs?.filter((j: any) => j.status === 'completed').length || 0,
        });
        setRecentJobs(jobs?.slice(0, 2) || []);
      } else {
        const contracts = await contractService.getMyContractsAsCraftsman(user!.id);
        setStats({
          total: contracts?.length || 0,
          active: contracts?.filter((c: any) => c.status === 'active').length || 0,
          completed: contracts?.filter((c: any) => c.status === 'completed').length || 0,
        });
        setRecentJobs(contracts?.slice(0, 2) || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  const statsCards = [
    {
      icon: Briefcase,
      label: profile?.role === 'client' ? 'Moje práce' : 'Aktívne',
      value: stats.active,
      gradient: 'from-coral-500 to-coral-600',
      bg: 'bg-coral-50',
      text: 'text-coral-600',
      iconBg: 'bg-coral-100',
    },
    {
      icon: CheckCircle,
      label: 'Dokončené',
      value: stats.completed,
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
    },
    {
      icon: TrendingUp,
      label: 'Celkom',
      value: stats.total,
      gradient: 'from-navy-500 to-navy-600',
      bg: 'bg-navy-50',
      text: 'text-navy-600',
      iconBg: 'bg-navy-100',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-0">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-600 to-navy-700 p-6 text-white">
        <div className="absolute top-0 right-0 w-40 h-40 bg-coral-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-2">
              Vitajte, {profile?.full_name?.split(' ')[0]}!
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </h1>
            <p className="text-white/70 text-sm sm:text-base">
              Máte{' '}
              <span className="text-coral-300 font-semibold">{stats.active}</span>
              {' '}aktívnych {stats.active === 1 ? 'prácu' : 'prác'}
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1 text-right">
            <span className="text-xs text-white/50 uppercase tracking-wider">Celkovo dokončené</span>
            <span className="text-3xl font-black text-emerald-300">{stats.completed}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards - responzívne */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border border-gray-100 hover:border-coral-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.text}`} />
              </div>
              <span className="text-sm font-medium text-gray-500">{card.label}</span>
            </div>
            <div className={`text-3xl font-bold ${card.text}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Rýchle akcie
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          {profile?.role === 'client' ? (
            <Link to="/jobs/new" className="flex-1 btn-gradient text-center py-3 text-sm rounded-xl">
              + Nová práca
            </Link>
          ) : (
            <Link to="/jobs" className="flex-1 btn-gradient text-center py-3 text-sm rounded-xl">
              🔍 Prehliadať práce
            </Link>
          )}
          <Link
            to="/messages"
            className="flex-1 bg-gray-50 text-gray-700 text-center py-3 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
          >
            💬 Správy
          </Link>
        </div>
      </div>

      {/* Recent Jobs */}
      {recentJobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-coral-500 animate-pulse" />
              {profile?.role === 'client' ? 'Najnovšie práce' : 'Aktívne zákazky'}
            </h2>
            <Link
              to={profile?.role === 'client' ? '/jobs' : '/contracts'}
              className="text-sm text-coral-500 hover:text-coral-600 font-medium flex items-center gap-1 transition-colors"
            >
              Všetky <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {recentJobs.map((job: any) => (
              <JobCardModern key={job.id} job={job} variant="compact" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}