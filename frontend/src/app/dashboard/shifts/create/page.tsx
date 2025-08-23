'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { CreateShiftForm } from '@/components/shifts/create-shift-form';

export default function CreateShiftPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/shifts');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Shift"
        description="Create a new shift with requirements, location, and scheduling details."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Shifts', href: '/dashboard/shifts' },
          { label: 'Create', href: '/dashboard/shifts/create' },
        ]}
      />
      
      <div className="max-w-4xl">
        <CreateShiftForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
} 