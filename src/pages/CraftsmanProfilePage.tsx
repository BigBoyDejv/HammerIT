import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { craftsmanService } from '../services';
import { supabase } from '../lib/supabase';
import { MapPin, Star, Briefcase, Clock, Mail, Phone, MessageCircle, CheckCircle, Award, Calendar, ArrowLeft } from 'lucide-react';

export function CraftsmanProfilePage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [craftsman, setCraftsman] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<any[]>([]);

    useEffect(() => {
        if (id) loadCraftsman();
    }, [id]);

    const loadCraftsman = async () => {
        try {
            // Získať profil remeselníka
            const { data: craftsmanData, error: craftsmanError } = await supabase
                .from('craftsman_profiles')
                .select(`
                    *,
                    user:profiles!craftsman_profiles_user_id_fkey(
                        id,
                        full_name,
                        avatar_url,
                        phone,
                        bio,
                        email
                    )
                `)
                .eq('user_id', id)
                .single();

            if (craftsmanError) throw craftsmanError;
            setCraftsman(craftsmanData);

            // Získať hodnotenia
            const { data: reviewsData } = await supabase
                .from('reviews')
                .select(`
                    *,
                    reviewer:profiles!reviewer_id(
                        full_name,
                        avatar_url
                    )
                `)
                .eq('reviewed_id', id)
                .order('created_at', { ascending: false });

            setReviews(reviewsData || []);
        } catch (error) {
            console.error('Error loading craftsman:', error);
        } finally {
            setLoading(false);
        }
    };

    const startConversation = async () => {
        if (!user) {
            navigate('/auth/login');
            return;
        }

        try {
            // Vytvoriť konverzáciu
            const [participant_1, participant_2] = [user.id, id!].sort();

            let { data: conversation } = await supabase
                .from('conversations')
                .select('id')
                .eq('participant_1', participant_1)
                .eq('participant_2', participant_2)
                .maybeSingle();

            if (!conversation) {
                const { data: newConversation } = await supabase
                    .from('conversations')
                    .insert({ participant_1, participant_2, last_message_at: new Date().toISOString() })
                    .select()
                    .single();
                conversation = newConversation;
            }

            navigate(`/messages?user=${id}`);
        } catch (error) {
            console.error('Error starting conversation:', error);
            alert('Nepodarilo sa spustiť konverzáciu');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
            </div>
        );
    }

    if (!craftsman) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Remeselník nebol nájdený</p>
                <Link to="/craftsmen" className="text-coral-500 hover:underline mt-2 inline-block">
                    Späť na zoznam
                </Link>
            </div>
        );
    }

    const isOwnProfile = user?.id === craftsman.user_id;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <Link to="/craftsmen" className="inline-flex items-center gap-2 text-gray-500 hover:text-coral-500 transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" />
                Späť na zoznam remeselníkov
            </Link>

            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-32 h-32 bg-gradient-to-r from-coral-500 to-coral-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold">
                        {craftsman.user?.full_name?.charAt(0) || 'R'}
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{craftsman.user?.full_name}</h1>
                            {craftsman.verified && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Overený
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 mb-4">
                            <span className="flex items-center gap-1 text-gray-600">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold">{craftsman.rating_avg?.toFixed(1) || 'Nový'}</span>
                                <span className="text-sm">({craftsman.total_jobs || 0} hodnotení)</span>
                            </span>
                            <span className="flex items-center gap-1 text-gray-600">
                                <Briefcase className="w-4 h-4" />
                                {craftsman.years_experience || 0} rokov skúseností
                            </span>
                            <span className="flex items-center gap-1 text-gray-600">
                                <Clock className="w-4 h-4" />
                                {craftsman.total_jobs || 0} dokončených prác
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {craftsman.specialization?.map((spec: string, idx: number) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                    {spec}
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            {!isOwnProfile && (
                                <button
                                    onClick={startConversation}
                                    className="btn-gradient flex items-center gap-2"
                                >
                                    <MessageCircle className="w-4 h-4" /> Správa
                                </button>
                            )}
                            <Link to={`/jobs?craftsman=${craftsman.user_id}`} className="btn-outline">
                                Pozrieť práce
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">O mne</h2>
                <p className="text-gray-600 leading-relaxed">
                    {craftsman.user?.bio || 'Tento remeselník zatiaľ nepridal žiadny popis.'}
                </p>
            </div>

            {/* Skills & Rates */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Špecializácie</h2>
                    <div className="flex flex-wrap gap-2">
                        {craftsman.specialization?.map((spec: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                                {spec}
                            </span>
                        ))}
                        {(!craftsman.specialization || craftsman.specialization.length === 0) && (
                            <p className="text-gray-500 text-sm">Zatiaľ neboli pridané žiadne špecializácie</p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Hodinová sadzba</h2>
                    <div className="text-3xl font-bold text-coral-500">
                        {craftsman.hourly_rate ? `${craftsman.hourly_rate}€` : 'Dohodou'}
                    </div>
                    <p className="text-gray-500 text-sm mt-2">za hodinu práce</p>
                </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Kontaktné údaje</h2>
                <div className="space-y-3">
                    {craftsman.user?.phone && (
                        <div className="flex items-center gap-3 text-gray-600">
                            <Phone className="w-5 h-5" />
                            <span>{craftsman.user.phone}</span>
                        </div>
                    )}
                    {craftsman.user?.email && (
                        <div className="flex items-center gap-3 text-gray-600">
                            <Mail className="w-5 h-5" />
                            <span>{craftsman.user.email}</span>
                        </div>
                    )}
                    {!craftsman.user?.phone && !craftsman.user?.email && (
                        <p className="text-gray-500">Kontaktné údaje nie sú k dispozícii</p>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Hodnotenia od klientov</h2>
                {reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Zatiaľ žiadne hodnotenia</p>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                                        {review.reviewer?.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{review.reviewer?.full_name}</p>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 ml-auto">
                                        {new Date(review.created_at).toLocaleDateString('sk-SK')}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}