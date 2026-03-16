import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  asChild?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  className = '',
  asChild = false,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  const variants = {
    primary: "bg-[url('/textures/wood.png')] bg-cover bg-center",
    outline: 'border border-[#3b2a1a] bg-transparent',
    ghost: 'bg-transparent',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <Comp
      {...props}
      className={`
        relative
        rounded-xl
        font-rustic
        tracking-wide
        text-[#3b2a1a]

        ${variants[variant]}
        ${sizes[size]}

        shadow-[inset_0_2px_3px_rgba(255,255,255,0.35),inset_0_-3px_4px_rgba(0,0,0,0.25),0_4px_6px_rgba(0,0,0,0.35)]
        hover:brightness-110
        hover:-translate-y-1
        active:translate-y-px
        transition-all
        duration-150

        disabled:opacity-50
        disabled:pointer-events-none

        ${className}
      `}
    >
      {children}
    </Comp>
  );
}
