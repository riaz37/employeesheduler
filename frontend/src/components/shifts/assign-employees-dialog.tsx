'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Users, Clock, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { Shift, Employee } from '@/types';
import { useEmployees } from '@/hooks/use-employees';
import { useAssignEmployee, useUnassignEmployee } from '@/hooks/use-shifts';

interface AssignEmployeesDialogProps {
  shift: Shift;
  onSuccess: () => void;
}

export function AssignEmployeesDialog({ shift, onSuccess }: AssignEmployeesDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [filterRole, setFilterRole] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  const { data: employeesData } = useEmployees({
    page: 1,
    limit: 100,
  });

  const assignEmployeeMutation = useAssignEmployee();
  const unassignEmployeeMutation = useUnassignEmployee();

  const employees = employeesData?.data || [];
  const assignedEmployeeIds = shift.assignedEmployees || [];

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = !filterRole || employee.role === filterRole;
    const matchesDepartment = !filterDepartment || employee.department === filterDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  // Get available employees (not already assigned)
  const availableEmployees = filteredEmployees.filter(employee => 
    !assignedEmployeeIds.includes(employee._id)
  );

  // Get assigned employees
  const assignedEmployees = employees.filter(employee => 
    assignedEmployeeIds.includes(employee._id)
  );

  const handleAssignEmployees = async () => {
    try {
      for (const employeeId of selectedEmployees) {
        await assignEmployeeMutation.mutateAsync({ shiftId: shift._id, employeeId });
      }
      setSelectedEmployees([]);
      onSuccess();
    } catch (error) {
      console.error('Failed to assign employees:', error);
    }
  };

  const handleUnassignEmployee = async (employeeId: string) => {
    try {
      await unassignEmployeeMutation.mutateAsync({ shiftId: shift._id, employeeId });
      onSuccess();
    } catch (error) {
      console.error('Failed to unassign employee:', error);
    }
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'manager':
        return 'default';
      case 'supervisor':
        return 'secondary';
      case 'staff':
        return 'outline';
      case 'specialist':
        return 'destructive';
      case 'trainee':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Shift Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Shift Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Title</Label>
              <p className="text-sm font-medium">{shift.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Date</Label>
              <p className="text-sm">{new Date(shift.date).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Time</Label>
              <p className="text-sm">{shift.startTime} - {shift.endTime}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Location</Label>
              <p className="text-sm">{shift.location.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Currently Assigned ({assignedEmployees.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedEmployees.length > 0 ? (
            <div className="space-y-3">
              {assignedEmployees.map((employee) => (
                <div key={employee._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                  <div className="flex items-center space-x-3">
                    <Badge variant={getRoleBadgeVariant(employee.role)}>
                      {employee.role}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnassignEmployee(employee._id)}
                      disabled={unassignEmployeeMutation.isPending}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No employees currently assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Available Employees */}
      <Card>
        <CardHeader>
          <CardTitle>Available Employees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="manager">Manager</option>
              <option value="supervisor">Supervisor</option>
              <option value="staff">Staff</option>
              <option value="specialist">Specialist</option>
              <option value="trainee">Trainee</option>
            </select>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          {/* Employee List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableEmployees.map((employee) => (
              <div key={employee._id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                                 <input
                   type="checkbox"
                   id={employee._id}
                   checked={selectedEmployees.includes(employee._id)}
                   onChange={() => toggleEmployeeSelection(employee._id)}
                   className="rounded border-gray-300"
                 />
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gray-100 text-gray-600">
                    {getInitials(employee.firstName, employee.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">
                    {employee.firstName} {employee.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{employee.email}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getRoleBadgeVariant(employee.role)}>
                    {employee.role}
                  </Badge>
                  <Badge variant="outline">{employee.department}</Badge>
                </div>
              </div>
            ))}
            {availableEmployees.length === 0 && (
              <p className="text-gray-500 text-center py-4">No available employees found</p>
            )}
          </div>

          {/* Assign Button */}
          {selectedEmployees.length > 0 && (
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleAssignEmployees}
                disabled={assignEmployeeMutation.isPending}
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>
                  Assign {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
                </span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requirements Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {shift.requirements && shift.requirements.length > 0 ? (
            <div className="space-y-3">
              {shift.requirements.map((requirement, index) => {
                const assignedCount = assignedEmployees.filter(emp => 
                  emp.role === requirement.role
                ).length;
                const isMet = assignedCount >= requirement.quantity;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{requirement.role}</div>
                      <div className="text-sm text-gray-500">
                        Required: {requirement.quantity} • Assigned: {assignedCount}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isMet ? (
                        <Badge variant="default" className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Met</span>
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Short {requirement.quantity - assignedCount}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No requirements specified</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 