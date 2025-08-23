'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalyticsService } from '@/services/analytics.service';
import type { DashboardShift } from '@/services/analytics.service';

export function DashboardShifts() {
  const { data: shifts, isLoading, error } = useQuery({
    queryKey: ['dashboard-shifts'],
    queryFn: AnalyticsService.getUpcomingShifts,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Shifts</CardTitle>
          <CardDescription>Shifts scheduled for the next 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="text-right">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Shifts</CardTitle>
          <CardDescription>Shifts scheduled for the next 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-red-500">Failed to load upcoming shifts</p>
        </CardContent>
      </Card>
    );
  }

  if (!shifts || shifts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Shifts</CardTitle>
          <CardDescription>Shifts scheduled for the next 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">No upcoming shifts found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Shifts</CardTitle>
        <CardDescription>Shifts scheduled for the next 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {shifts.map((shift) => (
            <div key={shift.id} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{shift.title}</p>
                <p className="text-xs text-muted-foreground">
                  {shift.date} • {shift.time}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {shift.employees}/{shift.required} staff
                </p>
                <Badge 
                  variant={shift.employees >= shift.required ? 'default' : 'destructive'}
                >
                  {shift.employees >= shift.required ? 'Fully Staffed' : 'Understaffed'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 