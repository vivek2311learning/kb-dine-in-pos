'use client';
// 👆 Ye batata hai ki ye component browser me run hoga (client side)
// Isliye hum hooks jaise useState, useEffect use kar sakte hain

import Link from 'next/link';
// 👆 Page reload ke bina route change karne ke liye

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
// usePathname → current URL path check karne ke liye
// useSearchParams → URL ke query params (jaise ?flash=login)
// useRouter → programmatically route change karne ke liye

import { useNotification } from '../notification/provider';
// 👆 Custom notification system (toast message show karne ke liye)

import { useEffect, useState } from 'react';
// useEffect → component load hone par kuch run karna
// useState → component ke andar state manage karna

// 🔹 Navbar me kaunse links honge
const KITCHEN_NAV = [{ label: 'Orders', href: '/kitchen/orders' }];

export function KitchenNavbar() {
  // 📍 Current URL path
  const pathname = usePathname();

  // 🔄 Programmatic navigation
  const router = useRouter();

  // 🔔 Notification show karne ka function
  const { show } = useNotification();

  // 🔎 URL ke query parameters read karne ke liye
  const params = useSearchParams();

  // 📱 Mobile menu open/close state
  const [isOpen, setIsOpen] = useState(false);

  /*
    🔔 Flash Message Logic

    Agar URL me ?flash=login ho
    to login success ka message show kare
  */
  useEffect(() => {
    if (params.get('flash') === 'login') {
      // Success notification show karo
      show('success', 'Welcome back!');

      // URL se query parameter hata do
      // taki reload par dobara message na aaye
      window.history.replaceState({}, '', '/kitchen/orders');
    }
  }, [params, show]);

  /*
    🔓 Logout Function

    - Backend logout API call karega
    - Cookie delete karega
    - User ko homepage par bhej dega
  */
  const handleLogout = async () => {
    // Server ko bolo logout karne ke liye
    await fetch('/api/auth/logout', { method: 'POST' });

    // Redirect homepage par
    router.replace('/');
  };

  return (
    /*
      🧱 Header Section

      - Full width
      - Light shadow
      - White background
    */
    <header className="w-full shadow-sm bg-white/20 backdrop-blur-md">
      {/* Main container (center aligned content) */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* ================= LEFT SIDE (BRAND) ================= */}

        <div>
          <h2 className="font-rustic text-xl text-[#3b2a1a]">Kitchen Panel</h2>

          <p className="text-xs opacity-60">Order Preparation</p>
        </div>

        {/* ================= DESKTOP NAVIGATION ================= */}

        {/* md:flex → medium screen se visible */}
        {/* hidden → mobile par hide */}
        <nav className="hidden md:flex gap-6 items-center">
          {KITCHEN_NAV.map((item) => {
            // Check karo kya current page active hai
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition ${
                  isActive
                    ? 'text-[#3b2a1a] border-b-2 border-[#3b2a1a]'
                    : 'text-gray-500 hover:text-[#3b2a1a]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Logout button desktop ke liye */}
          <button
            onClick={handleLogout}
            className="text-red-600 font-medium hover:underline"
          >
            Logout
          </button>
        </nav>

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

      {/* Agar isOpen true hai tabhi dikhega */}
      {isOpen && (
        <div className="md:hidden border-t px-6 py-4 space-y-4 bg-white">
          {KITCHEN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block text-gray-700"
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
