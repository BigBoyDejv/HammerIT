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
      <div className="min-h-screen flex items-center justify-center bg-[#ECEFF1]">
        <div className="animate-pulse text-[#191970] text-xl">Načítava sa...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requireRole && profile?.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
