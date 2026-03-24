// ─── Dashboard.tsx (and DashboardModern.tsx — identical logic, swap import) ───
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobService, contractService } from '../services';
import { Briefcase, TrendingUp, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
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
      glow: 'shadow-[0_4px_14px_rgba(255,77,26,0.3)]',
      bg: 'bg-coral-50',
      text: 'text-coral-600',
    },
    {
      icon: CheckCircle,
      label: 'Dokončené',
      value: stats.completed,
      gradient: 'from-emerald-500 to-teal-600',
      glow: 'shadow-[0_4px_14px_rgba(16,185,129,0.25)]',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
    {
      icon: TrendingUp,
      label: 'Celkom',
      value: stats.total,
      gradient: 'from-navy-500 to-navy-600',
      glow: 'shadow-[0_4px_14px_rgba(25,25,112,0.25)]',
      bg: 'bg-navy-50',
      text: 'text-navy-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #0f0f4a 0%, #191970 50%, #2a2a8a 100%)' }}>
        {/* decorative blobs */}
        <div className="absolute -top-6 -right-6 w-40 h-40 bg-coral-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              Vitajte, {profile?.full_name?.split(' ')[0]}!
              <Sparkles className="w-5 h-5 text-amber-300" />
            </h1>
            <p className="text-white/70 text-sm">
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {statsCards.map((card, idx) => (
          <div key={idx} className={`glass-card p-4 text-center hover-lift border-t-2 border-t-transparent`}
            style={{ borderTopColor: idx === 0 ? '#ff4d1a' : idx === 1 ? '#10b981' : '#191970' }}>
            <div className={`w-10 h-10 bg-gradient-to-r ${card.gradient} rounded-xl flex items-center justify-center mb-2 mx-auto ${card.glow}`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div className={`text-2xl font-black ${card.text}`}>{card.value}</div>
            <div className="text-xs text-gray-500 font-medium">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Rýchle akcie
        </h2>
        <div className="flex gap-3">
          {profile?.role === 'client' ? (
            <Link to="/jobs/new" className="flex-1 btn-gradient text-center py-3 text-sm">
              + Nová práca
            </Link>
          ) : (
            <Link to="/jobs" className="flex-1 btn-gradient text-center py-3 text-sm">
              🔍 Prehliadať práce
            </Link>
          )}
          <Link
            to="/messages"
            className="flex-1 bg-navy-50 text-navy-700 text-center py-3 rounded-xl text-sm font-medium hover:bg-navy-100 transition-colors border border-navy-100"
          >
            💬 Správy
          </Link>
        </div>
      </div>

      {/* Recent Jobs */}
      {recentJobs.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-coral-500 animate-pulse" />
              {profile?.role === 'client' ? 'Najnovšie práce' : 'Aktívne zákazky'}
            </span>
            <Link
              to={profile?.role === 'client' ? '/jobs' : '/contracts'}
              className="text-sm text-coral-500 hover:text-coral-600 font-medium flex items-center gap-1 transition-colors"
            >
              Všetky <ArrowRight className="w-3 h-3" />
            </Link>
          </h2>
          <div className="space-y-3">
            {recentJobs.map((job: any) => (
              <JobCardModern key={job.id} job={job} variant="compact" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}