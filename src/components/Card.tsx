import { ReactNode } from 'react';

type CardVariant = 'default' | 'glass' | 'coral' | 'navy' | 'emerald' | 'amber' | 'dark';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  variant?: CardVariant;
  accent?: 'coral' | 'navy' | 'emerald' | 'amber' | 'violet';
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-gray-100 shadow-sm',
  glass: 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl',
  coral: 'bg-gradient-to-br from-coral-50 to-coral-100 border border-coral-200/60',
  navy: 'bg-gradient-to-br from-navy-50 to-navy-100 border border-navy-200/60',
  emerald: 'bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60',
  amber: 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60',
  dark: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/60 text-white',
};

const accentStyles = {
  coral: 'border-l-4 border-l-coral-500',
  navy: 'border-l-4 border-l-navy-600',
  emerald: 'border-l-4 border-l-emerald-500',
  amber: 'border-l-4 border-l-amber-400',
  violet: 'border-l-4 border-l-violet-500',
};

export function Card({
  children,
  className = '',
  hoverable = false,
  variant = 'default',
  accent,
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl p-6
        ${variantStyles[variant]}
        ${accent ? accentStyles[accent] : ''}
        ${hoverable ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}