import type { Metadata } from "next";
// Saya ganti font ke 'Inter' agar lebih standar untuk UI
import { Inter } from "next/font/google"; 
import "./globals.css";
// 1. Impor provider Anda
import NextAuthProvider from "./providers"; 

const inter = Inter({ subsets: ["latin"] });

// 2. Perbarui metadata Anda
export const metadata: Metadata = {
  title: "Sidaya POS",
  description: "Sistem Point of Sale Sidaya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 3. Ganti bahasa ke "id" (Indonesia)
    <html lang="id"> 
      <body className={inter.className}>
        {/* 4. Bungkus {children} dengan provider. 
             Ini akan memperbaiki error 'useSession' Anda.
        */}
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}