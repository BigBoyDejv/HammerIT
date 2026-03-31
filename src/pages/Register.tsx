// src/pages/Register.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wrench, User, Hammer } from 'lucide-react';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    } catch (err) {
      setError('Nepodarilo sa zaregistrovať. Skúste iný email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 top-16 md:static z-[40] md:z-auto md:min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 pb-4">
      <div className="max-w-md w-full h-full md:h-auto overflow-y-auto hide-scrollbar md:overflow-visible flex flex-col justify-center py-4 space-y-4 md:space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Wrench className="h-12 w-12 text-[#191970] dark:text-coral-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">HammerIt</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Vytvorte si nový účet
          </p>
        </div>

        {/* Formulár */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Celé meno
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ján Novák"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.sk"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heslo
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimálne 6 znakov</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Registrujem sa ako
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${role === 'client'
                    ? 'border-coral-500 dark:border-coral-400 bg-coral-50 dark:bg-coral-900/20 text-coral-600 dark:text-coral-400'
                    : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Zákazník</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('craftsman')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${role === 'craftsman'
                    ? 'border-coral-500 dark:border-coral-400 bg-coral-50 dark:bg-coral-900/20 text-coral-600 dark:text-coral-400'
                    : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                >
                  <Hammer className="w-5 h-5" />
                  <span className="font-medium">Remeselník</span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-coral-500 to-coral-600 text-white font-medium py-3 rounded-lg hover:from-coral-600 hover:to-coral-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? 'Registrácia...' : 'Registrovať sa'}
          </button>

          <div className="text-center">
            <Link to="/auth/login" className="text-sm text-coral-500 dark:text-coral-400 hover:underline">
              Už máte účet? Prihláste sa
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}