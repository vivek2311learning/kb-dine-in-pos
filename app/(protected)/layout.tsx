import { redirect } from 'next/navigation';

import { AdminNavbar } from '../components/layout/adminNavbar';
import { CounterNavbar } from '../components/layout/counterNavbar';
import { KitchenNavbar } from '../components/layout/KitchenNavbar';

import { getUser } from '../lib/auth/getUserFromRequest';

type Role = 'admin' | 'counter' | 'kitchen';

const NAVBAR_BY_ROLE: Record<Role, React.ComponentType> = {
  admin: AdminNavbar,
  counter: CounterNavbar,
  kitchen: KitchenNavbar,
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  /* NOT LOGGED IN */

  if (!user) {
    redirect('/login?unauthorized=1');
  }

  const Navbar = NAVBAR_BY_ROLE[user.role as Role];

  return (
    <div className="min-h-screen flex flex-col">
      {/* ROLE BASED NAVBAR */}
      <Navbar />

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
