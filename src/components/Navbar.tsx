import { useState } from 'react';
import { Menu, X, Wrench, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-[#191970] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Wrench className="h-8 w-8" />
            <span className="text-xl font-bold">CraftConnect</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="hover:text-gray-300 transition">Domov</a>
            {user ? (
              <>
                {profile?.role === 'client' ? (
                  <>
                    <a href="/jobs/new" className="hover:text-gray-300 transition">Nová požiadavka</a>
                    <a href="/craftsmen" className="hover:text-gray-300 transition">Nájsť remeselníka</a>
                  </>
                ) : (
                  <>
                    <a href="/jobs" className="hover:text-gray-300 transition">Prehliadať zákazky</a>
                    <a href="/contracts" className="hover:text-gray-300 transition">Moje zákazky</a>
                  </>
                )}
                <a href="/messages" className="hover:text-gray-300 transition">Správy</a>
                <a href="/profile" className="hover:text-gray-300 transition flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Profil</span>
                </a>
                <button
                  onClick={handleSignOut}
                  className="hover:text-gray-300 transition flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Odhlásiť</span>
                </button>
              </>
            ) : (
              <>
                <a href="/auth/login" className="hover:text-gray-300 transition">Prihlásiť sa</a>
                <a
                  href="/auth/register"
                  className="bg-white text-[#191970] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
                >
                  Registrovať sa
                </a>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#191970] border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            <a href="/" className="block hover:text-gray-300 transition">Domov</a>
            {user ? (
              <>
                {profile?.role === 'client' ? (
                  <>
                    <a href="/jobs/new" className="block hover:text-gray-300 transition">Nová požiadavka</a>
                    <a href="/craftsmen" className="block hover:text-gray-300 transition">Nájsť remeselníka</a>
                  </>
                ) : (
                  <>
                    <a href="/jobs" className="block hover:text-gray-300 transition">Prehliadať zákazky</a>
                    <a href="/contracts" className="block hover:text-gray-300 transition">Moje zákazky</a>
                  </>
                )}
                <a href="/messages" className="block hover:text-gray-300 transition">Správy</a>
                <a href="/profile" className="block hover:text-gray-300 transition">Profil</a>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left hover:text-gray-300 transition"
                >
                  Odhlásiť
                </button>
              </>
            ) : (
              <>
                <a href="/auth/login" className="block hover:text-gray-300 transition">Prihlásiť sa</a>
                <a href="/auth/register" className="block hover:text-gray-300 transition">Registrovať sa</a>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
