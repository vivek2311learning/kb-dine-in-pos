'use client';

import { createContext, useContext, useRef, useState } from 'react';
import { Notification } from './notification';
import { NotificationSuccess } from './notification-success';
import { NotificationError } from './notification-error';
import { NotificationWarning } from './notification-warning';
import { NotificationInfo } from './notification-info';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationState {
  type: NotificationType;
  title?: string;
  message: string;
}

interface NotificationContextType {
  show: (type: NotificationType, message: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notification, setNotification] = useState<NotificationState | null>(
    null,
  );

  // ✅ FIX: store timeout reference
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const show = (type: NotificationType, message: string, title?: string) => {
    // ❌ clear old timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setNotification({ type, message, title });

    // ✅ new timeout
    timeoutRef.current = setTimeout(() => {
      setNotification(null);
      timeoutRef.current = null;
    }, 5000); // 👈 now this ACTUALLY works
  };

  const renderNotification = () => {
    if (!notification) return null;

    const props = {
      title: notification.title,
      children: notification.message,
    };

    switch (notification.type) {
      case 'success':
        return <NotificationSuccess {...props} />;
      case 'error':
        return <NotificationError {...props} />;
      case 'warning':
        return <NotificationWarning {...props} />;
      case 'info':
        return <NotificationInfo {...props} />;
      default:
        return <Notification {...props}>{notification.message}</Notification>;
    }
  };

  return (
    <NotificationContext.Provider value={{ show }}>
      {children}

      {notification && (
        <div className="fixed top-6 right-6 z-50">{renderNotification()}</div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification must be used inside NotificationProvider');
  }
  return ctx;
}
