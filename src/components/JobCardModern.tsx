// ─── JobCardModern.tsx ─────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';
import { MapPin, Euro, Clock, Star, ArrowRight, Wrench } from 'lucide-react';

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

export function JobCardModern({ job, variant = 'default', onAccept }: JobCardModernProps) {
    const getTimeAgo = (date: string) => {
        const minutes = Math.floor((new Date().getTime() - new Date(date).getTime()) / 60000);
        if (minutes < 60) return `${minutes} min`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)} hod`;
        return `${Math.floor(minutes / 1440)} dní`;
    };

    if (variant === 'active') {
        return (
            <div className="glass-card p-5 hover-lift">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-coral-100 to-coral-200 rounded-xl flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-coral-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                            <p className="text-xs text-gray-500">{job.category}</p>
                        </div>
                    </div>
                    <span className="badge badge-info">Prebieha</span>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>Priebeh práce</span>
                        <span className="font-semibold text-coral-500">{job.progress || 75}%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${job.progress || 75}%` }} />
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {getTimeAgo(job.created_at)}</span>
                </div>

                <Link
                    to={`/jobs/${job.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm font-medium hover:bg-coral-50 hover:border-coral-200 hover:text-coral-600 transition-all duration-200"
                >
                    Sledovať priebeh <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="glass-card p-5 hover-lift animate-fade-in-up">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-navy-50 to-navy-100 rounded-xl flex items-center justify-center text-xl border border-navy-100">
                        {CATEGORY_EMOJI[job.category] ?? '🔧'}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug">{job.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{job.description}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="badge badge-coral">{job.category}</span>
                <span className="badge badge-success">Otvorená</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-coral-400" /> {job.location}</span>
                <span className="flex items-center gap-1">
                    <Euro className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-700 font-medium">{job.budget_min}€ – {job.budget_max}€</span>
                </span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {getTimeAgo(job.created_at)}</span>
            </div>

            {job.client && (
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mb-4">
                    <div className="w-7 h-7 bg-gradient-to-br from-coral-500 to-coral-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {job.client.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{job.client.full_name}</p>
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs text-gray-400">4.9 · 23 recenzií</span>
                        </div>
                    </div>
                </div>
            )}

            {onAccept ? (
                <button
                    onClick={onAccept}
                    className="w-full py-2.5 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300 tap-scale"
                    style={{ boxShadow: '0 4px 14px rgba(255,77,26,0.3)' }}
                >
                    Prijať ponuku
                </button>
            ) : (
                <Link
                    to={`/jobs/${job.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:border-coral-400 hover:text-coral-600 hover:bg-coral-50 transition-all duration-200"
                >
                    Zobraziť detail <ArrowRight className="w-4 h-4" />
                </Link>
            )}
        </div>
    );
}
