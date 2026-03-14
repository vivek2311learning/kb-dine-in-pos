import { Notification } from './notification';
import { HTMLAttributes } from 'react';

interface NotificationWarningProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function NotificationWarning({
  title = 'Warning',
  children,
  className = '',
  ...props
}: NotificationWarningProps) {
  return (
    <Notification
      title={title}
      icon="⚠️"
      className={`
        border-yellow-700/40
        bg-yellow-200
        text-yellow-900
        ${className}
      `}
      {...props}
    >
      {children}
    </Notification>
  );
}
