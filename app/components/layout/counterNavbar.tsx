'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  { label: 'Tables', href: '/counter/tables' },
  { label: 'Parcel', href: '/counter/parcel' },
  { label: 'Orders', href: '/counter/unserved' },
];

export function CounterNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      router.replace('/');
      router.refresh();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <header className="border-bshadow-sm bg-white/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <h2 className="font-bold text-lg">Counter Panel</h2>
        <nav className="hidden md:flex items-center gap-6">
          {NAV.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition ${
                  active ? 'text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <button
            onClick={logout}
            className="ml-4 px-3 py-1 bg-red-600 text-white rounded-md text-sm"
          >
            Logout
          </button>
        </nav>
        <button onClick={() => setOpen(!open)} className="md:hidden text-lg">
          ☰
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t px-6 py-4 space-y-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-gray-700"
            >
              {item.label}
            </Link>
          ))}

          <button onClick={logout} className="text-red-600">
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
