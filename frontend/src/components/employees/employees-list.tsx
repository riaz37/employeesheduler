'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { useEmployees, useDeleteEmployee } from '@/hooks/use-employees';
import { Employee, EmployeeRole, EmployeeStatus } from '@/types';
import { EditEmployeeForm } from '@/components/employees/edit-employee-form';
import { EmployeeDetailsDialog } from '@/components/employees/employee-details-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { StatsCards, StatCard } from '@/components/ui/stats-cards';
import { DataTable, Column, FilterOption } from '@/components/ui/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, Clock, Award } from 'lucide-react';

export function EmployeesList() {
  const router = useRouter();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const { data: employeesData, isLoading, error } = useEmployees({
    page: 1,
    limit: 50,
  });

  const deleteEmployeeMutation = useDeleteEmployee();

  const employees = employeesData?.data || [];
  const totalEmployees = employeesData?.pagination?.totalItems || 0;

  const handleDeleteEmployee = async (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployeeMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete employee:', error);
      }
    }
  };

  const getRoleBadgeVariant = (role: EmployeeRole) => {
    switch (role) {
      case EmployeeRole.MANAGER:
        return 'default';
      case EmployeeRole.SUPERVISOR:
        return 'secondary';
      case EmployeeRole.STAFF:
        return 'outline';
      case EmployeeRole.SPECIALIST:
        return 'destructive';
      case EmployeeRole.TRAINEE:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE:
        return 'default';
      case EmployeeStatus.INACTIVE:
        return 'secondary';
      case EmployeeStatus.ON_LEAVE:
        return 'destructive';
      case EmployeeStatus.TERMINATED:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  // Stats data
  const stats: StatCard[] = [
    {
      title: 'Total Employees',
      value: totalEmployees,
      icon: Users,
    },
    {
      title: 'Active',
      value: employees.filter(e => e.status === EmployeeStatus.ACTIVE).length,
      icon: UserCheck,
    },
    {
      title: 'On Leave',
      value: employees.filter(e => e.status === EmployeeStatus.ON_LEAVE).length,
      icon: Clock,
    },
    {
      title: 'Managers',
      value: employees.filter(e => e.role === EmployeeRole.MANAGER).length,
      icon: Award,
    },
  ];

  // Filter options
  const filters: FilterOption[] = [
    {
      key: 'location',
      label: 'Location',
      options: [
        { value: 'Location A', label: 'Location A' },
        { value: 'Location B', label: 'Location B' },
        { value: 'Location C', label: 'Location C' },
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
    {
      key: 'role',
      label: 'Role',
      options: [
        { value: 'manager', label: 'Manager' },
        { value: 'supervisor', label: 'Supervisor' },
        { value: 'staff', label: 'Staff' },
        { value: 'specialist', label: 'Specialist' },
        { value: 'trainee', label: 'Trainee' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'on_leave', label: 'On Leave' },
        { value: 'terminated', label: 'Terminated' },
      ],
    },
  ];

  // Table columns
  const columns: Column<Employee>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (employee) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getInitials(employee.firstName, employee.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {employee.firstName} {employee.lastName}
            </div>
            <div className="text-sm text-gray-500">{employee.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (employee) => (
        <Badge variant={getRoleBadgeVariant(employee.role)}>
          {employee.role}
        </Badge>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (employee) => employee.department,
    },
    {
      key: 'location',
      header: 'Location',
      render: (employee) => employee.location,
    },
    {
      key: 'team',
      header: 'Team',
      render: (employee) => employee.team,
    },
    {
      key: 'status',
      header: 'Status',
      render: (employee) => (
        <Badge variant={getStatusBadgeVariant(employee.status)}>
          {employee.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'skills',
      header: 'Skills',
      render: (employee) => (
        <div className="flex flex-wrap gap-1">
          {employee.skills.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {skill.name}
            </Badge>
          ))}
          {employee.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{employee.skills.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '100px',
      render: (employee) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => {
              setSelectedEmployee(employee);
              setIsDetailsDialogOpen(true);
            }}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSelectedEmployee(employee);
              setIsEditDialogOpen(true);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteEmployee(employee._id)}
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
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Error loading employees: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Employees"
        description="Manage your employee database"
        actions={
          <Button onClick={() => router.push('/dashboard/employees/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        }
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Employees Table */}
      <DataTable
        title="Employee List"
        description={`${employees.length} employees found`}
        data={employees}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search employees..."
        isLoading={isLoading}
        emptyMessage="No employees found"
        onSearch={(query) => console.log('Search:', query)}
        onFilterChange={(key, value) => console.log('Filter:', key, value)}
        onExport={() => console.log('Export employees')}
      />

      {/* Dialogs */}
      {selectedEmployee && (
        <>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Employee</DialogTitle>
                <DialogDescription>
                  Update employee information
                </DialogDescription>
              </DialogHeader>
              <EditEmployeeForm 
                employee={selectedEmployee} 
                onSuccess={() => setIsEditDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>

          <EmployeeDetailsDialog
            employee={selectedEmployee}
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
          />
        </>
      )}
    </div>
  );
} 