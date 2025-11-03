'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Promo } from '@/lib/types';

type MenuDetail = {
  ID_Menu: string;
  Nama_Menu: string;
  Harga: number;
  diskon_persen: number;
};

type PromoDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  promo: Promo | null;
};

export default function PromoDetailModal({ isOpen, onClose, promo }: PromoDetailModalProps) {
  const [menuItems, setMenuItems] = useState<MenuDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && promo) {
      fetchPromoDetails();
    }
  }, [isOpen, promo]);

  const fetchPromoDetails = async () => {
    if (!promo) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/promo/${promo.ID_Promo}/details`);
      if (!res.ok) throw new Error('Failed to fetch promo details');
      const data = await res.json();
      setMenuItems(data.menuItems || []);
    } catch (error) {
      console.error('Error fetching promo details:', error);
      setMenuItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !promo) return null;

  const totalHarga = menuItems.reduce((total, item) => {
    const hargaSetelahDiskon = item.Harga - (item.Harga * item.diskon_persen / 100);
    return total + hargaSetelahDiskon;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="relative w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        
        <h3 className="mb-6 text-xl font-semibold">Detail Promo</h3>
        
        <div className="space-y-6">
          {/* Nama Promo */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Promo</label>
            <p className="mt-1 text-lg text-gray-900">{promo.Nama_Promo}</p>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
            <p className="mt-1 text-gray-900">{promo.Deskripsi || '-'}</p>
          </div>

          {/* Jadwal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Jadwal Mulai</label>
              <p className="mt-1 text-gray-900">
                {new Date(promo.Tanggal_Mulai).toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric'
                })}
                {' '}
                {new Date(promo.Tanggal_Mulai).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jadwal Selesai</label>
              <p className="mt-1 text-gray-900">
                {new Date(promo.Tanggal_Selesai).toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric'
                })}
                {' '}
                {new Date(promo.Tanggal_Selesai).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Menu diskon */}
          <div className="border-t pt-6">
            <h4 className="mb-4 text-lg font-medium text-gray-800">Menu diskon</h4>
            
            {isLoading ? (
              <p className="text-center py-4 text-gray-500">Loading...</p>
            ) : menuItems.length > 0 ? (
              <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Nama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Jumlah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Harga Slim
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Disc (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Harga Sesudah
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {menuItems.map((item, index) => {
                      const hargaSetelahDiskon = item.Harga - (item.Harga * item.diskon_persen / 100);
                      return (
                        <tr key={index}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {item.Nama_Menu}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            1
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {item.Harga.toLocaleString('id-ID')}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {item.diskon_persen}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {hargaSetelahDiskon.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {/* Total Harga Rp */}
                <div className="flex justify-between items-center border-t bg-gray-50 px-6 py-3">
                  <span className="text-sm font-medium text-gray-700">Total Harga Rp</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {totalHarga.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">Tidak ada menu dalam promo ini</p>
            )}
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