import { ClipboardList, Users, Wrench, Star } from 'lucide-react';

export function HowItWorksPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Ako funguje HammerIt</h1>
            
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm flex gap-4 items-start">
                    <div className="w-12 h-12 bg-coral-100 dark:bg-coral-900/30 text-coral-500 rounded-xl flex items-center justify-center shrink-0">
                        <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1. Pridajte zákazku</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Zaregistrujte sa a podrobne opíšte, čo potrebujete spraviť. Pridajte kategóriu práce, svoju lokalitu, predstavu o rozpočte a pokojne aj fotky, pre lepšiu predstavu.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm flex gap-4 items-start">
                    <div className="w-12 h-12 bg-coral-100 dark:bg-coral-900/30 text-coral-500 rounded-xl flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">2. Majstri sa vám ozvú</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Miestni overení remeselníci uvidia vašu zákazku a začnú vám posielať cenové ponuky. Systém vás na ne ihneď upozorní.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm flex gap-4 items-start">
                    <div className="w-12 h-12 bg-coral-100 dark:bg-coral-900/30 text-coral-500 rounded-xl flex items-center justify-center shrink-0">
                        <Wrench className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">3. Vyberte a dohodnite sa</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Pozrite si profily majstrov, prečítajte ich hodnotenia od predchádzajúcich klientov a vyberte si. Následne si pomocou chatu dohodnete termín.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm flex gap-4 items-start">
                    <div className="w-12 h-12 bg-coral-100 dark:bg-coral-900/30 text-coral-500 rounded-xl flex items-center justify-center shrink-0">
                        <Star className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">4. Práca a hodnotenie</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Zmluva je uzatvorená a po úspešnom dokončení práce nezabudnite remeselníkovi udeliť recenziu, pomôže to komunite aj jemu samotnému.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
