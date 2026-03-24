import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const variants = {
    primary: 'bg-gradient-to-r from-coral-500 to-coral-600 text-white hover:shadow-lg hover:scale-105',
    secondary: 'bg-navy-500 text-white hover:bg-navy-600 hover:shadow-md',
    outline: 'border-2 border-coral-500 text-coral-600 hover:bg-coral-500 hover:text-white',
    ghost: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-md',
  };

  // coral glow on primary
  const shadow = variant === 'primary' ? 'shadow-[0_4px_14px_rgba(255,77,26,0.3)]' : '';

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${shadow} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}