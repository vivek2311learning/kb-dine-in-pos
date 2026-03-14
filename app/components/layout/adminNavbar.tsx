'use client';

import Link from 'next/link';
import {
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';

import { useNotification } from '../notification/provider';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Menu', href: '/admin/menu' },
  { label: 'Staff', href: '/admin/staff' },
  { label: 'Reports', href: '/admin/reports' },
];

export function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();

  const { show } = useNotification();

  const [isOpen, setIsOpen] = useState(false);

  /* ================= FLASH MESSAGE ================= */

  useEffect(() => {
    if (params.get('flash') === 'login') {
      show('success', 'Welcome back!');
      router.replace('/admin/dashboard');
    }
  }, [params, router, show]);

  /* ================= AUTO CLOSE MOBILE MENU ================= */

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  /* ================= LOGOUT ================= */

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });

      router.replace('/');
      router.refresh();
    } catch {
      show('error', 'Logout failed');
    }
  };

  return (
    <header className="w-full shadow-sm bg-white/20 backdrop-blur-md border-b border-[#3b2a1a]/20">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LEFT SECTION */}

        <div className="flex items-center gap-8">

          <h2 className="font-rustic text-xl text-[#3b2a1a]">
            KB Admin
          </h2>

          {/* DESKTOP NAV */}

          <nav className="hidden md:flex gap-4">

            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-3 py-1 rounded-lg text-sm font-medium
                    transition duration-200
                    ${
                      isActive
                        ? 'bg-[#e0c4a2] text-[#3b2a1a]'
                        : 'text-[#3b2a1a] hover:bg-[#e0c4a2]/60'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}

          </nav>
        </div>

        {/* RIGHT SECTION */}

        <div className="hidden md:block">
          <button
            onClick={handleSignOut}
            className="
              px-4 py-1 rounded-lg text-sm
              text-red-700 hover:bg-red-100
              transition
            "
          >
            Sign Out
          </button>
        </div>

        {/* MOBILE BUTTON */}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden text-[#3b2a1a]"
          aria-label="Toggle admin menu"
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

          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-[#3b2a1a]"
            >
              {item.label}
            </Link>
          ))}

          <button
            onClick={handleSignOut}
            className="block text-red-600"
          >
            Sign Out
          </button>

        </div>

      </div>

    </header>
  );
}