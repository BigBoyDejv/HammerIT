// src/pages/Register.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wrench, User, Hammer, Eye, EyeOff, ShieldCheck, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'client' | 'craftsman'>('client');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, fullName, role);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Nepodarilo sa zaregistrovať. Skúste iný email alebo skontrolujte pripojenie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 top-16 md:static z-[40] md:z-auto md:min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 pb-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full h-full md:h-auto overflow-y-auto hide-scrollbar md:overflow-visible flex flex-col justify-center py-4 space-y-4 md:space-y-8"
      >
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <Wrench className="h-10 w-10 text-coral-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">HammerIt</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Vytvorte si nový účet zadarmo
          </p>
        </div>

        {/* Formulár */}
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1 transition-colors group-focus-within:text-coral-500">
                  Celé meno
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-all font-medium"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ján Novák"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1 transition-colors group-focus-within:text-coral-500">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.sk"
                />
              </div>

              <div className="group relative">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1 transition-colors group-focus-within:text-coral-500">
                  Heslo
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-all font-medium pr-12"
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
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 ml-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-coral-400" />
                  Minimálne 6 znakov pre tvoju bezpečnosť
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 ml-1">
                  Registrujem sa ako
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border-2 transition-all ${role === 'client'
                      ? 'border-coral-500 dark:border-coral-400 bg-coral-50 dark:bg-coral-900/20 text-coral-600 dark:text-coral-400 shadow-md shadow-coral-500/5'
                      : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                      }`}
                  >
                    <User className={`w-6 h-6 ${role === 'client' ? 'text-coral-500' : 'text-gray-400'}`} />
                    <span className="font-bold text-xs uppercase tracking-wide">Zákazník</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('craftsman')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border-2 transition-all ${role === 'craftsman'
                      ? 'border-coral-500 dark:border-coral-400 bg-coral-50 dark:bg-coral-900/20 text-coral-600 dark:text-coral-400 shadow-md shadow-coral-500/5'
                      : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                      }`}
                  >
                    <Hammer className={`w-6 h-6 ${role === 'craftsman' ? 'text-coral-500' : 'text-gray-400'}`} />
                    <span className="font-bold text-xs uppercase tracking-wide">Remeselník</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-coral-500 to-coral-600 text-white font-bold py-3.5 rounded-xl hover:from-coral-600 hover:to-coral-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-coral-500/25 active:scale-[0.98] mt-2"
            >
              {loading ? 'Registrácia...' : 'Vytvoriť účet'}
            </button>

            <div className="text-center pt-2">
              <Link to="/auth/login" className="text-sm text-gray-500 dark:text-gray-400">
                Už máte účet? {' '}
                <span className="text-coral-500 dark:text-coral-400 font-bold hover:underline">Prihláste sa</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Benefits text */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-2">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <CheckCircle className="w-4 h-4 text-green-500" /> Registrácia zadarmo
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <ShieldCheck className="w-4 h-4 text-green-500" /> Overená komunita
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <Sparkles className="w-4 h-4 text-green-500" /> Rýchle nájdenie práce
          </div>
        </div>
      </motion.div>
    </div>
  );
}