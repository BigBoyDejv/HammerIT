// ─── Navbar.tsx ────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Hammer, ChevronDown, Sun, Moon, Map } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { NotificationBell } from './NotificationBell';
import { supabase } from '../lib/supabase';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingOffersCount, setPendingOffersCount] = useState(0);
  const { user, profile, signOut } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Funkcia pre domov link - po prihlásení na dashboard
  const getHomeLink = () => {
    return user ? '/dashboard' : '/';
  };

  // Načítať počet neprečítaných správ
  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);

      if (!conversations?.length) {
        setUnreadCount(0);
        return;
      }

      const conversationIds = conversations.map(c => c.id);

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .neq('sender_id', user.id)
        .is('read_at', null);

      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Načítať počet čakajúcich ponúk (len pre remeselníka)
  const fetchPendingOffersCount = async () => {
    if (!user || profile?.role !== 'craftsman') return;
    try {
      const { count } = await supabase
        .from('job_offers')
        .select('*', { count: 'exact', head: true })
        .eq('craftsman_id', user.id)
        .eq('status', 'pending');

      setPendingOffersCount(count || 0);
    } catch (error) {
      console.error('Error fetching pending offers:', error);
    }
  };

  useEffect(() => {
    // Pridaj podmienku
    if (!user || profile?.role !== 'craftsman') return;

    const offerSubscription = supabase
      .channel('navbar-offers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_offers',
          filter: `craftsman_id=eq.${user.id}`
        },
        () => {
          fetchPendingOffersCount();
        }
      )
      .subscribe();

    return () => {
      offerSubscription.unsubscribe();
    };
  }, [user, profile]);

  // Načítať počiatočné hodnoty
  useEffect(() => {
    fetchUnreadCount();
    fetchPendingOffersCount();
  }, [user, profile]);

  // Real-time subskripcia na správy
  useEffect(() => {
    if (!user) return;

    const messageSubscription = supabase
      .channel('navbar-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `read_at=not.is.null`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Real-time subskripcia na ponuky (pre remeselníka)
    const offerSubscription = supabase
      .channel('navbar-offers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_offers',
          filter: `craftsman_id=eq.${user.id}`
        },
        () => {
          fetchPendingOffersCount();
        }
      )
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
      offerSubscription.unsubscribe();
    };
  }, [user, profile]);

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

  const navClass = `fixed top-0 w-full z-50 transition-all duration-300 ${
    scrolled
      ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-gray-100 dark:border-white/5'
      : 'bg-transparent'
  }`;

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">

          {/* Logo - Domov po prihlásení na dashboard */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-coral-500 to-coral-600 rounded-lg flex items-center justify-center shadow-sm">
              <Hammer className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">HammerIt</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <NavLink to={getHomeLink()}>Domov</NavLink>
                <NavLink to="/craftsmen">Remeselníci</NavLink>
                <NavLink to="/contracts">Zmluvy</NavLink>
                <NavLink to="/messages" unreadCount={unreadCount}>
                  Správy
                </NavLink>

                {profile?.role === 'client'
                  ? <NavLink to="/jobs/new" highlight>Nová práca</NavLink>
                  : (
                    <>
                      <NavLink to="/jobs">Prehliadať práce</NavLink>
                      <NavLink to="/map">
                        <Map className="w-4 h-4 inline mr-0.5" />
                        Mapa
                      </NavLink>
                      <NavLink to="/my-offers" pendingCount={pendingOffersCount}>
                        Moje ponuky
                      </NavLink>
                    </>
                  )
                }

                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
                  aria-label="Toggle theme"
                >
                  {resolvedTheme === 'dark' ? (
                    <Sun className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>

                {/* Notification Bell */}
                <NotificationBell />

                {/* Profil dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-coral-500 to-coral-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden lg:inline text-sm font-medium">
                      {profile?.full_name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 dark:border-gray-700 z-50">
                    <Link to="/profile" className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-xl transition-colors">
                      Môj profil
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-b-xl transition-colors"
                    >
                      Odhlásiť sa
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-6">
                {/* Theme toggle for guests */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
                  aria-label="Toggle theme"
                >
                  {resolvedTheme === 'dark' ? (
                    <Sun className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>

                <NavLink to="/auth/login">Prihlásiť sa</NavLink>
                <Link
                  to="/auth/register"
                  className="px-5 py-2 rounded-full font-semibold text-sm bg-gradient-to-r from-coral-500 to-coral-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-300"
                  style={{ boxShadow: '0 4px 14px rgba(255,77,26,0.3)' }}
                >
                  Registrovať sa
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ${isOpen ? 'max-h-[calc(100vh-5rem)] overflow-y-auto opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}>
        <div className="px-4 py-4 space-y-1 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-white/5">
          {user ? (
            <>
              <MobileNavLink to={getHomeLink()} onClick={() => setIsOpen(false)}>Domov</MobileNavLink>
              <MobileNavLink to="/craftsmen" onClick={() => setIsOpen(false)}>Remeselníci</MobileNavLink>
              <MobileNavLink to="/contracts" onClick={() => setIsOpen(false)}>Zmluvy</MobileNavLink>
              <MobileNavLink to="/messages" onClick={() => setIsOpen(false)} unreadCount={unreadCount}>
                Správy
              </MobileNavLink>

              {profile?.role === 'client'
                ? <MobileNavLink to="/jobs/new" onClick={() => setIsOpen(false)}>Nová práca</MobileNavLink>
                : (
                  <>
                    <MobileNavLink to="/jobs" onClick={() => setIsOpen(false)}>Prehliadať práce</MobileNavLink>
                    <MobileNavLink to="/my-offers" onClick={() => setIsOpen(false)} pendingCount={pendingOffersCount}>
                      Moje ponuky
                    </MobileNavLink>
                  </>
                )
              }

              <MobileNavLink to="/profile" onClick={() => setIsOpen(false)}>Môj profil</MobileNavLink>
              <button
                onClick={() => { handleSignOut(); setIsOpen(false); }}
                className="block w-full text-left py-2.5 px-2 text-red-600 dark:text-red-400 font-medium text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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

          {/* Theme Toggle Mobile */}
          <div className="pt-4 border-t border-gray-100 dark:border-white/5 mt-2">
            <button
              onClick={() => { toggleTheme(); }}
              className="flex items-center justify-between w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/40 text-gray-700 dark:text-gray-300 transition-all active:scale-[0.98] border border-gray-100 dark:border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${resolvedTheme === 'dark' ? 'bg-amber-400/10 text-amber-400' : 'bg-white text-gray-600 shadow-sm'}`}>
                  {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold leading-none mb-1">
                    {resolvedTheme === 'dark' ? 'Svetlý režim' : 'Tmavý režim'}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Prepnúť vzhľad aplikácie</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${resolvedTheme === 'dark' ? 'bg-coral-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${resolvedTheme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>

          {/* Mobile Footer Links */}
          <div className="pt-6 pb-2 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-gray-400 dark:text-gray-500 font-medium">
            <Link to="/about" onClick={() => setIsOpen(false)} className="hover:text-coral-500 transition-colors">O nás</Link>
            <Link to="/terms" onClick={() => setIsOpen(false)} className="hover:text-coral-500 transition-colors">Podmienky</Link>
            <Link to="/privacy" onClick={() => setIsOpen(false)} className="hover:text-coral-500 transition-colors">Súkromie</Link>
            <a href="mailto:info@hammerit.sk" className="hover:text-coral-500 transition-colors">Kontakt</a>
          </div>
        </div>
      </div>
    </nav>
  );
}

// NavLink s podporou pre neprečítané správy a čakajúce ponuky
const NavLink = ({
  to,
  children,
  highlight = false,
  unreadCount,
  pendingCount
}: {
  to: string;
  children: React.ReactNode;
  highlight?: boolean;
  unreadCount?: number;
  pendingCount?: number;
}) => (
  <Link
    to={to}
    className={`relative text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${highlight
      ? 'text-coral-500 font-semibold hover:text-coral-600'
      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
      }`}
  >
    {children}
    {unreadCount !== undefined && unreadCount > 0 && (
      <span className="absolute -top-1 -right-3 bg-coral-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    )}
    {pendingCount !== undefined && pendingCount > 0 && (
      <span className="absolute -top-1 -right-3 bg-yellow-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
        {pendingCount > 9 ? '9+' : pendingCount}
      </span>
    )}
  </Link>
);

// MobileNavLink s podporou pre neprečítané správy a čakajúce ponuky
const MobileNavLink = ({
  to,
  children,
  onClick,
  unreadCount,
  pendingCount
}: {
  to: string;
  children: React.ReactNode;
  onClick: () => void;
  unreadCount?: number;
  pendingCount?: number;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center justify-between py-2.5 px-2 text-sm text-gray-600 dark:text-gray-400 hover:text-coral-500 dark:hover:text-coral-400 hover:bg-coral-50 dark:hover:bg-coral-900/20 rounded-lg transition-colors font-medium"
  >
    <span>{children}</span>
    {(unreadCount !== undefined && unreadCount > 0) && (
      <span className="bg-coral-500 text-white text-xs rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    )}
    {(pendingCount !== undefined && pendingCount > 0) && (
      <span className="bg-yellow-500 text-white text-xs rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5">
        {pendingCount > 9 ? '9+' : pendingCount}
      </span>
    )}
  </Link>
);