'use client';

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';

import { Notification } from './notification';
import { NotificationSuccess } from './notification-success';
import { NotificationError } from './notification-error';
import { NotificationWarning } from './notification-warning';
import { NotificationInfo } from './notification-info';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationAction {
  label: string;
  onClick: () => void;
}

interface ShowOptions {
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  action?: NotificationAction;
}

interface NotificationState {
  id: number;
  type: NotificationType;
  title?: string;
  message: string;
  duration: number;
  action?: NotificationAction;
}

interface NotificationContextType {
  show: (options: ShowOptions) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismiss: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const show = useCallback(
    ({ type, message, title, duration = 4000, action }: ShowOptions) => {
      const id = ++idRef.current;

      setNotifications((prev) => [
        ...prev,
        {
          id,
          type,
          title,
          message,
          duration,
          action,
        },
      ]);

      window.setTimeout(() => {
        dismiss(id);
      }, duration);
    },
    [dismiss],
  );

  const success = useCallback(
    (message: string, title = 'Success') => {
      show({ type: 'success', message, title });
    },
    [show],
  );

  const error = useCallback(
    (message: string, title = 'Error') => {
      show({ type: 'error', message, title, duration: 5000 });
    },
    [show],
  );

  const warning = useCallback(
    (message: string, title = 'Warning') => {
      show({ type: 'warning', message, title });
    },
    [show],
  );

  const info = useCallback(
    (message: string, title = 'Info') => {
      show({ type: 'info', message, title });
    },
    [show],
  );

  const renderNotification = (notification: NotificationState) => {
    const props = {
      title: notification.title,
      onClose: () => dismiss(notification.id),
      action: notification.action,
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
    <NotificationContext.Provider
      value={{
        show,
        success,
        error,
        warning,
        info,
        dismiss,
      }}
    >
      {children}

      <div className="fixed top-4 right-4 left-4 sm:left-auto sm:top-6 sm:right-6 z-[100] space-y-3 pointer-events-none">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
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
