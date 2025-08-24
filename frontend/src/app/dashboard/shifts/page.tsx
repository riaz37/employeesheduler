"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Users,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useShifts, useDeleteShift } from "@/hooks/use-shifts";
import { Shift, ShiftType, ShiftStatus } from "@/types";
import { CreateShiftForm } from "@/components/shifts/create-shift-form";
import { EditShiftForm } from "@/components/shifts/edit-shift-form";
import { ShiftDetailsDialog } from "@/components/shifts/shift-details-dialog";
import { AssignEmployeesDialog } from "@/components/shifts/assign-employees-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCards, StatCard } from "@/components/ui/stats-cards";
import { DataTable, Column, FilterOption } from "@/components/ui/data-table";

export default function ShiftsPage() {
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const {
    data: shiftsData,
    isLoading,
    error,
  } = useShifts({
    page: 1,
    limit: 50,
  });

  const deleteShiftMutation = useDeleteShift();

  const shifts = shiftsData?.data || [];
  const totalShifts = shiftsData?.meta?.total || shifts.length;

  const handleDeleteShift = async (id: string) => {
    if (confirm("Are you sure you want to delete this shift?")) {
      try {
        await deleteShiftMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete shift:", error);
      }
    }
  };

  const getStatusBadgeVariant = (status: ShiftStatus) => {
    switch (status) {
      case ShiftStatus.SCHEDULED:
        return "default";
      case ShiftStatus.IN_PROGRESS:
        return "secondary";
      case ShiftStatus.COMPLETED:
        return "outline";
      case ShiftStatus.CANCELLED:
        return "destructive";
      default:
        return "outline";
    }
  };

  const getTypeBadgeVariant = (type: ShiftType) => {
    switch (type) {
      case ShiftType.REGULAR:
        return "default";
      case ShiftType.OVERTIME:
        return "secondary";
      case ShiftType.HOLIDAY:
        return "destructive";
      case ShiftType.WEEKEND:
        return "outline";
      case ShiftType.NIGHT:
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Stats data
  const stats: StatCard[] = [
    {
      title: "Total Shifts",
      value: totalShifts,
      icon: Clock,
    },
    {
      title: "Scheduled",
      value: shifts.filter((s) => s.status === ShiftStatus.SCHEDULED).length,
      icon: Clock,
    },
    {
      title: "In Progress",
      value: shifts.filter((s) => s.status === ShiftStatus.IN_PROGRESS).length,
      icon: Clock,
    },
    {
      title: "Completed",
      value: shifts.filter((s) => s.status === ShiftStatus.COMPLETED).length,
      icon: Clock,
    },
  ];

  // Filter options
  const filters: FilterOption[] = [
    {
      key: "type",
      label: "Type",
      options: [
        { value: "regular", label: "Regular" },
        { value: "overtime", label: "Overtime" },
        { value: "holiday", label: "Holiday" },
        { value: "weekend", label: "Weekend" },
        { value: "night", label: "Night" },
        { value: "split", label: "Split" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "scheduled", label: "Scheduled" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
        { value: "pending_approval", label: "Pending Approval" },
      ],
    },
    {
      key: "department",
      label: "Department",
      options: [
        { value: "Engineering", label: "Engineering" },
        { value: "Sales", label: "Sales" },
        { value: "Marketing", label: "Marketing" },
        { value: "Operations", label: "Operations" },
      ],
    },
    {
      key: "location",
      label: "Location",
      options: [
        { value: "Location A", label: "Location A" },
        { value: "Location B", label: "Location B" },
        { value: "Location C", label: "Location C" },
      ],
    },
  ];

  // Table columns
  const columns: Column<Shift>[] = [
    {
      key: "shift",
      header: "Shift",
      render: (shift) => (
        <div className="space-y-1">
          <div className="font-medium">{shift.title}</div>
          <div className="text-sm text-gray-500">{shift.description}</div>
        </div>
      ),
    },
    {
      key: "dateTime",
      header: "Date & Time",
      render: (shift) => (
        <div className="space-y-1">
          <div className="text-sm">{formatDate(shift.date)}</div>
          <div className="text-xs text-gray-500">
            {shift.startTime} - {shift.endTime}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (shift) => (
        <Badge variant={getTypeBadgeVariant(shift.type)}>
          {shift.type.charAt(0).toUpperCase() + shift.type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (shift) => (
        <Badge variant={getStatusBadgeVariant(shift.status)}>
          {shift.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (shift) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{shift.location.name}</span>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (shift) => shift.department,
    },
    {
      key: "assigned",
      header: "Assigned",
      render: (shift) => (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm">
            {shift.assignedEmployees?.length || 0}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "120px",
      render: (shift) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setSelectedShift(shift);
                setIsDetailsDialogOpen(true);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedShift(shift);
                setIsAssignDialogOpen(true);
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Assign Employees
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedShift(shift);
                setIsEditDialogOpen(true);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteShift(shift._id)}
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
          Error loading shifts: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Shifts"
        description="Manage work shifts and employee assignments"
        actions={
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Shift
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Shift</DialogTitle>
                <DialogDescription>
                  Fill in the shift information below
                </DialogDescription>
              </DialogHeader>
              <CreateShiftForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Shifts Table */}
      <DataTable
        title="Shift List"
        description={`${totalShifts} shifts found`}
        data={shifts}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search shifts..."
        isLoading={isLoading}
        emptyMessage="No shifts found"
        onSearch={(query) => console.log("Search:", query)}
        onFilterChange={(key, value) => console.log("Filter:", key, value)}
        onExport={() => console.log("Export shifts")}
      />

      {/* Dialogs */}
      {selectedShift && (
        <>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Shift</DialogTitle>
                <DialogDescription>Update shift information</DialogDescription>
              </DialogHeader>
              <EditShiftForm
                shift={selectedShift}
                onSuccess={() => setIsEditDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog
            open={isAssignDialogOpen}
            onOpenChange={setIsAssignDialogOpen}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Assign Employees to Shift</DialogTitle>
                <DialogDescription>
                  Manage employee assignments for this shift
                </DialogDescription>
              </DialogHeader>
              <AssignEmployeesDialog
                shift={selectedShift}
                onSuccess={() => setIsAssignDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <ShiftDetailsDialog
            shift={selectedShift}
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
          />
        </>
      )}
    </div>
  );
}
