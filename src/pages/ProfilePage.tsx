import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function ProfilePage() {
    const { user, profile, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        bio: profile?.bio || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(formData);
            alert('Profil bol aktualizovaný');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Nepodarilo sa aktualizovať profil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Môj profil</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
                <div>
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="form-input bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email nie je možné zmeniť</p>
                </div>

                <div>
                    <label className="form-label">Celé meno</label>
                    <input
                        type="text"
                        required
                        className="form-input"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="form-label">Telefón</label>
                    <input
                        type="tel"
                        className="form-input"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+421 xxx xxx xxx"
                    />
                </div>

                <div>
                    <label className="form-label">O mne</label>
                    <textarea
                        rows={4}
                        className="form-textarea"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Napíšte niečo o sebe..."
                    />
                </div>

                <div className="flex gap-4">
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Ukladám...' : 'Uložiť zmeny'}
                    </button>
                    <a href="/dashboard" className="btn-secondary">
                        Späť
                    </a>
                </div>
            </form>
        </div>
    );
}