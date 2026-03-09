import { AdminNavbar } from '../components/layout/adminNavbar';
import { CounterNavbar } from '../components/layout/counterNavbar';
import { KitchenNavbar } from '../components/layout/KitchenNavbar';
import { getUser } from '../lib/auth/getUserFromRequest';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* 🔥 ROLE BASED NAVBAR */}
      {user.role === 'admin' && <AdminNavbar />}
      {user.role === 'counter' && <CounterNavbar />}
      {user.role === 'kitchen' && <KitchenNavbar />}

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
