import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function Badge({ children, className = '', ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={`
        inline-flex
        items-center
        justify-center

        px-4 py-1.5
        rounded-lg

        font-rustic
        text-sm
        tracking-wide
        text-[#3b2a1a]

        bg-[url('/textures/wood.png')]
        bg-cover
        bg-center

        shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-2px_3px_rgba(0,0,0,0.25)]

        hover:brightness-110
        hover:-translate-y-1
        transition-all
        duration-150

        ${className}
      `}
    >
      {children}
    </span>
  );
}
