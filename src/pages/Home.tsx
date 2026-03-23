import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { Wrench, Search, MessageSquare, Star } from 'lucide-react';

export function Home() {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* Obsah Home stránky BEZ Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            Spojíme vás s{' '}
            <span className="text-[#191970]">najlepšími remeselníkmi</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            CraftConnect je platforma, kde sa stretávajú ľudia s potrebami a kvalifikovaní
            remeselníci. Rýchlo, bezpečne a spoľahlivo.
          </p>

          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="primary"
                onClick={() => (window.location.href = '/auth/register')}
                className="px-8 py-3 text-lg"
              >
                Začať teraz
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/craftsmen')}
                className="px-8 py-3 text-lg"
              >
                Prehľadať remeselníkov
              </Button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-4 gap-8 mt-20">
          {/* Features - rovnaký obsah */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#191970] rounded-full flex items-center justify-center mx-auto">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Nájdite remeselníka</h3>
            <p className="text-gray-600">
              Vyhľadajte kvalifikovaných remeselníkov podľa kategórie a lokality
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#191970] rounded-full flex items-center justify-center mx-auto">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Komunikujte priamo</h3>
            <p className="text-gray-600">
              Chatujte s remeselníkmi a dohodnite sa na detailoch práce
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#191970] rounded-full flex items-center justify-center mx-auto">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Práca hotová</h3>
            <p className="text-gray-600">
              Sledujte priebeh práce a plaťte až po dokončení
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#191970] rounded-full flex items-center justify-center mx-auto">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Ohodnoťte</h3>
            <p className="text-gray-600">
              Zanechajte recenziu a pomôžte iným v rozhodovaní
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#191970] text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ste remeselník?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Zaregistrujte sa a získajte prístup k novým zákazkám vo vašom okolí
          </p>
          {!user && (
            <Button
              variant="secondary"
              onClick={() => (window.location.href = '/auth/register')}
              className="px-8 py-3 text-lg"
            >
              Registrovať ako remeselník
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}