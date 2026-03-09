'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

type Role = 'admin' | 'counter' | 'kitchen';

export function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);

  const pathname = usePathname();

  /* Detect login state */

  useEffect(() => {
    const roleMatch = document.cookie.match(/user_role=([^;]+)/);

    if (roleMatch) {
      setRole(roleMatch[1] as Role);
      return;
    }

    setRole(null);
  }, [pathname]);

  /* Dashboard route */

  const dashboardPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'counter') return '/counter/tables';
    if (role === 'kitchen') return '/kitchen/orders';
    return '/';
  };

  /* Logout */

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });

    /*
    Full reload so navbar state reset ho jaye
    */
    window.location.href = '/';
  };

  return (
    <header className="w-full shadow-sm border-b border-[#3b2a1a]/20">
      <div className="w-full mx-auto px-6 py-4 flex justify-between items-center">
        {/* LEFT SECTION */}

        <div className="flex items-center gap-8">
          {/* BRAND */}

          <Link href="/" className="font-rustic text-2xl text-[#3b2a1a]">
            KB Restaurant
          </Link>

          {/* DESKTOP NAV */}

          <nav className="hidden md:flex gap-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-3 py-1 rounded-lg text-sm font-medium transition
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

        {/* RIGHT SECTION (Desktop) */}

        <div className="hidden md:flex items-center gap-3">
          {!role ? (
            <Link
              href="/login"
              className="px-4 py-1 rounded-lg text-sm text-[#3b2a1a] hover:bg-[#e0c4a2]/60 transition"
            >
              Login
            </Link>
          ) : (
            <>
              <Link
                href={dashboardPath()}
                className="px-4 py-1 rounded-lg text-sm text-[#3b2a1a] hover:bg-[#e0c4a2]/60 transition"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-1 rounded-lg text-sm text-red-600 hover:bg-red-100 transition"
              >
                Sign Out
              </button>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-[#3b2a1a]"
          aria-label="Toggle navigation menu"
        >
          <div className="space-y-1">
            <span className="block w-6 h-0.5 bg-[#3b2a1a]" />
            <span className="block w-6 h-0.5 bg-[#3b2a1a]" />
            <span className="block w-6 h-0.5 bg-[#3b2a1a]" />
          </div>
        </button>
      </div>

      {/* MOBILE MENU */}

      {isOpen && (
        <div className="md:hidden border-t px-6 py-6 space-y-5 shadow-sm bg-white/20 backdrop-blur-md">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block text-lg font-medium ${
                  isActive ? 'text-[#8b5e34]' : 'text-[#3b2a1a]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <hr className="border-[#3b2a1a]/20" />

          {!role ? (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="block text-[#3b2a1a] font-medium"
            >
              Login
            </Link>
          ) : (
            <>
              <Link
                href={dashboardPath()}
                onClick={() => setIsOpen(false)}
                className="block text-[#3b2a1a] font-medium"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="block text-red-600 font-medium"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
