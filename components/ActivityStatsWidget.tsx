// components/ActivityStatsWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileDown, FileUp, TrendingUp, Activity } from 'lucide-react';

type ActivityStats = {
  totalActivities: number;
  totalExports: number;
  totalUploads: number;
  successRate: number;
  recentActivity: string;
};

export default function ActivityStatsWidget() {
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/activity-logs/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return null;
  }

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <div className="rounded-lg bg-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Aktivitas</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
          </div>
          <Activity className="h-10 w-10 text-purple-500" />
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Export</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalExports}</p>
          </div>
          <FileDown className="h-10 w-10 text-blue-500" />
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Upload</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUploads}</p>
          </div>
          <FileUp className="h-10 w-10 text-green-500" />
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
          </div>
          <TrendingUp className="h-10 w-10 text-emerald-500" />
        </div>
      </div>
    </div>
  );
}