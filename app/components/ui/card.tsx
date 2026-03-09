import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`
        relative
        rounded-xl
        p-5

        bg-[url('/textures/wood.png')]
        bg-cover bg-center

        text-[#3b2a1a]

        shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-3px_5px_rgba(0,0,0,0.35),0_6px_10px_rgba(0,0,0,0.4)]

        transition-transform
        duration-200
        hover:-translate-y-1

        ${className}
      `}
    >
      {children}
    </div>
  );
}
