import { HTMLAttributes } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {}

export function Container({
  children,
  className = '',
  ...props
}: ContainerProps) {
  return (
    <div
      {...props}
      className={`
        mx-auto
        w-full
        max-w-7xl
        px-4
        md:px-6
        lg:px-8

        ${className}
      `}
    >
      {children}
    </div>
  );
}
