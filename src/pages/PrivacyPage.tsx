export function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Ochrana súkromia</h1>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm text-gray-700 dark:text-gray-300 space-y-6">
                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1. Zbieranie a ochrana údajov</h2>
                    <p>
                        Zaväzujeme sa chrániť vaše osobné údaje. Zhromažďujeme len tie dáta, ktoré sú nutné
                        pre plynulé fungovanie aplikácie HammerIt (ako email, meno, lokalita či telefónne číslo pre dohodnutie zákazky).
                        Tieto dáta nie sú predávané tretím stranám bez vášho výslovného a vedomeho súhlasu.
                    </p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">2. Komunikácia a práca s geolokáciou</h2>
                    <p>
                        Pre funkciu zobrazenia zákaziek vo vašom blízkom okolí na mape využívame vaše lokálne geolokačné údaje, pokiaľ nám to
                        odoberaním v prehliadači povolíte. Tieto údaje sa uchovávajú pre účel daných úloh. V rámci aplikácie máte kedykoľvek
                        možnosť odobrať tieto práva cez svoj profil alebo cez nastavenia prehliadača.
                    </p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">3. Vaše práva a vymazanie konta</h2>
                    <p>
                        V súlade s GDPR máte všetky štandardné práva: právo prístupu k profilu, právo zmeniť všetky
                        osobné dáta a kedykoľvek požiadať o úplné odstránenie účtu. Postačí kontaktovať správcov systému v sekcii Kontakt.
                    </p>
                </section>
            </div>
        </div>
    );
}
