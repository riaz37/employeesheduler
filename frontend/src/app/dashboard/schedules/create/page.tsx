'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { CreateScheduleForm } from '@/components/schedules/create-schedule-form';

export default function CreateSchedulePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/schedules');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Schedule"
        description="Create a new schedule by assigning shifts to employees for specific dates."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Schedules', href: '/dashboard/schedules' },
          { label: 'Create', href: '/dashboard/schedules/create' },
        ]}
      />
      
      <div className="max-w-4xl">
        <CreateScheduleForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
} 