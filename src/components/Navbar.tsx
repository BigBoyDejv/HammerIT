// src/components/Navbar.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Hammer, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const navClass = `fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
      ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
      : 'bg-white/80 backdrop-blur-sm'
    }`;

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center space-x-2 group">
            <Hammer className="h-7 w-7 text-[#191970]" />
            <span className="text-xl font-bold tracking-tight text-gray-900">HammerIt</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <NavLink to="/craftsmen">Remeselníci</NavLink>
                <NavLink to="/contracts">Zmluvy</NavLink>
                <NavLink to="/messages">Správy</NavLink>
                {profile?.role === 'client'
                  ? <NavLink to="/jobs/new" highlight>Nová práca</NavLink>
                  : <NavLink to="/jobs">Prehliadať práce</NavLink>
                }
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors py-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#191970] to-[#4a4ae6] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden lg:inline text-sm font-medium">
                      {profile?.full_name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 z-50">
                    <Link to="/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl transition-colors">
                      Môj profil
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 rounded-b-xl transition-colors"
                    >
                      Odhlásiť sa
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/auth/login">Prihlásiť sa</NavLink>
                <Link
                  to="/auth/register"
                  className="px-5 py-2 rounded-full font-medium text-sm bg-[#191970] text-white hover:bg-[#2a2a8a] transition-all duration-300"
                >
                  Registrovať sa
                </Link>
              </>
            )}
          </div>

          {/* Burger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-4 space-y-1 bg-white border-t border-gray-100">
          {user ? (
            <>
              <MobileNavLink to="/craftsmen" onClick={() => setIsOpen(false)}>Remeselníci</MobileNavLink>
              <MobileNavLink to="/contracts" onClick={() => setIsOpen(false)}>Zmluvy</MobileNavLink>
              <MobileNavLink to="/messages" onClick={() => setIsOpen(false)}>Správy</MobileNavLink>
              {profile?.role === 'client'
                ? <MobileNavLink to="/jobs/new" onClick={() => setIsOpen(false)}>Nová práca</MobileNavLink>
                : <MobileNavLink to="/jobs" onClick={() => setIsOpen(false)}>Prehliadať práce</MobileNavLink>
              }
              <MobileNavLink to="/profile" onClick={() => setIsOpen(false)}>Môj profil</MobileNavLink>
              <button
                onClick={() => { handleSignOut(); setIsOpen(false); }}
                className="block w-full text-left py-2.5 px-2 text-red-600 font-medium text-sm rounded-lg hover:bg-red-50 transition-colors"
              >
                Odhlásiť sa
              </button>
            </>
          ) : (
            <>
              <MobileNavLink to="/auth/login" onClick={() => setIsOpen(false)}>Prihlásiť sa</MobileNavLink>
              <MobileNavLink to="/auth/register" onClick={() => setIsOpen(false)}>Registrovať sa</MobileNavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const NavLink = ({
  to, children, highlight = false
}: { to: string; children: React.ReactNode; highlight?: boolean }) => (
  <Link
    to={to}
    className={`text-sm font-medium transition-colors duration-200 hover:text-[#191970] ${highlight ? 'text-[#191970] font-semibold' : 'text-gray-600'
      }`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({
  to, children, onClick
}: { to: string; children: React.ReactNode; onClick: () => void }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block py-2.5 px-2 text-sm text-gray-600 hover:text-[#191970] hover:bg-gray-50 rounded-lg transition-colors font-medium"
  >
    {children}
  </Link>
);