import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { JobsPage } from './pages/JobsPage';
import { CreateJobPage } from './pages/CreateJobPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { CraftsmenPage } from './pages/CraftsmenPage';
import { MessagesPage } from './pages/MessagesPage';
import { ContractsPage } from './pages/ContractsPage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Navbar />
      {/* Pridaný padding-top pre fixed navbar (h-16 na mobile = 64px, h-20 na desktop = 80px) */}
      <div className="pt-16 md:pt-20">
        <div className="container mx-auto px-4 py-8">
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
            <Route path="/messages" element={user ? <MessagesPage /> : <Navigate to="/auth/login" />} />
            <Route path="/contracts" element={user ? <ContractsPage /> : <Navigate to="/auth/login" />} />

            {/* Fallback pre neexistujúce stránky */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;