import { Notification } from './notification';
import { HTMLAttributes } from 'react';

interface NotificationInfoProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function NotificationInfo({
  title = 'Info',
  children,
  className = '',
  ...props
}: NotificationInfoProps) {
  return (
    <Notification
      title={title}
      icon="ℹ️"
      className={`
        border-blue-700/40
        bg-blue-200
        text-blue-900
        ${className}
      `}
      {...props}
    >
      {children}
    </Notification>
  );
}