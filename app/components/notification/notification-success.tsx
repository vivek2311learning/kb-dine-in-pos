import { Notification } from './notification';

export function NotificationSuccess({
  title = 'Success',
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Notification title={title} className="border-green-700/40 bg-green-200">
      {children}
    </Notification>
  );
}
