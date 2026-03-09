import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`
        relative
        px-8 py-3
        rounded-xl
        font-rustic
        tracking-wide
        text-[#3b2a1a]

        bg-[url('/textures/wood.png')]
        bg-cover bg-center

        shadow-[inset_0_2px_3px_rgba(255,255,255,0.35),inset_0_-3px_4px_rgba(0,0,0,0.25),0_4px_6px_rgba(0,0,0,0.35)]
        [text-shadow:0_1px_0_rgba(255,255,255,0.3)]

        hover:brightness-110
        active:translate-y-px
        transition-all
        duration-150

        ${className}
      `}
    >
      {children}
    </button>
  );
}
