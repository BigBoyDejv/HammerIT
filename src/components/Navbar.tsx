import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const getHomeLink = () => {
    return user ? '/dashboard' : '/';
  };

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

  const fetchPendingOffersCount = async () => {
    if (!user || !profile) return;
    try {
      if (profile.role === 'craftsman') {
        const { count } = await supabase
          .from('job_offers')
          .select('*', { count: 'exact', head: true })
          .eq('craftsman_id', user.id)
          .eq('status', 'pending');
        setPendingOffersCount(count || 0);
      } else {
        const { data: myJobs } = await supabase
          .from('job_requests')
          .select('id')
          .eq('client_id', user.id);

        if (!myJobs?.length) {
          setPendingOffersCount(0);
          return;
        }

        const jobIds = myJobs.map(j => j.id);
        const { count } = await supabase
          .from('job_offers')
          .select('*', { count: 'exact', head: true })
          .in('job_request_id', jobIds)
          .eq('status', 'pending');
          
        setPendingOffersCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching pending offers:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchPendingOffersCount();
  }, [user, profile]);

  useEffect(() => {
    if (!user) return;
    const messageChannel = supabase
      .channel('navbar-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchUnreadCount())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: 'read_at=not.is.null' }, () => fetchUnreadCount())
      .subscribe();

    const offerChannel = supabase
      .channel('navbar-offers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_offers' }, () => fetchPendingOffersCount())
      .subscribe();

    return () => {
      messageChannel.unsubscribe();
      offerChannel.unsubscribe();
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
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-coral-500 to-coral-600 rounded-lg flex items-center justify-center shadow-sm">
              <Hammer className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">HammerIt</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <NavLink to={getHomeLink()}>Domov</NavLink>
                <NavLink to="/craftsmen">Remeselníci</NavLink>
                <NavLink to="/messages" unreadCount={unreadCount}>Správy</NavLink>

                {profile?.role === 'client' ? (
                  <>
                    <NavLink to="/my-requests" pendingCount={pendingOffersCount}>Moje zakázky</NavLink>
                    <NavLink to="/jobs/new" highlight>Nová práca</NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/jobs">Prehliadať práce</NavLink>
                    <NavLink to="/map"><Map className="w-4 h-4 inline mr-0.5" />Mapa</NavLink>
                    <NavLink to="/my-requests">Moje práce</NavLink>
                  </>
                )}

                <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300">
                  {resolvedTheme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
                </button>

                <NotificationBell />

                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shadow-sm ring-2 ring-white/10 group-hover:ring-coral-500/30 transition-all">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center text-white text-sm font-semibold">
                          {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <span className="hidden lg:inline text-sm font-medium">{profile?.full_name?.split(' ')[0]}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 dark:border-gray-700 z-50">
                    <Link to="/profile" className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-xl transition-colors">Môj profil</Link>
                    <button onClick={handleSignOut} className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-b-xl transition-colors">Odhlásiť sa</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-6">
                <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300">
                  {resolvedTheme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
                </button>
                <Link to="/auth/login" className="px-5 py-2 rounded-full font-bold text-sm bg-gradient-to-r from-coral-500 to-coral-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-lg shadow-coral-500/25">Prihlásiť sa</Link>
                <Link to="/auth/register" className="px-5 py-2 rounded-full font-bold text-sm border-2 border-coral-500 text-coral-500 hover:bg-coral-50 dark:hover:bg-coral-900/10 transition-all duration-300">Registrovať sa</Link>
              </div>
            )}
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden bg-white dark:bg-slate-900 shadow-xl border-t border-gray-100 dark:border-white/5">
            <div className="px-4 py-6 space-y-2">
              {user ? (
                <>
                  <MobileNavLink to={getHomeLink()} onClick={() => setIsOpen(false)}>Domov</MobileNavLink>
                  <MobileNavLink to="/craftsmen" onClick={() => setIsOpen(false)}>Remeselníci</MobileNavLink>
                  <MobileNavLink to="/messages" onClick={() => setIsOpen(false)} unreadCount={unreadCount}>Správy</MobileNavLink>
                  {profile?.role === 'client' ? (
                    <>
                      <MobileNavLink to="/my-requests" onClick={() => setIsOpen(false)} pendingCount={pendingOffersCount}>Moje zakázky</MobileNavLink>
                      <MobileNavLink to="/jobs/new" onClick={() => setIsOpen(false)}>Nová práca</MobileNavLink>
                    </>
                  ) : (
                    <>
                      <MobileNavLink to="/jobs" onClick={() => setIsOpen(false)}>Prehliadať práce</MobileNavLink>
                      <MobileNavLink to="/my-requests" onClick={() => setIsOpen(false)}>Moje práce</MobileNavLink>
                    </>
                  )}
                  <MobileNavLink to="/profile" onClick={() => setIsOpen(false)}>Môj profil</MobileNavLink>
                  <button onClick={() => { handleSignOut(); setIsOpen(false); }} className="block w-full text-left py-3 px-4 text-red-600 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-4 italic">Odhlásiť sa</button>
                </>
              ) : (
                <div className="space-y-4 pt-4">
                  <Link to="/auth/login" onClick={() => setIsOpen(false)} className="block w-full text-center py-4 bg-coral-500 text-white font-bold rounded-2xl shadow-lg shadow-coral-500/20">Prihlásiť sa</Link>
                  <Link to="/auth/register" onClick={() => setIsOpen(false)} className="block w-full text-center py-4 border-2 border-coral-500 text-coral-500 font-bold rounded-2xl">Registrovať sa</Link>
                </div>
              )}
              
              <div className="pt-8 mt-8 border-t border-gray-100 dark:border-white/5">
                <button onClick={toggleTheme} className="flex items-center justify-between w-full p-5 rounded-[2rem] bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${resolvedTheme === 'dark' ? 'bg-amber-400/10 text-amber-400' : 'bg-white shadow-sm'}`}>
                      {resolvedTheme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-gray-900 dark:text-white leading-none mb-1">{resolvedTheme === 'dark' ? 'Svetlý režim' : 'Tmavý režim'}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Zmeniť vzhľad aplikácie</p>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 ${resolvedTheme === 'dark' ? 'bg-coral-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${resolvedTheme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

const NavLink = ({ to, children, highlight = false, unreadCount, pendingCount }: any) => (
  <Link to={to} className={`relative text-sm font-bold transition-all ${highlight ? 'text-coral-500 hover:text-coral-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
    {children}
    {unreadCount! > 0 && <span className="absolute -top-2 -right-3 bg-coral-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black shadow-lg shadow-coral-500/40 animate-pulse">{unreadCount}</span>}
    {pendingCount! > 0 && <span className="absolute -top-2 -right-3 bg-amber-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black shadow-lg shadow-amber-500/40">{pendingCount}</span>}
  </Link>
);

const MobileNavLink = ({ to, children, onClick, unreadCount, pendingCount }: any) => (
  <Link to={to} onClick={onClick} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-slate-800/30 text-sm font-black text-gray-900 dark:text-white active:scale-95 transition-all mb-1 border border-transparent dark:border-white/5">
    <span>{children}</span>
    {unreadCount! > 0 && <span className="bg-coral-500 text-white text-xs px-2 py-0.5 rounded-lg">{unreadCount}</span>}
    {pendingCount! > 0 && <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-lg">{pendingCount}</span>}
  </Link>
);