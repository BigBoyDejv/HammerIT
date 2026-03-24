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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Wrench className="h-12 w-12 text-[#191970]" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">HammerIt</h2>
          <p className="mt-2 text-sm text-gray-600">
            Vytvorte si nový účet
          </p>
        </div>

        {/* Formulár */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="form-label">Celé meno</label>
              <input
                type="text"
                required
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ján Novák"
              />
            </div>

            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.sk"
              />
            </div>

            <div>
              <label className="form-label">Heslo</label>
              <input
                type="password"
                required
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">Minimálne 6 znakov</p>
            </div>

            <div>
              <label className="form-label">Registrujem sa ako</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${role === 'client'
                      ? 'border-[#191970] bg-[#191970]/5 text-[#191970]'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Zákazník</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('craftsman')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${role === 'craftsman'
                      ? 'border-[#191970] bg-[#191970]/5 text-[#191970]'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
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
            className="btn-primary w-full py-3"
          >
            {loading ? 'Registrácia...' : 'Registrovať sa'}
          </button>

          <div className="text-center">
            <Link to="/auth/login" className="text-sm text-[#191970] hover:underline">
              Už máte účet? Prihláste sa
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}