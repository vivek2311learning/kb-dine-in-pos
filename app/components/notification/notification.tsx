import { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

interface NotificationAction {
  label: string;
  onClick: () => void;
}

interface NotificationProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  icon?: ReactNode;
  onClose?: () => void;
  action?: NotificationAction;
}

export function Notification({
  title,
  icon,
  onClose,
  action,
  children,
  className = '',
  ...props
}: NotificationProps) {
  return (
    <div
      role="alert"
      {...props}
      className={`
        relative
        w-[calc(100vw-2rem)]
        sm:w-full
        max-w-md
        rounded-xl
        p-4
        bg-[#f5efe6]
        text-[#3b2a1a]
        shadow-[0_6px_14px_rgba(0,0,0,0.35)]
        border
        border-[#3b2a1a]/30
        flex
        gap-3
        ${className}
      `}
    >
      {icon && <div className="flex-shrink-0 text-lg pt-0.5">{icon}</div>}

      <div className="flex-1 min-w-0">
        {title && <h4 className="font-rustic text-sm mb-1">{title}</h4>}

        <div className="text-sm opacity-90 break-words">{children}</div>

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-3 text-sm font-semibold underline underline-offset-2"
          >
            {action.label}
          </button>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            top-2
            right-2
            text-sm
            opacity-60
            hover:opacity-100
          "
          aria-label="Close notification"
        >
          ✕
        </button>
      )}
    </div>
  );
}
