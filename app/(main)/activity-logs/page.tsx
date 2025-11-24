// app/(main)/activity-logs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, FileDown, FileUp, CheckCircle, XCircle, Calendar, User, AlertCircle, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Define types locally to avoid import issues
type ActivityLogWithUser = {
  ID_Log: string;
  userId: string;
  Activity_Type: 'EXPORT' | 'UPLOAD';
  Action_Details?: string | null;
  Timestamp: string;
  Status: 'SUCCESS' | 'FAILED';
  File_Name?: string | null;
  Records_Processed: number;
  Records_Success: number;
  Records_Failed: number;
  Error_Message?: string | null;
  IP_Address?: string | null;
  User_Agent?: string | null;
  User_Name?: string | null;
  User_Email?: string | null;
};

type FilterType = 'all' | 'EXPORT' | 'UPLOAD';
type StatusFilter = 'all' | 'SUCCESS' | 'FAILED';

export default function ActivityLogsPage() {
  const router = useRouter();
  
  const [logs, setLogs] = useState<ActivityLogWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<ActivityLogWithUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const logsPerPage = 20;

  useEffect(() => {
    fetchLogs();
  }, [typeFilter, statusFilter, currentPage]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', logsPerPage.toString());
      params.append('offset', ((currentPage - 1) * logsPerPage).toString());

      const res = await fetch(`/api/activity-logs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      
      const data = await res.json();
      setLogs(data.logs || []);
      setTotalLogs(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Gagal memuat riwayat aktivitas');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.File_Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ID_Log.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.User_Name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getActivityIcon = (type: string) => {
    return type === 'EXPORT' ? (
      <FileDown size={20} className="text-blue-600" />
    ) : (
      <FileUp size={20} className="text-green-600" />
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'SUCCESS') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
          <CheckCircle size={14} />
          Berhasil
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
        <XCircle size={14} />
        Gagal
      </span>
    );
  };

  const totalPages = Math.ceil(totalLogs / logsPerPage);

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto p-6">
          {/* Header and Back Button */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Riwayat Aktivitas</h1>
              <p className="text-gray-600">Log upload dan export data sistem</p>
            </div>
            <button
              onClick={() => router.push('/stok')}
              className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-gray-700 shadow-md transition hover:bg-gray-50"
              title="Kembali ke Kelola Stok"
            >
              <ArrowLeft size={20} />
              Kembali
            </button>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan file, ID, atau user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              {/* Type Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setTypeFilter('all'); setCurrentPage(1); }}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                    typeFilter === 'all'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => { setTypeFilter('EXPORT'); setCurrentPage(1); }}
                  className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                    typeFilter === 'EXPORT'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileDown size={16} />
                  Export
                </button>
                <button
                  onClick={() => { setTypeFilter('UPLOAD'); setCurrentPage(1); }}
                  className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                    typeFilter === 'UPLOAD'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileUp size={16} />
                  Upload
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                    statusFilter === 'all'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semua Status
                </button>
                <button
                  onClick={() => { setStatusFilter('SUCCESS'); setCurrentPage(1); }}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                    statusFilter === 'SUCCESS'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Berhasil
                </button>
                <button
                  onClick={() => { setStatusFilter('FAILED'); setCurrentPage(1); }}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                    statusFilter === 'FAILED'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Gagal
                </button>
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="rounded-lg bg-white shadow-md">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Waktu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Tipe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Records
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoading && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  )}
                  {!isLoading && filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        Tidak ada data aktivitas
                      </td>
                    </tr>
                  )}
                  {!isLoading && filteredLogs.map((log) => (
                    <tr key={log.ID_Log} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar size={16} className="text-gray-400" />
                          {formatDate(log.Timestamp)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getActivityIcon(log.Activity_Type)}
                          <span className="text-sm font-medium text-gray-900">
                            {log.Activity_Type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{log.File_Name || '-'}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.User_Name || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {log.User_Email || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">Total: {log.Records_Processed}</div>
                          {log.Activity_Type === 'UPLOAD' && (
                            <div className="text-xs text-gray-500">
                              ✓ {log.Records_Success} | ✗ {log.Records_Failed}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getStatusBadge(log.Status)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <AlertCircle size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
                <div className="text-sm text-gray-700">
                  Menampilkan {((currentPage - 1) * logsPerPage) + 1} - {Math.min(currentPage * logsPerPage, totalLogs)} dari {totalLogs} aktivitas
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="flex items-center px-4 text-sm text-gray-700">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
            
            <h3 className="mb-6 text-xl font-semibold">Detail Aktivitas</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID Log</label>
                  <p className="mt-1 text-gray-900">{selectedLog.ID_Log}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1">{getStatusBadge(selectedLog.Status)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipe Aktivitas</label>
                  <div className="mt-1 flex items-center gap-2">
                    {getActivityIcon(selectedLog.Activity_Type)}
                    <span className="text-gray-900">{selectedLog.Activity_Type}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Waktu</label>
                  <p className="mt-1 text-gray-900">{formatDate(selectedLog.Timestamp)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nama File</label>
                <p className="mt-1 text-gray-900">{selectedLog.File_Name || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">User</label>
                <p className="mt-1 text-gray-900">
                  {selectedLog.User_Name || 'Unknown'} ({selectedLog.User_Email || '-'})
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Records</label>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{selectedLog.Records_Processed}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Berhasil</label>
                  <p className="mt-1 text-2xl font-bold text-green-600">{selectedLog.Records_Success}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gagal</label>
                  <p className="mt-1 text-2xl font-bold text-red-600">{selectedLog.Records_Failed}</p>
                </div>
              </div>

              {selectedLog.Error_Message && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Error Message</label>
                  <p className="mt-1 rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {selectedLog.Error_Message}
                  </p>
                </div>
              )}

              {selectedLog.Action_Details && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Detail Aksi</label>
                  <pre className="mt-1 overflow-x-auto rounded-md bg-gray-50 p-3 text-xs text-gray-800">
                    {JSON.stringify(JSON.parse(selectedLog.Action_Details), null, 2)}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <label className="block font-medium">IP Address</label>
                  <p className="mt-1">{selectedLog.IP_Address || '-'}</p>
                </div>
                <div>
                  <label className="block font-medium">User Agent</label>
                  <p className="mt-1 truncate" title={selectedLog.User_Agent || '-'}>
                    {selectedLog.User_Agent || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t pt-4">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}