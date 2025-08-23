import { Suspense } from 'react';
import { EmployeesList } from '@/components/employees/employees-list';
import { EmployeesSkeleton } from '@/components/employees/employees-skeleton';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employees - Employee Scheduler',
  description: 'Manage your employee database and information',
};

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<EmployeesSkeleton />}>
        <EmployeesList />
      </Suspense>
    </div>
  );
} 