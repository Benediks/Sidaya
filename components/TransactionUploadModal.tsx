// components/TransactionUploadModal.tsx
'use client';

import { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2, Download } from 'lucide-react';

type UploadResult = {
  id: string;
  success: boolean;
  menu?: string;
  message: string;
};

type UploadResponse = {
  message: string;
  summary: {
    total: number;
    success: number;
    failed: number;
  };
  results: UploadResult[];
};

type TransactionUploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function TransactionUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: TransactionUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);

  const handleClose = () => {
    setFile(null);
    setUploadResult(null);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
        setFile(droppedFile);
        setUploadResult(null);
      } else {
        alert('Please upload an Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/transactions/upload', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setUploadResult(data);
      
      if (data.summary.success > 0) {
        onSuccess();
      }
    } catch (error: any) {
      alert(`Upload error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    window.open('/template/transaction-template.html', '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="relative w-full max-w-4xl rounded-lg bg-white shadow-xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          disabled={isUploading}
        >
          <X size={24} />
        </button>

        <div className="p-6">
          <h3 className="mb-6 text-2xl font-semibold text-gray-800">
            Upload Transaksi Penjualan
          </h3>

          {/* Download Template Section */}
          <div className="mb-6 rounded-lg bg-blue-50 p-4 border border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-2">
                  📋 Belum punya template?
                </h4>
                <p className="text-sm text-blue-700">
                  Download template Excel terlebih dahulu untuk format yang sesuai
                </p>
              </div>
              <button
                onClick={downloadTemplate}
                className="ml-4 flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Download size={16} />
                Download Template
              </button>
            </div>
          </div>

          {/* Upload Area */}
          {!uploadResult && (
            <>
              <div
                className={`relative mb-6 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  disabled={isUploading}
                />
                
                <div className="pointer-events-none">
                  {file ? (
                    <>
                      <FileSpreadsheet size={48} className="mx-auto mb-4 text-green-600" />
                      <p className="mb-2 text-lg font-medium text-gray-700">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="mb-2 text-lg font-medium text-gray-700">
                        Drag & drop file Excel di sini
                      </p>
                      <p className="text-sm text-gray-500">
                        atau klik untuk memilih file (.xlsx, .xls)
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="mb-6 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-2">
                  ⚠️ Penting:
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-800">
                  <li>Pastikan nama menu dalam Excel sesuai dengan database</li>
                  <li>Format tanggal harus YYYY-MM-DD (contoh: 2025-11-09)</li>
                  <li>Sistem akan otomatis mengurangi stok bahan</li>
                  <li>Transaksi akan dibatalkan jika stok tidak mencukupi</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  disabled={isUploading}
                >
                  Batal
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="flex items-center gap-2 rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload & Proses
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Upload Results */}
          {uploadResult && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-blue-50 p-4 text-center border border-blue-200">
                  <p className="text-3xl font-bold text-blue-700">
                    {uploadResult.summary.total}
                  </p>
                  <p className="text-sm text-blue-600">Total Transaksi</p>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center border border-green-200">
                  <p className="text-3xl font-bold text-green-700">
                    {uploadResult.summary.success}
                  </p>
                  <p className="text-sm text-green-600">Berhasil</p>
                </div>
                <div className="rounded-lg bg-red-50 p-4 text-center border border-red-200">
                  <p className="text-3xl font-bold text-red-700">
                    {uploadResult.summary.failed}
                  </p>
                  <p className="text-sm text-red-600">Gagal</p>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="max-h-96 overflow-y-auto rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Menu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {uploadResult.results.map((result, index) => (
                      <tr key={index} className={result.success ? '' : 'bg-red-50'}>
                        <td className="whitespace-nowrap px-6 py-4">
                          {result.success ? (
                            <CheckCircle size={20} className="text-green-600" />
                          ) : (
                            <XCircle size={20} className="text-red-600" />
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {result.id}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {result.menu || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {result.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleClose}
                  className="rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Selesai
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}