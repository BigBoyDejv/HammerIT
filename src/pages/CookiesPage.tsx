export function CookiesPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Zásady používania súborov cookies</h1>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm text-gray-700 dark:text-gray-300 space-y-6">
                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Čo sú to cookies?</h2>
                    <p>
                        Súbory cookies sú malé textové súbory, ktoré sa do vášho počítača alebo mobilného zariadenia ukladajú pri návšteve našej platformy. 
                        Pomáhajú našej webstránke zapamätať si vaše akcie a preferencie počas určitého obdobia.
                    </p>    
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ako cookies využívame?</h2>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li><strong>Nevyhnutné cookies:</strong> Pre bezpečné prihlásenie a spravovanie vašej relácie (session), aby ste sa nemuseli prihlasovať zakaždým, keď prejdete na inú podstránku.</li>
                        <li><strong>Funkčné cookies:</strong> Ukladanie vybraných nastavení (napr. vizuálna téma aplikácie - svetlý/tmavý režim).</li>
                        <li><strong>Analytické cookies:</strong> Pre sledovanie návštevnosti platformy s cieľom zlepšovať jej používateľskú skúsenosť a funkčnosť (údaje sú plne anonymizované).</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Správa vašich cookies</h2>
                    <p>
                        Svoj súhlas alebo nesúhlas so zaradením cookies môžete spravovať v nastaveniach vášho prehliadača. 
                        Upozorňujeme však, že zablokovanie nevyhnutných cookies môže spôsobiť nefunkčnosť prihlasovania a dôležitých funkcií u nás na HammerIt.
                    </p>
                </section>
            </div>
        </div>
    );
}
