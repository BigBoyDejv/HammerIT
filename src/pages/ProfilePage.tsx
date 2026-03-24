// src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
    const { user, profile, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        bio: '',
    });

    // Sync form when profile loads
    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name ?? '',
                phone: profile.phone ?? '',
                bio: profile.bio ?? '',
            });
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        try {
            await updateProfile(formData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('updateProfile error:', err);
            alert('Nepodarilo sa aktualizovať profil');
        } finally {
            setLoading(false);
        }
    };

    const field = (key: keyof typeof formData) =>
        ({ value: formData[key], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [key]: e.target.value }) });

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Môj profil</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                        ✓ Profil bol úspešne aktualizovaný
                    </div>
                )}

                <div>
                    <label className="form-label">Email</label>
                    <input type="email" value={user?.email ?? ''} disabled className="form-input bg-gray-50 cursor-not-allowed" />
                    <p className="text-xs text-gray-500 mt-1">Email nie je možné zmeniť</p>
                </div>

                <div>
                    <label className="form-label">Rola</label>
                    <input
                        type="text"
                        value={profile?.role === 'client' ? 'Zákazník' : 'Remeselník'}
                        disabled
                        className="form-input bg-gray-50 cursor-not-allowed"
                    />
                </div>

                <div>
                    <label className="form-label">Celé meno *</label>
                    <input type="text" required className="form-input" {...field('full_name')} />
                </div>

                <div>
                    <label className="form-label">Telefón</label>
                    <input type="tel" className="form-input" placeholder="+421 xxx xxx xxx" {...field('phone')} />
                </div>

                <div>
                    <label className="form-label">O mne</label>
                    <textarea
                        rows={4}
                        className="form-textarea"
                        placeholder="Napíšte niečo o sebe..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                </div>

                <div className="flex gap-4">
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Ukladám...' : 'Uložiť zmeny'}
                    </button>
                    <Link to="/dashboard" className="btn-secondary">Späť</Link>
                </div>
            </form>
        </div>
    );
}