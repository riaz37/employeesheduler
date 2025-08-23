'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Employee, EmployeeRole, EmployeeStatus } from '@/types';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

interface EmployeeDetailsDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeDetailsDialog({ employee, open, onOpenChange }: EmployeeDetailsDialogProps) {
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
          <DialogDescription>
            Comprehensive information about {employee.firstName} {employee.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                    {getInitials(employee.firstName, employee.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-2xl font-bold">
                    {employee.firstName} {employee.lastName}
                  </div>
                  <div className="text-gray-600">{employee.email}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Employee ID</Label>
                  <p className="text-sm">{employee.employeeId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Role</Label>
                  <Badge variant={getRoleBadgeVariant(employee.role)} className="mt-1">
                    {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge variant={getStatusBadgeVariant(employee.status)} className="mt-1">
                    {employee.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Department</Label>
                  <p className="text-sm">{employee.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Location</Label>
                  <p className="text-sm">{employee.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Team</Label>
                  <p className="text-sm">{employee.team}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Hire Date</Label>
                  <p className="text-sm">{formatDate(employee.hireDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Part-time</Label>
                  <p className="text-sm">{employee.isPartTime ? 'Yes' : 'No'}</p>
                </div>
                {employee.phone && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                    <p className="text-sm">{employee.phone}</p>
                  </div>
                )}
                {employee.emergencyContact && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Emergency Contact</Label>
                    <p className="text-sm">{employee.emergencyContact}</p>
                  </div>
                )}
                {employee.notes && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-500">Notes</Label>
                    <p className="text-sm">{employee.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Certifications</CardTitle>
              <CardDescription>Employee skills and their proficiency levels</CardDescription>
            </CardHeader>
            <CardContent>
              {employee.skills && employee.skills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{skill.name}</div>
                        <div className="text-sm text-gray-600">
                          Level: {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {skill.certified && (
                          <Badge variant="default">Certified</Badge>
                        )}
                        {skill.validUntil && (
                          <Badge variant="outline">
                            Valid until {formatDate(skill.validUntil)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No skills recorded</p>
              )}
            </CardContent>
          </Card>

          {/* Availability Windows */}
          <Card>
            <CardHeader>
              <CardTitle>Availability Windows</CardTitle>
              <CardDescription>Weekly availability schedule</CardDescription>
            </CardHeader>
            <CardContent>
              {employee.availabilityWindows && employee.availabilityWindows.length > 0 ? (
                <div className="space-y-3">
                  {employee.availabilityWindows.map((availability, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-24 text-sm font-medium">
                          {daysOfWeek[availability.dayOfWeek]}
                        </div>
                        <div className="text-sm">
                          {availability.startTime} - {availability.endTime}
                        </div>
                        <div className="text-sm text-gray-500">
                          {availability.timezone}
                        </div>
                      </div>
                      <Badge variant={availability.isAvailable ? 'default' : 'secondary'}>
                        {availability.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No availability windows set</p>
              )}
            </CardContent>
          </Card>

          {/* Work Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Work Preferences</CardTitle>
              <CardDescription>Employee work preferences and constraints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Hours & Schedule</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Max Hours per Week:</span>
                      <span className="text-sm font-medium">{employee.workPreference.maxHoursPerWeek}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Max Consecutive Days:</span>
                      <span className="text-sm font-medium">{employee.workPreference.maxConsecutiveDays} days</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Preferred Shifts</h4>
                  {employee.workPreference.preferredShifts.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {employee.workPreference.preferredShifts.map((shift, index) => (
                        <Badge key={index} variant="outline">
                          {shift}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No preferred shifts set</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-medium mb-3">Preferred Locations</h4>
                  {employee.workPreference.preferredLocations.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {employee.workPreference.preferredLocations.map((location, index) => (
                        <Badge key={index} variant="outline">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No preferred locations set</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Work Statistics</CardTitle>
              <CardDescription>Employee performance and work metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{employee.totalHoursWorked}</div>
                  <div className="text-sm text-gray-600">Total Hours Worked</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {employee.lastActiveDate ? formatDate(employee.lastActiveDate) : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Last Active</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {employee.terminationDate ? formatDate(employee.terminationDate) : 'Active'}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 