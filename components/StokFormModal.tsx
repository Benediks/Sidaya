'use client';

import { Stok } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { StokSchema } from '@/lib/db';
import { useEffect } from 'react';

// This type is still correct and needed
type StokFormData = z.infer<typeof StokSchema>;

type StokFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StokFormData) => void; // This prop type is also correct
  defaultValues?: Stok;
  isSubmitting: boolean;
};

export default function StokFormModal({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isSubmitting,
}: StokFormModalProps) {
  
  // --- THIS IS THE FIX for handleSubmit error ---
  // We remove `<StokFormData>` from useForm()
  // The resolver will automatically infer the type for useForm.
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ // NO <StokFormData> generic here
    resolver: zodResolver(StokSchema),
  });
  // --- END OF FIX ---


  // This useEffect is still correct and should be kept.
  useEffect(() => {
    if (isOpen) {
      if (defaultValues) {
        // If editing, map only the fields from the schema
        reset({
          Nama_Stok: defaultValues.Nama_Stok,
          Kategori_Stok: defaultValues.Kategori_Stok,
          Jumlah: defaultValues.Jumlah,
          Satuan: defaultValues.Satuan,
          Harga_Beli: defaultValues.Harga_Beli,
        });
      } else {
        // If adding, reset to empty/default values
        reset({
          Nama_Stok: '',
          Kategori_Stok: 'Stok Bahan',
          Jumlah: 0,
          Satuan: 'Pcs',
          Harga_Beli: 0,
        });
      }
    }
  }, [isOpen, defaultValues, reset]);

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-6 text-xl font-semibold">
          {defaultValues ? 'Ubah Stok' : 'Tambah Stok'}
        </h3>
        {/* This handleSubmit(onSubmit) will no longer have an error */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nama Stok</label>
              <input
                {...register('Nama_Stok')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              {errors.Nama_Stok && <p className="text-sm text-red-600">{errors.Nama_Stok.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kategori</label>
              <select {...register('Kategori_Stok')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option>Stok Bahan</option>
                <option>Stok Barang</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Satuan</label>
              <select {...register('Satuan')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option>Pcs</option>
                <option>ml</option>
                <option>gram</option>
                <option>liter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah</label>
              <input
                type="number"
                // --- THIS IS THE FIX for the resolver error ---
                {...register('Jumlah', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              {errors.Jumlah && <p className="text-sm text-red-600">{errors.Jumlah.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Harga Beli (Rp)</label>
              <input
                type="number"
                // --- THIS IS THE FIX for the resolver error ---
                {...register('Harga_Beli', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              {errors.Harga_Beli && <p className="text-sm text-red-600">{errors.Harga_Beli.message}</p>}
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

