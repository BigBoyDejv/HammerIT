export function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Obchodné podmienky</h1>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm text-gray-700 dark:text-gray-300 space-y-6">
                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1. Všeobecné ustanovenia</h2>
                    <p>
                        Tieto obchodné podmienky upravujú využívanie platformy HammerIt, ktorá slúži ako sprostredkovateľský priestor 
                        medzi osobami hľadajúcimi remeselné práce (zákazníkmi) a osobami ponúkajúcimi tieto práce (remeselníkmi).
                    </p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">2. Sprostredkovateľská povaha služby</h2>
                    <p>
                        Platforma HammerIt nie je účastníkom formálnej zmluvy o diele. Všetky dojednania, cenové ponuky a kvalita prác 
                        sú vyslovene vecou dohody medzi remeselníkom a zákazníkom. Platforma slúži iba ako nástroj na ich vzájomné prepojenie. 
                        HammerIt nezodpovedá za spôsobené škody počas výkonu práce.
                    </p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">3. Pravidlá používania pre remeselníkov</h2>
                    <p>
                        Remeselníci musia vystupovať pod pravdivými informáciami. Zaväzujú sa komunikovať korektne a vykonávať práce 
                        podľa vopred dohodnutých podmienok a za dohodnutú sumu. Závažné sťažnosti klientov môžu viesť k dočasnému zablokovaniu 
                        profilu, prípadne k jeho zrušeniu.
                    </p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">4. Pravidlá používania pre zákazníkov</h2>
                    <p>
                        Zákazníci musia vytvárať presné a overiteľné dopyty. Oponovanie vykonanej práci po jej schválení, ako aj bezdôvodné odopretie 
                        úhrady remeselníkovi je porušením týchto podmienok a môže vyústiť k blokácii zákazníka na platforme.
                    </p>
                </section>
            </div>
        </div>
    );
}
