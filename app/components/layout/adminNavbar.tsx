'use client';
// 👆 Ye component browser (client side) me run karega
// Isliye hum React hooks use kar sakte hain

import Link from 'next/link';
// 👆 Page reload ke bina route change karne ke liye

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
// usePathname → current URL check karne ke liye
// useRouter → programmatically redirect karne ke liye
// useSearchParams → URL ke query params read karne ke liye

import { useNotification } from '../notification/provider';
// 👆 Toast / notification show karne ke liye

import { useEffect, useState } from 'react';
// useEffect → component load hone par logic run karna
// useState → mobile menu open/close control karna

// 🔹 Admin navbar ke links
const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Menu', href: '/admin/menu' },
  { label: 'Staff', href: '/admin/staff' },
  { label: 'Reports', href: '/admin/reports' },
];

export function AdminNavbar() {
  // 📍 Current route path
  const pathname = usePathname();

  // 🔄 Programmatic navigation
  const router = useRouter();

  // 🔔 Notification system
  const { show } = useNotification();

  // 🔎 URL ke query params read karne ke liye
  const params = useSearchParams();

  // 📱 Mobile menu open/close state
  const [isOpen, setIsOpen] = useState(false);

  /* ================= FLASH MESSAGE ================= */

  useEffect(() => {
    // Agar URL me ?flash=login ho
    if (params.get('flash') === 'login') {
      // Success notification show karo
      show('success', 'Welcome back!');

      // URL clean karo (taaki reload par repeat na ho)
      router.replace('/admin/dashboard');
    }
  }, [params, router, show]);

  /* ================= LOGOUT ================= */

  const handleSignOut = async () => {
    try {
      // Backend logout API call
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // Homepage redirect
      router.replace('/');
    } catch {
      // Agar error aaye to notification show karo
      show('error', 'Logout failed');
    }
  };

  return (
    /*
      🧱 HEADER CONTAINER
      - Full width
      - Light blur effect
      - Bottom border
    */

    <header
      className="
       w-full shadow-sm bg-white/20 backdrop-blur-md
      "
    >
      {/* Inner container for alignment */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* ================= LEFT SECTION ================= */}

        <div className="flex items-center gap-8">
          {/* BRAND NAME */}
          <h2 className="font-rustic text-xl text-[#3b2a1a]">KB Admin</h2>

          {/* ================= DESKTOP NAV ================= */}
          {/* hidden → mobile me hide */}
          {/* md:flex → medium screen se visible */}
          <nav className="hidden md:flex gap-4">
            {NAV_ITEMS.map((item) => {
              // Check karo kya current page active hai
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

        {/* ================= RIGHT SECTION ================= */}

        {/* Desktop logout */}
        <div className="hidden md:block">
          <button
            onClick={handleSignOut}
            className="
              px-4 py-1 rounded-lg
              text-sm
              text-red-700
              hover:bg-red-100
              transition
            "
          >
            Sign Out
          </button>
        </div>

        {/* ================= MOBILE MENU BUTTON ================= */}

        {/* md:hidden → desktop par hide */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-[#3b2a1a]"
        >
          ☰
        </button>
      </div>

      {/* ================= MOBILE DROPDOWN ================= */}

      {isOpen && (
        <div className="md:hidden border-t px-6 py-4 space-y-4 shadow-sm bg-white/20 backdrop-blur-md">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block text-[#3b2a1a]"
            >
              {item.label}
            </Link>
          ))}

          <button onClick={handleSignOut} className="block text-red-600">
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
