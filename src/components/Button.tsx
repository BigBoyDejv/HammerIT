import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = [
    'inline-flex items-center justify-center gap-2',
    'font-semibold rounded-xl',
    'transition-all duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  ].join(' ');

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const variants = {
    primary: [
      'bg-gradient-to-r from-coral-500 to-coral-600 text-white',
      'hover:shadow-lg hover:scale-105',
      'shadow-[0_4px_14px_rgba(255,77,26,0.3)]',
      'focus-visible:ring-coral-500',
    ].join(' '),

    secondary: [
      'bg-navy-500 text-white',
      'hover:bg-navy-600 hover:shadow-md hover:scale-105',
      'focus-visible:ring-navy-500',
    ].join(' '),

    outline: [
      'border-2 border-coral-500 text-coral-600 bg-transparent',
      'hover:bg-coral-500 hover:text-white hover:scale-105',
      'focus-visible:ring-coral-500',
    ].join(' '),

    ghost: [
      'bg-transparent text-gray-600',
      'hover:bg-gray-100 hover:text-gray-900',
      'focus-visible:ring-gray-400',
    ].join(' '),

    danger: [
      'bg-red-500 text-white',
      'hover:bg-red-600 hover:shadow-md hover:scale-105',
      'focus-visible:ring-red-500',
    ].join(' '),

    success: [
      'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
      'hover:shadow-lg hover:scale-105',
      'shadow-[0_4px_14px_rgba(16,185,129,0.25)]',
      'focus-visible:ring-emerald-500',
    ].join(' '),
  };

  return (
    <button
      disabled={disabled || loading}
      className={[
        base,
        sizes[size],
        variants[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {loading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin shrink-0`} />
      ) : leftIcon ? (
        <span className={`${iconSizes[size]} shrink-0 flex items-center`}>{leftIcon}</span>
      ) : null}

      <span>{children}</span>

      {!loading && rightIcon && (
        <span className={`${iconSizes[size]} shrink-0 flex items-center`}>{rightIcon}</span>
      )}
    </button>
  );
}