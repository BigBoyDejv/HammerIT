// src/pages/Home.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SEO } from '../components/SEO';
import { Search, MessageSquare, Star, Shield, Zap, ArrowRight, Hammer, Palette, Droplets, Layers, HardHat, Leaf, Mountain, CheckCircle2, TrendingUp, Sparkles, ShieldCheck, Wallet } from 'lucide-react';

const STATS = [
  { value: '2.4k+', label: 'Remeselníkov', icon: <Hammer className="w-4 h-4" /> },
  { value: '18k+', label: 'Prác', icon: <CheckCircle2 className="w-4 h-4" /> },
  { value: '4.91', label: 'Hodnotenie', icon: <Star className="w-4 h-4" /> },
  { value: '99%', label: 'Spokojnosť', icon: <Sparkles className="w-4 h-4" /> },
];

const FEATURES = [
  {
    icon: <Search className="h-8 w-8" />,
    title: 'Nájdite remeselníka',
    desc: 'Vyhľadajte overených odborníkov podľa kategórie a lokality okamžite.',
    color: 'text-navy-500',
    bg: 'bg-navy-500/10',
  },
  {
    icon: <MessageSquare className="h-8 w-8" />,
    title: 'Komunikujte priamo',
    desc: 'Chatujte, porovnajte ponuky a dohodnite si detaily v bezpečnom prostredí.',
    color: 'text-coral-500',
    bg: 'bg-coral-500/10',
  },
  {
    icon: <ShieldCheck className="h-8 w-8" />,
    title: 'Bezpečná dohoda',
    desc: 'Vaša spokojnosť je prioritou. Sledujte priebeh a kontrolujte kvalitu.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: <Wallet className="h-8 w-8" />,
    title: 'Platba po práci',
    desc: 'Pohodlný systém platieb. Remeselník dostane odmenu až po vašom schválení.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
];

const CATEGORIES = [
  { icon: <Zap className="h-6 w-6" />, name: 'Elektrikár', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'hover:border-amber-500/50' },
  { icon: <Hammer className="h-6 w-6" />, name: 'Murár', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'hover:border-orange-500/50' },
  { icon: <Palette className="h-6 w-6" />, name: 'Maliar', color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'hover:border-pink-500/50' },
  { icon: <Droplets className="h-6 w-6" />, name: 'Inštalatér', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'hover:border-blue-500/50' },
  { icon: <Layers className="h-6 w-6" />, name: 'Podlahár', color: 'text-yellow-600', bg: 'bg-yellow-500/10', border: 'hover:border-yellow-500/50' },
  { icon: <HardHat className="h-6 w-6" />, name: 'Stavebné práce', color: 'text-navy-500', bg: 'bg-navy-500/10', border: 'hover:border-navy-500/50' },
  { icon: <Leaf className="h-6 w-6" />, name: 'Záhradník', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/50' },
  { icon: <Mountain className="h-6 w-6" />, name: 'Strechár', color: 'text-coral-500', bg: 'bg-coral-500/10', border: 'hover:border-coral-500/50' },
];

const TRUST = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Overení remeselníci',
    desc: 'Každý remeselník prechádza overovacím procesom. Žiadne prekvapenia.',
    iconBg: 'bg-navy-500/8 dark:bg-navy-500/15 text-navy-600 dark:text-navy-400',
    accent: 'border-l-navy-500',
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: 'Transparentné hodnotenia',
    desc: 'Skutočné recenzie od skutočných klientov. Vidíte presne čo dostanete.',
    iconBg: 'bg-amber-400/10 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400',
    accent: 'border-l-amber-400',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Platba po dokončení',
    desc: 'Peniaze uvoľnené až keď ste spokojní s výsledkom práce.',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    accent: 'border-l-emerald-500',
  },
];

export function Home() {
  const { user } = useAuth();

  return (
    <div className="overflow-hidden">
      <SEO />

      {/* ── HERO ── */}
      <section className="hero-bg min-h-[80vh] md:min-h-screen flex flex-col justify-center relative">
        <div className="container-wide relative z-10 py-4 md:py-24">
          <div className="max-w-4xl mx-auto text-center">

            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-emerald-200/60 dark:border-emerald-500/20 rounded-full px-4 py-1.5 mb-8 shadow-sm animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Platforma č.1 pre remeselníkov na Slovensku
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-8 animate-fade-up delay-100 text-gray-900 dark:text-white">
              Spojíme vás s{' '}
              <span className="gradient-text">najlepšími<br />remeselníkmi</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light animate-fade-up delay-200">
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

            <div className="hidden md:flex justify-center mt-20 animate-fade-up delay-500">
              <div className="scroll-indicator" />
            </div>
          </div>
        </div>

        {/* Floating cards */}
        <div className="absolute top-1/4 left-8 animate-float delay-100 hidden lg:block">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] p-5 shadow-2xl border border-white/50 dark:border-white/10 w-56 transform hover:scale-105 transition-transform cursor-default">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white text-sm font-black shadow-lg">J</div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">Jozo Murár</div>
                <div className="stars text-xs flex gap-0.5 text-amber-400 mt-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-500 font-black uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Práca dokončená</span>
            </div>
          </div>
        </div>
 
        <div className="absolute bottom-1/4 right-8 animate-float delay-300 hidden lg:block">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl border border-white/50 dark:border-white/10 w-64 transform hover:scale-105 transition-transform cursor-default">
            <div className="flex items-center gap-2 text-[10px] font-black text-coral-500 uppercase tracking-[0.2em] mb-3">
              <TrendingUp className="w-4 h-4" />
              <span>Nová dopyt</span>
            </div>
            <div className="text-lg font-black text-navy-900 dark:text-white mb-1 leading-tight">Oprava strechy</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium italic">500€ – 800€ · Košice</div>
            <div className="flex -space-x-3 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="inline-block h-8 w-8 rounded-full ring-4 ring-white dark:ring-slate-800 bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 border border-white/20">
                   {String.fromCharCode(64 + i)}
                </div>
              ))}
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-coral-500 ring-4 ring-white dark:ring-slate-800 text-[10px] font-black text-white">
                +3
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-3 font-bold uppercase tracking-widest">3 Ponuky od remeselníkov</p>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="section-dark py-20 noise relative">
        <div className="container-wide relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="relative group animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2 bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                    <span className="text-blue-200">{stat.icon}</span>
                    <span className="text-[10px] text-blue-100 font-black uppercase tracking-[0.2em]">{stat.label}</span>
                  </div>
                  <div className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 bg-white dark:bg-slate-900/50">
        <div className="container-wide">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-coral-500/8 dark:bg-coral-500/15 rounded-full px-4 py-1.5 mb-4 border border-coral-200/40 dark:border-coral-500/20">
              <Zap className="h-4 w-4 text-coral-500" />
              <span className="text-sm font-semibold text-coral-600 dark:text-coral-400">Ako to funguje</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Jednoducho. Rýchlo. Spoľahlivo.
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-12">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="relative group animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`w-20 h-20 rounded-[2rem] ${f.bg} ${f.color} flex items-center justify-center mb-8 relative z-10 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500`}>
                  {f.icon}
                  <div className="absolute top-0 right-0 -mr-2 -mt-2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-xs font-black text-gray-900 dark:text-white shadow-lg border border-gray-100 dark:border-white/5">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">{f.desc}</p>
                <div className="mt-6 w-12 h-1 bg-gray-100 dark:bg-slate-800 rounded-full group-hover:w-full group-hover:bg-coral-500 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-28 section-alt">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
              Kategórie prác
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Nájdite odborníka pre každú potrebu</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.name}
                to={user ? `/craftsmen?spec=${cat.name}` : '/auth/register'}
                className={`group relative p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-white/5 transition-all duration-500 hover:shadow-2xl hover:shadow-navy-900/10 hover:-translate-y-2 animate-fade-up ${cat.border}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-sm`}>
                  {cat.icon}
                </div>
                <h3 className="font-black text-gray-900 dark:text-white text-lg mb-2 tracking-tight">{cat.name}</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 group-hover:text-coral-500 transition-colors uppercase tracking-widest">
                  <span>Prezrieť</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="py-28 bg-white dark:bg-slate-900/50">
        <div className="container-wide">
          <div className="grid md:grid-cols-3 gap-8">
            {TRUST.map((item, i) => (
              <div key={item.title} className={`card-premium p-8 animate-fade-up delay-${i * 100} border-l-4 ${item.accent} dark:bg-slate-800/50`}>
                <div className={`feature-card-icon w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${item.iconBg}`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
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