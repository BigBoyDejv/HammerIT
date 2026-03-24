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
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm
            focus:outline-none focus:ring-2 focus:bg-white
            transition-all duration-200
            ${error
              ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
              : 'border-gray-200 focus:ring-coral-200 focus:border-coral-500'
            }
            ${className}
          `}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1.5 text-xs text-gray-400">{hint}</p>
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