import { Notification } from './notification';

export function NotificationInfo({
  title = 'Info',
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Notification title={title} className="border-blue-700/40 bg-blue-200">
      {children}
    </Notification>
  );
}
