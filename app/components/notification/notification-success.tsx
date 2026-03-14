import { Notification } from './notification';
import { HTMLAttributes } from 'react';

interface NotificationSuccessProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function NotificationSuccess({
  title = 'Success',
  children,
  className = '',
  ...props
}: NotificationSuccessProps) {
  return (
    <Notification
      title={title}
      icon="✅"
      className={`
        border-green-700/40
        bg-green-200
        text-green-900
        ${className}
      `}
      {...props}
    >
      {children}
    </Notification>
  );
}