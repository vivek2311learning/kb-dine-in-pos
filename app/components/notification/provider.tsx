'use client';

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from 'react';

import { Notification } from './notification';
import { NotificationSuccess } from './notification-success';
import { NotificationError } from './notification-error';
import { NotificationWarning } from './notification-warning';
import { NotificationInfo } from './notification-info';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationState {
  id: number;
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
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const idRef = useRef(0);

  const remove = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const show = useCallback(
    (type: NotificationType, message: string, title?: string) => {
      const id = ++idRef.current;

      setNotifications((prev) => [
        ...prev,
        {
          id,
          type,
          message,
          title,
        },
      ]);

      setTimeout(() => {
        remove(id);
      }, 5000);
    },
    [],
  );

  const renderNotification = (notification: NotificationState) => {
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

      <div className="fixed top-6 right-6 z-50 space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id}>
            {renderNotification(notification)}
          </div>
        ))}
      </div>
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