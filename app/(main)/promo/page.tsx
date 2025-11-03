'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Promo } from '@/lib/types';
import PromoFormModal from '@/components/PromoFormModal';
import PromoDetailModal from '@/components/PromoDetailModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { Toaster, toast } from 'react-hot-toast';

type ModalState =
  | { type: 'none' }
  | { type: 'add' }
  | { type: 'edit'; item: Promo & { menuItems?: any[] } }
  | { type: 'delete'; item: Promo }
  | { type: 'detail'; item: Promo };

export default function KelolaPromoPage() {
  const [promos, setPromos] = useState<(Promo & { menu_count: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  // For the 'edit' modal, we need to fetch the full promo details (with menu items)
  const fetchPromoDetails = async (id: string): Promise<(Promo & { menuItems?: any[] }) | undefined> => {
    try {
      const res = await fetch(`/api/promo/${id}`);
      if (!res.ok) throw new Error('Failed to fetch promo details');
      return await res.json();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openEditModal = async (promo: Promo) => {
    setIsSubmitting(true); // Use as loading indicator
    const promoDetails = await fetchPromoDetails(promo.ID_Promo);
    if (promoDetails) {
      setModal({ type: 'edit', item: promoDetails });
    }
    setIsSubmitting(false);
  };

  // --- Calendar Functions ---
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    let startDayOfWeek = firstDay.getDay();
    // Convert to Monday-based (0 = Monday, 6 = Sunday)
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    const daysInMonth = lastDay.getDate();
    
    // Create array with null for empty cells before month starts
    const days: (number | null)[] = Array(startDayOfWeek).fill(null);
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  // Check if a promo is active on a specific date
  const getPromosForDate = (date: Date): (Promo & { menu_count: string })[] => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return promos.filter(promo => {
      const startDate = new Date(promo.Tanggal_Mulai);
      const endDate = new Date(promo.Tanggal_Selesai);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      
      return targetDate >= startDate && targetDate <= endDate;
    });
  };

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Format month and year for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  // --- End Calendar Functions ---

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const calendarDays = generateCalendarDays(currentDate);

  const fetchPromos = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/promo');
      if (!res.ok) throw new Error('Failed to fetch promos');
      const data = await res.json();
      setPromos(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    const isEditing = modal.type === 'edit';
    const url = isEditing ? `/api/promo/${(modal as any).item.ID_Promo}` : '/api/promo';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal menyimpan promo');
      }

      toast.success(isEditing ? 'Promo berhasil diubah!' : 'Promo berhasil ditambahkan!');
      setModal({ type: 'none' });
      fetchPromos();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (modal.type !== 'delete') return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/promo/${modal.item.ID_Promo}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus promo');

      toast.success('Promo berhasil dihapus!');
      setModal({ type: 'none' });
      fetchPromos();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto p-6">
          {/* Dashboard Promo */}
          <section className="mb-6 rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">Dashboard Promo</h2>
              <button
                onClick={() => setModal({ type: 'add' })}
                className="flex items-center rounded-md bg-green-500 px-4 py-2 font-medium text-white transition hover:bg-green-600"
              >
                <Plus size={20} className="mr-2" /> Tambah Promo
              </button>
            </div>

            {/* Promo List */}
            <div className="space-y-3">
              {isLoading && <p>Loading promos...</p>}
              {!isLoading && promos.map((promo) => (
                <div key={promo.ID_Promo} className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-4">
                  <div>
                    <span className="font-medium text-gray-700">{promo.Nama_Promo}</span>
                    <span className="ml-3 text-xs text-gray-500">
                      ({new Date(promo.Tanggal_Mulai).toLocaleDateString('id-ID')} - {new Date(promo.Tanggal_Selesai).toLocaleDateString('id-ID')})
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                      {promo.menu_count} Menu
                    </span>
                    <button 
                      onClick={() => setModal({ type: 'detail', item: promo })}
                      className="text-blue-600 hover:text-blue-900"
                      title="Detail"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => openEditModal(promo)} 
                      className="text-teal-600 hover:text-teal-900"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => setModal({ type: 'delete', item: promo })} 
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Functional Calendar Section */}
          <section className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">Calendar</h2>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={previousMonth}
                  className="rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-lg font-medium text-gray-800">{formatMonthYear(currentDate)}</span>
                <button 
                  onClick={nextMonth}
                  className="rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px rounded-md border border-gray-200 bg-gray-100">
              {daysOfWeek.map((day) => (
                <div key={day} className="bg-gray-200 p-3 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => {
                const isEmptyCell = day === null;
                const cellDate = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
                const promosForDay = cellDate ? getPromosForDate(cellDate) : [];
                
                return (
                  <div
                    key={index}
                    className={`relative h-28 border border-gray-200 p-2 text-right text-sm ${
                      isEmptyCell ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-800'
                    }`}
                  >
                    <div className="font-medium">{day}</div>
                    
                    {/* Promo stamps */}
                    {promosForDay.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {promosForDay.map((promo) => (
                          <div
                            key={promo.ID_Promo}
                            className="rounded-md bg-teal-100 px-2 py-1 text-left text-xs font-medium text-teal-700 truncate"
                            title={promo.Nama_Promo}
                          >
                            • {promo.Nama_Promo}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {/* --- Modals --- */}
      <PromoFormModal
        isOpen={modal.type === 'add' || modal.type === 'edit'}
        onClose={() => setModal({ type: 'none' })}
        onSubmit={handleSubmit}
        defaultPromo={modal.type === 'edit' ? modal.item : undefined}
        isSubmitting={isSubmitting}
      />

      <PromoDetailModal
        isOpen={modal.type === 'detail'}
        onClose={() => setModal({ type: 'none' })}
        promo={modal.type === 'detail' ? modal.item : null}
      />

      <DeleteConfirmModal
        isOpen={modal.type === 'delete'}
        onClose={() => setModal({ type: 'none' })}
        onConfirm={handleDelete}
        itemName={modal.type === 'delete' ? modal.item.Nama_Promo : ''}
        isDeleting={isSubmitting}
      />
    </>
  );
}