import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 pl-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm
            text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-gray-750
            transition-all duration-200
            ${error
              ? 'border-red-400 focus:ring-red-200 dark:focus:ring-red-900/30 focus:border-red-400'
              : 'border-gray-200 dark:border-gray-700 focus:ring-coral-200 dark:focus:ring-coral-900/30 focus:border-coral-500 dark:focus:border-coral-500'
            }
            ${className}
          `}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500 pl-1">{hint}</p>
        )}
        {error && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';