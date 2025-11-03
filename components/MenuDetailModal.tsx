'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Menu } from '@/lib/types';

type MenuIngredient = {
  ID_Stok: string;
  Nama_Stok: string;
  Satuan: string;
  Jumlah_Tersedia: number;
  Jumlah_Dibutuhkan: number;
};

type MenuDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  menu: Menu | null;
};

export default function MenuDetailModal({ isOpen, onClose, menu }: MenuDetailModalProps) {
  const [ingredients, setIngredients] = useState<MenuIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && menu) {
      fetchMenuDetails();
    }
  }, [isOpen, menu]);

  const fetchMenuDetails = async () => {
    if (!menu) return;
    
    setIsLoading(true);
    try {
      // Fetch menu details with ingredients
      const res = await fetch(`/api/menu/${menu.ID_Menu}/details`);
      if (!res.ok) throw new Error('Failed to fetch menu details');
      const data = await res.json();
      setIngredients(data.ingredients || []);
    } catch (error) {
      console.error('Error fetching menu details:', error);
      setIngredients([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !menu) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="relative w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        
        <h3 className="mb-6 text-xl font-semibold">Detail Stok Menu</h3>
        
        <div className="space-y-4">
          {/* Menu Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Stok Menu</label>
              <p className="mt-1 text-gray-900">{menu.Nama_Menu}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah Stok Menu</label>
              <p className="mt-1 text-gray-900">{menu.Jumlah_Stok}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Kategori</label>
            <p className="mt-1 text-gray-900">{menu.Kategori_Menu}</p>
          </div>

          {/* Ingredients Table */}
          <div className="mt-6 border-t pt-6">
            <h4 className="mb-4 text-lg font-medium text-gray-800">Stok Bahan Yang Dibutuhkan</h4>
            
            {isLoading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Nama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Satuan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Jumlah Tersedia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Masukkan Jumlah
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {ingredients.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          Tidak ada bahan yang dibutuhkan
                        </td>
                      </tr>
                    ) : (
                      ingredients.map((ingredient) => (
                        <tr key={ingredient.ID_Stok}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {ingredient.Nama_Stok}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {ingredient.Satuan}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {ingredient.Jumlah_Tersedia}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {ingredient.Jumlah_Dibutuhkan}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Harga Satuan (Rp)</label>
            <p className="mt-1 text-gray-900">{new Intl.NumberFormat('id-ID').format(menu.Harga)}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-end border-t pt-6">
          <button
            onClick={onClose}
            className="rounded-md border border-transparent bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  );
}