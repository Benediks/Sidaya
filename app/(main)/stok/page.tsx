import { Search, Plus, Edit, Trash2, View, Utensils, Coffee } from 'lucide-react'; // Menggunakan lucide-react untuk ikon

// Komponen Header Navigasi (untuk kemudahan, bisa dibuat terpisah di folder components)
export default function KelolaStokPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Kelola Stok Section */}
          <section className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">Kelola Stok</h2>
            <div className="mb-4 flex items-center space-x-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari stok..."
                  className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                />
              </div>
              <button className="rounded-md bg-teal-500 px-4 py-2 font-medium text-white transition hover:bg-teal-600">
                Stok Bahan
              </button>
              <button className="rounded-md bg-gray-200 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-300">
                Stok Barang
              </button>
            </div>

            <button className="mb-4 flex items-center rounded-md bg-green-500 px-4 py-2 font-medium text-white transition hover:bg-green-600">
              <Plus size={20} className="mr-2" /> Tambah Stok
            </button>

            <div className="overflow-x-auto rounded-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Jumlah</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Satuan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Harga Beli (Rp)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tanggal Masuk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tanggal Update</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {/* Contoh Baris Data */}
                  <tr>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">12345</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">Kopi Sachet</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">1</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">Pcs</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">8000</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">1/1/2025</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">12/10/2025</td>
                    <td className="flex items-center justify-end whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <button className="text-teal-600 hover:text-teal-900">
                        <Edit size={18} />
                      </button>
                      <button className="ml-2 text-red-600 hover:text-red-900">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">22345</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">Air</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">500</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">ml</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">6000</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">1/1/2025</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">12/10/2025</td>
                    <td className="flex items-center justify-end whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <button className="text-teal-600 hover:text-teal-900">
                        <Edit size={18} />
                      </button>
                      <button className="ml-2 text-red-600 hover:text-red-900">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">32345</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">Granule</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">500</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">gram</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">2000</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">1/1/2025</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">12/10/2025</td>
                    <td className="flex items-center justify-end whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <button className="text-teal-600 hover:text-teal-900">
                        <Edit size={18} />
                      </button>
                      <button className="ml-2 text-red-600 hover:text-red-900">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                  {/* Tambahkan lebih banyak baris jika diperlukan */}
                </tbody>
              </table>
              {/* Scrollbar kanan jika tabel terlalu panjang */}
              <div className="absolute right-0 top-0 h-full w-2 bg-gray-200">
                <div className="h-1/3 w-full rounded-full bg-teal-500"></div>
              </div>
            </div>
          </section>

          {/* Stok Menu Section */}
          <section className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">Stok Menu</h2>
            <div className="mb-4 flex items-center space-x-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari stok..."
                  className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                />
              </div>
              <button className="rounded-md bg-gray-200 p-2 text-gray-700 transition hover:bg-gray-300">
                <Utensils size={20} /> {/* Ikon Makanan */}
              </button>
              <button className="rounded-md bg-gray-200 p-2 text-gray-700 transition hover:bg-gray-300">
                <Coffee size={20} /> {/* Ikon Minuman */}
              </button>
            </div>

            <button className="mb-4 flex items-center rounded-md bg-green-500 px-4 py-2 font-medium text-white transition hover:bg-green-600">
              <Plus size={20} className="mr-2" /> Tambah Stok Menu
            </button>

            <div className="overflow-x-auto rounded-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Jumlah</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {/* Contoh Baris Data */}
                  <tr>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">M1234</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">Kopi Pahit</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">1</td>
                    <td className="flex items-center justify-end whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <button className="text-teal-600 hover:text-teal-900">
                        <Edit size={18} />
                      </button>
                      <button className="ml-2 text-red-600 hover:text-red-900">
                        <Trash2 size={18} />
                      </button>
                      <button className="ml-2 text-teal-600 hover:text-teal-900">
                        <View size={18} />
                      </button>
                    </td>
                  </tr>
                  {/* Tambahkan lebih banyak baris jika diperlukan */}
                </tbody>
              </table>
               {/* Scrollbar kanan jika tabel terlalu panjang */}
              <div className="absolute right-0 top-0 h-full w-2 bg-gray-200">
                <div className="h-1/3 w-full rounded-full bg-teal-500"></div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}