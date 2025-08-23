'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, MoreHorizontal, Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { useTimeOffRequests, useDeleteTimeOffRequest, useApproveTimeOff, useRejectTimeOff } from '@/hooks/use-time-off';
import { TimeOff, TimeOffType, TimeOffStatus, TimeOffPriority } from '@/types';
import { CreateTimeOffForm } from '@/components/time-off/create-time-off-form';
import { EditTimeOffForm } from '@/components/time-off/edit-time-off-form';
import { TimeOffDetailsDialog } from '@/components/time-off/time-off-details-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { StatsCards, StatCard } from '@/components/ui/stats-cards';
import { DataTable, Column, FilterOption } from '@/components/ui/data-table';

export default function TimeOffPage() {
  const router = useRouter();
  const [selectedTimeOff, setSelectedTimeOff] = useState<TimeOff | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const { data: timeOffData, isLoading, error } = useTimeOffRequests({
    page: 1,
    limit: 50,
  });

  const deleteTimeOffMutation = useDeleteTimeOffRequest();
  const approveTimeOffMutation = useApproveTimeOff();
  const rejectTimeOffMutation = useRejectTimeOff();

  const timeOffRequests = timeOffData?.data || [];
  const totalRequests = timeOffData?.pagination?.totalItems || 0;

  const handleDeleteTimeOff = async (id: string) => {
    if (confirm('Are you sure you want to delete this time-off request?')) {
      try {
        await deleteTimeOffMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete time-off request:', error);
      }
    }
  };

  const handleApproveTimeOff = async (id: string) => {
    try {
      await approveTimeOffMutation.mutateAsync({ id, level: 1, comments: 'Approved' });
    } catch (error) {
      console.error('Failed to approve time-off request:', error);
    }
  };

  const handleRejectTimeOff = async (id: string, reason: string) => {
    try {
      await rejectTimeOffMutation.mutateAsync({ id, reason });
    } catch (error) {
      console.error('Failed to reject time-off request:', error);
    }
  };

  const getStatusBadgeVariant = (status: TimeOffStatus) => {
    switch (status) {
      case TimeOffStatus.APPROVED:
        return 'default';
      case TimeOffStatus.PENDING:
        return 'secondary';
      case TimeOffStatus.REJECTED:
        return 'destructive';
      case TimeOffStatus.CANCELLED:
        return 'destructive';
      case TimeOffStatus.MODIFIED:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getTypeBadgeVariant = (type: TimeOffType) => {
    switch (type) {
      case TimeOffType.VACATION:
        return 'default';
      case TimeOffType.SICK_LEAVE:
        return 'destructive';
      case TimeOffType.PERSONAL_LEAVE:
        return 'secondary';
      case TimeOffType.MATERNITY_LEAVE:
        return 'outline';
      case TimeOffType.PATERNITY_LEAVE:
        return 'outline';
      case TimeOffType.BEREAVEMENT:
        return 'destructive';
      case TimeOffType.UNPAID_LEAVE:
        return 'secondary';
      case TimeOffType.COMPENSATORY_TIME:
        return 'default';
      case TimeOffType.OTHER:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: TimeOffPriority) => {
    switch (priority) {
      case TimeOffPriority.LOW:
        return 'outline';
      case TimeOffPriority.MEDIUM:
        return 'secondary';
      case TimeOffPriority.HIGH:
        return 'default';
      case TimeOffPriority.URGENT:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Stats data
  const stats: StatCard[] = [
    {
      title: 'Total Requests',
      value: totalRequests,
      icon: Calendar,
    },
    {
      title: 'Pending',
      value: timeOffRequests.filter(r => r.status === TimeOffStatus.PENDING).length,
      icon: Clock,
    },
    {
      title: 'Approved',
      value: timeOffRequests.filter(r => r.status === TimeOffStatus.APPROVED).length,
      icon: CheckCircle,
    },
    {
      title: 'Rejected',
      value: timeOffRequests.filter(r => r.status === TimeOffStatus.REJECTED).length,
      icon: XCircle,
    },
  ];

  // Filter options
  const filters: FilterOption[] = [
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'vacation', label: 'Vacation' },
        { value: 'sick_leave', label: 'Sick Leave' },
        { value: 'personal_leave', label: 'Personal Leave' },
        { value: 'maternity_leave', label: 'Maternity Leave' },
        { value: 'paternity_leave', label: 'Paternity Leave' },
        { value: 'bereavement', label: 'Bereavement' },
        { value: 'unpaid_leave', label: 'Unpaid Leave' },
        { value: 'compensatory_time', label: 'Compensatory Time' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'modified', label: 'Modified' },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' },
      ],
    },
  ];

  // Table columns
  const columns: Column<TimeOff>[] = [
    {
      key: 'request',
      header: 'Request',
      render: (timeOff) => (
        <div className="space-y-1">
          <div className="font-medium">#{timeOff.requestId}</div>
          <div className="text-sm text-gray-500">{timeOff.reason}</div>
        </div>
      ),
    },
    {
      key: 'employee',
      header: 'Employee',
      render: (timeOff) => (
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
              {timeOff.employeeId.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{timeOff.employeeId}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (timeOff) => (
        <Badge variant={getTypeBadgeVariant(timeOff.type)}>
          {timeOff.type.replace('_', ' ').charAt(0).toUpperCase() + timeOff.type.replace('_', ' ').slice(1)}
        </Badge>
      ),
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (timeOff) => (
        <div className="space-y-1">
          <div className="text-sm">{formatDate(timeOff.startDate)} - {formatDate(timeOff.endDate)}</div>
          <div className="text-xs text-gray-500">
            {timeOff.startTime} - {timeOff.endTime}
          </div>
        </div>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (timeOff) => (
        <div className="text-sm">
          {timeOff.totalHours}h ({timeOff.totalDays} days)
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (timeOff) => (
        <Badge variant={getStatusBadgeVariant(timeOff.status)}>
          {timeOff.status.charAt(0).toUpperCase() + timeOff.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (timeOff) => (
        <Badge variant={getPriorityBadgeVariant(timeOff.priority)}>
          {timeOff.priority.charAt(0).toUpperCase() + timeOff.priority.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '150px',
      render: (timeOff) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => {
              setSelectedTimeOff(timeOff);
              setIsDetailsDialogOpen(true);
            }}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {timeOff.status === TimeOffStatus.PENDING && (
              <>
                <DropdownMenuItem onClick={() => handleApproveTimeOff(timeOff._id)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const reason = prompt('Enter rejection reason:');
                  if (reason) handleRejectTimeOff(timeOff._id, reason);
                }}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={() => {
              setSelectedTimeOff(timeOff);
              setIsEditDialogOpen(true);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteTimeOff(timeOff._id)}
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
          Error loading time-off requests: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Time-Off Requests"
        description="Manage employee time-off requests and approvals"
        actions={
          <Button onClick={() => router.push('/dashboard/time-off/create')}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        }
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Time-Off Requests Table */}
      <DataTable
        title="Time-Off Requests"
        description={`${timeOffRequests.length} requests found`}
        data={timeOffRequests}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search requests..."
        isLoading={isLoading}
        emptyMessage="No time-off requests found"
        onSearch={(query) => console.log('Search:', query)}
        onFilterChange={(key, value) => console.log('Filter:', key, value)}
        onExport={() => console.log('Export time-off requests')}
      />

      {/* Dialogs */}
      {selectedTimeOff && (
        <>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Time-Off Request</DialogTitle>
                <DialogDescription>
                  Update time-off request information
                </DialogDescription>
              </DialogHeader>
              <EditTimeOffForm 
                timeOff={selectedTimeOff} 
                onSuccess={() => setIsEditDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>

          <TimeOffDetailsDialog
            timeOff={selectedTimeOff}
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
          />
        </>
      )}
    </div>
  );
} 