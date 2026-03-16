'use client';

import React, { useId } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  label?: string;
  error?: string;
}

export function Select({
  children,
  label,
  error,
  className = '',
  id,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block font-rustic text-sm text-[#3b2a1a]"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          {...props}
          className={`
            appearance-none
            w-full
            px-4 py-2
            rounded-xl

            bg-[#e8dccb]
            border
            ${error ? 'border-red-600' : 'border-[#c8b79e]'}

            text-[#3b2a1a]

            shadow-sm
            focus:outline-none
            focus:ring-2
            focus:ring-[#8b5e3c]

            disabled:opacity-60
            disabled:cursor-not-allowed

            transition
            ${className}
          `}
        >
          {children}
        </select>

        {/* Arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#3b2a1a]">
          ▼
        </div>
      </div>

      {error && <p className="text-xs text-red-700 font-medium">{error}</p>}
    </div>
  );
}
