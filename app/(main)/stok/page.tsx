'use client'; // <-- Make this a Client Component

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, View, Utensils, Coffee } from 'lucide-react';
import { Stok, Menu } from '@/lib/types';
import StokFormModal from '@/components/StokFormModal';
// import MenuFormModal from '@/components/MenuFormModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { Toaster, toast } from 'react-hot-toast';

// Define types for modal states
type ModalState =
  | { type: 'none' }
  | { type: 'add-stok' }
  | { type: 'edit-stok'; item: Stok }
  | { type: 'delete-stok'; item: Stok }
  | { type: 'add-menu' }
  | { type: 'edit-menu'; item: Menu }
  | { type: 'delete-menu'; item: Menu };

export default function KelolaStokPage() {
  const [stokList, setStokList] = useState<Stok[]>([]);
  const [menuList, setMenuList] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data Fetching
  const fetchStok = async () => {
    const res = await fetch('/api/stok');
    const data = await res.json();
    setStokList(data);
  };

  const fetchMenu = async () => {
    const res = await fetch('/api/menu');
    const data = await res.json();
    setMenuList(data);
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchStok(), fetchMenu()]).finally(() => setIsLoading(false));
  }, []);

  const refreshData = () => {
    fetchStok();
    fetchMenu();
  };

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

  // --- Menu Handlers (Placeholder) ---
  // You would create these just like the Stok Handlers
  const handleMenuSubmit = (data: any) => {
    console.log('Submitting menu', data);
    // ... logic for add/edit menu
  };

  const handleDeleteMenu = () => {
    if (modal.type !== 'delete-menu') return;
    console.log('Deleting menu', modal.item);
    // ... logic for delete menu
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            
            {/* Kelola Stok Section */}
            <section className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800">Kelola Stok</h2>
              {/* ... Search and Filter buttons ... */}
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
                    {isLoading && <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>}
                    {!isLoading && stokList.map((stok) => (
                      <tr key={stok.ID_Stok}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{stok.ID_Stok}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{stok.Nama_Stok}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{stok.Jumlah}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{stok.Satuan}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{stok.Harga_Beli}</td>
                        <td className="flex items-center justify-end whitespace-nowrap px-6 py-4 text-sm font-medium">
                          <button onClick={() => setModal({ type: 'edit-stok', item: stok })} className="text-teal-600 hover:text-teal-900">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => setModal({ type: 'delete-stok', item: stok })} className="ml-2 text-red-600 hover:text-red-900">
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
               {/* ... Search and Filter ... */}
                <button
                // onClick={() => setModal({ type: 'add-menu' })}
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
                     {isLoading && <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>}
                     {!isLoading && menuList.map((menu) => (
                       <tr key={menu.ID_Menu}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{menu.ID_Menu}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{menu.Nama_Menu}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{menu.Jumlah_Stok}</td>
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
                     ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* --- Modals --- */}
      <StokFormModal
        isOpen={modal.type === 'add-stok' || modal.type === 'edit-stok'}
        onClose={() => setModal({ type: 'none' })}
        onSubmit={handleStokSubmit}
        defaultValues={modal.type === 'edit-stok' ? modal.item : undefined}
        isSubmitting={isSubmitting}
      />
      
      {/* <MenuFormModal
        isOpen={modal.type === 'add-menu' || modal.type === 'edit-menu'}
        onClose={() => setModal({ type: 'none' })}
        onSubmit={handleMenuSubmit}
        defaultValues={modal.type === 'edit-menu' ? modal.item : undefined}
        isSubmitting={isSubmitting}
      /> 
      */}

      <DeleteConfirmModal
        isOpen={modal.type === 'delete-stok' || modal.type === 'delete-menu'}
        onClose={() => setModal({ type: 'none' })}
        onConfirm={modal.type === 'delete-stok' ? handleDeleteStok : handleDeleteMenu}
        itemName={modal.type === 'delete-stok' ? modal.item.Nama_Stok : (modal.type === 'delete-menu' ? modal.item.Nama_Menu : '')}
        isDeleting={isSubmitting}
      />
    </>
  );
}
