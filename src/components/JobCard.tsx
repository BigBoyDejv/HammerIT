import { Link } from 'react-router-dom';

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
        client?: {
            full_name: string;
            avatar_url: string | null;
        };
    };
}

export function JobCard({ job }: JobCardProps) {
    return (
        <div className="job-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200">
            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <h3 className="text-xl font-semibold text-[#191970] hover:text-[#2a2a8a] transition-colors">
                                {job.title}
                            </h3>
                            <span className="status-badge status-open ml-2">Otvorená</span>
                        </div>
                        <p className="text-gray-600 mt-2 line-clamp-2">
                            {job.description}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {job.budget_min}€ - {job.budget_max}€
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                                </svg>
                                {job.category}
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {job.created_at ? new Date(job.created_at).toLocaleDateString('sk-SK') : 'Neznámy dátum'}
                            </span>
                        </div>
                        {job.client && (
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                                    {job.client.full_name?.charAt(0) || 'K'}
                                </div>
                                <span className="text-sm text-gray-500">Klient: {job.client.full_name}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 min-w-[140px]">
                        <Link
                            to={`/jobs/${job.id}`}
                            className="btn-primary text-center"
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