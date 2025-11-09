'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Upload, Download } from 'lucide-react';
import { Stok, Menu } from '@/lib/types';
import StokFormModal from '@/components/StokFormModal';
import MenuFormModal from '@/components/MenuFormModal';
import MenuDetailModal from '@/components/MenuDetailModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import TransactionUploadModal from '@/components/TransactionUploadModal';
import ExportStockButton from '@/components/ExportStockButton';
import { Toaster, toast } from 'react-hot-toast';

type ModalState =
  | { type: 'none' }
  | { type: 'add-stok' }
  | { type: 'edit-stok'; item: Stok }
  | { type: 'delete-stok'; item: Stok }
  | { type: 'add-menu' }
  | { type: 'edit-menu'; item: Menu }
  | { type: 'delete-menu'; item: Menu }
  | { type: 'view-menu'; item: Menu }
  | { type: 'upload-transaction' };

export default function KelolaStokPage() {
  const [stokList, setStokList] = useState<Stok[]>([]);
  const [menuList, setMenuList] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search states
  const [stokSearchQuery, setStokSearchQuery] = useState('');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [stokFilter, setStokFilter] = useState<'all' | 'Stok Bahan' | 'Stok Barang'>('all');
  const [menuFilter, setMenuFilter] = useState<'all' | 'Makanan' | 'Minuman'>('all');

  // Data Fetching
  const fetchStok = async () => {
    try {
      const res = await fetch('/api/stok');
      if (!res.ok) throw new Error('Failed to fetch stok');
      const data = await res.json();
      setStokList(data);
    } catch (error) {
      console.error('Error fetching stok:', error);
      toast.error('Gagal memuat data stok');
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      if (!res.ok) throw new Error('Failed to fetch menu');
      const data = await res.json();
      setMenuList(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast.error('Gagal memuat data menu');
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchStok(), fetchMenu()]).finally(() => setIsLoading(false));
  }, []);

  const refreshData = () => {
    fetchStok();
    fetchMenu();
  };

  // Filter functions
  const filteredStokList = stokList.filter((stok) => {
    const matchesSearch = stok.Nama_Stok.toLowerCase().includes(stokSearchQuery.toLowerCase()) ||
                         stok.ID_Stok.toLowerCase().includes(stokSearchQuery.toLowerCase());
    const matchesFilter = stokFilter === 'all' || stok.Kategori_Stok === stokFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredMenuList = menuList.filter((menu) => {
    const matchesSearch = menu.Nama_Menu.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                         menu.ID_Menu.toLowerCase().includes(menuSearchQuery.toLowerCase());
    const matchesFilter = menuFilter === 'all' || menu.Kategori_Menu === menuFilter;
    return matchesSearch && matchesFilter;
  });

  // --- Stok Handlers ---
  const handleStokSubmit = async (data: any) => {
    setIsSubmitting(true);
    const isEditing = modal.type === 'edit-stok';
    const url = isEditing ? `/api/stok/${(modal as any).item.ID_Stok}` : '/api/stok';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Gagal menyimpan stok');
      
      toast.success(isEditing ? 'Stok berhasil diubah!' : 'Stok berhasil ditambahkan!');
      setModal({ type: 'none' });
      refreshData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStok = async () => {
    if (modal.type !== 'delete-stok') return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/stok/${modal.item.ID_Stok}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus stok');

      toast.success('Stok berhasil dihapus!');
      setModal({ type: 'none' });
      refreshData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Menu Handlers ---
  const handleMenuSubmit = async (data: any) => {
    setIsSubmitting(true);
    const isEditing = modal.type === 'edit-menu';
    const url = isEditing ? `/api/menu/${(modal as any).item.ID_Menu}` : '/api/menu';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Gagal menyimpan menu');
      
      toast.success(isEditing ? 'Menu berhasil diubah!' : 'Menu berhasil ditambahkan!');
      setModal({ type: 'none' });
      refreshData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMenu = async () => {
    if (modal.type !== 'delete-menu') return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/menu/${modal.item.ID_Menu}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus menu');

      toast.success('Menu berhasil dihapus!');
      setModal({ type: 'none' });
      refreshData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransactionUploadSuccess = () => {
    toast.success('Transaksi berhasil diproses!');
    refreshData();
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto p-6">
          {/* Export and Upload Buttons */}
          <div className="mb-6 flex justify-end gap-3">
            <ExportStockButton />
            <button
              onClick={() => setModal({ type: 'upload-transaction' })}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 font-medium text-white shadow-lg transition hover:bg-blue-700"
            >
              <Upload size={20} />
              Upload Transaksi Penjualan
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            
            {/* Kelola Stok Section */}
            <section className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800">Kelola Stok</h2>
              
              {/* Search and Filter */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari stok..."
                    value={stokSearchQuery}
                    onChange={(e) => setStokSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStokFilter('all')}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                      stokFilter === 'all'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setStokFilter('Stok Bahan')}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                      stokFilter === 'Stok Bahan'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Stok Bahan
                  </button>
                  <button
                    onClick={() => setStokFilter('Stok Barang')}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                      stokFilter === 'Stok Barang'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Stok Barang
                  </button>
                </div>
              </div>

              <button
                onClick={() => setModal({ type: 'add-stok' })}
                className="mb-4 flex items-center rounded-md bg-green-500 px-4 py-2 font-medium text-white transition hover:bg-green-600"
              >
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
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Harga Beli</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {isLoading && (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    )}
                    {!isLoading && filteredStokList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-500">
                          Tidak ada data stok
                        </td>
                      </tr>
                    )}
                    {!isLoading && filteredStokList.map((stok) => (
                      <tr key={stok.ID_Stok} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{stok.ID_Stok}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{stok.Nama_Stok}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{stok.Jumlah}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{stok.Satuan}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          Rp {new Intl.NumberFormat('id-ID').format(stok.Harga_Beli)}
                        </td>
                        <td className="flex items-center justify-end whitespace-nowrap px-6 py-4 text-sm font-medium">
                          <button 
                            onClick={() => setModal({ type: 'edit-stok', item: stok })} 
                            className="text-teal-600 hover:text-teal-900"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => setModal({ type: 'delete-stok', item: stok })} 
                            className="ml-2 text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Stok Menu Section */}
            <section className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800">Stok Menu</h2>
              
              {/* Search and Filter */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari stok..."
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMenuFilter('all')}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                      menuFilter === 'all'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setMenuFilter('Makanan')}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                      menuFilter === 'Makanan'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Makanan
                  </button>
                  <button
                    onClick={() => setMenuFilter('Minuman')}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                      menuFilter === 'Minuman'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Minuman
                  </button>
                </div>
              </div>

              <button
                onClick={() => setModal({ type: 'add-menu' })}
                className="mb-4 flex items-center rounded-md bg-green-500 px-4 py-2 font-medium text-white transition hover:bg-green-600"
              >
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
                    {isLoading && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    )}
                    {!isLoading && filteredMenuList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">
                          Tidak ada data menu
                        </td>
                      </tr>
                    )}
                    {!isLoading && filteredMenuList.map((menu) => (
                      <tr key={menu.ID_Menu} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{menu.ID_Menu}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{menu.Nama_Menu}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{menu.Jumlah_Stok}</td>
                        <td className="flex items-center justify-end whitespace-nowrap px-6 py-4 text-sm font-medium">
                          <button 
                            onClick={() => setModal({ type: 'edit-menu', item: menu })}
                            className="text-teal-600 hover:text-teal-900"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => setModal({ type: 'delete-menu', item: menu })}
                            className="ml-2 text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button 
                            onClick={() => setModal({ type: 'view-menu', item: menu })}
                            className="ml-2 text-blue-600 hover:text-blue-900"
                            title="View Detail"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Modals */}
      <StokFormModal
        isOpen={modal.type === 'add-stok' || modal.type === 'edit-stok'}
        onClose={() => setModal({ type: 'none' })}
        onSubmit={handleStokSubmit}
        defaultValues={modal.type === 'edit-stok' ? modal.item : undefined}
        isSubmitting={isSubmitting}
      />
      
      <MenuFormModal
        isOpen={modal.type === 'add-menu' || modal.type === 'edit-menu'}
        onClose={() => setModal({ type: 'none' })}
        onSubmit={handleMenuSubmit}
        defaultValues={modal.type === 'edit-menu' ? modal.item : undefined}
        isSubmitting={isSubmitting}
      />

      <MenuDetailModal
        isOpen={modal.type === 'view-menu'}
        onClose={() => setModal({ type: 'none' })}
        menu={modal.type === 'view-menu' ? modal.item : null}
      />

      <DeleteConfirmModal
        isOpen={modal.type === 'delete-stok' || modal.type === 'delete-menu'}
        onClose={() => setModal({ type: 'none' })}
        onConfirm={modal.type === 'delete-stok' ? handleDeleteStok : handleDeleteMenu}
        itemName={
          modal.type === 'delete-stok' 
            ? modal.item.Nama_Stok 
            : (modal.type === 'delete-menu' ? modal.item.Nama_Menu : '')
        }
        isDeleting={isSubmitting}
      />

      <TransactionUploadModal
        isOpen={modal.type === 'upload-transaction'}
        onClose={() => setModal({ type: 'none' })}
        onSuccess={handleTransactionUploadSuccess}
      />
    </>
  );
}