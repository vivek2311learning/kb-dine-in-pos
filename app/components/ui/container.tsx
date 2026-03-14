import { HTMLAttributes, ReactNode, ElementType } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: ElementType;
}

export function Container({
  children,
  className = '',
  as: Component = 'div',
  ...props
}: ContainerProps) {
  return (
    <Component
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
    </Component>
  );
}