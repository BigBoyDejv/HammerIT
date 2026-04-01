// src/pages/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wrench, Eye, EyeOff, ShieldCheck, CheckCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message?.includes('Email not confirmed')) {
        setError('Potvrďte prosím svoju emailovú adresu');
      } else if (err.message?.includes('Invalid login credentials')) {
        setError('Nesprávny email alebo heslo');
      } else {
        setError('Prihlásenie sa nepodarilo. Skontrolujte svoje údaje.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 top-16 md:static z-[40] md:z-auto md:min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <Wrench className="h-10 w-10 text-coral-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">HammerIt</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Prihláste sa do vášho účtu
          </p>
        </div>

        {/* Formulár */}
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1 transition-colors group-focus-within:text-coral-500">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.sk"
                />
              </div>

              <div className="group relative">
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors group-focus-within:text-coral-500">
                    Heslo
                  </label>
                  <Link to="/auth/forgot-password" className="text-xs text-coral-500 hover:underline font-medium">
                    Zabudli ste heslo?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-all pr-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-coral-500 to-coral-600 text-white font-bold py-3.5 rounded-xl hover:from-coral-600 hover:to-coral-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-coral-500/25 active:scale-[0.98]"
            >
              {loading ? 'Prihlasovanie...' : 'Prihlásiť sa'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nemáte účet?{' '}
              <Link to="/auth/register" className="text-coral-500 dark:text-coral-400 font-bold hover:underline">
                Zaregistrujte sa
              </Link>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
              Zaregistrujte sa zadarmo a nájdite spoľahlivého remeselníka za 2 minúty.
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4">
          <div className="flex flex-col items-center text-center space-y-1">
            <div className="w-10 h-10 rounded-full bg-coral-50 dark:bg-coral-900/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-coral-500" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-tight leading-tight">100+ remeselníkov</span>
          </div>
          <div className="flex flex-col items-center text-center space-y-1">
            <div className="w-10 h-10 rounded-full bg-coral-50 dark:bg-coral-900/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-coral-500" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Overené profily</span>
          </div>
          <div className="flex flex-col items-center text-center space-y-1">
            <div className="w-10 h-10 rounded-full bg-coral-50 dark:bg-coral-900/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-coral-500" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Zabezpečené pripojenie</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}