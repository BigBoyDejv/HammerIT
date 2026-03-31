// ─── JobCard.tsx ───────────────────────────────────────────────────────────────
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
  'Elektrikár':      'bg-amber-100  text-amber-800  border-amber-200',
  'Murár':           'bg-orange-100 text-orange-800 border-orange-200',
  'Maliar':          'bg-pink-100   text-pink-800   border-pink-200',
  'Inštalatér':      'bg-blue-100   text-blue-800   border-blue-200',
  'Podlahár':        'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Stavebné práce':  'bg-navy-100   text-navy-800   border-navy-200',
  'Záhradník':       'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Strechár':        'bg-coral-100  text-coral-800  border-coral-200',
};

export function JobCard({ job }: JobCardProps) {
  const catColor = CATEGORY_COLORS[job.category] ?? 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900 hover:text-coral-600 transition-colors leading-snug">
                {job.title}
              </h3>
              <span className="status-badge status-open shrink-0">Otvorená</span>
            </div>

            <p className="text-gray-500 text-sm line-clamp-2 mb-4">{job.description}</p>

            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-coral-400" /> {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Euro className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-emerald-700">{job.budget_min}€ – {job.budget_max}€</span>
              </span>
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${catColor}`}>
                <Tag className="w-3 h-3" /> {job.category}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                {job.created_at ? new Date(job.created_at).toLocaleDateString('sk-SK') : '—'}
              </span>
            </div>

            {job.client && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <div className="w-6 h-6 bg-gradient-to-br from-coral-500 to-coral-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {job.client.full_name?.charAt(0) || 'K'}
                </div>
                <span className="text-xs text-gray-500">Klient: <span className="font-medium text-gray-700">{job.client.full_name}</span></span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 min-w-[140px]">
            <Link to={`/jobs/${job.id}`} className="btn-primary text-center text-sm py-2.5 px-4 rounded-xl">
              Zobraziť detail
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobCard;




