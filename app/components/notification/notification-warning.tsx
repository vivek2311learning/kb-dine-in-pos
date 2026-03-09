import { Notification } from './notification';

export function NotificationWarning({
  title = 'Warning',
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Notification title={title} className="border-yellow-700/40 bg-yellow-200">
      {children}
    </Notification>
  );
}
