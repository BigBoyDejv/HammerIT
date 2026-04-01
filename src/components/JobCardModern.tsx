// ─── JobCardModern.tsx ─────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';
import { MapPin, Euro, Clock, ArrowRight, Wrench } from 'lucide-react';

interface JobCardModernProps {
    job: any;
    variant?: 'default' | 'compact' | 'active';
    onAccept?: () => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
    'Elektrikár': '⚡',
    'Murár': '🧱',
    'Maliar': '🎨',
    'Inštalatér': '🔧',
    'Podlahár': '🪵',
    'Záhradník': '🌿',
    'Strechár': '🏠',
};

const STATUS_CONFIG: Record<string, { label: string, color: string, bg: string }> = {
    'open': { label: 'Otvorená', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    'in_progress': { label: 'Prebieha', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    'completed': { label: 'Dokončená', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    'cancelled': { label: 'Zrušená', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' },
};

export function JobCardModern({ job, variant = 'default', onAccept }: JobCardModernProps) {
    const getTimeAgo = (date: string) => {
        if (!date) return '---';
        const minutes = Math.floor((new Date().getTime() - new Date(date).getTime()) / 60000);
        if (minutes < 60) return `${minutes} min`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)} hod`;
        return `${Math.floor(minutes / 1440)} dní`;
    };

    const status = STATUS_CONFIG[job.status] || STATUS_CONFIG['open'];

    if (variant === 'active') {
        return (
            <div className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-white/5">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-coral-500 to-coral-600 rounded-2xl flex items-center justify-center shadow-lg shadow-coral-500/20 group-hover:rotate-6 transition-transform duration-300">
                            <Wrench className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 dark:text-white text-lg leading-tight group-hover:text-coral-500 transition-colors">{job.title}</h3>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">{job.category}</p>
                        </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full ${status.bg} ${status.color} text-[10px] font-black uppercase tracking-widest shadow-sm`}>
                        {status.label}
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                            <MapPin className="w-4 h-4 text-coral-500" />
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{job.location}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Pridané pred {getTimeAgo(job.created_at)}</span>
                    </div>
                    <Link
                        to={job.contract_id ? `/contracts/${job.contract_id}` : `/jobs/${job.id}`}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-navy-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-coral-500 dark:hover:bg-coral-500 hover:text-white dark:hover:text-white transition-all active:scale-95 shadow-lg shadow-navy-900/10"
                    >
                        Spravovať <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-coral-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl border border-gray-100 dark:border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-all">
                        {CATEGORY_EMOJI[job.category] ?? '🔧'}
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 dark:text-white text-base leading-tight">{job.title}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                           <span className="text-[10px] font-black text-coral-500 uppercase tracking-widest">{job.category}</span>
                           <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                           <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{status.label}</span>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 font-medium leading-relaxed">
                {job.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-white/5">
                    <MapPin className="w-4 h-4 text-coral-500" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                    <Euro className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{job.budget_min}€ – {job.budget_max}€</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" /> pred {getTimeAgo(job.created_at)}
                </div>
                {onAccept ? (
                    <button
                        onClick={onAccept}
                        className="px-6 py-2.5 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-coral-500/20 transition-all active:scale-95"
                    >
                        Prijať
                    </button>
                ) : (
                    <Link
                        to={`/jobs/${job.id}`}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all group/btn"
                    >
                        <span className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Detail</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>
        </div>
    );
}
