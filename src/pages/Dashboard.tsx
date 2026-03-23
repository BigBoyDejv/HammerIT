import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { profile } = useAuth();

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Vitajte, {profile?.full_name}!
          </h1>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {profile?.role === 'client' ? 'Moje požiadavky' : 'Moje ponuky'}
              </h2>
              <p className="text-3xl font-bold text-[#191970]">0</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Aktívne zákazky</h2>
              <p className="text-3xl font-bold text-[#191970]">0</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Správy</h2>
              <p className="text-3xl font-bold text-[#191970]">0</p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
