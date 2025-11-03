"use client"; // Diperlukan karena kita menggunakan hook (usePathname, useSession)

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

// Data link navigasi
const navLinks = [
  { href: '/stok', label: 'Kelola Stok' },
  { href: '/promo', label: 'Kelola Promo' },
];

export default function Header() {
  const pathname = usePathname();
  // 1. Menggunakan hook useSession
  const { data: session, status } = useSession();

  // 2. Menampilkan skeleton loading untuk mencegah Layout Shift
  // Tinggi h-[72px] didapat dari padding (p-4 = 16px*2) + tinggi ikon (h-10 = 40px)
  if (status === 'loading') {
    return (
      <nav className="sticky top-0 z-10 h-[72px] animate-pulse bg-white p-4 shadow-sm">
        {/* Skeleton layout untuk 3 kolom */}
        <div className="container mx-auto flex items-center justify-between">
          <div className="h-8 w-24 rounded bg-gray-200"></div> {/* Logo skeleton */}
          <div className="flex space-x-4">
            <div className="h-8 w-24 rounded bg-gray-200"></div> {/* Nav link skeleton */}
            <div className="h-8 w-24 rounded bg-gray-200"></div> {/* Nav link skeleton */}
          </div>
          <div className="flex h-10 w-28 items-center rounded bg-gray-200"></div> {/* User info skeleton */}
        </div>
      </nav>
    );
  }

  // 3. Mengambil data user dari session
  const user = session?.user;

  // 4. Jika tidak ada user (misal: session error atau belum terautentikasi)
  // Ini seharusnya ditangani oleh middleware, tapi sebagai fallback
  if (!user) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-10 bg-white p-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        
        {/* Kolom 1: Logo (Kiri) - basis-1/3 */}
        <div className="flex-1 basis-1/3">
          <Link href="/login" className="flex items-center space-x-2">
            <Image
              src="/sidaya-logo.png" // Pastikan logo ada di /public/sidaya-logo.png
              alt="Sidaya Logo"
              width={100}
              height={30}
              priority
            />
          </Link>
        </div>

        {/* Kolom 2: Navigasi (Tengah) - basis-1/3 */}
        <div className="flex flex-1 basis-1/3 justify-center space-x-4">
          {navLinks.map((link) => {
            // 5. Logika Navigasi (Role-based)
            // Hanya tampilkan 'Kelola Promo' jika role user adalah 'owner'
            if (link.href === '/promo' && user.role !== 'owner') {
              return null; // Jangan render tombol 'Kelola Promo' untuk karyawan
            }

            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-4 py-2 font-medium transition ${
                  isActive
                    ? 'bg-teal-500 text-white' // Style aktif
                    : 'text-gray-700 hover:bg-gray-100' // Style non-aktif
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Kolom 3: Info User (Kanan) - basis-1/3 */}
        <div className="flex flex-1 basis-1/3 justify-end">
          <div className="flex items-center space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-700">
              {user.initial || 'A'} {/* 6. Data User Dinamis (dengan fallback 'A') */}
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-800">
                {user.name || 'User'} {/* 6. Data User Dinamis (dengan fallback 'User') */}
              </span>
              
              {/* 7. Fungsi Logout */}
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