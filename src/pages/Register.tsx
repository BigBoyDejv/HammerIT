import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

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
      setError('Nepodarilo sa zaregistrovať');
    } finally {
      setLoading(false);
    }
  };

  return (
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
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registrujem sa ako
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="client"
                    checked={role === 'client'}
                    onChange={(e) => setRole(e.target.value as 'client')}
                    className="mr-2"
                  />
                  Zákazník
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="craftsman"
                    checked={role === 'craftsman'}
                    onChange={(e) => setRole(e.target.value as 'craftsman')}
                    className="mr-2"
                  />
                  Remeselník
                </label>
              </div>
            </div>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Registrácia...' : 'Registrovať sa'}
          </Button>
        </form>
      </div>
    </div>
  );
}