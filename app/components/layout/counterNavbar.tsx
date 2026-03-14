'use client';

import Link from 'next/link';
import {
  usePathname,
  useSearchParams,
  useRouter,
} from 'next/navigation';

import { useNotification } from '../notification/provider';
import { useEffect, useState } from 'react';

const COUNTER_NAV = [
  { label: 'Tables', href: '/counter/tables' },
  { label: 'Order List', href: '/counter/orders' },
];

export function CounterNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();

  const { show } = useNotification();

  const [isOpen, setIsOpen] = useState(false);

  /* FLASH MESSAGE */

  useEffect(() => {
    if (params.get('flash') === 'login') {
      show('success', 'Welcome back!');
      router.replace('/counter/tables');
    }
  }, [params, router, show]);

  /* AUTO CLOSE MOBILE MENU ON NAVIGATION */

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  /* LOGOUT */

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });

      router.replace('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
      show('error', 'Logout failed');
      router.replace('/login');
    }
  };

  return (
    <header className="w-full shadow-sm bg-white/20 backdrop-blur-md border-b border-[#3b2a1a]/20">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* BRAND */}

        <div>
          <h2 className="font-rustic text-xl text-[#3b2a1a]">
            Counter Panel
          </h2>

          <p className="text-xs opacity-70">
            POS System
          </p>
        </div>

        {/* DESKTOP NAV */}

        <nav className="hidden md:flex items-center gap-6">

          {COUNTER_NAV.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative font-medium text-[#3b2a1a]
                  transition duration-200
                  ${
                    isActive
                      ? 'text-[#8b5e34]'
                      : 'hover:text-[#8b5e34]'
                  }
                `}
              >
                {item.label}

                {isActive && (
                  <span
                    className="
                      absolute left-0 -bottom-1
                      w-full h-0.5
                      bg-[#8b5e34]
                    "
                  />
                )}
              </Link>
            );
          })}

          {/* LOGOUT */}

          <button
            onClick={handleLogout}
            className="
              ml-6 px-4 py-1.5 rounded-lg
              bg-red-600 text-white text-sm
              hover:bg-red-700 transition
            "
          >
            Logout
          </button>

        </nav>

        {/* MOBILE MENU BUTTON */}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden text-[#3b2a1a]"
          aria-label="Toggle counter menu"
        >
          ☰
        </button>

      </div>

      {/* MOBILE DROPDOWN */}

      <div
         className={`
          md:hidden shadow-sm bg-white/10 backdrop-blur-md
          overflow-hidden transition-all duration-300
          ${isOpen ? 'max-h-96 py-6 opacity-100' : 'max-h-0 py-0 opacity-0'}
        `}
      >

        <div className="px-6 space-y-4">

          {COUNTER_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-[#3b2a1a]"
            >
              {item.label}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="block text-red-600"
          >
            Logout
          </button>

        </div>

      </div>

    </header>
  );
}