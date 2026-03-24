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
    icon: <Search className="h-7 w-7" />,
    title: 'Nájdite remeselníka',
    desc: 'Vyhľadajte overených remeselníkov podľa kategórie a lokality za pár sekúnd.',
    color: 'bg-navy-500/10 text-navy-600 border border-navy-200/40',
    hover: 'group-hover:bg-navy-500 group-hover:text-white group-hover:border-transparent',
  },
  {
    icon: <MessageSquare className="h-7 w-7" />,
    title: 'Komunikujte priamo',
    desc: 'Chatujte s remeselníkmi, porovnajte ponuky a dohodnite detaily práce.',
    color: 'bg-coral-500/10 text-coral-600 border border-coral-200/40',
    hover: 'group-hover:bg-coral-500 group-hover:text-white group-hover:border-transparent',
  },
  {
    icon: <Wrench className="h-7 w-7" />,
    title: 'Práca hotová',
    desc: 'Sledujte priebeh práce v reálnom čase. Plaťte až po dokončení.',
    color: 'bg-emerald-500/10 text-emerald-600 border border-emerald-200/40',
    hover: 'group-hover:bg-emerald-500 group-hover:text-white group-hover:border-transparent',
  },
  {
    icon: <Star className="h-7 w-7" />,
    title: 'Ohodnoťte',
    desc: 'Zanechajte recenziu a pomôžte komunite nájsť tých najlepších.',
    color: 'bg-amber-400/10 text-amber-600 border border-amber-200/40',
    hover: 'group-hover:bg-amber-400 group-hover:text-white group-hover:border-transparent',
  },
];

const CATEGORIES = [
  { emoji: '⚡', name: 'Elektrikár', accent: 'hover:border-amber-300  hover:bg-amber-50' },
  { emoji: '🧱', name: 'Murár', accent: 'hover:border-orange-300 hover:bg-orange-50' },
  { emoji: '🎨', name: 'Maliar', accent: 'hover:border-pink-300   hover:bg-pink-50' },
  { emoji: '🔧', name: 'Inštalatér', accent: 'hover:border-blue-300   hover:bg-blue-50' },
  { emoji: '🪵', name: 'Podlahár', accent: 'hover:border-yellow-300 hover:bg-yellow-50' },
  { emoji: '🏗️', name: 'Stavebné práce', accent: 'hover:border-navy-300   hover:bg-navy-50' },
  { emoji: '🌿', name: 'Záhradník', accent: 'hover:border-emerald-300 hover:bg-emerald-50' },
  { emoji: '🏠', name: 'Strechár', accent: 'hover:border-coral-300  hover:bg-coral-50' },
];

const TRUST = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Overení remeselníci',
    desc: 'Každý remeselník prechádza overovacím procesom. Žiadne prekvapenia.',
    iconBg: 'bg-navy-500/8 text-navy-600',
    accent: 'border-l-navy-500',
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: 'Transparentné hodnotenia',
    desc: 'Skutočné recenzie od skutočných klientov. Vidíte presne čo dostanete.',
    iconBg: 'bg-amber-400/10 text-amber-600',
    accent: 'border-l-amber-400',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Platba po dokončení',
    desc: 'Peniaze uvoľnené až keď ste spokojní s výsledkom práce.',
    iconBg: 'bg-emerald-500/10 text-emerald-600',
    accent: 'border-l-emerald-500',
  },
];

export function Home() {
  const { user } = useAuth();

  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="hero-bg min-h-screen flex flex-col justify-center relative pt-20">
        <div className="container-wide relative z-10 py-24">
          <div className="max-w-4xl mx-auto text-center">

            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-emerald-200/60 rounded-full px-4 py-1.5 mb-8 shadow-sm animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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

            <div className="flex justify-center mt-20 animate-fade-up delay-500">
              <div className="scroll-indicator" />
            </div>
          </div>
        </div>

        {/* Floating cards */}
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
            <div className="text-sm font-bold text-navy-500">Oprava strechy</div>
            <div className="text-xs text-gray-500 mt-1">500€ – 800€ · Košice</div>
            <div className="mt-2 text-xs bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 inline-block font-medium">
              3 ponuky
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="section-dark py-20 noise relative">
        <div className="container-wide relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="text-center animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
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
            <div className="inline-flex items-center gap-2 bg-coral-500/8 rounded-full px-4 py-1.5 mb-4 border border-coral-200/40">
              <Zap className="h-4 w-4 text-coral-500" />
              <span className="text-sm font-semibold text-coral-600">Ako to funguje</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Jednoducho. Rýchlo. Spoľahlivo.
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`text-center group animate-fade-up delay-${i * 100}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${f.color} ${f.hover}`}>
                  {f.icon}
                </div>
                <div className="text-xs font-bold text-gray-300 mb-2 tracking-widest uppercase">
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
                className={`card p-6 text-center group cursor-pointer animate-fade-up border transition-all duration-300 ${cat.accent} delay-${i * 50}`}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {cat.emoji}
                </div>
                <div className="font-semibold text-gray-800 text-sm">{cat.name}</div>
                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-coral-500 opacity-0 group-hover:opacity-100 transition-opacity">
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
            {TRUST.map((item, i) => (
              <div key={item.title} className={`card-premium p-8 animate-fade-up delay-${i * 100} border-l-4 ${item.accent}`}>
                <div className={`feature-card-icon w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${item.iconBg}`}>
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
      <section className="section-dark py-28 noise relative">
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
              className="cta-button"
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