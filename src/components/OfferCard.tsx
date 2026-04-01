import { Link } from 'react-router-dom';
import { MapPin, Euro, Tag, Clock, CheckCircle, XCircle, ChevronRight, MessageSquare, RefreshCcw } from 'lucide-react';

interface OfferCardProps {
  offer: {
    id: string;
    job_request_id: string;
    price: number;
    estimated_duration: string;
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    job?: {
      id: string;
      title: string;
      description: string;
      location: string;
      category: string;
      budget_min: number;
      budget_max: number;
      client: {
        full_name: string;
        avatar_url: string | null;
      };
    };
  };
}

const STATUS_CONFIG = {
  pending: {
    label: 'Čaká na schválenie',
    icon: Clock,
    colorClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  accepted: {
    label: 'Prijatá',
    icon: CheckCircle,
    colorClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  rejected: {
    label: 'Zamietnutá',
    icon: XCircle,
    colorClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
};

export function OfferCard({ offer }: OfferCardProps) {
  const status = STATUS_CONFIG[offer.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        {/* Header: Title + Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-coral-600 dark:group-hover:text-coral-400 transition-colors leading-tight">
            {offer.job?.title}
          </h3>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border shrink-0 ${status.colorClass}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </div>

        {/* Job Details Meta */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">
            <Tag className="w-3 h-3" /> {offer.job?.category}
          </span>
          <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs">
            <MapPin className="w-3.5 h-3.5 text-coral-500" />
            <span className="truncate max-w-[120px]">{offer.job?.location}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs">
            <Euro className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {offer.job?.budget_min}–{offer.job?.budget_max}€
            </span>
          </span>
        </div>

        {/* Your Offer Section */}
        <div className="bg-gray-50/80 dark:bg-gray-900/40 rounded-2xl p-4 mb-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Vaša ponuka</span>
            <div className="flex items-center gap-1.5">
               <span className="text-xl font-black text-coral-500">{offer.price}€</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 text-[10px] font-bold text-gray-500 dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-700">
              ⏱️ {offer.estimated_duration}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 italic line-clamp-2 leading-relaxed">
            "{offer.message}"
          </p>
        </div>

        {/* Client Footer */}
        {offer.job?.client && (
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mb-6">
            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-800 shadow-sm bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
              {offer.job.client.avatar_url ? (
                <img 
                  src={offer.job.client.avatar_url} 
                  alt={offer.job.client.full_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{offer.job.client.full_name?.charAt(0) || 'K'}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider leading-none mb-0.5">Klient</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{offer.job.client.full_name}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-auto">
          <Link
            to={`/jobs/${offer.job_request_id}`}
            className="flex-1 bg-gradient-to-r from-coral-500 to-coral-600 text-white text-center text-sm font-bold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-coral-500/30 transition-all flex items-center justify-center gap-2"
          >
            Zobraziť detail
            <ChevronRight className="w-4 h-4" />
          </Link>
          
          {offer.status === 'accepted' && (
            <Link
              to="/messages"
              className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 text-center text-sm font-bold py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              Správa
            </Link>
          )}

          {offer.status === 'rejected' && (
             <Link
                to={`/jobs/${offer.job_request_id}`}
                className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 text-center text-sm font-bold py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
                <RefreshCcw className="w-4 h-4 text-rose-500" />
                Nová ponuka
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
