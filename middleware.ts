import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` akan mengenkripsi JWT dan meneruskannya ke `token`
  function middleware(req) {
    const token = req.nextauth.token;

    // --- LOGIKA PROTEKSI ROLE ---
    // Jika user mencoba mengakses /promo
    if (req.nextUrl.pathname.startsWith("/promo")) {
      // Dan role-nya BUKAN owner
      if (token?.role !== "owner") {
        // Redirect ke halaman /stok (atau halaman 'unauthorized')
        return NextResponse.redirect(new URL("/stok", req.url));
      }
    }

    // Jika user mencoba mengakses /stok
    if (req.nextUrl.pathname.startsWith("/stok")) {
      // Dan role-nya BUKAN owner ATAU karyawan (misal: role tidak dikenal)
      if (token?.role !== "owner" && token?.role !== "karyawan") {
         // Redirect ke halaman login
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  },
  {
    // Opsi untuk 'withAuth'
    callbacks: {
      // 'authorized' callback digunakan untuk menentukan apakah user diizinkan
      authorized: ({ token }) => {
        // Jika ada token (user sudah login), izinkan (return true)
        // Logika spesifik role kita tangani di 'middleware' function di atas
        return !!token;
      },
    },
  }
);

// 'matcher' menentukan halaman mana yang akan dilindungi oleh middleware ini
export const config = {
  matcher: [
    "/stok/:path*", // Lindungi semua halaman /stok
    "/promo/:path*", // Lindungi semua halaman /promo
  ],
};
