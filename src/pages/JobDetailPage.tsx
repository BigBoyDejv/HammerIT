import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobService, offerService } from '../services';

// Typy pre prácu
interface Job {
    id: string;
    client_id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    budget_min: number | null;
    budget_max: number | null;
    status: string;
    created_at: string | null;
    client?: {
        full_name: string;
        avatar_url: string | null;
    };
    offers?: Offer[];
}

// Typy pre ponuku
interface Offer {
    id: string;
    price: number;
    estimated_duration: string;
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
    craftsman?: {
        full_name: string;
        avatar_url: string | null;
        phone: string | null;
    };
}

// Typy pre formulár ponuky
interface OfferFormData {
    price: string;
    duration: string;
    message: string;
}

export function JobDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [offerForm, setOfferForm] = useState<OfferFormData>({
        price: '',
        duration: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            loadJob();
        }
    }, [id]);

    const loadJob = async () => {
        if (!id) return;

        try {
            const data = await jobService.getJobById(id);
            setJob(data as any);
        } catch (error) {
            console.error('Chyba pri načítaní práce:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOfferSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !id) return;

        setSubmitting(true);
        try {
            await offerService.createOffer({
                job_request_id: id,
                craftsman_id: user.id,
                price: Number(offerForm.price),
                estimated_duration: offerForm.duration,
                message: offerForm.message,
                status: 'pending'
            });
            alert('Ponuka bola odoslaná!');
            setOfferForm({ price: '', duration: '', message: '' });
            loadJob();
        } catch (error) {
            console.error('Chyba pri odosielaní ponuky:', error);
            alert('Nepodarilo sa odoslať ponuku');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!job) {
        return <div className="text-center py-12">Práca nebola nájdená</div>;
    }

    const isClient = profile?.role === 'client';
    const isMyJob = job.client_id === user?.id;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="card p-6 mb-8">
                <h1 className="text-3xl font-bold mb-4">{job.title}</h1>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                    <span className="bg-gray-100 px-3 py-1 rounded">📁 {job.category}</span>
                    <span className="bg-gray-100 px-3 py-1 rounded">📍 {job.location}</span>
                    <span className="bg-gray-100 px-3 py-1 rounded">
                        💰 {job.budget_min}€ - {job.budget_max}€
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded">
                        📅 {job.created_at ? new Date(job.created_at).toLocaleDateString('sk-SK') : 'Neznámy dátum'}
                    </span>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Popis práce:</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Klient:</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            {job.client?.full_name?.charAt(0) || 'K'}
                        </div>
                        <span className="font-medium">{job.client?.full_name}</span>
                    </div>
                </div>
            </div>

            {isClient && isMyJob && job.offers && job.offers.length > 0 && (
                <div className="card p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">Ponuky remeselníkov</h2>
                    <div className="space-y-4">
                        {job.offers.map((offer) => (
                            <div key={offer.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{offer.craftsman?.full_name}</p>
                                        <p className="text-2xl font-bold text-primary-600 mt-1">{offer.price}€</p>
                                        <p className="text-sm text-gray-600 mt-1">Odhad: {offer.estimated_duration}</p>
                                        <p className="text-gray-700 mt-2">{offer.message}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded text-sm ${offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {offer.status === 'pending' ? 'Čaká' :
                                            offer.status === 'accepted' ? 'Prijatá' : 'Zamietnutá'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {profile?.role === 'craftsman' && !isMyJob && job.status === 'open' && (
                <div className="card p-6">
                    <h2 className="text-2xl font-bold mb-4">Odoslať ponuku</h2>
                    <form onSubmit={handleOfferSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cena (€) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                className="input-field"
                                value={offerForm.price}
                                onChange={(e) => setOfferForm({ ...offerForm, price: e.target.value })}
                                placeholder="napr. 850"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Odhadovaný čas *
                            </label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                value={offerForm.duration}
                                onChange={(e) => setOfferForm({ ...offerForm, duration: e.target.value })}
                                placeholder="napr. 3 dni, 1 týždeň..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Správa pre klienta *
                            </label>
                            <textarea
                                required
                                rows={3}
                                className="input-field"
                                value={offerForm.message}
                                onChange={(e) => setOfferForm({ ...offerForm, message: e.target.value })}
                                placeholder="Popíšte, čo všetko ponúkate, kedy môžete začať..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary w-full"
                        >
                            {submitting ? 'Odosielam...' : 'Odoslať ponuku'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}