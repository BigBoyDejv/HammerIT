// src/pages/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wrench } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, profile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      // Presmerovanie podľa roly po prihlásení
      if (profile?.role === 'client') {
        navigate('/dashboard');
      } else if (profile?.role === 'craftsman') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Nesprávny email alebo heslo');
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
            Prihláste sa do vášho účtu
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
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? 'Prihlasovanie...' : 'Prihlásiť sa'}
          </button>

          <div className="text-center">
            <Link to="/auth/register" className="text-sm text-[#191970] hover:underline">
              Nemáte účet? Zaregistrujte sa
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}