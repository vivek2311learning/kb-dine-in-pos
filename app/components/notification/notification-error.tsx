import { Notification } from './notification';

export function NotificationError({
  title = 'Error',
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Notification title={title} className="border-red-700/40 bg-red-200">
      {children}
    </Notification>
  );
}
