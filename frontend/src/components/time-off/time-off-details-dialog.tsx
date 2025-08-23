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
import { TimeOff, TimeOffType, TimeOffStatus, TimeOffPriority } from '@/types';
import { format } from 'date-fns';
import { Calendar, Clock, User, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface TimeOffDetailsDialogProps {
  timeOff: TimeOff;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimeOffDetailsDialog({ timeOff, open, onOpenChange }: TimeOffDetailsDialogProps) {
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
          <DialogTitle>Time-Off Request Details</DialogTitle>
          <DialogDescription>
            Comprehensive information about this time-off request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">Request #{timeOff.requestId}</div>
                  <div className="text-gray-600">{timeOff.reason}</div>
                </div>
                <div className="flex space-x-2">
                  <Badge variant={getTypeBadgeVariant(timeOff.type)}>
                    {timeOff.type.replace('_', ' ').charAt(0).toUpperCase() + timeOff.type.replace('_', ' ').slice(1)}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(timeOff.status)}>
                    {timeOff.status.charAt(0).toUpperCase() + timeOff.status.slice(1)}
                  </Badge>
                  <Badge variant={getPriorityBadgeVariant(timeOff.priority)}>
                    {timeOff.priority.charAt(0).toUpperCase() + timeOff.priority.slice(1)}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Employee ID</Label>
                  <p className="text-sm">{timeOff.employeeId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Request Date</Label>
                  <p className="text-sm">{formatDate(timeOff.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Hours</Label>
                  <p className="text-sm">{timeOff.totalHours}h</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Days</Label>
                  <p className="text-sm">{timeOff.totalDays} days</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Half Day</Label>
                  <p className="text-sm">{timeOff.isHalfDay ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Emergency</Label>
                  <p className="text-sm">{timeOff.isEmergency ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Requires Coverage</Label>
                  <p className="text-sm">{timeOff.requiresCoverage ? 'Yes' : 'No'}</p>
                </div>
                {timeOff.attachments && timeOff.attachments.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Attachments</Label>
                    <p className="text-sm">{timeOff.attachments.length} file(s)</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Date and Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Date and Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Start Date</Label>
                  <p className="text-sm">{formatDate(timeOff.startDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">End Date</Label>
                  <p className="text-sm">{formatDate(timeOff.endDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Start Time</Label>
                  <p className="text-sm">{formatTime(timeOff.startTime)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">End Time</Label>
                  <p className="text-sm">{formatTime(timeOff.endTime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coverage Employees */}
          {timeOff.coverageEmployees && timeOff.coverageEmployees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Coverage Employees</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {timeOff.coverageEmployees.map((employeeId, index) => (
                    <Badge key={index} variant="outline">
                      {employeeId}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approvals */}
          {timeOff.approvals && timeOff.approvals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Approval History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeOff.approvals.map((approval, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium">Level {approval.level} Approval</div>
                        <div className="text-sm text-gray-600">
                          Approved by {approval.approverId} on {formatDate(approval.approvedAt)}
                        </div>
                        {approval.comments && (
                          <div className="text-sm text-gray-500 mt-1">{approval.comments}</div>
                        )}
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejection Information */}
          {timeOff.status === TimeOffStatus.REJECTED && timeOff.rejectionReason && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span>Rejection Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Rejected By</Label>
                    <p className="text-sm">{timeOff.rejectedBy}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Rejected At</Label>
                    <p className="text-sm">{timeOff.rejectedAt ? formatDate(timeOff.rejectedAt) : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Reason</Label>
                    <p className="text-sm text-red-600">{timeOff.rejectionReason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cancellation Information */}
          {timeOff.status === TimeOffStatus.CANCELLED && timeOff.cancellationReason && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-600">
                  <XCircle className="h-5 w-5" />
                  <span>Cancellation Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Cancelled By</Label>
                    <p className="text-sm">{timeOff.cancelledBy}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Cancelled At</Label>
                    <p className="text-sm">{timeOff.cancelledAt ? formatDate(timeOff.cancelledAt) : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Reason</Label>
                    <p className="text-sm text-orange-600">{timeOff.cancellationReason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description and Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {timeOff.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="text-sm">{timeOff.description}</p>
                </div>
              )}
              {timeOff.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Notes</Label>
                  <p className="text-sm">{timeOff.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Request Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">Request Created</div>
                    <div className="text-sm text-gray-500">{formatDate(timeOff.createdAt)}</div>
                  </div>
                </div>
                
                {timeOff.submittedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Submitted</div>
                      <div className="text-sm text-gray-500">{formatDate(timeOff.submittedAt)}</div>
                    </div>
                  </div>
                )}

                {timeOff.lastModifiedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Last Modified</div>
                      <div className="text-sm text-gray-500">{formatDate(timeOff.lastModifiedAt)}</div>
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