// ─── ProtectedRoute.tsx ────────────────────────────────────────────────────────
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'client' | 'craftsman';
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 gap-4">
        <div className="spinner" />
        <p className="text-sm text-gray-400 font-medium">Načítava sa...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/login" replace />;
  if (requireRole && profile?.role !== requireRole) return <Navigate to="/" replace />;

  return <>{children}</>;
}
