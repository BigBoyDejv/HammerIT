// src/components/JobCard.tsx
import { Link } from 'react-router-dom';
import { MapPin, Euro, Tag, Calendar } from 'lucide-react';

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
  const catColor = CATEGORY_COLORS[job.category] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white hover:text-coral-600 dark:hover:text-coral-400 transition-colors leading-snug">
                {job.title}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 shrink-0">
                Otvorená
              </span>
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
              {job.description}
            </p>

            <div className="flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <MapPin className="w-4 h-4 text-coral-400 dark:text-coral-500" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <Euro className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  {job.budget_min}€ – {job.budget_max}€
                </span>
              </span>
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${catColor}`}>
                <Tag className="w-3 h-3" /> {job.category}
              </span>
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                {job.created_at ? new Date(job.created_at).toLocaleDateString('sk-SK') : '—'}
              </span>
            </div>

            {job.client && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="w-6 h-6 bg-gradient-to-br from-coral-500 to-coral-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {job.client.full_name?.charAt(0) || 'K'}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Klient: <span className="font-medium text-gray-700 dark:text-gray-300">{job.client.full_name}</span>
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 min-w-[140px]">
            <Link
              to={`/jobs/${job.id}`}
              className="bg-gradient-to-r from-coral-500 to-coral-600 text-white text-center text-sm font-medium py-2.5 px-4 rounded-xl hover:from-coral-600 hover:to-coral-700 transition-all shadow-sm hover:shadow-md"
            >
              Zobraziť detail
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobCard;