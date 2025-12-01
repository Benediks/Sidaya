"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

// Data link navigasi - UPDATED with Dashboard
const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/stok', label: 'Kelola Stok' },
  { href: '/promo', label: 'Kelola Promo' },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <nav className="sticky top-0 z-10 h-[72px] animate-pulse bg-white p-4 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="h-8 w-24 rounded bg-gray-200"></div>
          <div className="flex space-x-4">
            <div className="h-8 w-24 rounded bg-gray-200"></div>
            <div className="h-8 w-24 rounded bg-gray-200"></div>
            <div className="h-8 w-24 rounded bg-gray-200"></div>
          </div>
          <div className="flex h-10 w-28 items-center rounded bg-gray-200"></div>
        </div>
      </nav>
    );
  }

  const user = session?.user;

  if (!user) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-10 bg-white p-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">

        {/* Logo (Kiri) */}
        <div className="flex-1 basis-1/3">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Image
              src="/sidaya-logo.png"
              alt="Sidaya Logo"
              width={100}
              height={30}
              priority
            />
          </Link>
        </div>

        {/* Navigasi (Tengah) */}
        <div className="flex flex-1 basis-1/3 justify-center space-x-4">
          {navLinks.map((link) => {

            // Hanya tampilkan 'Dashboard' jika role user adalah 'owner'
            if (link.href === '/dashboard' && user.role !== 'owner') {
              return null;
            }
            // Hanya tampilkan 'Kelola Promo' jika role user adalah 'owner'
            if (link.href === '/promo' && user.role !== 'owner') {
              return null;
            }

            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-4 py-2 font-medium transition ${isActive
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Info User (Kanan) */}
        <div className="flex flex-1 basis-1/3 justify-end">
          <div className="flex items-center space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-700">
              {user.initial || 'A'}
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-800">
                {user.name || 'User'}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="block text-left text-teal-600 hover:underline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

      </div>
    </nav>
  );
}