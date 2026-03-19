'use client';

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

import { useNotification } from '../notification/provider';
import { useEffect, useState } from 'react';

const KITCHEN_NAV = [{ label: 'Orders', href: '/kitchen/orders' }];

export function KitchenNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();

  const { show } = useNotification();

  const [isOpen, setIsOpen] = useState(false);

  /* FLASH MESSAGE */

  useEffect(() => {
    if (params.get('flash') === 'login') {
      show('success', 'Welcome back!');
      router.replace('/kitchen/orders');
    }
  }, [params, router, show]);

  /* AUTO CLOSE MOBILE MENU */

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  /* LOGOUT */

 const handleLogout = async () => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // 🔥 MUST
    });

    router.replace('/');
    router.refresh();
  } catch {
    show('error', 'Logout failed');
  }
};

  return (
    <header className="w-full shadow-sm bg-white/20 backdrop-blur-md border-b border-[#3b2a1a]/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* BRAND */}

        <div>
          <h2 className="font-rustic text-xl text-[#3b2a1a]">Kitchen Panel</h2>

          <p className="text-xs opacity-60">Order Preparation</p>
        </div>

        {/* DESKTOP NAV */}

        <nav className="hidden md:flex gap-6 items-center">
          {KITCHEN_NAV.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative font-medium transition
                  ${
                    isActive
                      ? 'text-[#3b2a1a]'
                      : 'text-gray-500 hover:text-[#3b2a1a]'
                  }
                `}
              >
                {item.label}

                {isActive && (
                  <span
                    className="
                      absolute
                      left-0
                      -bottom-1
                      w-full
                      h-0.5
                      bg-[#3b2a1a]
                    "
                  />
                )}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="
              text-red-600
              font-medium
              hover:underline
            "
          >
            Logout
          </button>
        </nav>

        {/* MOBILE BUTTON */}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden text-[#3b2a1a]"
          aria-label="Toggle kitchen menu"
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}

      <div
        className={`
          md:hidden shadow-sm bg-white/10 backdrop-blur-md
          overflow-hidden transition-all duration-300
          ${isOpen ? 'max-h-96 py-6 opacity-100' : 'max-h-0 py-0 opacity-0'}
        `}
      >
        <div className="px-6 space-y-3">
          {KITCHEN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-gray-700"
            >
              {item.label}
            </Link>
          ))}

          <button onClick={handleLogout} className="block text-red-600">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
