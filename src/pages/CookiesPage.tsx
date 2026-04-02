import { motion } from 'framer-motion';
import { MousePointer2, Settings, Info, CheckCircle2 } from 'lucide-react';

export function CookiesPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pt-32 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 border-l-4 border-amber-500 pl-6 py-2"
                >
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
                        <MousePointer2 className="w-4 h-4" />
                        <span>Súbory Cookies</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                        Zásady používania <br/>
                        <span className="text-amber-500 font-black">súborov cookies</span>
                    </h1>
                </motion.div>

                {/* Main Content */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="bg-amber-500/5 dark:bg-amber-500/10 rounded-3xl p-8 md:p-12 border border-amber-100 dark:border-amber-500/20 shadow-sm mb-12 flex flex-col md:flex-row gap-8 items-center text-left">
                        <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0">
                            <Info className="w-10 h-10 text-amber-500" />
                        </div>
                        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 font-medium m-0">
                            Na platforme HammerIT používame súbory cookies, aby sme vám zabezpečili najlepší zážitok, analyzovali premávku a personalizovali obsah. Pokračovaním v používaní súhlasíte s ich ukladaním.
                        </p>
                    </div>

                    <div className="space-y-12 prose prose-lg prose-slate dark:prose-invert max-w-none">
                        <section>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <Settings className="w-6 h-6 text-amber-500" /> Čo sú súbory cookies?
                            </h2>
                            <p>Cookies sú malé textové súbory, ktoré sa ukladajú vo vašom zariadení (počítač, tablet, smartfón) pri návšteve webovej stránky. Umožňujú webom zapamätať si informácie o vašej návšteve, napríklad váš jazyk alebo iné preferencie.</p>
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
                            <div className="p-8 bg-gray-50 dark:bg-slate-900/50 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
                                <div className="p-3 bg-amber-500/10 rounded-xl w-fit">
                                    <CheckCircle2 className="w-6 h-6 text-amber-500" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Nevyhnutné cookies</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed m-0">Tieto cookies sú kľúčové pre fungovanie bezpečnosti, prihlásenie a ukladanie vašich ponuky na Platforme. Bez nich nie je možné služby HammerIT plnohodnotne využívať.</p>
                            </div>
                            <div className="p-8 bg-gray-50 dark:bg-slate-900/50 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl w-fit">
                                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Analytické cookies</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed m-0">Pomáhajú nám pochopiť, ako návštevníci používajú našu Platformu (napr. cez Google Analytics), čo nám umožňuje neustále zlepšovať jej rýchlosť a funkcie.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Ako spravovať cookies?</h2>
                            <p>Väčšina prehliadačov umožňuje spravovať alebo úplne vypnúť cookies v ich nastaveniach. Ak sa rozhodnete cookies zakázať, niektoré časti Platformy nemusia fungovať správne (napríklad automatické prihlásenie alebo ukladanie dopytov vo formulári).</p>
                        </section>
                        
                        <div className="mt-16 flex flex-col md:flex-row md:justify-between items-center gap-6 pt-12 border-t border-gray-100 dark:border-white/5">
                            <p className="text-gray-400 text-sm italic m-0 underline decoration-amber-500/30">
                                HammerIT s.r.o. | info@hammerit.sk | Bratislava, 2026
                            </p>
                            <button 
                                onClick={() => window.history.back()}
                                className="text-amber-500 hover:text-amber-600 font-black uppercase tracking-widest text-xs transition-colors"
                            >
                                Späť na platformu
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
