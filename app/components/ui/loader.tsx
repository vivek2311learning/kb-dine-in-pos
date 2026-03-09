import { HTMLAttributes } from 'react';

interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};

export function Loader({ size = 'md', className = '', ...props }: LoaderProps) {
  return (
    <div
      {...props}
      className={`
        ${sizeMap[size]}
        rounded-full
        border-2
        border-[#3b2a1a]/30
        border-t-[#3b2a1a]
        animate-spin

        ${className}
      `}
    />
  );
}
