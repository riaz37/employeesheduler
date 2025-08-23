import { Suspense } from 'react';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { DashboardActivity } from '@/components/dashboard/dashboard-activity';
import { DashboardShifts } from '@/components/dashboard/dashboard-shifts';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Employee Scheduler',
  description: 'Overview of your employee scheduling system',
};

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your employee scheduling system</p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardActivity />
        </Suspense>
        
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardShifts />
        </Suspense>
      </div>
    </div>
  );
} 