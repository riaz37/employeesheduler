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
import { Separator } from '@/components/ui/separator';
import { Shift, ShiftStatus, ShiftType } from '@/types';
import { format } from 'date-fns';
import { Clock, MapPin, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ShiftDetailsDialogProps {
  shift: Shift;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShiftDetailsDialog({ shift, open, onOpenChange }: ShiftDetailsDialogProps) {
  const getStatusBadgeVariant = (status: ShiftStatus) => {
    switch (status) {
      case ShiftStatus.SCHEDULED:
        return 'default';
      case ShiftStatus.IN_PROGRESS:
        return 'secondary';
      case ShiftStatus.COMPLETED:
        return 'outline';
      case ShiftStatus.CANCELLED:
        return 'destructive';
      case ShiftStatus.PENDING_APPROVAL:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTypeBadgeVariant = (type: ShiftType) => {
    switch (type) {
      case ShiftType.REGULAR:
        return 'default';
      case ShiftType.OVERTIME:
        return 'secondary';
      case ShiftType.HOLIDAY:
        return 'destructive';
      case ShiftType.WEEKEND:
        return 'outline';
      case ShiftType.NIGHT:
        return 'secondary';
      case ShiftType.SPLIT:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shift Details</DialogTitle>
          <DialogDescription>
            Comprehensive information about {shift.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{shift.title}</div>
                  <div className="text-gray-600">{shift.description}</div>
                </div>
                <div className="flex space-x-2">
                  <Badge variant={getTypeBadgeVariant(shift.type)}>
                    {shift.type.charAt(0).toUpperCase() + shift.type.slice(1)}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(shift.status)}>
                    {shift.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Shift ID</Label>
                  <p className="text-sm">{shift.shiftId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Priority</Label>
                  <p className="text-sm">{shift.priority || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Hours</Label>
                  <p className="text-sm">{shift.totalHours}h</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Break Time</Label>
                  <p className="text-sm">{shift.breakMinutes}m</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Recurring</Label>
                  <p className="text-sm">{shift.isRecurring ? 'Yes' : 'No'}</p>
                </div>
                {shift.recurringPattern && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Pattern</Label>
                    <p className="text-sm">{shift.recurringPattern}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Date and Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Date and Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date</Label>
                  <p className="text-sm">{formatDate(shift.date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Day of Week</Label>
                  <p className="text-sm">{shift.dayOfWeek}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Start Time</Label>
                  <p className="text-sm">{formatTime(shift.startTime)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">End Time</Label>
                  <p className="text-sm">{formatTime(shift.endTime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Location Name</Label>
                  <p className="text-sm">{shift.location.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <p className="text-sm">{shift.location.address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Timezone</Label>
                  <p className="text-sm">{shift.location.timezone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department & Team */}
          <Card>
            <CardHeader>
              <CardTitle>Department & Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Department</Label>
                  <p className="text-sm">{shift.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Team</Label>
                  <p className="text-sm">{shift.team}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staffing Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Staffing Requirements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shift.requirements && shift.requirements.length > 0 ? (
                <div className="space-y-3">
                  {shift.requirements.map((requirement, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{requirement.role}</h4>
                        <Badge variant="outline">{requirement.quantity} staff</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-gray-600">Skills</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {requirement.skills.map((skill, skillIndex) => (
                              <Badge key={skillIndex} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-600">Quantity</Label>
                          <p>{requirement.quantity} staff</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No requirements specified</p>
              )}
            </CardContent>
          </Card>

          {/* Assigned Employees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Assigned Employees</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shift.assignedEmployees && shift.assignedEmployees.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {shift.assignedEmployees.map((employeeId, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{typeof employeeId === 'string' ? employeeId : 'Employee ID'}</span>
                      <Badge variant="outline" className="text-xs">
                        Assigned
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No employees assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {shift.tags && shift.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {shift.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {shift.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{shift.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {shift.assignedEmployees?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Assigned Staff</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {shift.requirements?.reduce((total, req) => total + req.quantity, 0) || 0}
                  </div>
                  <div className="text-sm text-gray-600">Required Staff</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {shift.totalHours}
                  </div>
                  <div className="text-sm text-gray-600">Total Hours</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 