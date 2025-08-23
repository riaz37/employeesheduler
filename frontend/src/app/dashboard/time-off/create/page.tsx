'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { CreateTimeOffForm } from '@/components/time-off/create-time-off-form';

export default function CreateTimeOffPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/time-off');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Time-off Request"
        description="Submit a new time-off request with details about dates, coverage, and reason."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Time Off', href: '/dashboard/time-off' },
          { label: 'Create', href: '/dashboard/time-off/create' },
        ]}
      />
      
      <div className="max-w-4xl">
        <CreateTimeOffForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
} 