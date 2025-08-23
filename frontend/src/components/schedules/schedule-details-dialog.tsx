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
import { Schedule } from '@/types';
import { format } from 'date-fns';
import { Calendar, Clock, Users, MapPin, Building, Lock, Globe } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ScheduleDetailsDialogProps {
  schedule: Schedule;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleDetailsDialog({ schedule, open, onOpenChange }: ScheduleDetailsDialogProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      case 'locked':
        return 'destructive';
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

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Details</DialogTitle>
          <DialogDescription>
            Comprehensive information about schedule {schedule.scheduleId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{schedule.scheduleId}</div>
                  <div className="text-gray-600">{schedule.notes || 'No description'}</div>
                </div>
                <div className="flex space-x-2">
                  <Badge variant={getStatusBadgeVariant(schedule.status)}>
                    {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                  </Badge>
                  {schedule.isTemplate && (
                    <Badge variant="outline">
                      Template
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Schedule ID</Label>
                  <p className="text-sm">{schedule.scheduleId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created At</Label>
                  <p className="text-sm">{formatDate(schedule.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Modified</Label>
                  <p className="text-sm">{schedule.updatedAt ? formatDate(schedule.updatedAt) : 'Never'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Schedule Date</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date</Label>
                  <p className="text-sm">{formatDate(schedule.date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Day of Week</Label>
                  <p className="text-sm">{daysOfWeek[new Date(schedule.date).getDay()]}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department & Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Department & Team</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Department</Label>
                  <p className="text-sm">{schedule.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Team</Label>
                  <p className="text-sm">{schedule.team}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Location</Label>
                  <p className="text-sm">{schedule.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shifts & Employees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Shifts & Employees</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Shifts</Label>
                  <p className="text-sm">{schedule.shifts.length}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Employees</Label>
                  <p className="text-sm">{schedule.employees.length}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Time Off Requests</Label>
                  <p className="text-sm">{schedule.timeOffRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coverage & Conflicts */}
          {schedule.coverage && schedule.coverage.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Coverage Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedule.coverage.map((cov, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-gray-600">Role</Label>
                          <p className="font-medium">{cov.role}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Required</Label>
                          <p>{cov.required}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Assigned</Label>
                          <p>{cov.assigned}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Coverage</Label>
                          <p>{cov.coverage}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conflicts */}
          {schedule.conflicts && schedule.conflicts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Conflicts & Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedule.conflicts.map((conflict, index) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-red-800">{conflict.type.replace('_', ' ')}</div>
                          <div className="text-sm text-red-600">{conflict.description}</div>
                        </div>
                        <Badge variant={conflict.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {conflict.severity}
                        </Badge>
                      </div>
                      {conflict.resolution && (
                        <div className="mt-2 text-sm text-green-700">
                          <strong>Resolution:</strong> {conflict.resolution}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {schedule.shifts.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Shifts</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {schedule.employees.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Employees</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {schedule.timeOffRequests.length}
                  </div>
                  <div className="text-sm text-gray-600">Time Off Requests</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {schedule.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{schedule.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">Schedule Created</div>
                    <div className="text-sm text-gray-500">{formatDate(schedule.createdAt)}</div>
                  </div>
                </div>
                
                {schedule.publishedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Published</div>
                      <div className="text-sm text-gray-500">{formatDate(schedule.publishedAt)}</div>
                    </div>
                  </div>
                )}

                {schedule.lockedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Locked</div>
                      <div className="text-sm text-gray-500">{formatDate(schedule.lockedAt)}</div>
                    </div>
                  </div>
                )}

                {schedule.archivedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Archived</div>
                      <div className="text-sm text-gray-500">{formatDate(schedule.archivedAt)}</div>
                    </div>
                  </div>
                )}

                {schedule.lastModifiedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Last Modified</div>
                      <div className="text-sm text-gray-500">{formatDate(schedule.lastModifiedAt)}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 