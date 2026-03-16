import { HTMLAttributes, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'wood' | 'outline' | 'ghost';
  asChild?: boolean;
}

export function Badge({
  children,
  className = '',
  variant = 'wood',
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span';

  const variants = {
    wood: `
      bg-[url('/textures/wood.png')]
      bg-cover
      bg-center
      shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-2px_3px_rgba(0,0,0,0.25)]
    `,
    outline: `
      border
      border-[#3b2a1a]
      bg-transparent
    `,
    ghost: `
      bg-[#f5f2ee]
    `,
  };

  return (
    <Comp
      {...props}
      className={`
        inline-flex
        items-center
        justify-center

        px-4
        py-1.5
        rounded-lg

        font-rustic
        text-sm
        tracking-wide
        text-[#3b2a1a]

        ${variants[variant]}

        hover:brightness-110
        hover:-translate-y-0.5
        transition-all
        duration-150

        ${className}
      `}
    >
      {children}
    </Comp>
  );
}
