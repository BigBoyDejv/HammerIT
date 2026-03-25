// src/components/Footer.tsx
import { Link } from 'react-router-dom';
import { Wrench, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#191970] text-white mt-auto">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-coral-500 flex items-center justify-center">
                                <Wrench className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-heading text-xl font-bold">
                                Hammer<span className="text-coral-500">It</span>
                            </span>
                        </Link>
                        <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                            Spájame domácnosti so skúsenými remeselníkmi. Rýchlo, spoľahlivo a transparentne.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-coral-500 transition-colors">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-coral-500 transition-colors">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-coral-500 transition-colors">
                                <Twitter className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Služby */}
                    <div>
                        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/50">Služby</h4>
                        <ul className="space-y-3">
                            {["Inštalatérske práce", "Elektrikárske práce", "Maliarske práce", "Stolárske práce", "Murárske práce"].map((s) => (
                                <li key={s}>
                                    <Link to="/jobs" className="text-sm text-white/60 hover:text-coral-500 transition-colors">{s}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Spoločnosť */}
                    <div>
                        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/50">Spoločnosť</h4>
                        <ul className="space-y-3">
                            {["O nás", "Ako to funguje", "Pre remeselníkov", "Cenník", "Blog", "Kariéra"].map((s) => (
                                <li key={s}>
                                    <Link to="#" className="text-sm text-white/60 hover:text-coral-500 transition-colors">{s}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Kontakt */}
                    <div>
                        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/50">Kontakt</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm text-white/60">
                                <Mail className="w-4 h-4 text-coral-500 flex-shrink-0" />
                                info@hammerit.sk
                            </li>
                            <li className="flex items-center gap-3 text-sm text-white/60">
                                <Phone className="w-4 h-4 text-coral-500 flex-shrink-0" />
                                +421 900 123 456
                            </li>
                            <li className="flex items-start gap-3 text-sm text-white/60">
                                <MapPin className="w-4 h-4 text-coral-500 flex-shrink-0 mt-0.5" />
                                Hlavná 1, 811 01 Bratislava
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-white/40">
                        © 2024 HammerIt. Všetky práva vyhradené.
                    </p>
                    <div className="flex gap-6">
                        <Link to="#" className="text-xs text-white/40 hover:text-coral-500 transition-colors">Obchodné podmienky</Link>
                        <Link to="#" className="text-xs text-white/40 hover:text-coral-500 transition-colors">Ochrana súkromia</Link>
                        <Link to="#" className="text-xs text-white/40 hover:text-coral-500 transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;