// app/(main)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, ShoppingBag, TrendingUp, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

type DashboardData = {
  cards: {
    totalMenu: number;
    totalStok: number;
    bestSellingMenu: string;
  };
  charts: {
    monthlyRevenue: Array<{ month: string; revenue: number }>;
    topMenus: Array<{ name: string; sold: number }>;
  };
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Custom tooltip for revenue chart
  const RevenueTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-white p-3 shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{payload[0].payload.month}</p>
          <p className="text-sm text-teal-600">
            Rp {new Intl.NumberFormat('id-ID').format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for menu chart
  const MenuTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-white p-3 shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{payload[0].payload.name}</p>
          <p className="text-sm text-teal-600">
            Terjual: {payload[0].value} porsi
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto p-6">
          <h1 className="mb-6 text-3xl font-bold text-gray-800">Dashboard</h1>

          {/* Cards Section */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Card 1: Total Menu */}
            <div className="rounded-lg border-2 border-teal-500 bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Daftar Stok menu</h3>
                <Package className="h-8 w-8 text-teal-500" />
              </div>
              <p className="text-5xl font-bold text-gray-900">{data?.cards.totalMenu || 0}</p>
            </div>

            {/* Card 2: Total Stok Bahan */}
            <div className="rounded-lg border-2 border-teal-500 bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Daftar Stok Bahan</h3>
                <ShoppingBag className="h-8 w-8 text-teal-500" />
              </div>
              <p className="text-5xl font-bold text-gray-900">{data?.cards.totalStok || 0}</p>
            </div>

            {/* Card 3: Best Selling Menu */}
            <div className="rounded-lg border-2 border-teal-500 bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Penjualan Terbanyak</h3>
                <TrendingUp className="h-8 w-8 text-teal-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 truncate" title={data?.cards.bestSellingMenu}>
                {data?.cards.bestSellingMenu || 'N/A'}
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Chart 1: Monthly Revenue */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="mb-6 text-xl font-semibold text-gray-800">
                Pendapatan berdasarkan Total Transaksi
              </h3>
              <p className="mb-4 text-sm text-gray-600">6 Bulan terakhir</p>
              
              {data?.charts.monthlyRevenue && data.charts.monthlyRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data.charts.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#666' }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis 
                      tick={{ fill: '#666' }}
                      axisLine={{ stroke: '#e0e0e0' }}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }} />
                    <Bar 
                      dataKey="revenue" 
                      fill="#14b8a6" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[350px] items-center justify-center text-gray-500">
                  Tidak ada data transaksi
                </div>
              )}
            </div>

            {/* Chart 2: Top Selling Menus */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="mb-6 text-xl font-semibold text-gray-800">
                Menu dengan Penjualan Terbanyak
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                6 Menu Terbanyak berdasarkan seluruh Transaksi
              </p>
              
              {data?.charts.topMenus && data.charts.topMenus.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart 
                    data={data.charts.topMenus} 
                    layout="vertical"
                    margin={{ left: 20, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      type="number" 
                      tick={{ fill: '#666' }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fill: '#666', fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                      width={100}
                    />
                    <Tooltip content={<MenuTooltip />} cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }} />
                    <Bar 
                      dataKey="sold" 
                      fill="#14b8a6" 
                      radius={[0, 8, 8, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[350px] items-center justify-center text-gray-500">
                  Tidak ada data penjualan
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}