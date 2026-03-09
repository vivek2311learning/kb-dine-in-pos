'use client';
// 👆 Iska matlab ye component browser me chalega (client-side).
// Isliye hum hooks use kar sakte hain.

import Link from 'next/link';
// 👆 Page reload ke bina route change karta hai (SPA navigation)

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
// usePathname → current URL path detect karne ke liye
// useSearchParams → URL ke query params read karne ke liye
// useRouter → programmatically redirect karne ke liye

import { useNotification } from '../notification/provider';
// 👆 Toast/notification show karne ke liye custom hook

import { useEffect, useState } from 'react';
// useEffect → component mount hone par code chalane ke liye
// useState → mobile menu open/close state control karne ke liye

/* ================= NAV ITEMS ================= */
// Counter ke navbar ke links
const COUNTER_NAV = [
  { label: 'Tables', href: '/counter/tables' },
  { label: 'Order List', href: '/counter/orders' },
];

export function CounterNavbar() {
  // 📍 Current active path (e.g., /counter/tables)
  const pathname = usePathname();

  // 🔄 Router for redirect
  const router = useRouter();

  // 🔔 Notification system
  const { show } = useNotification();

  // 🔎 URL ke query params read karne ke liye
  const params = useSearchParams();

  // 📱 Mobile menu state
  const [isOpen, setIsOpen] = useState(false);

  /* ================= FLASH MESSAGE ================= */

  useEffect(() => {
    // Agar URL me ?flash=login ho
    if (params.get('flash') === 'login') {
      // Welcome notification show karo
      show('success', 'Welcome back!');

      // URL clean karo taaki reload par message repeat na ho
      router.replace('/counter/tables');
    }
  }, [params, router, show]);

  /* ================= LOGOUT ================= */

  const handleLogout = async () => {
    try {
      // Backend logout API call
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // Logout ke baad homepage redirect
      router.replace('/');
    } catch (error) {
      // Error aaye to console me show karo
      console.error('Logout failed:', error);

      // Fallback login page redirect
      router.replace('/login');
    }
  };

  return (
    /*
      🧱 HEADER CONTAINER
      - Full width
      - Light blur
      - Bottom border
    */

    <header
      className="
        w-full shadow-sm bg-white/20 backdrop-blur-md
      "
    >
      {/* Inner wrapper for alignment */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* ================= LEFT BRAND ================= */}

        <div>
          <h2 className="font-rustic text-xl text-[#3b2a1a]">Counter Panel</h2>

          <p className="text-xs opacity-70">POS System</p>
        </div>

        {/* ================= DESKTOP NAV ================= */}
        {/* hidden → mobile par hide */}
        {/* md:flex → medium screen se visible */}
        <nav className="hidden md:flex items-center gap-6">
          {COUNTER_NAV.map((item) => {
            // Check karo kya current route active hai
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative
                  font-medium
                  text-[#3b2a1a]
                  transition
                  ${isActive ? 'text-[#8b5e34]' : 'hover:text-[#8b5e34]'}
                `}
              >
                {item.label}

                {/* Active underline */}
                {isActive && (
                  <span
                    className="
                      absolute
                      left-0
                      -bottom-1
                      w-full
                      h-0.5
                      bg-[#8b5e34]
                    "
                  />
                )}
              </Link>
            );
          })}

          {/* Logout button (desktop only) */}
          <button
            onClick={handleLogout}
            className="
              ml-6
              px-4 py-1.5
              rounded-lg
              bg-red-600
              text-white
              text-sm
              hover:bg-red-700
              transition
            "
          >
            Logout
          </button>
        </nav>

        {/* ================= MOBILE MENU BUTTON ================= */}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-[#3b2a1a]"
        >
          ☰
        </button>
      </div>

      {/* ================= MOBILE DROPDOWN ================= */}

      {isOpen && (
        <div className="md:hidden border-t px-6 py-4 space-y-4 bg-white">
          {COUNTER_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block text-[#3b2a1a]"
            >
              {item.label}
            </Link>
          ))}

          <button onClick={handleLogout} className="block text-red-600">
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
