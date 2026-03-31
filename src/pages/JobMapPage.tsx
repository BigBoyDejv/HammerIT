import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { jobService } from '../services/jobService';
import { MapPin, List, Map as MapIcon, Filter, Navigation, MessageCircle, ChevronRight, Briefcase } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons in Leaflet + bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Category icons with colors
const CATEGORY_COLORS: Record<string, string> = {
    'Elektrikár': '#f59e0b',
    'Murár': '#ef4444',
    'Maliar': '#8b5cf6',
    'Inštalatér': '#3b82f6',
    'Podlahár': '#10b981',
    'Stavebné práce': '#f97316',
    'Záhradník': '#22c55e',
    'Strechár': '#dc2626',
    'Kúrenár': '#ea580c',
    'Iné': '#6b7280',
};

function createCategoryIcon(category: string) {
    const color = CATEGORY_COLORS[category] || '#6b7280';
    return L.divIcon({
        html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:3px solid white;">
            <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M21 13v10h-6v-6h-6v6h-6v-10h-3l12-12 12 12h-3z"/></svg>
        </div>`,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
}

// Haversine distance calculation (km)
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Component to recenter the map
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], map.getZoom());
    }, [lat, lng]);
    return null;
}

interface JobWithGeo {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    lat: number;
    lng: number;
    budget_min: number | null;
    budget_max: number | null;
    status: string;
    created_at: string;
    client_id: string;
    client?: { full_name: string; avatar_url: string | null };
    distance?: number;
}

const CATEGORIES = [
    'Elektrikár', 'Murár', 'Maliar', 'Inštalatér',
    'Podlahár', 'Stavebné práce', 'Záhradník', 'Strechár', 'Kúrenár', 'Iné'
];

export function JobMapPage() {
    const { } = useAuth();
    const { resolvedTheme } = useTheme();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<JobWithGeo[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<JobWithGeo[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [userLat, setUserLat] = useState<number>(48.1486); // Default: Bratislava
    const [userLng, setUserLng] = useState<number>(17.1077);
    const [radius, setRadius] = useState(20);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [hasGeo, setHasGeo] = useState(false);

    // Load jobs with coordinates
    useEffect(() => {
        loadJobs();
    }, []);

    // Refilter when radius, category, or user position changes
    useEffect(() => {
        filterJobs();
    }, [jobs, radius, selectedCategory, userLat, userLng]);

    const loadJobs = async () => {
        try {
            const data = await jobService.getAllJobs({ status: 'open' });
            // Only include jobs with coordinates
            const geoJobs = (data || [])
                .filter((j: any) => j.lat != null && j.lng != null)
                .map((j: any) => ({
                    ...j,
                    lat: Number(j.lat),
                    lng: Number(j.lng),
                })) as JobWithGeo[];
            setJobs(geoJobs);
        } catch (error) {
            console.error('Error loading jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterJobs = () => {
        let result = [...jobs];

        // Category filter
        if (selectedCategory) {
            result = result.filter(j => j.category === selectedCategory);
        }

        // Distance filter (if user has provided location)
        if (hasGeo) {
            result = result
                .map(j => ({ ...j, distance: getDistanceKm(userLat, userLng, j.lat, j.lng) }))
                .filter(j => j.distance! <= radius)
                .sort((a, b) => a.distance! - b.distance!);
        }

        setFilteredJobs(result);
    };

    const getUserLocation = () => {
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLat(pos.coords.latitude);
                setUserLng(pos.coords.longitude);
                setHasGeo(true);
                setGeoLoading(false);
            },
            (err) => {
                console.error('Geolocation error:', err);
                setGeoLoading(false);
                alert('Nepodarilo sa získať vašu polohu. Skontrolujte povolenia prehliadača.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Tile URLs
    const lightTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const tileUrl = resolvedTheme === 'dark' ? darkTileUrl : lightTileUrl;
    const attribution = resolvedTheme === 'dark'
        ? '&copy; <a href="https://carto.com/">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MapIcon className="w-7 h-7 text-coral-500" />
                        Mapa prác
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {filteredJobs.length} {filteredJobs.length === 1 ? 'práca' : filteredJobs.length < 5 ? 'práce' : 'prác'} v okolí
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Get location */}
                    <button
                        onClick={getUserLocation}
                        disabled={geoLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                    >
                        <Navigation className={`w-4 h-4 text-coral-500 ${geoLoading ? 'animate-spin' : ''}`} />
                        {geoLoading ? 'Hľadám...' : hasGeo ? 'Znova lokalizovať' : 'Použiť moju polohu'}
                    </button>

                    {/* Filter toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm ${showFilters
                            ? 'bg-coral-500 text-white'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filtre
                    </button>

                    {/* View toggle */}
                    <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                        <button
                            onClick={() => setViewMode('map')}
                            className={`px-3 py-2 text-sm ${viewMode === 'map' ? 'bg-coral-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'} transition-all`}
                        >
                            <MapIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-coral-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'} transition-all`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 mb-4 animate-fade-in shadow-lg">
                    {/* Radius slider */}
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Okruh: <span className="text-coral-500 font-bold">{radius} km</span>
                            {!hasGeo && <span className="text-xs text-amber-500 ml-2">(najprv povoľte polohu)</span>}
                        </label>
                        <input
                            type="range"
                            min={5}
                            max={100}
                            step={5}
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                            className="w-full accent-coral-500"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>5 km</span>
                            <span>50 km</span>
                            <span>100 km</span>
                        </div>
                    </div>

                    {/* Category chips */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Kategória</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory('')}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!selectedCategory
                                    ? 'bg-coral-500 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                Všetky
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === cat
                                        ? 'bg-coral-500 text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Map View */}
            {viewMode === 'map' ? (
                <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700" style={{ height: '600px' }}>
                    <MapContainer
                        center={[userLat, userLng]}
                        zoom={hasGeo ? 11 : 8}
                        style={{ height: '100%', width: '100%' }}
                        key={resolvedTheme} // Force re-render on theme change
                    >
                        <TileLayer url={tileUrl} attribution={attribution} />
                        <RecenterMap lat={userLat} lng={userLng} />

                        {/* User location radius */}
                        {hasGeo && (
                            <Circle
                                center={[userLat, userLng]}
                                radius={radius * 1000}
                                pathOptions={{
                                    color: '#ff4d1a',
                                    fillColor: '#ff4d1a',
                                    fillOpacity: 0.08,
                                    weight: 2,
                                    dashArray: '5, 10',
                                }}
                            />
                        )}

                        {/* Job markers */}
                        {filteredJobs.map(job => (
                            <Marker
                                key={job.id}
                                position={[job.lat, job.lng]}
                                icon={createCategoryIcon(job.category)}
                            >
                                <Popup maxWidth={280} className="job-popup">
                                    <div className="p-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ background: CATEGORY_COLORS[job.category] || '#6b7280' }}
                                            />
                                            <span className="text-xs font-medium text-gray-500">{job.category}</span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-sm mb-1">{job.title}</h3>
                                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{job.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                            <MapPin className="w-3 h-3" />
                                            <span>{job.location}</span>
                                            {job.distance != null && (
                                                <span className="font-medium text-coral-500">
                                                    ({job.distance.toFixed(1)} km)
                                                </span>
                                            )}
                                        </div>
                                        {(job.budget_min || job.budget_max) && (
                                            <p className="text-xs font-semibold text-emerald-600 mb-3">
                                                💰 {job.budget_min ? `${job.budget_min}€` : ''}{job.budget_min && job.budget_max ? ' - ' : ''}{job.budget_max ? `${job.budget_max}€` : ''}
                                            </p>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/jobs/${job.id}`)}
                                                className="flex-1 text-xs bg-coral-500 text-white py-1.5 px-3 rounded-lg font-medium hover:bg-coral-600 transition-colors"
                                            >
                                                Detail
                                            </button>
                                            <button
                                                onClick={() => navigate(`/messages?user=${job.client_id}`)}
                                                className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 py-1.5 px-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                            >
                                                <MessageCircle className="w-3 h-3" />
                                                Chat
                                            </button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            ) : (
                /* List View */
                <div className="space-y-3">
                    {filteredJobs.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
                            <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Žiadne práce v tomto okolí</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Skúste zväčšiť okruh alebo zmeniť kategóriu</p>
                        </div>
                    ) : (
                        filteredJobs.map(job => (
                            <div
                                key={job.id}
                                onClick={() => navigate(`/jobs/${job.id}`)}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                style={{ background: CATEGORY_COLORS[job.category] || '#6b7280' }}
                                            />
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{job.category}</span>
                                            {job.distance != null && (
                                                <span className="text-xs font-bold text-coral-500 ml-auto">
                                                    📍 {job.distance.toFixed(1)} km
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-coral-500 transition-colors">{job.title}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{job.description}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {job.location}
                                            </span>
                                            {(job.budget_min || job.budget_max) && (
                                                <span className="text-xs font-semibold text-emerald-600">
                                                    {job.budget_min ? `${job.budget_min}€` : ''}{job.budget_min && job.budget_max ? ' - ' : ''}{job.budget_max ? `${job.budget_max}€` : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-coral-500 transition-colors flex-shrink-0 ml-3" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
