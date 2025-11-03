'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PromoSchema } from '@/lib/schemas';
import { Promo, Menu } from '@/lib/types';
import { z } from 'zod';
import { Plus, Trash2, X } from 'lucide-react';

type PromoFormData = z.infer<typeof PromoSchema>;

type PromoFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PromoFormData) => void;
  defaultPromo?: Promo & { menuItems?: any[] };
  isSubmitting: boolean;
};

export default function PromoFormModal({
  isOpen,
  onClose,
  onSubmit,
  defaultPromo,
  isSubmitting,
}: PromoFormModalProps) {
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [menuToAdd, setMenuToAdd] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm({
    resolver: zodResolver(PromoSchema),
    defaultValues: {
      Nama_Promo: '',
      Deskripsi: '',
      Tanggal_Mulai: '',
      Tanggal_Selesai: '',
      menuItems: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'menuItems',
  });

  // Fetch all available menus for the dropdown
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch('/api/menu');
        if (!res.ok) throw new Error('Failed to fetch menus');
        const data = await res.json();
        setAllMenus(data);
        if (data.length > 0) {
          setMenuToAdd(data[0].ID_Menu);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchMenus();
  }, []);

  // Set form data when defaultPromo (for editing) is loaded
  useEffect(() => {
    if (isOpen) {
      if (defaultPromo) {
        reset({
          Nama_Promo: defaultPromo.Nama_Promo,
          Deskripsi: defaultPromo.Deskripsi || '',
          Tanggal_Mulai: new Date(defaultPromo.Tanggal_Mulai).toISOString().split('T')[0],
          Tanggal_Selesai: new Date(defaultPromo.Tanggal_Selesai).toISOString().split('T')[0],
          menuItems: defaultPromo.menuItems || [],
        });
      } else {
        reset({
          Nama_Promo: '',
          Deskripsi: '',
          Tanggal_Mulai: '',
          Tanggal_Selesai: '',
          menuItems: [],
        });
      }
    }
  }, [isOpen, defaultPromo, reset]);


  const handleClose = () => {
    reset();
    onClose();
  };

  const addMenuItem = () => {
    if (!menuToAdd) return;
    const menu = allMenus.find((m) => m.ID_Menu === menuToAdd);
    if (!menu) return;
    if (fields.some((field) => field.ID_Menu === menu.ID_Menu)) return;

    append({
      ID_Menu: menu.ID_Menu,
      Nama_Menu: menu.Nama_Menu,
      Harga: menu.Harga,
      diskon_persen: 0,
    });
    setMenuToAdd(allMenus[0]?.ID_Menu || '');
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
          {defaultPromo ? 'Ubah Promo' : 'Tambah Promo'}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[80vh] overflow-y-auto pr-2">
          {/* Basic Promo Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Promo</label>
              <input
                {...register('Nama_Promo')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              {errors.Nama_Promo && <p className="text-sm text-red-600">{errors.Nama_Promo.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
              <textarea
                {...register('Deskripsi')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Jadwal Mulai</label>
                <input
                  type="date"
                  {...register('Tanggal_Mulai')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.Tanggal_Mulai && <p className="text-sm text-red-600">{errors.Tanggal_Mulai.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Jadwal Selesai</label>
                <input
                  type="date"
                  {...register('Tanggal_Selesai')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.Tanggal_Selesai && <p className="text-sm text-red-600">{errors.Tanggal_Selesai.message}</p>}
              </div>
            </div>
          </div>

          {/* Menu Diskon Section */}
          <div className="mt-6 border-t pt-6">
            <h4 className="text-lg font-medium text-gray-800">Masukkan Menu Diskon</h4>
            <div className="my-4 flex items-center space-x-2">
              <select
                value={menuToAdd}
                onChange={(e) => setMenuToAdd(e.target.value)}
                className="block w-full flex-grow rounded-md border-gray-300 shadow-sm"
              >
                <option value="">Pilih menu...</option>
                {allMenus.map((menu) => (
                  <option key={menu.ID_Menu} value={menu.ID_Menu}>
                    {menu.Nama_Menu} (Rp {menu.Harga})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addMenuItem}
                className="flex-shrink-0 rounded-md bg-green-500 p-2 text-white hover:bg-green-600"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* List of Added Menus */}
            <div className="space-y-2">
              {fields.map((field, index) => {
                const harga = field.Harga || 0;
                const diskon = Number(watch(`menuItems.${index}.diskon_persen`)) || 0;
                const hargaDiskon = harga - harga * (diskon / 100);

                return (
                  <div key={field.id} className="grid grid-cols-5 items-center gap-2 rounded-md border p-2">
                    <div className="col-span-2">
                      <span className="font-medium">{field.Nama_Menu}</span>
                      <span className="block text-xs text-gray-500">
                        Rp {new Intl.NumberFormat('id-ID').format(harga)}
                      </span>
                    </div>
                    <div>
                      <label className="text-xs">Diskon (%)</label>
                      <input
                        type="number"
                        {...register(`menuItems.${index}.diskon_persen`, { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 p-1 text-sm shadow-sm"
                      />
                      {errors.menuItems?.[index]?.diskon_persen && (
                        <p className="text-sm text-red-600">{errors.menuItems?.[index]?.diskon_persen?.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs">Harga Diskon</label>
                      <input
                        type="text"
                        readOnly
                        value={`Rp ${new Intl.NumberFormat('id-ID').format(hargaDiskon)}`}
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 p-1 text-sm shadow-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Promo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}