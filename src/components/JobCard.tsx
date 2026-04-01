// src/components/JobCard.tsx
import { Link } from 'react-router-dom';
import { MapPin, Euro, Tag, Calendar, ChevronRight, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    location: string;
    budget_min: number | null;
    budget_max: number | null;
    category: string;
    created_at: string | null;
    client?: { full_name: string; avatar_url: string | null };
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  'Elektrikár': 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  'Murár': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  'Maliar': 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  'Inštalatér': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'Podlahár': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  'Stavebné práce': 'bg-navy-100 dark:bg-navy-900/30 text-navy-800 dark:text-navy-300 border-navy-200 dark:border-navy-800',
  'Záhradník': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  'Strechár': 'bg-coral-100 dark:bg-coral-900/30 text-coral-800 dark:text-coral-300 border-coral-200 dark:border-coral-800',
};

export function JobCard({ job }: JobCardProps) {
  const { profile } = useAuth();
  const catColor = CATEGORY_COLORS[job.category] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
  const isCraftsman = profile?.role === 'craftsman';

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        {/* Header: Title + Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-coral-600 dark:group-hover:text-coral-400 transition-colors leading-tight">
            {job.title}
          </h3>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
            Otvorená
          </span>
        </div>

        {/* Category Tag */}
        <div className="mb-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] font-bold uppercase tracking-tight ${catColor}`}>
            <Tag className="w-3 h-3" /> {job.category}
          </span>
        </div>

        {/* Description: Truncated */}
        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-5 flex-1">
          {job.description}
        </p>

        {/* Details Row */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-5">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <div className="w-8 h-8 rounded-lg bg-coral-50 dark:bg-coral-500/10 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-coral-500" />
            </div>
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Euro className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {job.budget_min} – {job.budget_max}€
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <span>{job.created_at ? new Date(job.created_at).toLocaleDateString('sk-SK') : '—'}</span>
          </div>
        </div>

        {/* Client Footer */}
        {job.client && (
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mb-6">
            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-800 shadow-sm bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
              {job.client.avatar_url ? (
                <img 
                  src={job.client.avatar_url} 
                  alt={job.client.full_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{job.client.full_name?.charAt(0) || 'K'}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider leading-none mb-0.5">Klient</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{job.client.full_name}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={`/jobs/${job.id}`}
            className="flex-1 bg-gradient-to-r from-coral-500 to-coral-600 text-white text-center text-sm font-bold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-coral-500/30 transition-all flex items-center justify-center gap-2"
          >
            Zobraziť detail
            <ChevronRight className="w-4 h-4" />
          </Link>
          
          {isCraftsman && (
            <Link
              to={`/jobs/${job.id}`}
              className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 text-center text-sm font-bold py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              Poslať ponuku
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobCard;