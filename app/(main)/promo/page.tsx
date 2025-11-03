import { Plus, Edit, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';

export default function KelolaPromoPage() {
  const currentMonth = 'October 2025'; // Nanti bisa dinamis
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const calendarDays = [
    null, null, null, null, null, 1, 2, // Dummy days, adjust as needed
    3, 4, 5, 6, 7, 8, 9,
    10, 11, 12, 13, 14, 15, 16,
    17, 18, 19, 20, 21, 22, 23,
    24, 25, 26, 27, 28, 29, 30, 31
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto p-6">
        {/* Dashboard Promo */}
        <section className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">Dashboard Promo</h2>
            <button className="flex items-center rounded-md bg-green-500 px-4 py-2 font-medium text-white transition hover:bg-green-600">
              <Plus size={20} className="mr-2" /> Tambah Promo
            </button>
          </div>

          {/* Promo List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-4">
              <span className="font-medium text-gray-700">Diskon Kemerdekaan</span>
              <div className="flex items-center space-x-2">
                <CheckSquare size={18} className="text-teal-600" />
                <button className="text-blue-600 hover:underline">Detail</button>
                <button className="text-teal-600 hover:text-teal-900">
                  <Edit size={18} />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-4">
              <span className="font-medium text-gray-700">Diskon Sidaya Anniversary</span>
              <div className="flex items-center space-x-2">
                <CheckSquare size={18} className="text-teal-600" />
                <button className="text-blue-600 hover:underline">Detail</button>
                <button className="text-teal-600 hover:text-teal-900">
                  <Edit size={18} />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
             {/* Scrollbar kanan jika list terlalu panjang */}
             <div className="absolute right-0 top-0 h-full w-2 bg-gray-200">
                <div className="h-1/3 w-full rounded-full bg-teal-500"></div>
              </div>
          </div>
        </section>

        {/* Calendar Section */}
        <section className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">Calendar</h2>
            <div className="flex items-center space-x-4">
              <button className="rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300">
                <ChevronLeft size={20} />
              </button>
              <span className="text-lg font-medium text-gray-800">{currentMonth}</span>
              <button className="rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px rounded-md border border-gray-200 bg-gray-100">
            {/* Days of Week */}
            {daysOfWeek.map((day) => (
              <div key={day} className="bg-gray-200 p-3 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`relative h-28 border border-gray-200 bg-white p-2 text-right text-sm ${
                  day === null ? 'bg-gray-50 text-gray-400' : 'text-gray-800'
                }`}
              >
                {day}
                {day === 1 && (
                  <div className="absolute left-2 top-2 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800">
                    Diskon Kemerdekaan
                  </div>
                )}
                 {day === 8 && (
                  <div className="absolute left-2 top-2 rounded-md bg-green-100 px-2 py-1 text-xs text-green-800">
                    Diskon Sidaya Anniversary
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}