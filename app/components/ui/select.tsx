'use client';

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export function Select({ children, className = '', ...props }: SelectProps) {
  return (
    <div className="relative w-full">
      <select
        {...props}
        className={`
          appearance-none
          w-full
          px-4 py-2
          rounded-xl
          bg-[#e8dccb]
          border border-[#c8b79e]
          text-[#3b2a1a]
          shadow-sm
          focus:outline-none
          focus:ring-2
          focus:ring-[#8b5e3c]
          transition
          ${className}
        `}
      >
        {children}
      </select>

      {/* Custom Arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#3b2a1a]">
        ▼
      </div>
    </div>
  );
}
