import { useState } from 'react';
import { 
  ClipboardList, Users, Wrench, Star, 
  ChevronDown, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group transition-all"
      >
        <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-coral-500 transition-colors">
          {question}
        </span>
        <div className={`p-2 rounded-xl bg-gray-50 dark:bg-gray-800 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-coral-50 dark:bg-coral-900/20 text-coral-500' : 'text-gray-400'}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HowItWorksPage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pb-32 animate-fade-in">
      {/* ── HERO ── */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
          Ako funguje <span className="gradient-text">HammerIt</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
          Jednoduchá a bezpečná cesta k nájdeniu najlepších remeselníkov na Slovensku.
        </p>
      </div>

      {/* ── STEPS ── */}
      <div className="grid md:grid-cols-4 gap-8 mb-32">
        {[
          { 
            icon: ClipboardList, 
            step: '1', 
            title: 'Zadajte dopyt', 
            desc: 'Opíšte prácu, ktorú potrebujete. Pridajte fotky a odhadovaný rozpočet.',
            color: 'text-coral-500',
            bg: 'bg-coral-50 dark:bg-coral-950/30'
          },
          { 
            icon: Users, 
            step: '2', 
            title: 'Majstri sa ozvú', 
            desc: 'Overení remeselníci vám začnú posielať cenové ponuky na mieru.',
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-950/30'
          },
          { 
            icon: Wrench, 
            step: '3', 
            title: 'Vyberte si', 
            desc: 'Pozrite si profily, recenzie a vyberte si toho najlepšieho odborníka.',
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-950/30'
          },
          { 
            icon: Star, 
            step: '4', 
            title: 'Hotovo', 
            desc: 'Po dokončení práce remeselníka ohodnoťte a pomôžte tak ostatným.',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-950/30'
          }
        ].map((item, idx) => (
          <div key={idx} className="relative group p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl shadow-navy-900/5 transition-all hover:scale-105">
            <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6`}>
              <item.icon className="w-7 h-7" />
            </div>
            <div className="absolute top-8 right-8 text-4xl font-black opacity-5 text-gray-900 dark:text-white">{item.step}</div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">{item.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* ── FAQ ── */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <HelpCircle className="w-8 h-8 text-coral-500" />
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Často kladené otázky</h2>
        </div>

        <div className="space-y-16">
          {/* Pre Klientov */}
          <section>
            <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5 text-navy-600 dark:text-navy-400" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Pre Klientov</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] px-8 py-4 border border-gray-100 dark:border-white/5 shadow-lg">
              <FAQItem 
                question="Je pridanie zákazky bezplatné?" 
                answer="Áno, pridanie dopytu na platformu HammerIt je pre klientov úplne bezplatné. Zaplatíte až priamo vybranému remeselníkovi za jeho reálne vykonanú prácu." 
              />
              <FAQItem 
                question="Ako si mám vybrať najlepšieho remeselníka?" 
                answer="Odporúčame pozrieť si profil remeselníka, jeho doterajšie hodnotenia od iných klientov a taktiež portfólio jeho predošlých prác. Na HammerIt vidíte len reálne a overené recenzie." 
              />
              <FAQItem 
                question="Ako prebieha platba za prácu?" 
                answer="Platba prebieha podľa dohody medzi vami a remeselníkom. Odporúčame však využívať zmluvy v našom systéme a platiť za prácu až po jej riadnom dokončení a vašej spokojnosti." 
              />
              <FAQItem 
                question="Čo ak nie som s výslednou prácou spokojný?" 
                answer="V prípade sporov vám odporúčame najskôr komunikovať priamo s remeselníkom. Ak sa neviete dohodnúť, môžete kontaktovať našu podporu a my sa pokúsime pomôcť pri mediácii problému na základe histórie vašej komunikácie v rámci platformy." 
              />
            </div>
          </section>

          {/* Pre Remeselníkov */}
          <section>
            <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                <Wrench className="w-5 h-5 text-coral-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Pre Remeselníkov</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] px-8 py-4 border border-gray-100 dark:border-white/5 shadow-lg">
              <FAQItem 
                question="Musím platiť poplatky zo svojich zákaziek?" 
                answer="HammerIt momentálne funguje bez provízií z vašich zákaziek. V budúcnosti plánujeme zaviesť prémiové funkcie a predplatné pre profesionálov, ktorí chcú u nás prioritné zviditeľnenie." 
              />
              <FAQItem 
                question="Čo musím urobiť, aby som sa stal overeným majstrom?" 
                answer="Po registrácii si môžete v nastaveniach profilu požiadať o overenie identity. Nahrajte potrebné doklady a po ich kontrole naším tímom dostanete badge 'Overený', ktorý zvyšuje dôveru klientov o viac ako 70 %." 
              />
              <FAQItem 
                question="Kde nájdem nové zákazky vo svojom okolí?" 
                answer="Stačí ísť do sekcie 'Zákazky' a zapnúť zobrazenie mapy. V profile si taktiež môžete nastaviť SMS alebo emailové upozornenia na nové dopyty vo vami zvolených lokalitách." 
              />
              <FAQItem 
                question="Môžem odmietnuť zákazku, o ktorú už nemám záujem?" 
                answer="Samozrejme. Kým neprijmete ponuku ako finálnu zmluvu, komunikácia je nezáväzná. Odporúčame však korektne odmietnuť, aby si klient mohol rýchlejšie nájsť iného majstra." 
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
