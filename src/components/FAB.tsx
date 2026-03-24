// src/components/FAB.tsx
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function FAB() {
    const { profile } = useAuth();

    if (!profile) return null;

    const link = profile.role === 'client' ? '/jobs/new' : '/jobs';

    return (
        <Link to={link} className="fab tap-scale">
            <Plus className="w-6 h-6" />
        </Link>
    );
}