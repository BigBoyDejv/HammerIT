import { Mail, MapPin, Phone } from 'lucide-react';

export function ContactPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Kontaktujte nás</h1>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sme tu pre vás</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Máte akékoľvek otázky týkajúce sa platformy, potvrdzovania zákaziek alebo vylepšení? Neváhajte sa nám kedykoľvek ozvať, náš tím vám rad odpovie na všetko podstatné.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <div className="w-10 h-10 bg-coral-50 dark:bg-coral-900/30 rounded-lg flex items-center justify-center text-coral-500">
                                <Mail className="w-5 h-5" />
                            </div>
                            <span className="font-semibold">info@hammerit.sk</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <div className="w-10 h-10 bg-coral-50 dark:bg-coral-900/30 rounded-lg flex items-center justify-center text-coral-500">
                                <Phone className="w-5 h-5" />
                            </div>
                            <span className="font-semibold">+421 900 123 456</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <div className="w-10 h-10 bg-coral-50 dark:bg-coral-900/30 rounded-lg flex items-center justify-center text-coral-500">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <span className="font-semibold">Hlavná 1, 811 01 Bratislava</span>
                        </li>
                    </ul>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 bg-gradient-to-tr from-coral-500 to-coral-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                       HIT
                   </div>
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">HammerIt s.r.o.</h3>
                   <p className="text-gray-500 dark:text-gray-400 mb-1">IČO: 12 345 678</p>
                   <p className="text-gray-500 dark:text-gray-400">Zapísaná v Obchodnom registri Slovenskej republiky</p>
                </div>
            </div>
        </div>
    );
}
