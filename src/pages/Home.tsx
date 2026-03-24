// src/pages/Home.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wrench, Search, MessageSquare, Star, Shield, Zap, ChevronRight, ArrowRight } from 'lucide-react';

const STATS = [
  { value: '2,400+', label: 'Remeselníkov' },
  { value: '18,000+', label: 'Dokončených prác' },
  { value: '4.9★', label: 'Priemerné hodnotenie' },
  { value: '98%', label: 'Spokojných klientov' },
];

const FEATURES = [
  {
    icon: <Search className="h-7 w-7 text-[#191970]" />,
    title: 'Nájdite remeselníka',
    desc: 'Vyhľadajte overených remeselníkov podľa kategórie a lokality za pár sekúnd.',
  },
  {
    icon: <MessageSquare className="h-7 w-7 text-[#191970]" />,
    title: 'Komunikujte priamo',
    desc: 'Chatujte s remeselníkmi, porovnajte ponuky a dohodnite detaily práce.',
  },
  {
    icon: <Wrench className="h-7 w-7 text-[#191970]" />,
    title: 'Práca hotová',
    desc: 'Sledujte priebeh práce v reálnom čase. Plaťte až po dokončení.',
  },
  {
    icon: <Star className="h-7 w-7 text-[#191970]" />,
    title: 'Ohodnoťte',
    desc: 'Zanechajte recenziu a pomôžte komunite nájsť tých najlepších.',
  },
];

const CATEGORIES = [
  { emoji: '⚡', name: 'Elektrikár' },
  { emoji: '🧱', name: 'Murár' },
  { emoji: '🎨', name: 'Maliar' },
  { emoji: '🔧', name: 'Inštalatér' },
  { emoji: '🪵', name: 'Podlahár' },
  { emoji: '🏗️', name: 'Stavebné práce' },
  { emoji: '🌿', name: 'Záhradník' },
  { emoji: '🏠', name: 'Strechár' },
];

export function Home() {
  const { user } = useAuth();

  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="hero-bg min-h-screen flex flex-col justify-center relative pt-20">
        <div className="container-wide relative z-10 py-24">
          <div className="max-w-4xl mx-auto text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-[#191970]/10 rounded-full px-4 py-1.5 mb-8 shadow-sm animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-600">
                Platforma č.1 pre remeselníkov na Slovensku
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-8 animate-fade-up delay-100">
              Spojíme vás s{' '}
              <span className="gradient-text">najlepšími<br />remeselníkmi</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed font-light animate-fade-up delay-200">
              Rýchlo, bezpečne a spoľahlivo. Nájdite overených odborníkov vo vašom okolí.
            </p>

            {!user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up delay-300">
                <Link to="/auth/register" className="btn-primary text-lg px-8 py-4 rounded-xl">
                  <span>Začať zadarmo</span>
                  <ArrowRight className="ml-2 h-5 w-5 inline" />
                </Link>
                <Link to="/craftsmen" className="btn-secondary text-lg px-8 py-4 rounded-xl">
                  Prehľadať remeselníkov
                </Link>
              </div>
            ) : (
              <div className="flex gap-4 justify-center animate-fade-up delay-300">
                <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 rounded-xl">
                  <span>Môj dashboard</span>
                  <ArrowRight className="ml-2 h-5 w-5 inline" />
                </Link>
              </div>
            )}

            {/* Scroll indicator */}
            <div className="flex justify-center mt-20 animate-fade-up delay-500">
              <div className="scroll-indicator" />
            </div>
          </div>
        </div>

        {/* Floating cards decoration */}
        <div className="absolute top-1/4 left-8 animate-float delay-100 hidden lg:block">
          <div className="glass rounded-2xl p-4 shadow-lg border border-white/50 w-48">
            <div className="flex items-center gap-3 mb-2">
              <div className="avatar w-8 h-8 text-xs">J</div>
              <div>
                <div className="text-xs font-semibold text-gray-900">Jozo Murár</div>
                <div className="stars text-xs">★★★★★</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Práca dokončená ✓</div>
          </div>
        </div>

        <div className="absolute top-1/3 right-8 animate-float delay-300 hidden lg:block">
          <div className="glass rounded-2xl p-4 shadow-lg border border-white/50 w-52">
            <div className="text-xs font-semibold text-gray-600 mb-1">Nová ponuka</div>
            <div className="text-sm font-bold text-[#191970]">Oprava strechy</div>
            <div className="text-xs text-gray-500 mt-1">500€ – 800€ · Košice</div>
            <div className="mt-2 text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 inline-block">3 ponuky</div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="section-dark py-20 noise">
        <div className="container-wide relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div key={stat.label} className={`text-center animate-fade-up`} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="stat-number">{stat.value}</div>
                <div className="text-sm text-blue-200 font-medium mt-2 uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 bg-white">
        <div className="container-wide">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-[#191970]/6 rounded-full px-4 py-1.5 mb-4">
              <Zap className="h-4 w-4 text-[#191970]" />
              <span className="text-sm font-semibold text-[#191970]">Ako to funguje</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Jednoducho. Rýchlo. Spoľahlivo.
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`text-center animate-fade-up delay-${i * 100}`}>
                <div className="feature-icon mx-auto mb-6">
                  {f.icon}
                </div>
                <div className="text-xs font-bold text-[#191970]/40 mb-2 tracking-widest uppercase">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-28 section-alt">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
              Kategórie prác
            </h2>
            <p className="text-gray-500 text-lg">Nájdite odborníka pre každú potrebu</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.name}
                to={user ? `/craftsmen?spec=${cat.name}` : '/auth/register'}
                className={`card p-6 text-center group cursor-pointer animate-fade-up delay-${i * 50}`}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {cat.emoji}
                </div>
                <div className="font-semibold text-gray-800 text-sm">{cat.name}</div>
                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-[#191970] opacity-0 group-hover:opacity-100 transition-opacity">
                  Zobraziť <ChevronRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="py-28 bg-white">
        <div className="container-wide">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Shield className="h-6 w-6" />, title: 'Overení remeselníci', desc: 'Každý remeselník prechádza overovacím procesom. Žiadne prekvapenia.' },
              { icon: <Star className="h-6 w-6" />, title: 'Transparentné hodnotenia', desc: 'Skutočné recenzie od skutočných klientov. Vidíte presne čo dostanete.' },
              { icon: <Zap className="h-6 w-6" />, title: 'Platba po dokončení', desc: 'Peniaze uvoľnené až keď ste spokojní s výsledkom práce.' },
            ].map((item, i) => (
              <div key={item.title} className={`card-premium p-8 animate-fade-up delay-${i * 100}`}>
                <div className="w-12 h-12 rounded-xl bg-[#191970]/8 flex items-center justify-center text-[#191970] mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-dark py-28 noise">
        <div className="container-wide relative z-10 text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Ste remeselník?
          </h2>
          <p className="text-xl text-blue-200 mb-12 max-w-2xl mx-auto font-light">
            Zaregistrujte sa zadarmo a získajte prístup k stovkám zákaziek vo vašom okolí každý deň.
          </p>
          {!user && (
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-3 bg-white text-[#191970] font-bold text-lg px-10 py-5 rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:-translate-y-1"
            >
              Registrovať ako remeselník
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </div>
      </section>

    </div>
  );
}