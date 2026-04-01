import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobService } from '../services/jobService';
import { 
    ArrowLeft, Send, Briefcase, MapPin, Euro, FileText, Tag, Navigation, 
    Loader2, Home, CheckCircle2, ChevronRight, ChevronLeft, Info, Eye, 
    Sparkles, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
    'Elektrikár', 'Murár', 'Maliar', 'Inštalatér',
    'Podlahár', 'Stavebné práce', 'Záhradník', 'Strechár', 'Kúrenár', 'Iné'
];

export function CreateJobPage() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    
    const [addressQuery, setAddressQuery] = useState('');
    const [addressDetails, setAddressDetails] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        budget_min: '',
        budget_max: '',
        lat: null as number | null,
        lng: null as number | null,
    });

    // Auto-complete suggestions for address
    useEffect(() => {
        if (addressQuery.length < 3) {
            setAddressSuggestions([]);
            return;
        }
        const delayDebounceFn = setTimeout(async () => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=5&countrycodes=sk,cz`);
                const data = await res.json();
                setAddressSuggestions(data);
            } catch (err) {
                console.error('Error fetching address suggestions:', err);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [addressQuery]);

    const handleSelectSuggestion = (suggestion: any) => {
        setAddressQuery(suggestion.display_name);
        setFormData(prev => ({
            ...prev,
            lat: parseFloat(suggestion.lat),
            lng: parseFloat(suggestion.lon)
        }));
        setShowSuggestions(false);
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolokácia nie je podporovaná vašim prehliadačom.');
            return;
        }
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));

                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
                        { headers: { 'Accept-Language': 'sk' } }
                    );
                    const data = await res.json();
                    if (data.display_name) {
                        setAddressQuery(data.display_name);
                    }
                } catch (err) {
                    console.error('Reverse geocoding failed:', err);
                }
                setGeoLoading(false);
            },
            () => {
                alert('Nepodarilo sa získať polohu.');
                setGeoLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const nextStep = () => {
        if (step === 1 && (!formData.title || !formData.description || !formData.category)) return;
        if (step === 2 && !addressQuery) return;
        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        setLoading(true);
        const finalLocation = addressDetails 
            ? `${addressQuery} (${addressDetails})`
            : addressQuery;

        try {
            await jobService.createJob({
                client_id: user!.id,
                title: formData.title,
                description: formData.description,
                category: formData.category,
                location: finalLocation,
                budget_min: formData.budget_min ? Number(formData.budget_min) : null,
                budget_max: formData.budget_max ? Number(formData.budget_max) : null,
                lat: formData.lat,
                lng: formData.lng,
                status: 'open'
            });
            navigate('/jobs');
        } catch (error) {
            console.error('Error creating job:', error);
        } finally {
            setLoading(false);
        }
    };

    if (profile?.role !== 'client') {
        return (
            <div className="max-w-md mx-auto py-20 text-center">
                <div className="w-20 h-20 bg-coral-50 dark:bg-coral-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-coral-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Iba pre zákazníkov</h3>
                <p className="text-gray-500 font-medium">Na vytváranie ponúk musíte mať klientsky účet.</p>
                <Link to="/dashboard" className="btn-primary mt-8 inline-block">Späť na dashboard</Link>
            </div>
        );
    }

    const steps = [
        { id: 1, label: 'Základ', icon: FileText },
        { id: 2, label: 'Lokalita', icon: MapPin },
        { id: 3, label: 'Rozpočet', icon: Euro },
        { id: 4, label: 'Prehľad', icon: Eye }
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 pb-32">
            <header className="mb-12">
                <Link to="/jobs" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-coral-500 font-bold transition-all mb-6">
                    <ArrowLeft className="w-4 h-4" /> Späť na dopyty
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            Vytvoriť dopyt
                            <Sparkles className="w-6 h-6 text-amber-400" />
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Opíšte vašu požiadavku a získajte ponuky od profesionálov</p>
                    </div>
                </div>
            </header>

            {/* Stepper */}
            <div className="flex justify-between items-center mb-12 relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800 -translate-y-1/2 -z-10 rounded-full" />
                <motion.div 
                    className="absolute top-1/2 left-0 h-1 bg-coral-500 -translate-y-1/2 -z-10 rounded-full transition-all duration-500"
                    style={{ width: `${(step - 1) / (steps.length - 1) * 100}%` }}
                />
                {steps.map((s) => (
                    <div key={s.id} className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-900 px-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                            step >= s.id ? 'bg-coral-500 border-coral-500 text-white shadow-lg shadow-coral-500/30' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 text-gray-400'
                        }`}>
                            {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-coral-500' : 'text-gray-400'}`}>{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Form Side */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 border border-gray-100 dark:border-white/5 shadow-2xl shadow-navy-900/5 space-y-8"
                            >
                                <div className="space-y-6">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Základné informácie</h3>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Názov práce *</label>
                                        <input 
                                            className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-5 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-coral-500 transition-all"
                                            placeholder="Napr. Maľovanie 3-izbového bytu"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value.slice(0, 80) })}
                                        />
                                        <div className="flex justify-between px-1">
                                            <p className="text-[10px] font-bold text-gray-400">Buďte stručný a jasný</p>
                                            <p className="text-[10px] font-bold text-gray-400">{formData.title.length}/80</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Kategória *</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {CATEGORIES.map(cat => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, category: cat })}
                                                    className={`p-3 text-[11px] font-black uppercase tracking-wider rounded-xl border-2 transition-all ${
                                                        formData.category === cat ? 'bg-coral-500 border-coral-500 text-white shadow-lg shadow-coral-500/20' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 text-gray-500 hover:border-gray-200'
                                                    }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Podrobný popis *</label>
                                        <textarea 
                                            rows={6}
                                            className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-5 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-coral-500 transition-all resize-none"
                                            placeholder="Opíšte vašu požiadavku čo najpodrobnejšie..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                        <div className="flex items-center gap-2 px-1 text-emerald-500">
                                            <Info className="w-3 h-3" />
                                            <p className="text-[10px] font-bold uppercase">Čím podrobnejší popis, tým presnejšie ponuky</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 border border-gray-100 dark:border-white/5 shadow-2xl shadow-navy-900/5 space-y-8"
                            >
                                <div className="space-y-6">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Kde sa práca vykoná?</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 p-2 rounded-2xl">
                                                <div className="flex-1">
                                                    <input 
                                                        className="w-full bg-transparent border-none p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-0"
                                                        placeholder="Zadajte adresu alebo mesto"
                                                        value={addressQuery}
                                                        onChange={e => { setAddressQuery(e.target.value); setShowSuggestions(true); }}
                                                    />
                                                </div>
                                                <button 
                                                    type="button" onClick={handleGetLocation} disabled={geoLoading}
                                                    className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-700 rounded-xl text-coral-500 shadow-sm hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    {geoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                                                </button>
                                            </div>

                                            {showSuggestions && addressSuggestions.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                                    {addressSuggestions.map((s, i) => (
                                                        <button 
                                                            key={i} type="button" onClick={() => handleSelectSuggestion(s)}
                                                            className="w-full text-left p-4 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border-b border-gray-100 dark:border-white/5 last:border-none"
                                                        >
                                                            {s.display_name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Spresnenie polohy</label>
                                            <input 
                                                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-5 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-coral-500 transition-all"
                                                placeholder="Napr. 3. poschodie, dvere vľavo"
                                                value={addressDetails}
                                                onChange={e => setAddressDetails(e.target.value)}
                                            />
                                        </div>

                                        {formData.lat && (
                                            <div className="aspect-video rounded-3xl overflow-hidden bg-gray-100 dark:bg-slate-800 relative border-4 border-gray-50 dark:border-white/5">
                                                <img 
                                                    src={`https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${formData.lng},${formData.lat}&z=13&l=map&size=600,300&pt=${formData.lng},${formData.lat},pm2rdm`} 
                                                    alt="Location Map"
                                                    className="w-full h-full object-cover grayscale opacity-50 dark:brightness-75"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <div className="w-12 h-12 bg-coral-500 rounded-full flex items-center justify-center shadow-2xl shadow-coral-500/50">
                                                        <MapPin className="text-white w-6 h-6" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 border border-gray-100 dark:border-white/5 shadow-2xl shadow-navy-900/5 space-y-8"
                            >
                                <div className="space-y-8">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Aký je váš rozpočet?</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Minimálna cena (€)</label>
                                            <div className="relative">
                                                <Euro className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                                <input 
                                                    type="number"
                                                    className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-5 pl-14 text-lg font-black text-gray-900 dark:text-white focus:ring-2 focus:ring-coral-500 transition-all"
                                                    placeholder="0"
                                                    value={formData.budget_min}
                                                    onChange={e => setFormData({ ...formData, budget_min: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Maximálna cena (€)</label>
                                            <div className="relative">
                                                <Euro className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-coral-500" />
                                                <input 
                                                    type="number"
                                                    className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-5 pl-14 text-lg font-black text-gray-900 dark:text-white focus:ring-2 focus:ring-coral-500 transition-all"
                                                    placeholder="500"
                                                    value={formData.budget_max}
                                                    onChange={e => setFormData({ ...formData, budget_max: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/50 flex gap-4">
                                        <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                                        <p className="text-xs font-bold text-amber-800 dark:text-amber-400 leading-relaxed">
                                            Udaný rozpočet je orientačný. Remeselníci vám môžu zaslať ponuky nad aj pod túto hranicu v závislosti od ich ohodnotenia.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div 
                                key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 border border-gray-100 dark:border-white/5 shadow-2xl shadow-navy-900/5"
                            >
                                <div className="space-y-10">
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Všetko pripravené!</h3>
                                        <p className="text-gray-500 font-medium">Skontrolujte údaje a odošlite dopyt do sveta.</p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-3xl p-8 space-y-6">
                                        <div className="pb-6 border-b border-gray-200 dark:border-white/5">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dopyt</p>
                                            <h4 className="text-xl font-black text-gray-900 dark:text-white">{formData.title}</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kategória</p>
                                                <p className="text-sm font-black text-coral-500 uppercase">{formData.category}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lokalita</p>
                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{addressQuery.split(',')[0]}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rozpočet</p>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">{formData.budget_min}€ - {formData.budget_max}€</p>
                                        </div>
                                    </div>
                                    
                                    <div className="p-8 bg-gradient-to-tr from-coral-500 to-coral-600 rounded-[2rem] text-white space-y-4">
                                        <p className="text-sm font-bold leading-relaxed opacity-90">
                                            Po odoslaní bude váš dopyt viditeľný pre všetkých overených remeselníkov v kategórii <span className="underline font-black">{formData.category}</span>.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Info / Preview Side */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-24 space-y-8">
                        <div className="bg-navy-900 rounded-[2.5rem] p-8 text-white space-y-6 relative overflow-hidden">
                            <Sparkles className="absolute -top-4 -right-4 w-32 h-32 text-white/5 rotate-12" />
                            <h4 className="text-xl font-black tracking-tight">Prečo byť podrobný?</h4>
                            <ul className="space-y-4">
                                <li className="flex gap-3 text-sm font-medium text-white/80">
                                    <div className="w-5 h-5 rounded-full bg-coral-500 flex items-center justify-center shrink-0">1</div>
                                    Lepšie pochopenie zadania
                                </li>
                                <li className="flex gap-3 text-sm font-medium text-white/80">
                                    <div className="w-5 h-5 rounded-full bg-coral-500 flex items-center justify-center shrink-0">2</div>
                                    Presnejšie cenové ponuky
                                </li>
                                <li className="flex gap-3 text-sm font-medium text-white/80">
                                    <div className="w-5 h-5 rounded-full bg-coral-500 flex items-center justify-center shrink-0">3</div>
                                    Rýchlejší výber remeselníka
                                </li>
                            </ul>
                        </div>

                        {/* Summary Widget */}
                        {formData.title && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm space-y-4"
                            >
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Náhľad dopytu</p>
                                <div className="space-y-2">
                                    <h5 className="font-black text-gray-900 dark:text-white line-clamp-2 leading-tight">{formData.title}</h5>
                                    <div className="flex items-center gap-2">
                                        <div className="px-2 py-1 bg-coral-50 dark:bg-coral-900/20 rounded-md text-[9px] font-black text-coral-500 uppercase">{formData.category || 'NA'}</div>
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-1">
                                            <MapPin className="w-2.5 h-2.5" /> {addressQuery.split(',')[0] || 'Lokalita'}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sticky Navigation Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-6 sm:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 z-50">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                    {step > 1 ? (
                        <button onClick={prevStep} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold hover:text-coral-500 transition-all p-4">
                            <ChevronLeft className="w-5 h-5" /> Späť
                        </button>
                    ) : <div />}
                    
                    {step < 4 ? (
                        <button 
                            onClick={nextStep}
                            disabled={
                                (step === 1 && (!formData.title || !formData.description || !formData.category)) ||
                                (step === 2 && !addressQuery)
                            }
                            className="bg-gradient-to-tr from-coral-500 to-coral-600 text-white font-black px-8 py-5 rounded-2xl shadow-xl shadow-coral-500/25 flex items-center gap-3 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            Pokračovať <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-navy-900 dark:bg-coral-500 text-white font-black px-12 py-5 rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Zverejniť dopyt
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}