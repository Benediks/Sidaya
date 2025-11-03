// components/MenuFormModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MenuSchema } from '@/lib/schemas';
import { Menu, Stok } from '@/lib/types';
import { z } from 'zod';
import { X } from 'lucide-react';

type MenuFormData = z.infer<typeof MenuSchema>;

type MenuFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MenuFormData & { ingredients: { ID_Stok: string; jumlah: number }[] }) => void;
  defaultValues?: Menu;
  isSubmitting: boolean;
};

export default function MenuFormModal({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isSubmitting,
}: MenuFormModalProps) {
  const [allStok, setAllStok] = useState<Stok[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<{ [key: string]: number }>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(MenuSchema),
    defaultValues: {
      Nama_Menu: '',
      Kategori_Menu: 'Makanan',
      Jumlah_Stok: 0,
      Harga: 0,
    },
  });

  // Fetch all available stock items
  useEffect(() => {
    const fetchStok = async () => {
      try {
        const res = await fetch('/api/stok');
        if (!res.ok) throw new Error('Failed to fetch stok');
        const data = await res.json();
        setAllStok(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStok();
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (defaultValues) {
        reset({
          Nama_Menu: defaultValues.Nama_Menu,
          Kategori_Menu: defaultValues.Kategori_Menu,
          Jumlah_Stok: defaultValues.Jumlah_Stok,
          Harga: defaultValues.Harga,
        });
      } else {
        reset({
          Nama_Menu: '',
          Kategori_Menu: 'Makanan',
          Jumlah_Stok: 0,
          Harga: 0,
        });
        setSelectedIngredients({});
      }
    }
  }, [isOpen, defaultValues, reset]);

  const handleClose = () => {
    reset();
    setSelectedIngredients({});
    onClose();
  };

  const handleIngredientToggle = (stokId: string) => {
    setSelectedIngredients((prev) => {
      const newState = { ...prev };
      if (newState[stokId]) {
        delete newState[stokId];
      } else {
        newState[stokId] = 1;
      }
      return newState;
    });
  };

  const handleIngredientQuantityChange = (stokId: string, quantity: number) => {
    setSelectedIngredients((prev) => ({
      ...prev,
      [stokId]: quantity,
    }));
  };

  const handleFormSubmit = (data: MenuFormData) => {
    const ingredients = Object.entries(selectedIngredients).map(([ID_Stok, jumlah]) => ({
      ID_Stok,
      jumlah,
    }));

    onSubmit({ ...data, ingredients });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="relative w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        <h3 className="mb-6 text-xl font-semibold">
          {defaultValues ? 'Ubah Menu' : 'Tambah Stok Menu'}
        </h3>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="max-h-[80vh] overflow-y-auto pr-2">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Stok Menu</label>
              <input
                {...register('Nama_Menu')}
                placeholder="Kopi Manis"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
              />
              {errors.Nama_Menu && <p className="text-sm text-red-600">{errors.Nama_Menu.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                <select
                  {...register('Kategori_Menu')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                >
                  <option>Makanan</option>
                  <option>Minuman</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Harga Satuan (Rp)</label>
                <input
                  type="number"
                  {...register('Harga', { valueAsNumber: true })}
                  placeholder="12000"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                />
                {errors.Harga && <p className="text-sm text-red-600">{errors.Harga.message}</p>}
              </div>
            </div>
          </div>

          {/* Stock Selection */}
          <div className="mt-6 border-t pt-6">
            <h4 className="mb-4 text-lg font-medium text-gray-800">Stok Bahan Yang Dibutuhkan</h4>
            <div className="mb-4">
              <input
                type="text"
                placeholder="🔍 Cari stok..."
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
              />
            </div>
            <div className="max-h-60 overflow-y-auto rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Nama</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Satuan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Jumlah Tersedia</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Masukkan Jumlah</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {allStok.map((stok) => (
                    <tr key={stok.ID_Stok}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{stok.Nama_Stok}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{stok.Satuan}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{stok.Jumlah}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={selectedIngredients[stok.ID_Stok] || ''}
                          onChange={(e) => handleIngredientQuantityChange(stok.ID_Stok, Number(e.target.value))}
                          className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                          placeholder="1"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={!!selectedIngredients[stok.ID_Stok]}
                          onChange={() => handleIngredientToggle(stok.ID_Stok)}
                          className="h-4 w-4 rounded border-gray-300 text-green-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-3 border-t pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-green-400"
            >
              {isSubmitting ? 'Menyimpan...' : 'Konfirmasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}