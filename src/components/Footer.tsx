// src/components/Footer.tsx
import { Link } from 'react-router-dom';
import { 
  Hammer, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Send,
  ExternalLink
} from 'lucide-react';

const Footer = () => {
    return (
        <footer className="hidden md:block bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-white/5 transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    
                    {/* Column 1: Brand & About */}
                    <div className="md:col-span-2 lg:col-span-1 space-y-6 text-center lg:text-left">
                        <Link to="/" className="inline-flex items-center gap-3 group justify-center lg:justify-start">
                            <div className="w-12 h-12 rounded-2xl bg-coral-500 flex items-center justify-center shadow-lg shadow-coral-500/20 group-hover:rotate-6 transition-transform duration-300">
                                <Hammer className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                                Hammer<span className="text-coral-500">It</span>
                            </span>
                        </Link>
                        <p className="text-sm md:text-base leading-relaxed max-w-sm mx-auto lg:mx-0 font-medium opacity-80">
                            Najväčšia slovenská sieť certifikovaných remeselníkov. Premeníme vaše vízie na realitu s garanciou kvality a bezpečnej platby.
                        </p>
                        <div className="flex justify-center lg:justify-start gap-4">
                            {[
                                { Icon: Facebook, href: "#", label: "Facebook" },
                                { Icon: Instagram, href: "#", label: "Instagram" },
                                { Icon: Linkedin, href: "#", label: "LinkedIn" }
                            ].map((social, i) => (
                                <a 
                                    key={i} 
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-gray-100 dark:border-white/5 shadow-sm hover:bg-coral-500 hover:text-white dark:hover:bg-coral-500 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <social.Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Services */}
                    <div className="text-center md:text-left">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-8">Služby</h4>
                        <ul className="space-y-4">
                            {["Inštalatéri", "Elektrikári", "Maliari", "Stolári", "Murári"].map((s) => (
                                <li key={s}>
                                    <Link to="/jobs" className="text-sm md:text-base font-semibold hover:text-coral-500 transition-colors flex items-center justify-center md:justify-start gap-2 group">
                                        <div className="w-1 h-1 bg-coral-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {s} prácas
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div className="text-center md:text-left">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-8">Spoločnosť</h4>
                        <ul className="space-y-4">
                            <li><Link to="/about" className="text-sm md:text-base font-semibold hover:text-coral-500 transition-colors">O nás</Link></li>
                            <li><Link to="/how-it-works" className="text-sm md:text-base font-semibold hover:text-coral-500 transition-colors">Centrum pomoci</Link></li>
                            <li><Link to="/contact" className="text-sm md:text-base font-semibold hover:text-coral-500 transition-colors">Kontakt</Link></li>
                            <li>
                                <Link to="/auth/register" className="text-sm md:text-base font-black text-coral-500 flex items-center justify-center md:justify-start gap-2 group">
                                    Pre remeselníkov
                                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Contact & Newsletter */}
                    <div className="text-center md:text-left space-y-8">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-8">Kontakt</h4>
                            <ul className="space-y-5">
                                <li>
                                    <a href="mailto:info@hammerit.sk" className="flex items-center justify-center md:justify-start gap-3 group text-sm md:text-base font-semibold transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-coral-50 dark:bg-coral-500/10 flex items-center justify-center text-coral-500 group-hover:scale-110 transition-transform">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        info@hammerit.sk
                                    </a>
                                </li>
                                <li>
                                    <a href="tel:+421900123456" className="flex items-center justify-center md:justify-start gap-3 group text-sm md:text-base font-semibold transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-coral-50 dark:bg-coral-500/10 flex items-center justify-center text-coral-500 group-hover:scale-110 transition-transform">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        +421 900 123 456
                                    </a>
                                </li>
                                <li className="flex items-center justify-center md:justify-start gap-3 text-sm md:text-base font-semibold">
                                    <div className="w-8 h-8 rounded-lg bg-coral-50 dark:bg-coral-500/10 flex items-center justify-center text-coral-500">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    Slovenská republika
                                </li>
                            </ul>
                        </div>

                        {/* Newsletter Mini Form */}
                        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-3">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">Newsletter</h5>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    placeholder="Váš email" 
                                    className="w-full bg-gray-50 dark:bg-slate-900 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-coral-500 transition-all font-medium"
                                />
                                <button className="absolute right-1 top-1 bottom-1 w-10 bg-coral-500 text-white rounded-lg flex items-center justify-center hover:bg-coral-600 transition-colors">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar: Legal & Copyright */}
                <div className="pt-8 border-t border-gray-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center md:text-left">
                        © 2026 HammerIt s.r.o. <span className="hidden sm:inline mx-2">•</span> <br className="sm:hidden" /> Vyrobené s precíznosťou 🛠️
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                        {[
                            { name: "Podmienky", path: "/terms" },
                            { name: "Súkromie", path: "/privacy" },
                            { name: "Cookies", path: "/cookies" }
                        ].map((link) => (
                            <Link 
                                key={link.path}
                                to={link.path}
                                className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-coral-500 dark:hover:text-coral-400 transition-colors underline-offset-4 hover:underline"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;