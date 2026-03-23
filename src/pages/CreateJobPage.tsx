import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobService } from '../services';

interface JobFormData {
    title: string;
    description: string;
    category: string;
    location: string;
    budget_min: string;
    budget_max: string;
}

export function CreateJobPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<JobFormData>({
        title: '',
        description: '',
        category: '',
        location: '',
        budget_min: '',
        budget_max: ''
    });

    const categories = [
        'Elektrikár',
        'Murár',
        'Maliar',
        'Inštalatér',
        'Podlahár',
        'Stavebné práce',
        'Záhradník',
        'Iné'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await jobService.createJob({
                client_id: user!.id,
                title: formData.title,
                description: formData.description,
                category: formData.category,
                location: formData.location,
                budget_min: Number(formData.budget_min),
                budget_max: Number(formData.budget_max),
                status: 'open'
            });

            navigate('/jobs');
        } catch (error) {
            console.error('Chyba pri vytváraní práce:', error);
            alert('Nepodarilo sa vytvoriť prácu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Nová pracovná ponuka</h1>
                <p className="text-gray-600 mt-2">Vyplňte formulár pre vytvorenie novej pracovnej ponuky</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
                <div>
                    <label className="form-label">
                        Názov práce <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        className="form-input"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="napr. Oprava strechy, Maľovanie bytu..."
                    />
                </div>

                <div>
                    <label className="form-label">
                        Popis práce <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        required
                        rows={5}
                        className="form-textarea"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detailný popis práce, čo všetko je potrebné urobiť..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Podrobný popis pomôže remeselníkom lepšie pochopiť vaše požiadavky</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="form-label">
                            Kategória <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            className="form-select"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="">Vyberte kategóriu</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="form-label">
                            Lokalita <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            className="form-input"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="napr. Bratislava, Košice..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="form-label">
                            Minimálny rozpočet (€) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            className="form-input"
                            value={formData.budget_min}
                            onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                            placeholder="napr. 500"
                        />
                    </div>

                    <div>
                        <label className="form-label">
                            Maximálny rozpočet (€) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            className="form-input"
                            value={formData.budget_max}
                            onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                            placeholder="napr. 1000"
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex-1"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Vytváram...
                            </span>
                        ) : (
                            'Vytvoriť ponuku'
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/jobs')}
                        className="btn-secondary"
                    >
                        Zrušiť
                    </button>
                </div>
            </form>
        </div>
    );
}