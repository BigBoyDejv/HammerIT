// src/pages/CreateJobPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobService } from '../services/jobService';
import { ArrowLeft, Send, Briefcase, MapPin, Euro, FileText, Tag } from 'lucide-react';

const CATEGORIES = [
    'Elektrikár', 'Murár', 'Maliar', 'Inštalatér',
    'Podlahár', 'Stavebné práce', 'Záhradník', 'Strechár', 'Kúrenár', 'Iné'
];

export function CreateJobPage() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        location: '',
        budget_min: '',
        budget_max: ''
    });

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
                budget_min: formData.budget_min ? Number(formData.budget_min) : null,
                budget_max: formData.budget_max ? Number(formData.budget_max) : null,
                status: 'open'
            });

            navigate('/jobs');
        } catch (error) {
            console.error('Error creating job:', error);
            alert('Nepodarilo sa vytvoriť prácu');
        } finally {
            setLoading(false);
        }
    };

    // Presmerovanie ak nie je klient
    if (profile?.role !== 'client') {
        return (
            <div className="glass-card p-12 text-center">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">Prístup odmietnutý</h3>
                <p className="text-gray-500 text-sm mt-1">
                    Iba zákazníci môžu vytvárať nové pracovné ponuky.
                </p>
                <a href="/jobs" className="btn-gradient inline-flex mt-6">
                    Späť na zoznam prác
                </a>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <button
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-2 text-gray-500 hover:text-coral-500 transition-colors mb-6 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Späť na zoznam prác
            </button>

            <div className="glass-card overflow-hidden">
                <div className="bg-gradient-to-r from-coral-500 to-coral-600 p-6">
                    <h1 className="text-2xl font-bold text-white">Nová pracovná ponuka</h1>
                    <p className="text-white/80 text-sm mt-1">Vyplňte formulár a nájdite správneho remeselníka</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="form-label flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-coral-500" />
                            Názov práce *
                        </label>
                        <input
                            type="text"
                            required
                            className="input-modern"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="napr. Oprava strechy, Maľovanie bytu..."
                        />
                    </div>

                    <div>
                        <label className="form-label flex items-center gap-2">
                            <FileText className="w-4 h-4 text-coral-500" />
                            Popis práce *
                        </label>
                        <textarea
                            required
                            rows={5}
                            className="input-modern"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detailný popis práce, čo všetko je potrebné urobiť..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Čím podrobnejší popis, tým lepšie ponuky dostanete</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="form-label flex items-center gap-2">
                                <Tag className="w-4 h-4 text-coral-500" />
                                Kategória *
                            </label>
                            <select
                                required
                                className="form-select"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">Vyberte kategóriu</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="form-label flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-coral-500" />
                                Lokalita *
                            </label>
                            <input
                                type="text"
                                required
                                className="input-modern"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="napr. Bratislava, Košice..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="form-label flex items-center gap-2">
                                <Euro className="w-4 h-4 text-coral-500" />
                                Minimálny rozpočet (€)
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="input-modern"
                                value={formData.budget_min}
                                onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                                placeholder="napr. 500"
                            />
                        </div>

                        <div>
                            <label className="form-label flex items-center gap-2">
                                <Euro className="w-4 h-4 text-coral-500" />
                                Maximálny rozpočet (€)
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="input-modern"
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
                            className="btn-gradient flex-1 flex items-center justify-center gap-2 py-3"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Vytváram...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Vytvoriť ponuku
                                </>
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
        </div>
    );
}