'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, MoreHorizontal, Calendar, Clock, Users, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSchedules, useDeleteSchedule, usePublishSchedule, useLockSchedule } from '@/hooks/use-schedules';
import { Schedule } from '@/types';
import { CreateScheduleForm } from '@/components/schedules/create-schedule-form';
import { EditScheduleForm } from '@/components/schedules/edit-schedule-form';
import { ScheduleDetailsDialog } from '@/components/schedules/schedule-details-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { StatsCards, StatCard } from '@/components/ui/stats-cards';
import { DataTable, Column, FilterOption } from '@/components/ui/data-table';

export default function SchedulesPage() {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const { data: schedulesData, isLoading, error } = useSchedules({
    page: 1,
    limit: 50,
  });

  const deleteScheduleMutation = useDeleteSchedule();
  const publishScheduleMutation = usePublishSchedule();
  const lockScheduleMutation = useLockSchedule();

  const schedules = schedulesData?.data || [];
  const totalSchedules = schedulesData?.meta?.total || schedules.length;

  const handleDeleteSchedule = async (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteScheduleMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete schedule:', error);
      }
    }
  };

  const handlePublishSchedule = async (id: string) => {
    try {
      await publishScheduleMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to publish schedule:', error);
    }
  };

  const handleLockSchedule = async (id: string) => {
    try {
      await lockScheduleMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to lock schedule:', error);
    }
  };

  const getStatusBadgeVariant = (schedule: Schedule) => {
    if (schedule.status === 'locked') return 'destructive';
    if (schedule.status === 'published') return 'default';
    return 'secondary';
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'weekly':
        return 'default';
      case 'monthly':
        return 'secondary';
      case 'custom':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getScheduleStatus = (schedule: Schedule) => {
    if (schedule.status === 'locked') return 'Locked';
    if (schedule.status === 'published') return 'Published';
    return 'Draft';
  };

  // Stats data
  const stats: StatCard[] = [
    {
      title: 'Total Schedules',
      value: totalSchedules,
      icon: Calendar,
    },
    {
      title: 'Published',
      value: schedules.filter(s => s.status === 'published').length,
      icon: Globe,
    },
    {
      title: 'Draft',
      value: schedules.filter(s => s.status === 'draft').length,
      icon: Calendar,
    },
    {
      title: 'Locked',
      value: schedules.filter(s => s.status === 'locked').length,
      icon: Lock,
    },
  ];

  // Filter options
  const filters: FilterOption[] = [
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' },
        { value: 'locked', label: 'Locked' },
      ],
    },
    {
      key: 'department',
      label: 'Department',
      options: [
        { value: 'Engineering', label: 'Engineering' },
        { value: 'Sales', label: 'Sales' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Operations', label: 'Operations' },
      ],
    },
    {
      key: 'team',
      label: 'Team',
      options: [
        { value: 'Team Alpha', label: 'Team Alpha' },
        { value: 'Team Beta', label: 'Team Beta' },
        { value: 'Team Gamma', label: 'Team Gamma' },
      ],
    },
  ];

  // Table columns
  const columns: Column<Schedule>[] = [
    {
      key: 'schedule',
      header: 'Schedule',
      render: (schedule) => (
        <div className="space-y-1">
          <div className="font-medium">{schedule.scheduleId}</div>
          <div className="text-sm text-gray-500">{schedule.notes}</div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (schedule) => (
        <div className="space-y-1">
          <div className="text-sm">{formatDate(schedule.date)}</div>
          <div className="text-xs text-gray-500">Schedule</div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (schedule) => schedule.department,
    },
    {
      key: 'team',
      header: 'Team',
      render: (schedule) => schedule.team,
    },
    {
      key: 'location',
      header: 'Location',
      render: (schedule) => schedule.location,
    },
    {
      key: 'templates',
      header: 'Templates',
      render: (schedule) => (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{schedule.shifts?.length || 0}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (schedule) => (
        <Badge variant={getStatusBadgeVariant(schedule)}>
          {getScheduleStatus(schedule)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '150px',
      render: (schedule) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => {
              setSelectedSchedule(schedule);
              setIsDetailsDialogOpen(true);
            }}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {schedule.status !== 'locked' && (
              <DropdownMenuItem onClick={() => {
                setSelectedSchedule(schedule);
                setIsEditDialogOpen(true);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {schedule.status === 'draft' && (
              <DropdownMenuItem onClick={() => handlePublishSchedule(schedule._id)}>
                <Globe className="mr-2 h-4 w-4" />
                Publish
              </DropdownMenuItem>
            )}
            {schedule.status !== 'locked' && (
              <DropdownMenuItem onClick={() => handleLockSchedule(schedule._id)}>
                <Lock className="mr-2 h-4 w-4" />
                Lock
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteSchedule(schedule._id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error loading schedules: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Schedules"
        description="Manage work schedules and shift templates"
        actions={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Schedule</DialogTitle>
                <DialogDescription>
                  Fill in the schedule information below
                </DialogDescription>
              </DialogHeader>
              <CreateScheduleForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Schedules Table */}
      <DataTable
        title="Schedule List"
        description={`${totalSchedules} schedules found`}
        data={schedules}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search schedules..."
        isLoading={isLoading}
        emptyMessage="No schedules found"
        onSearch={(query) => console.log('Search:', query)}
        onFilterChange={(key, value) => console.log('Filter:', key, value)}
        onExport={() => console.log('Export schedules')}
      />

      {/* Dialogs */}
      {selectedSchedule && (
        <>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Schedule</DialogTitle>
                <DialogDescription>
                  Update schedule information
                </DialogDescription>
              </DialogHeader>
              <EditScheduleForm 
                schedule={selectedSchedule} 
                onSuccess={() => setIsEditDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>

          <ScheduleDetailsDialog
            schedule={selectedSchedule}
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
          />
        </>
      )}
    </div>
  );
} 