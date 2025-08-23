'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { CreateEmployeeForm } from '@/components/employees/create-employee-form';

export default function CreateEmployeePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/employees');
  };

  const handleCancel = () => {
    router.push('/dashboard/employees');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Employee"
        description="Add a new employee to the system with their details, skills, and preferences."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Employees', href: '/dashboard/employees' },
          { label: 'Create', href: '/dashboard/employees/create' },
        ]}
      />
      
      <div className="max-w-4xl">
        <CreateEmployeeForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
} 