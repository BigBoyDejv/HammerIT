import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobService, contractService } from '../services';
import { Briefcase, TrendingUp, CheckCircle, Sparkles, ArrowRight, Wrench, MessageSquare, Star } from 'lucide-react';
import { JobCardModern } from './JobCardModern';

export function DashboardModern() {
    const { user, profile } = useAuth();
    const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
    const [recentJobs, setRecentJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile) loadData();
    }, [profile]);

    const loadData = async () => {
        try {
            if (profile?.role === 'client') {
                const jobs = await jobService.getMyJobs(user!.id);
                setStats({
                    total: jobs?.length || 0,
                    active: jobs?.filter((j: any) => j.status === 'in_progress').length || 0,
                    completed: jobs?.filter((j: any) => j.status === 'completed').length || 0
                });
                setRecentJobs(jobs?.slice(0, 2) || []);
            } else {
                const contracts = await contractService.getMyContractsAsCraftsman(user!.id);
                setStats({
                    total: contracts?.length || 0,
                    active: contracts?.filter((c: any) => c.status === 'active').length || 0,
                    completed: contracts?.filter((c: any) => c.status === 'completed').length || 0
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
                <div className="spinner"></div>
            </div>
        );
    }

    const statsCards = [
        { icon: Briefcase, label: 'Aktívne', value: stats.active, color: 'from-coral-500 to-coral-600' },
        { icon: CheckCircle, label: 'Dokončené', value: stats.completed, color: 'from-green-500 to-emerald-600' },
        { icon: TrendingUp, label: 'Celkom', value: stats.total, color: 'from-navy-500 to-navy-600' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-500 to-navy-600 p-6 text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                        Vitajte, {profile?.full_name?.split(' ')[0]}!
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                    </h1>
                    <p className="text-white/80 text-sm">Máte {stats.active} aktívnych {stats.active === 1 ? 'prácu' : 'prác'}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
                {statsCards.map((card, idx) => (
                    <div key={idx} className="glass-card p-4 text-center hover-lift">
                        <div className={`w-10 h-10 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center mb-2 mx-auto`}>
                            <card.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                        <div className="text-xs text-gray-500">{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-coral-500" />
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
                    <Link to="/messages" className="flex-1 bg-gray-100 text-gray-700 text-center py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                        💬 Správy
                    </Link>
                </div>
            </div>

            {/* Recent Jobs */}
            {recentJobs.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center justify-between">
                        <span>📋 {profile?.role === 'client' ? 'Najnovšie práce' : 'Aktívne zákazky'}</span>
                        <Link to={profile?.role === 'client' ? '/jobs' : '/contracts'} className="text-sm text-coral-500 hover:underline flex items-center gap-1">
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