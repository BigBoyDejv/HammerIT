import { motion } from 'framer-motion';

interface Tab {
  value: string;
  label: string;
  count: number;
}

interface OfferTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function OfferTabs({ tabs, activeTab, onTabChange }: OfferTabsProps) {
  return (
    <div className="w-full mb-8 overflow-x-auto custom-scrollbar">
      <div className="flex gap-2 min-w-max px-1 py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={`relative flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-black transition-all group ${
                isActive 
                ? 'text-white' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 border border-transparent'
              }`}
            >
                {isActive && (
                    <motion.div 
                        layoutId="activeTabBg" 
                        className="absolute inset-0 bg-coral-500 rounded-2xl shadow-lg shadow-coral-500/30 z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                
                <span className="relative z-10 tracking-tight">{tab.label}</span>
                
                <span className={`relative z-10 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-lg text-[10px] font-black tracking-tighter ${
                    isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200'
                }`}>
                    {tab.count}
                </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
