import { HTMLAttributes } from 'react';

interface NotificationProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function Notification({
  title,
  children,
  className = '',
  ...props
}: NotificationProps) {
  return (
    <div
      {...props}
      className={`
        relative
        w-full
        max-w-md
        rounded-xl
        p-4

        bg-[#f5efe6]
        text-[#3b2a1a]

        shadow-[0_6px_14px_rgba(0,0,0,0.35)]
        border
        border-[#3b2a1a]/30

        ${className}
      `}
    >
      {title && <h4 className="font-rustic text-sm mb-1">{title}</h4>}
      <div className="text-sm opacity-90">{children}</div>
    </div>
  );
}
