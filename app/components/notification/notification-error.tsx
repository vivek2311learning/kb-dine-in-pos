import { Notification } from './notification';
import { HTMLAttributes } from 'react';

interface NotificationErrorProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function NotificationError({
  title = 'Error',
  children,
  className = '',
  ...props
}: NotificationErrorProps) {
  return (
    <Notification
      title={title}
      icon="❌"
      className={`
        border-red-700/40
        bg-red-200
        text-red-900
        ${className}
      `}
      {...props}
    >
      {children}
    </Notification>
  );
}
