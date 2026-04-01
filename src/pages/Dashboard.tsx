// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobService, contractService } from '../services';
import { Briefcase, TrendingUp, CheckCircle, Sparkles, ArrowRight, MessageSquare, Plus, Search } from 'lucide-react';
import { JobCardModern } from '../components/JobCardModern';
import { motion } from 'framer-motion';

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
          active: jobs?.filter((j: any) => j.status === 'in_progress' || j.status === 'open').length || 0,
          completed: jobs?.filter((j: any) => j.status === 'completed').length || 0,
        });
        setRecentJobs(jobs?.slice(0, 3) || []);
      } else {
        const contracts = await contractService.getMyContractsAsCraftsman(user!.id);
        setStats({
          total: contracts?.length || 0,
          active: contracts?.filter((c: any) => c.status === 'active').length || 0,
          completed: contracts?.filter((c: any) => c.status === 'completed').length || 0,
        });
        
        const formattedContracts = contracts?.slice(0, 3).map((c: any) => {
            const jobData = Array.isArray(c.job) ? c.job[0] : c.job;
            const clientData = Array.isArray(c.client) ? c.client[0] : c.client;
            return {
                ...jobData,
                contract_id: c.id,
                client: clientData,
                budget_min: c.final_price || jobData?.budget_min,
                budget_max: c.final_price || jobData?.budget_max,
                status: c.status === 'active' ? 'in_progress' : c.status
            };
        }) || [];
        setRecentJobs(formattedContracts);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl" />
      </div>
    );
  }


  const statsCards = [
    {
      icon: Briefcase,
      label: profile?.role === 'client' ? 'Aktualné práce' : 'Aktívne zákazky',
      value: stats.active,
      color: 'coral',
    },
    {
      icon: CheckCircle,
      label: 'Dokončené',
      value: stats.completed,
      color: 'emerald',
    },
    {
      icon: TrendingUp,
      label: 'Celkový počet',
      value: stats.total,
      color: 'blue',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-0">
      {/* Welcome banner */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-navy-800 via-navy-900 to-black p-8 sm:p-12 text-white shadow-2xl shadow-navy-900/20"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-coral-500/10 rounded-full blur-[100px] -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/10 rounded-full blur-[80px] -ml-20 -mb-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase text-coral-300">
              <Sparkles className="w-3 h-3" /> Dashboard
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Vitajte späť,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-400 to-coral-600">
                {profile?.full_name?.split(' ')[0]}
              </span>!
            </h1>
            <p className="text-white/60 text-lg max-w-md font-medium">
              Dnes je skvelý deň na {profile?.role === 'client' ? 'nájdenie špičkového remeselníka' : 'získanie novej zákazky'}.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {statsCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            className={`group relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-white/5 hover:-translate-y-1`}
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex flex-row sm:flex-col justify-between items-center sm:items-start">
                <div className={`p-3 sm:p-4 rounded-2xl bg-${card.color}-500/10 dark:bg-${card.color}-500/20 group-hover:scale-110 transition-transform duration-500`}>
                  <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${card.color}-500`} />
                </div>
                <div className="text-right sm:text-left mt-0 sm:mt-4">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">{card.label}</span>
                  <p className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mt-0.5 leading-none">{card.value}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-1.5 h-8 bg-coral-500 rounded-full" />
              {profile?.role === 'client' ? 'Vaše najnovšie práce' : 'Aktuálne zákazky'}
            </h2>
            <Link
              to={profile?.role === 'client' ? '/jobs' : '/contracts'}
              className="group text-sm font-bold text-coral-500 flex items-center gap-2 hover:gap-3 transition-all"
            >
              Všetky <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {recentJobs.map((job: any, i) => (
                <motion.div
                  key={job.id || job.contract_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (0.1 * i) }}
                >
                  <JobCardModern job={job} variant="active" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/5 p-12 text-center">
               <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-8 h-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Zatiaľ tu nič nie je</h3>
               <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto mb-6">
                  {profile?.role === 'client' 
                    ? 'Vytvorte svoju prvú prácu a nájdite spoľahlivého remeselníka hneď teraz.'
                    : 'Prehliadajte dostupné práce v okolí a získajte svoju prvú zákazku.'}
               </p>
               <Link 
                to={profile?.role === 'client' ? '/jobs/new' : '/jobs'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-coral-500 hover:bg-coral-600 text-white font-bold rounded-2xl transition-all active:scale-95"
               >
                  {profile?.role === 'client' ? <Plus className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                  {profile?.role === 'client' ? 'Nová práca' : 'Hľadať zákazky'}
               </Link>
            </div>
          )}
        </div>

        {/* Sidebar / Quick Actions - Hidden on mobile */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-white/5">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">Rýchle akcie</h2>
            <div className="grid gap-4">
              {profile?.role === 'client' ? (
                <Link 
                  to="/jobs/new" 
                  className="flex items-center gap-4 p-4 bg-gradient-to-br from-coral-500 to-coral-700 text-white rounded-2xl hover:shadow-lg hover:shadow-coral-500/30 transition-all active:scale-[0.98] group"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold">Nová práca</p>
                    <p className="text-[10px] text-white/70 uppercase tracking-widest font-bold">Vytvoriť inzerát</p>
                  </div>
                </Link>
              ) : (
                <Link 
                  to="/jobs" 
                  className="flex items-center gap-4 p-4 bg-gradient-to-br from-coral-500 to-coral-700 text-white rounded-2xl hover:shadow-lg hover:shadow-coral-500/30 transition-all active:scale-[0.98] group"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold">Hľadať práce</p>
                    <p className="text-[10px] text-white/70 uppercase tracking-widest font-bold">Nové príležitosti</p>
                  </div>
                </Link>
              )}
              
              <Link 
                to="/messages" 
                className="flex items-center gap-4 p-4 border-2 border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-gray-800/30 text-gray-900 dark:text-white rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all active:scale-[0.98] group"
              >
                <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-coral-500" />
                </div>
                <div>
                  <p className="font-bold">Správy</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">Komunikácia</p>
                </div>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-4 p-4 bg-navy-500/5 dark:bg-blue-500/10 rounded-2xl">
                 <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                 <p className="text-xs font-bold text-navy-600 dark:text-blue-400 uppercase tracking-wider">
                    Dnes bolo pridaných 12 nových prác
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}