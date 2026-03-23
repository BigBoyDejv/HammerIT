import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

export function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      navigate('/');
    } catch (err) {
      setError('Chyba pri registrácii. Skúste prosím iný email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Registrácia
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Už máte účet?{' '}
              <a href="/auth/login" className="font-medium text-[#191970] hover:underline">
                Prihláste sa
              </a>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Celé meno"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Ján Novák"
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vas@email.sk"
              />

              <Input
                label="Heslo"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registrujem sa ako
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`p-4 border-2 rounded-lg transition ${
                      role === 'client'
                        ? 'border-[#191970] bg-[#191970] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">Klient</div>
                    <div className="text-sm opacity-80">Hľadám remeselníka</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('craftsman')}
                    className={`p-4 border-2 rounded-lg transition ${
                      role === 'craftsman'
                        ? 'border-[#191970] bg-[#191970] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">Remeselník</div>
                    <div className="text-sm opacity-80">Ponúkam služby</div>
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Registrujem...' : 'Zaregistrovať sa'}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
