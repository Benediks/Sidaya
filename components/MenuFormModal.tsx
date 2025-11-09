// components/MenuFormModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MenuSchema } from '@/lib/schemas';
import { Menu, Stok } from '@/lib/types';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';

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
  const [isLoadingStok, setIsLoadingStok] = useState(false);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      setIsLoadingStok(true);
      try {
        const res = await fetch('/api/stok');
        if (!res.ok) throw new Error('Failed to fetch stok');
        const data = await res.json();
        setAllStok(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingStok(false);
      }
    };
    fetchStok();
  }, []);

  // Fetch existing ingredients when editing
  useEffect(() => {
    const fetchMenuDetails = async () => {
      if (!defaultValues?.ID_Menu) return;
      
      setIsLoadingIngredients(true);
      try {
        const res = await fetch(`/api/menu/${defaultValues.ID_Menu}/details`);
        if (!res.ok) throw new Error('Failed to fetch menu details');
        const data = await res.json();
        
        // Convert ingredients array to the selectedIngredients object format
        const ingredientsMap: { [key: string]: number } = {};
        data.ingredients.forEach((ing: any) => {
          ingredientsMap[ing.ID_Stok] = ing.Jumlah_Dibutuhkan;
        });
        
        setSelectedIngredients(ingredientsMap);
      } catch (error) {
        console.error('Error fetching menu ingredients:', error);
      } finally {
        setIsLoadingIngredients(false);
      }
    };

    if (isOpen && defaultValues) {
      fetchMenuDetails();
    }
  }, [isOpen, defaultValues]);

  // Reset form when modal opens/closes
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
      setSearchQuery('');
    }
  }, [isOpen, defaultValues, reset]);

  const handleClose = () => {
    reset();
    setSelectedIngredients({});
    setSearchQuery('');
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
    if (quantity <= 0) {
      // If quantity is 0 or negative, remove the ingredient
      setSelectedIngredients((prev) => {
        const newState = { ...prev };
        delete newState[stokId];
        return newState;
      });
    } else {
      setSelectedIngredients((prev) => ({
        ...prev,
        [stokId]: quantity,
      }));
    }
  };

  const handleFormSubmit = (data: MenuFormData) => {
    const ingredients = Object.entries(selectedIngredients).map(([ID_Stok, jumlah]) => ({
      ID_Stok,
      jumlah,
    }));

    onSubmit({ ...data, ingredients });
  };

  // Filter stock items based on search query
  const filteredStok = allStok.filter((stok) =>
    stok.Nama_Stok.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stok.ID_Stok.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="relative w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          disabled={isSubmitting}
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                disabled={isSubmitting}
              />
              {errors.Nama_Menu && <p className="text-sm text-red-600">{errors.Nama_Menu.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                <select
                  {...register('Kategori_Menu')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  disabled={isSubmitting}
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  disabled={isSubmitting}
                />
                {errors.Harga && <p className="text-sm text-red-600">{errors.Harga.message}</p>}
              </div>
            </div>
          </div>

          {/* Stock Selection */}
          <div className="mt-6 border-t pt-6">
            <h4 className="mb-4 text-lg font-medium text-gray-800">
              Stok Bahan Yang Dibutuhkan
              {isLoadingIngredients && (
                <span className="ml-2 text-sm text-gray-500">
                  <Loader2 className="inline h-4 w-4 animate-spin" /> Loading ingredients...
                </span>
              )}
            </h4>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="🔍 Cari stok..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                disabled={isSubmitting}
              />
            </div>

            {/* Selected Ingredients Summary */}
            {Object.keys(selectedIngredients).length > 0 && (
              <div className="mb-4 rounded-md bg-green-50 p-3">
                <p className="text-sm font-medium text-green-800">
                  {Object.keys(selectedIngredients).length} bahan dipilih
                </p>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto rounded-md border">
              {isLoadingStok ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                  <span className="ml-2 text-gray-500">Loading stock...</span>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Nama
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Satuan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Tersedia
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Jumlah
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">
                        Pilih
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredStok.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          {searchQuery ? 'Tidak ada stok yang cocok' : 'Tidak ada stok tersedia'}
                        </td>
                      </tr>
                    ) : (
                      filteredStok.map((stok) => (
                        <tr 
                          key={stok.ID_Stok}
                          className={`hover:bg-gray-50 ${selectedIngredients[stok.ID_Stok] ? 'bg-green-50' : ''}`}
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {stok.Nama_Stok}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {stok.Satuan}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {stok.Jumlah}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={selectedIngredients[stok.ID_Stok] || ''}
                              onChange={(e) => handleIngredientQuantityChange(stok.ID_Stok, Number(e.target.value))}
                              className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                              placeholder="0"
                              disabled={isSubmitting}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={!!selectedIngredients[stok.ID_Stok]}
                              onChange={() => handleIngredientToggle(stok.ID_Stok)}
                              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                              disabled={isSubmitting}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-3 border-t pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingIngredients}
              className="flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-green-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Konfirmasi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}