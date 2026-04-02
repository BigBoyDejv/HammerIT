import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, UserCheck, Trash2, FileText } from 'lucide-react';

export function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pt-32 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 border-l-4 border-emerald-500 pl-6 py-2"
                >
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
                        <Lock className="w-4 h-4" />
                        <span>Súkromie a Bezpečnosť</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                        Ochrana osobných <br/>
                        <span className="text-emerald-500 font-black">údajov (GDPR)</span>
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" /> Posledná aktualizácia: 1. apríla 2026</span>
                    </div>
                </motion.div>

                {/* Main Content */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="prose prose-lg prose-slate dark:prose-invert max-w-none"
                >
                    <div className="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-3xl p-8 md:p-12 border border-emerald-100 dark:border-emerald-500/20 shadow-sm mb-12">
                        <h2 className="text-emerald-600 dark:text-emerald-400 mt-0 mb-4 text-xl font-black uppercase tracking-widest">Identita prevádzkovateľa</h2>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                            <p className="font-bold text-gray-900 dark:text-white m-0 uppercase">HammerIT s.r.o.</p>
                            <p className="m-0">Sídlo: Bratislava, Slovenská republika</p>
                            <p className="m-0">IČO: [Doplniť]</p>
                            <p className="m-0 flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-500" /> gdpr@hammerit.sk</p>
                        </div>
                    </div>

                    <section className="space-y-12">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <span className="text-emerald-500">15</span> Aké osobné údaje spracúvame
                            </h2>
                            <div className="grid md:grid-cols-2 gap-8 mt-6">
                                <div className="p-6 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <h3 className="mt-0 text-emerald-500 text-sm font-black uppercase mb-4 tracking-widest">Pre Klientov</h3>
                                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                        <li>Meno, E-mail, Telefónne číslo</li>
                                        <li>Lokalita (GPS alebo mesto)</li>
                                        <li>Obsah dopytov a fotografie</li>
                                    </ul>
                                </div>
                                <div className="p-6 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <h3 className="mt-0 text-emerald-500 text-sm font-black uppercase mb-4 tracking-widest">Pre Remeselníkov</h3>
                                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                        <li>Profesijná biografia a portfólio</li>
                                        <li>Kópia dokladu identity (na overenie)</li>
                                        <li>Lokalita a recenzie</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <span className="text-emerald-500">16</span> Účely a právne základy
                            </h2>
                            <p>Vaše údaje spracúvame na plnenie zmluvy (spájanie s odborníkmi), overenie identity z dôvodu bezpečnosti a zasielanie notifikácií o nových zákazkách.</p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <span className="text-emerald-500">17</span> Príjemcovia údajov
                            </h2>
                            <p>Dáta sú uložené v cloudovej databáze <strong>Supabase</strong> (EU servery). Niektoré platby môžu ísť cez bránu Stripe. Údaje neuvádzame tretím stranám na marketingové účely.</p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <span className="text-emerald-500">19</span> Doba uchovávania
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                    <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                                    <span className="text-sm">Doklady identity remeselníkov: <strong>30 dní</strong> od úspešného overenia.</span>
                                </div>
                                <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                    <Trash2 className="w-8 h-8 text-emerald-500 shrink-0" />
                                    <span className="text-sm">Správy medzi používateľmi: <strong>2 roky</strong> od poslednej aktivity.</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-500 p-8 md:p-12 rounded-[2.5rem] text-white">
                            <h2 className="text-2xl md:text-3xl font-black mt-0 mb-6 text-white tracking-tight">
                                Článok 20 – Vaše práva
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs font-bold uppercase tracking-widest text-emerald-100">
                                <div className="space-y-2">
                                    <UserCheck className="w-5 h-5" />
                                    <p>Právo na prístup</p>
                                </div>
                                <div className="space-y-2">
                                    <FileText className="w-5 h-5" />
                                    <p>Právo na opravu</p>
                                </div>
                                <div className="space-y-2">
                                    <Trash2 className="w-5 h-5" />
                                    <p>Právo na vymazanie</p>
                                </div>
                            </div>
                            <p className="mt-8 text-emerald-100/80 mb-0 font-medium leading-relaxed">
                                Svoje práva môžete uplatniť kedykoľvek e-mailom na <strong>gdpr@hammerit.sk</strong>. Na žiadosť odpovieme do 30 dní.
                            </p>
                        </div>
                        
                        <div className="pt-12 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:justify-between items-center gap-6">
                            <p className="text-gray-400 text-sm italic m-0">
                                HammerIT s.r.o. | gdpr@hammerit.sk | Bratislava, Slovenská republika
                            </p>
                            <button 
                                onClick={() => window.history.back()}
                                className="text-emerald-500 hover:text-emerald-600 font-black uppercase tracking-widest text-xs transition-colors"
                            >
                                Späť
                            </button>
                        </div>
                    </section>
                </motion.div>
            </div>
        </div>
    );
}
