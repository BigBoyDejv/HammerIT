// src/pages/ProfilePage.tsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { verificationService } from '../services/verificationService';
import {
    User,
    Shield,
    Bell,
    CreditCard,
    HelpCircle,
    Camera,
    Save,
    Smartphone,
    Globe,
    FileText,
    Image as ImageIcon,
    ChevronRight,
    Lock,
    Mail,
    Eye,
    EyeOff,
    History,
    AlertCircle,
    CheckCircle2,
    Upload,
    XCircle,
    Clock,
    BadgeCheck
} from 'lucide-react';

export function ProfilePage() {
    const { user, profile, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'payments' | 'verification'>('profile');

    // Verification states
    const [verificationFile, setVerificationFile] = useState<File | null>(null);
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // States
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        bio: '',
        nationality: '',
        sms_alerts: true,
        email_notifications: true,
        two_factor: false,
    });

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });

    const [portfolio, setPortfolio] = useState<string[]>([]);
    const [newImageUrl, setNewImageUrl] = useState('');

    // Sync form when profile loads
    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name ?? '',
                phone: profile.phone ?? '',
                bio: profile.bio ?? '',
                nationality: profile.nationality ?? '',
                sms_alerts: (profile as any).sms_alerts ?? true,
                email_notifications: true,
                two_factor: false,
            });

            if (profile.role === 'craftsman') {
                loadCraftsmanData();
                loadVerification();
            }
        }
    }, [profile]);

    const loadCraftsmanData = async () => {
        try {
            const { data } = await supabase
                .from('craftsman_profiles')
                .select('*')
                .eq('user_id', user!.id)
                .single();
            if (data) {
                setPortfolio(data.portfolio || []);
            }
        } catch (error) {
            console.error('Error loading craftsman data:', error);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        try {
            await updateProfile({
                full_name: formData.full_name,
                phone: formData.phone,
                bio: formData.bio,
                nationality: formData.nationality,
            });

            if (profile?.role === 'craftsman') {
                await supabase
                    .from('craftsman_profiles')
                    .update({ portfolio })
                    .eq('user_id', user!.id);
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('updateProfile error:', err);
            alert('Nepodarilo sa aktualizovať profil');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setPasswords({ current: '', new: '', confirm: '' });
            setTimeout(() => setSuccess(false), 3000);
        }, 1000);
    };

    const addPortfolioImage = () => {
        if (!newImageUrl.trim()) return;
        setPortfolio([...portfolio, newImageUrl.trim()]);
        setNewImageUrl('');
    };

    const removePortfolioImage = (index: number) => {
        setPortfolio(portfolio.filter((_, i) => i !== index));
    };

    const toggle = (key: keyof typeof formData) => setFormData({ ...formData, [key]: !formData[key] });

    // Verification
    const loadVerification = async () => {
        try {
            await verificationService.getVerificationStatus(user!.id);
            // We reload the page on upload to sync everything, so we don't need to store this status locally for now
        } catch (err) {
            console.error('Error loading verification:', err);
        }
    };

    const handleVerificationUpload = async () => {
        if (!verificationFile) return;
        setVerificationLoading(true);
        try {
            await verificationService.submitVerification(user!.id, verificationFile);
            setVerificationFile(null);
            await loadVerification();
            window.location.reload();
        } catch (err: any) {
            alert(err.message || 'Nepodarilo sa odoslať dokument');
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) setVerificationFile(file);
    };

    const getVerificationBadge = () => {
        const status = profile?.verification_status || 'none';
        switch (status) {
            case 'verified': return { icon: CheckCircle2, text: 'Overený', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' };
            case 'pending': return { icon: Clock, text: 'Čaká na schválenie', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' };
            case 'rejected': return { icon: XCircle, text: 'Zamietnuté', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' };
            default: return { icon: Shield, text: 'Neoverený', color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' };
        }
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in pb-12">
            <div className="mb-8 px-4 sm:px-0">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nastavenia</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Spravujte svoj profil a nastavenia aplikácie</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* ─── LOCAL SIDEBAR ─── */}
                <div className="w-full lg:w-64 flex-shrink-0 px-4 sm:px-0">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-24">
                        <nav className="p-2 space-y-1">
                            <SidebarItem
                                icon={User}
                                label="Môj profil"
                                active={activeTab === 'profile'}
                                onClick={() => setActiveTab('profile')}
                            />
                            <SidebarItem
                                icon={Shield}
                                label="Zabezpečenie"
                                active={activeTab === 'security'}
                                onClick={() => setActiveTab('security')}
                            />
                            {profile?.role === 'craftsman' && (
                                <SidebarItem
                                    icon={BadgeCheck}
                                    label="Overenie identity"
                                    active={activeTab === 'verification'}
                                    onClick={() => setActiveTab('verification')}
                                    badge={profile?.verification_status === 'verified' ? '✅' : profile?.verification_status === 'pending' ? '🟡' : undefined}
                                />
                            )}
                            <SidebarItem
                                icon={Bell}
                                label="Notifikácie"
                                active={activeTab === 'notifications'}
                                onClick={() => setActiveTab('notifications')}
                            />
                            <SidebarItem
                                icon={CreditCard}
                                label="Platby"
                                active={activeTab === 'payments'}
                                onClick={() => setActiveTab('payments')}
                            />
                            <SidebarItem icon={HelpCircle} label="Podpora" onClick={() => { }} />
                        </nav>
                        <div className="p-4 border-t border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest pl-2 mb-2">Verzia</p>
                            <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 font-medium">HammerIT v1.4.2</div>
                        </div>
                    </div>
                </div>

                {/* ─── MAIN CONTENT ─── */}
                <div className="flex-1 space-y-6 px-4 sm:px-0">
                    {success && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm animate-fade-up flex items-center gap-2">
                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                            Zmeny boli úspešne uložené
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT COLUMN: STATIC INFO OR PROFILE CARD */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden group">
                                <div className="h-32 bg-gradient-to-br from-navy-600 via-navy-700 to-coral-600 relative">
                                    <div className="absolute inset-0 opacity-20 noise"></div>
                                </div>
                                <div className="px-6 pb-6 text-center -mt-16 relative z-10">
                                    <div className="relative inline-block group/avatar">
                                        <div className="w-32 h-32 rounded-3xl bg-white dark:bg-gray-700 p-1.5 shadow-xl mx-auto transition-transform group-hover/avatar:scale-105 duration-300">
                                            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                                                {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        </div>
                                        <button className="absolute bottom-1 right-1 bg-white dark:bg-gray-600 p-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-500 text-navy-600 dark:text-white hover:text-coral-500 dark:hover:text-coral-400 transition-colors">
                                            <Camera className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{profile?.full_name}</h3>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">{profile?.role === 'client' ? 'Zákazník' : 'Remeselník'}</p>

                                    <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-700 text-left space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <Smartphone className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Telefón</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.phone || 'Nepriradený'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Národnosť</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.nationality || 'Slovenská'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: DYNAMIC TAB CONTENT */}
                        <div className="lg:col-span-2 space-y-6">
                            {activeTab === 'profile' && (
                                <form onSubmit={handleProfileUpdate} className="space-y-6 animate-fade-in">
                                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-coral-500" />
                                                    Osobné údaje
                                                </h2>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Zmeňte základné údaje o svojom konte</p>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="bg-gradient-to-r from-coral-500 to-coral-600 text-white font-medium py-2 px-6 rounded-xl hover:from-coral-600 hover:to-coral-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <Save className="w-4 h-4" />
                                                {loading ? 'Ukladám...' : 'Uložiť'}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pl-1">Celé meno</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                                                    value={formData.full_name}
                                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pl-1">Email (nemožné zmeniť)</label>
                                                <input
                                                    type="email"
                                                    disabled
                                                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                                    value={user?.email || ''}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pl-1">Telefón</label>
                                                <div className="relative">
                                                    <input
                                                        type="tel"
                                                        className="w-full px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                                                        placeholder="+421 xxx xxx xxx"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    />
                                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pl-1">Národnosť</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                                                        placeholder="Slovenská"
                                                        value={formData.nationality}
                                                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                                    />
                                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pl-1">O mne / Bio</label>
                                                <textarea
                                                    rows={4}
                                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                                                    placeholder="Povedzte niečo o sebe..."
                                                    value={formData.bio}
                                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {profile?.role === 'craftsman' && (
                                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                                <ImageIcon className="w-5 h-5 text-emerald-500" />
                                                Moje Portfólio
                                            </h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">Pridajte odkazy na fotografie vašich predošlých prác.</p>

                                            <div className="flex gap-2 mb-8">
                                                <input
                                                    type="url"
                                                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                                                    placeholder="https://example.com/image.jpg"
                                                    value={newImageUrl}
                                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addPortfolioImage}
                                                    className="bg-gradient-to-r from-coral-500 to-coral-600 text-white font-medium px-6 py-2 rounded-xl hover:from-coral-600 hover:to-coral-700 transition-all whitespace-nowrap"
                                                >
                                                    Pridať
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                {portfolio.map((img, index) => (
                                                    <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:scale-[1.02]">
                                                        <img src={img} alt={`Portfólio ${index}`} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => removePortfolioImage(index)}
                                                                className="bg-red-500 text-white p-2 rounded-xl shadow-lg hover:bg-red-600 transform hover:scale-110 transition-all font-bold"
                                                            >
                                                                Odstrániť
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {portfolio.length === 0 && (
                                                    <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                                        <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                                        <p className="text-gray-400 dark:text-gray-500 font-medium italic">Zatiaľ ste nepridali žiadne fotografie</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    <Lock className="w-5 h-5 text-navy-600 dark:text-navy-400" />
                                                    Zmena hesla
                                                </h2>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Uistite sa, že vaše konto je zabezpečené silným heslom</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pl-1">Aktuálne heslo</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        className="w-full px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                                                        placeholder="••••••••"
                                                        value={passwords.current}
                                                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-600 dark:hover:text-white"
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pl-1">Nové heslo</label>
                                                    <input
                                                        type="password"
                                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                                                        placeholder="Nové heslo"
                                                        value={passwords.new}
                                                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pl-1">Potvrdenie hesla</label>
                                                    <input
                                                        type="password"
                                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                                                        placeholder="Potvrďte heslo"
                                                        value={passwords.confirm}
                                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-4">
                                                <button type="submit" className="bg-gradient-to-r from-coral-500 to-coral-600 text-white font-medium py-2 px-8 rounded-xl hover:from-coral-600 hover:to-coral-700 transition-all flex items-center gap-2">
                                                    <Save className="w-4 h-4" />
                                                    Aktualizovať heslo
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-coral-500" />
                                            Rozšírená bezpečnosť
                                        </h2>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900/30 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all cursor-pointer group" onClick={() => toggle('two_factor')}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${formData.two_factor ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                                        <Smartphone className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white">Dvojfaktorové overenie (2FA)</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Pridajte extra vrstvu zabezpečenia k vášmu kontu</p>
                                                    </div>
                                                </div>
                                                <div className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1 ${formData.two_factor ? 'bg-coral-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formData.two_factor ? 'translate-x-7' : 'translate-x-0'}`}></div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-5 border border-gray-100 dark:border-gray-700 rounded-2xl">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-navy-50 dark:bg-navy-900/30 text-navy-600 dark:text-navy-400 flex items-center justify-center">
                                                        <History className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white">Aktívne relácie</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Práve ste prihlásený z: Chrome, Windows 11</p>
                                                    </div>
                                                </div>
                                                <button className="text-sm font-bold text-red-500 hover:text-red-600 px-4 py-2 border border-red-100 dark:border-red-900/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                    Odhlásiť všade
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                            <Bell className="w-5 h-5 text-orange-500" />
                                            Kanály upozornení
                                        </h2>

                                        <div className="space-y-4">
                                            <ToggleRow
                                                icon={Smartphone}
                                                title="SMS notifikácie"
                                                description="Dostávajte súrne upozornenia o prácach na váš mobil"
                                                active={formData.sms_alerts}
                                                onToggle={() => toggle('sms_alerts')}
                                            />
                                            <ToggleRow
                                                icon={Mail}
                                                title="Emailové novinky"
                                                description="Týždenné zhrnutia a novinky vo vašej oblasti"
                                                active={formData.email_notifications}
                                                onToggle={() => toggle('email_notifications')}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">O čom vás máme informovať?</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <CheckboxCard title="Nové správy" description="Keď vám niekto napíše správu" defaultChecked />
                                            <CheckboxCard title="Ponuky prác" description="Keď je dostupná práca vo vašom okolí" defaultChecked />
                                            <CheckboxCard title="Status zmluvy" description="Zmeny v rozpracovaných zmluvách" defaultChecked />
                                            <CheckboxCard title="Platby" description="Keď obdržíte platbu alebo faktúru" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'verification' && profile?.role === 'craftsman' && (
                                <div className="space-y-6 animate-fade-in">
                                    {/* Verification Status Banner */}
                                    {(() => {
                                        const badge = getVerificationBadge();
                                        const BadgeIcon = badge.icon;
                                        return (
                                            <div className={`rounded-2xl border p-6 ${badge.bg}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${badge.color} bg-white dark:bg-gray-800 shadow-sm`}>
                                                        <BadgeIcon className="w-7 h-7" />
                                                    </div>
                                                    <div>
                                                        <h3 className={`text-lg font-bold ${badge.color}`}>{badge.text}</h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                            {profile.verification_status === 'verified'
                                                                ? 'Vaša identita bola úspešne overená. Môžete plnohodnotne využívať platformu.'
                                                                : profile.verification_status === 'pending'
                                                                    ? 'Váš dokument sa práve kontroluje. Zvyčajne to trvá 24–48 hodín.'
                                                                    : profile.verification_status === 'rejected'
                                                                        ? 'Váš dokument bol zamietnutý. Nahrajte prosím nový.'
                                                                        : 'Pre plný prístup k funkciám platformy si overte svoju identitu.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Upload Section */}
                                    {(profile.verification_status === 'none' || profile.verification_status === 'rejected') && (
                                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                <Upload className="w-5 h-5 text-coral-500" />
                                                Nahrať doklad totožnosti
                                            </h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                                Nahrajte fotografiu alebo sken vášho občianskeho preukazu, pasu alebo vodičského preukazu.
                                                Podporované formáty: JPG, PNG, WebP, PDF. Maximum 5MB.
                                            </p>

                                            {/* Drag & Drop Zone */}
                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                                onDragLeave={() => setDragOver(false)}
                                                onDrop={handleFileDrop}
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${dragOver
                                                    ? 'border-coral-400 bg-coral-50 dark:bg-coral-900/20'
                                                    : verificationFile
                                                        ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20'
                                                        : 'border-gray-200 dark:border-gray-600 hover:border-coral-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                                    className="hidden"
                                                    onChange={(e) => setVerificationFile(e.target.files?.[0] || null)}
                                                />
                                                {verificationFile ? (
                                                    <div>
                                                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                                        <p className="font-semibold text-gray-900 dark:text-white">{verificationFile.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {(verificationFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setVerificationFile(null); }}
                                                            className="mt-3 text-sm text-red-500 hover:text-red-600 font-medium"
                                                        >
                                                            Odstrániť
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <Upload className="w-12 h-12 text-gray-300 dark:text-gray-500 mx-auto mb-3" />
                                                        <p className="font-semibold text-gray-700 dark:text-gray-300">Pretiahnite súbor sem</p>
                                                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">alebo kliknite pre výber</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Submit Button */}
                                            <div className="flex justify-end mt-6">
                                                <button
                                                    onClick={handleVerificationUpload}
                                                    disabled={!verificationFile || verificationLoading}
                                                    className="bg-gradient-to-r from-coral-500 to-coral-600 text-white font-medium py-2.5 px-8 rounded-xl hover:from-coral-600 hover:to-coral-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {verificationLoading ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            Odosielam...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-4 h-4" />
                                                            Odoslať na overenie
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Info Card */}
                                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <HelpCircle className="w-5 h-5 text-blue-500" />
                                            Prečo verifikujeme?
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-[10px] font-bold text-emerald-600">1</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400"><strong className="text-gray-900 dark:text-white">Bezpečnosť.</strong> Klienti si zaslúžia vedieť, že spolupracujú s overeným profesionálom.</p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-[10px] font-bold text-blue-600">2</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400"><strong className="text-gray-900 dark:text-white">Dôveryhodnosť.</strong> Overení remeselníci dostávajú viac pracovných príležitostí.</p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-[10px] font-bold text-amber-600">3</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400"><strong className="text-gray-900 dark:text-white">Ochrana dát.</strong> Vaše dokumenty sú uložené v zabezpečenom súkromnom úložisku.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'payments' && (
                                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center animate-fade-in">
                                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <CreditCard className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Platby a fakturácia</h2>
                                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Tu si čoskoro budete môcť nastaviť svoje platobné údaje a sťahovať faktúry za dokončené práce.</p>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold animate-pulse">
                                        <AlertCircle className="w-4 h-4" />
                                        Funkcia sa pripravuje
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── HELPER COMPONENTS ───

function SidebarItem({ icon: Icon, label, active = false, onClick, badge }: { icon: any, label: string, active?: boolean, onClick: () => void, badge?: string }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${active
                ? 'bg-coral-50 dark:bg-coral-900/20 text-coral-600 dark:text-coral-400 font-bold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium'
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${active ? 'text-coral-500' : 'text-gray-400 group-hover:text-coral-400'}`} />
                <span className="text-sm">{label}</span>
                {badge && <span className="text-xs">{badge}</span>}
            </div>
            {active && <ChevronRight className="w-4 h-4" />}
        </button>
    );
}

function ToggleRow({ icon: Icon, title, description, active, onToggle }: { icon: any, title: string, description: string, active: boolean, onToggle: () => void }) {
    return (
        <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900/30 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all cursor-pointer group" onClick={onToggle}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="font-bold text-gray-900 dark:text-white">{title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
            </div>
            <div className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1 ${active ? 'bg-coral-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${active ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </div>
        </div>
    );
}

function CheckboxCard({ title, description, defaultChecked = false }: { title: string, description: string, defaultChecked?: boolean }) {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <div
            onClick={() => setChecked(!checked)}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${checked
                ? 'border-coral-200 dark:border-coral-800 bg-coral-50/30 dark:bg-coral-900/20'
                : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className={`font-bold transition-colors ${checked ? 'text-coral-600 dark:text-coral-400' : 'text-gray-900 dark:text-white'}`}>
                        {title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                </div>
                <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${checked ? 'bg-coral-500 border-coral-500' : 'border-gray-300 dark:border-gray-600'}`}>
                    {checked && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
            </div>
        </div>
    );
}