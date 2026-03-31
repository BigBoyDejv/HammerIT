// src/pages/CreateJobPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobService } from '../services/jobService';
import { ArrowLeft, Send, Briefcase, MapPin, Euro, FileText, Tag, Navigation, Loader2 } from 'lucide-react';

const CATEGORIES = [
    'Elektrikár', 'Murár', 'Maliar', 'Inštalatér',
    'Podlahár', 'Stavebné práce', 'Záhradník', 'Strechár', 'Kúrenár', 'Iné'
];

export function CreateJobPage() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        location: '',
        budget_min: '',
        budget_max: '',
        lat: null as number | null,
        lng: null as number | null,
    });

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolokácia nie je podporovaná vašim prehliadačom.');
            return;
        }
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setFormData(prev => ({
                    ...prev,
                    lat: latitude,
                    lng: longitude,
                }));

                // Reverse geocode to get address
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
                        { headers: { 'Accept-Language': 'sk' } }
                    );
                    const data = await res.json();
                    if (data.display_name) {
                        // Shorten address: city + district or village
                        const addr = data.address;
                        const city = addr.city || addr.town || addr.village || addr.municipality || '';
                        const district = addr.city_district || addr.suburb || '';
                        const shortAddress = district ? `${city}, ${district}` : city || data.display_name.split(',').slice(0, 2).join(',');
                        setFormData(prev => ({ ...prev, location: shortAddress }));
                    }
                } catch (err) {
                    console.error('Reverse geocoding failed:', err);
                }
                setGeoLoading(false);
            },
            (err) => {
                console.error('Geolocation error:', err);
                alert('Nepodarilo sa získať polohu. Skontrolujte povolenia prehliadača.');
                setGeoLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

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
                lat: formData.lat,
                lng: formData.lng,
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
            <div className="glass-card p-12 text-center bg-card dark:bg-slate-800/40 border border-gray-100 dark:border-gray-700/50">
                <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Prístup odmietnutý</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Iba zákazníci môžu vytvárať nové pracovné ponuky.
                </p>
                <Link to="/jobs" className="btn-gradient inline-flex mt-6">
                    Späť na zoznam prác
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <button
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-coral-500 transition-colors mb-6 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Späť na zoznam prác
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="bg-gradient-to-r from-coral-500 to-coral-600 p-6">
                    <h1 className="text-2xl font-bold text-white">Nová pracovná ponuka</h1>
                    <p className="text-white/80 text-sm mt-1">Vyplňte formulár a nájdite správneho remeselníka</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="form-label flex items-center gap-2 dark:text-gray-300">
                            <Briefcase className="w-4 h-4 text-coral-500" />
                            Názov práce *
                        </label>
                        <input
                            type="text"
                            required
                            className="input-modern dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="napr. Oprava strechy, Maľovanie bytu..."
                        />
                    </div>

                    <div>
                        <label className="form-label flex items-center gap-2 dark:text-gray-300">
                            <FileText className="w-4 h-4 text-coral-500" />
                            Popis práce *
                        </label>
                        <textarea
                            required
                            rows={5}
                            className="input-modern dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detailný popis práce, čo všetko je potrebné urobiť..."
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Čím podrobnejší popis, tým lepšie ponuky dostanete</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="form-label flex items-center gap-2 dark:text-gray-300">
                                <Tag className="w-4 h-4 text-coral-500" />
                                Kategória *
                            </label>
                            <select
                                required
                                className="form-select dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                            <label className="form-label flex items-center gap-2 dark:text-gray-300">
                                <MapPin className="w-4 h-4 text-coral-500" />
                                Lokalita *
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    required
                                    className="input-modern flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="napr. Bratislava, Košice..."
                                />
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    disabled={geoLoading}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-coral-50 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 border border-coral-200 dark:border-coral-800 rounded-xl text-sm font-medium hover:bg-coral-100 dark:hover:bg-coral-900/50 transition-all flex-shrink-0"
                                    title="Použiť moju polohu"
                                >
                                    {geoLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Navigation className="w-4 h-4" />
                                    )}
                                    <span className="hidden sm:inline">📍</span>
                                </button>
                            </div>
                            {formData.lat && formData.lng && (
                                <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                                    ✅ GPS súradnice uložené ({formData.lat.toFixed(4)}, {formData.lng.toFixed(4)})
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="form-label flex items-center gap-2 dark:text-gray-300">
                                <Euro className="w-4 h-4 text-coral-500" />
                                Minimálny rozpočet (€)
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="input-modern dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.budget_min}
                                onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                                placeholder="napr. 500"
                            />
                        </div>

                        <div>
                            <label className="form-label flex items-center gap-2 dark:text-gray-300">
                                <Euro className="w-4 h-4 text-coral-500" />
                                Maximálny rozpočet (€)
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="input-modern dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                            className="btn-secondary dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                        >
                            Zrušiť
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}