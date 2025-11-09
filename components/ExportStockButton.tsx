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
      const response = await fetch('/api/stok/export', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Export failed');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `Sidaya_DataStok_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Data berhasil diexport!');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Gagal mengexport data: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 rounded-md bg-green-600 px-6 py-3 font-medium text-white shadow-lg transition hover:bg-green-700 disabled:bg-green-400"
    >
      {isExporting ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download size={20} />
          Export Data Stok
        </>
      )}
    </button>
  );
}