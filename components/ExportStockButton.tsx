// components/ExportStockButton.tsx
'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ExportStockButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/stok/export');
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Sidaya_DataStok_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Data berhasil di-export ke PDF!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 rounded-md bg-teal-600 px-6 py-3 font-medium text-white shadow-lg transition hover:bg-teal-700 disabled:bg-teal-400"
    >
      {isExporting ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          Mengexport...
        </>
      ) : (
        <>
          <Download size={20} />
          Export Data Stok (PDF)
        </>
      )}
    </button>
  );
}