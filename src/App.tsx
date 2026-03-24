import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { FAB } from './components/FAB';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { JobsPage } from './pages/JobsPage';
import { CreateJobPage } from './pages/CreateJobPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { CraftsmenPage } from './pages/CraftsmenPage';
import { CraftsmanProfilePage } from './pages/CraftsmanProfilePage';
import { MessagesPage } from './pages/MessagesPage';
import { ContractsPage } from './pages/ContractsPage';
import { ContractDetailPage } from './pages/ContractDetailPage';
import { MyOffersPage } from './pages/MyOffersPage';
import { supabase } from './lib/supabase';
import { useEffect } from 'react';
import { RealtimeProvider } from './contexts/RealtimeContext';

function App() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // Ak nemáme používateľa, nespúšťame subskripciu
    if (!user) return;

    const notificationSub = supabase
      .channel('global-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Spustiť aktualizáciu notifikačného badge
          window.dispatchEvent(new Event('notification-received'));
        }
      )
      .subscribe();

    return () => {
      notificationSub.unsubscribe();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <RealtimeProvider>
        <Navbar />
        <div className="pb-20 md:pb-0 pt-16 md:pt-20">
          <div className="container mx-auto px-4 py-4 md:py-8">
            <Routes>
              {/* Verejné stránky */}
              <Route path="/" element={<Home />} />
              <Route path="/auth/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
              <Route path="/auth/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

              {/* Chránené stránky */}
              <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth/login" />} />
              <Route path="/jobs" element={user ? <JobsPage /> : <Navigate to="/auth/login" />} />
              <Route path="/jobs/new" element={user ? <CreateJobPage /> : <Navigate to="/auth/login" />} />
              <Route path="/jobs/:id" element={user ? <JobDetailPage /> : <Navigate to="/auth/login" />} />
              <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/auth/login" />} />
              <Route path="/craftsmen" element={user ? <CraftsmenPage /> : <Navigate to="/auth/login" />} />
              <Route path="/craftsmen/:id" element={user ? <CraftsmanProfilePage /> : <Navigate to="/auth/login" />} />
              <Route path="/messages" element={user ? <MessagesPage /> : <Navigate to="/auth/login" />} />
              <Route path="/contracts" element={user ? <ContractsPage /> : <Navigate to="/auth/login" />} />
              <Route path="/contracts/:id" element={user ? <ContractDetailPage /> : <Navigate to="/auth/login" />} />

              {/* Remeselník - moje ponuky */}
              <Route
                path="/my-offers"
                element={
                  user && profile && profile.role === 'craftsman'
                    ? <MyOffersPage />
                    : <Navigate to="/dashboard" />
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
        <BottomNav />
        <FAB />
      </RealtimeProvider>
    </BrowserRouter>
  );
}

export default App;