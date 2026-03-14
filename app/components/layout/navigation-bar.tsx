'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

type Role = 'admin' | 'counter' | 'kitchen';

export function NavigationBar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);

  /* Detect login state */

  useEffect(() => {
    const roleMatch = document.cookie.match(/user_role=([^;]+)/);

    if (roleMatch) {
      setRole(roleMatch[1] as Role);
    } else {
      setRole(null);
    }
  }, [pathname]);

  /* Dashboard route */

  const dashboardPath =
    role === 'admin'
      ? '/admin/dashboard'
      : role === 'counter'
      ? '/counter/tables'
      : role === 'kitchen'
      ? '/kitchen/orders'
      : '/';

  /* Logout */

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });

    router.push('/');
    router.refresh();
  };

  return (
    <header className="w-full border-b border-[#3b2a1a]/20 shadow-sm">

      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">

        {/* LEFT */}

        <div className="flex items-center gap-8">

          <Badge className="py-4 bg-[#e0c4a2] hover:bg-[#e0c4a2]/80 transition">
            <Link href="/" className="font-rustic text-2xl text-[#3b2a1a]">
              KB Restaurant
            </Link>
          </Badge>

          {/* DESKTOP NAV */}

          <nav className="hidden md:flex gap-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-3 py-1 rounded-lg text-md font-medium
                    transition duration-200
                    hover:bg-[#e0c4a2]/60 hover:scale-[1.02]
                    ${
                      isActive
                        ? 'bg-[#e0c4a2] text-[#3b2a1a]'
                        : 'text-[#3b2a1a]'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

        </div>

        {/* RIGHT (Desktop) */}

        <div className="hidden md:flex items-center gap-3">

          {!role ? (
            <Link href="/login">
              <Button className="px-4 py-1 text-sm text-[#3b2a1a]">
                Login
              </Button>
            </Link>
          ) : (
            <>
              <Link
                href={dashboardPath}
                className="px-4 py-1 rounded-lg text-sm text-[#3b2a1a] hover:bg-[#e0c4a2]/60 transition"
              >
                Dashboard
              </Link>

              <Button
                onClick={handleLogout}
                className="px-4 py-1 text-sm text-red-600 hover:bg-red-100"
              >
                Sign Out
              </Button>
            </>
          )}

        </div>

        {/* MOBILE MENU BUTTON */}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden text-[#3b2a1a]"
          aria-label="Toggle navigation menu"
        >
          <div className={`space-y-1 transition ${isOpen ? 'rotate-90' : ''}`}>
            <span className="block w-6 h-0.5 bg-[#3b2a1a]" />
            <span className="block w-6 h-0.5 bg-[#3b2a1a]" />
            <span className="block w-6 h-0.5 bg-[#3b2a1a]" />
          </div>
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

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`
                block px-4 py-2 text-lg font-medium
                transition duration-200
                hover:translate-x-1 hover:text-[#8b5e34]
                ${isActive ? 'text-[#8b5e34]' : 'text-[#3b2a1a]'}
              `}
            >
              {item.label}
            </Link>
          );
        })}

        {!role ? (
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-[#3b2a1a] font-medium hover:text-[#8b5e34]"
          >
            Login
          </Link>
        ) : (
          <>
            <Link
              href={dashboardPath}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-[#3b2a1a] font-medium hover:text-[#8b5e34]"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="block px-4 py-2 text-red-600 font-medium hover:text-red-700"
            >
              Sign Out
            </button>
          </>
        )}

      </div>
    </header>
  );
}