import { motion } from 'framer-motion';
import { Scale, ChevronRight } from 'lucide-react';

export function TermsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pt-32 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 border-l-4 border-coral-500 pl-6 py-2"
                >
                    <div className="flex items-center gap-2 text-coral-500 text-xs font-bold uppercase tracking-widest mb-3">
                        <Scale className="w-4 h-4" />
                        <span>Právna sekcia Platformy</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                        Všeobecné obchodné <br/>
                        <span className="text-coral-500 font-black">podmienky</span>
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" /> Platnosť: 1. apríla 2026</span>
                        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" /> Verzia: 1.0</span>
                    </div>
                </motion.div>

                {/* Main Content */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="prose prose-lg prose-slate dark:prose-invert max-w-none"
                >
                    <div className="bg-gray-50 dark:bg-slate-900/50 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-white/5 shadow-sm mb-12">
                        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 font-medium first-letter:text-5xl first-letter:font-black first-letter:text-coral-500 first-letter:mr-3 first-letter:float-left">
                            Tieto Všeobecné obchodné podmienky (VOP) upravujú práva a povinnosti všetkých strán pri využívaní online platformy <strong>HammerIT</strong>. Pred registráciou a používaním Platformy si tieto VOP pozorne prečítajte. Registráciou potvrdzujete, že ste si tieto podmienky prečítali, porozumeli ste im a súhlasíte s nimi.
                        </p>
                    </div>

                    <section className="space-y-8">
                        <div className="group">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <span className="text-coral-500">01</span> Článok 1 – Úvodné ustanovenia a definície
                            </h2>
                            <ul className="list-none pl-0 space-y-4">
                                <li className="flex gap-4">
                                    <ChevronRight className="w-5 h-5 text-coral-500 shrink-0 mt-1" />
                                    <span><strong>Prevádzkovateľ</strong> – HammerIT s.r.o., technický sprostredkovateľ medzi Klientmi a Remeselníkmi.</span>
                                </li>
                                <li className="flex gap-4">
                                    <ChevronRight className="w-5 h-5 text-coral-500 shrink-0 mt-1" />
                                    <span><strong>Klient</strong> – Osoba zverejňujúca dopyt na vykonanie remeselných prác.</span>
                                </li>
                                <li className="flex gap-4">
                                    <ChevronRight className="w-5 h-5 text-coral-500 shrink-0 mt-1" />
                                    <span><strong>Remeselník</strong> – Odborník zasielajúci cenové ponuky.</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <span className="text-coral-500">02</span> Článok 2 – Postavenie Prevádzkovateľa
                            </h2>
                            <p>Prevádzkovateľ vystupuje výlučne ako technický sprostredkovateľ. Platforma nie je stranou Zmluvy o dielo, nie je zamestnávateľom Remeselníkov ani dodávateľom prác.</p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <span className="text-coral-500">03</span> Článok 3 – Registrácia a účet
                            </h2>
                            <p>Registrovať sa môže osoba staršia ako 18 rokov. Ste povinný uviesť pravdivé údaje a chrániť svoje heslo. Jeden používateľ = jeden aktívny účet.</p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <span className="text-coral-500">04</span> Článok 4 – Dopyty a Ponuky
                            </h2>
                            <p>Klient zverejňuje Dopyt s lokalitou a popisom. Remeselník zasiela Ponuku cez správu v rámci Platformy. Dohoda prebieha priamo medzi vami.</p>
                        </div>

                        <div className="bg-coral-500/5 border-l-4 border-coral-500 p-6 rounded-r-2xl my-8">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-0 mb-4 tracking-tight uppercase text-sm">
                                Dôležité: Článok 5 – Overenie Identity
                            </h2>
                            <p className="m-0 text-gray-700 dark:text-gray-300">Remeselník je povinný absolvovať overenie identity (kópia dokladu). Bez overenia nie je možné zasielať ponuky.</p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <span className="text-coral-500">06</span> Článok 6 – Platby a poplatky
                            </h2>
                            <p>Aktuálne je Platforma <strong>bezplatná</strong>. Platby za prácu si riešite priamo medzi sebou mimo Platformy.</p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <span className="text-coral-500">07</span> Článok 7 – Hodnotenia
                            </h2>
                            <p>Recenzie musia byť pravdivé a založené na skutočnej skúsenosti. Hanlivé výrazy a falošné recenzie sú zakázané.</p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <span className="text-coral-500">09</span> Článok 9 – Zrušenie účtu
                            </h2>
                            <p>Prevádzkovateľ môže zrušiť účet pri porušení VOP, podvodnom konaní alebo poškodzovaní mena Platformy.</p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <span className="text-coral-500">11</span> Článok 11 – Zodpovednosť
                            </h2>
                            <p>Platforma je poskytovaná "tak, ako je". Zodpovednosť za výpadky systému alebo kybernetické útoky je vylúčená v najširšom rozsahu.</p>
                        </div>

                        <div className="pt-12 border-t border-gray-100 dark:border-white/5">
                            <p className="text-gray-400 text-sm italic">
                                HammerIT s.r.o. | Bratislava, 1. apríla 2026 | info@hammerit.sk
                            </p>
                        </div>
                    </section>
                </motion.div>
                
                <div className="mt-16 flex justify-center">
                    <button 
                        onClick={() => window.history.back()}
                        className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 px-8 py-3 rounded-2xl font-black hover:bg-coral-500 hover:text-white transition-all uppercase tracking-widest text-xs"
                    >
                        Späť na platformu
                    </button>
                </div>
            </div>
        </div>
    );
}
