import Header from '@/components/header'; // Impor Header Anda

/*
 * Ini adalah Server Component.
 * Layout ini akan secara otomatis diterapkan ke semua halaman
 * di dalam folder (main), seperti /stok dan /promo.
 */
export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {/* Tag <main> sudah tidak diperlukan di sini 
        jika Anda sudah memilikinya di halaman /stok atau /promo.
        Tapi jika belum, ini adalah tempat yang baik untuk menambahkannya.
      */}
      {children}
    </>
  );
}
