import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block font-rustic text-sm text-[#3b2a1a]">
            {label}
          </label>
        )}

        <input
          ref={ref}
          {...props}
          className={`
            w-full
            px-4 py-2
            rounded-lg

            bg-[#f5efe6]
            text-[#3b2a1a]
            placeholder:text-[#3b2a1a]/50

            border
            border-[#3b2a1a]/30
            focus:border-[#3b2a1a]
            focus:outline-none

            shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]

            transition-colors
            duration-150

            ${className}
          `}
        />

        {error && <p className="text-xs text-red-700 font-medium">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
