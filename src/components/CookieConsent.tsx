import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X } from 'lucide-react';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-[400px] z-[100]"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="bg-coral-50 dark:bg-coral-900/20 p-2 rounded-xl">
                <Shield className="w-6 h-6 text-coral-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">Ochrana súkromia</h3>
                  <button onClick={() => setShow(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  Používame súbory cookie, aby sme vám poskytli čo najlepší zážitok na našej platforme HammerIt. Pokračovaním súhlasíte s ich používaním.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleAccept}
                    className="flex-1 bg-coral-500 hover:bg-coral-600 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-coral-500/20 active:scale-95"
                  >
                    Rozumiem
                  </button>
                  <button
                    onClick={() => setShow(false)}
                    className="px-4 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Viac info
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
