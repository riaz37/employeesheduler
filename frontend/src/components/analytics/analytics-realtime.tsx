'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users, Clock, MapPin, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';

interface AnalyticsRealtimeProps {
  date: string;
  location?: string;
  team?: string;
  department?: string;
}

export function AnalyticsRealtime({ date, location, team, department }: AnalyticsRealtimeProps) {
  const {
    useConflictsForDate,
    useCoverageGaps,
    useUpcomingShifts,
    useRecentActivities
  } = useAnalytics();

  const conflictsForDate = useConflictsForDate(date, location);
  const coverageGaps = useCoverageGaps(date, location);
  const upcomingShifts = useUpcomingShifts(date, location, team, department);
  const recentActivities = useRecentActivities(date, location, team, department);

  const isLoading = conflictsForDate.isLoading || coverageGaps.isLoading || 
                   upcomingShifts.isLoading || recentActivities.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Real-time Analytics</CardTitle>
            <CardDescription>Loading real-time data...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Real-time Conflicts */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Today&apos;s Conflicts</span>
          </CardTitle>
          <CardDescription>
            Active conflicts that need immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {conflictsForDate.data && conflictsForDate.data.length > 0 ? (
            <div className="space-y-3">
              {conflictsForDate.data.slice(0, 5).map((conflict, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="font-medium text-sm">{conflict.title}</p>
                      <p className="text-xs text-gray-600">{conflict.conflicts.description}</p>
                    </div>
                  </div>
                  <Badge variant="destructive">{conflict.conflicts.severity}</Badge>
                </div>
              ))}
              {conflictsForDate.data.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  +{conflictsForDate.data.length - 5} more conflicts
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-green-600 font-medium">No conflicts detected</p>
              <p className="text-sm text-gray-500">All schedules are conflict free</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coverage Gaps */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <Users className="h-5 w-5" />
            <span>Coverage Gaps</span>
          </CardTitle>
          <CardDescription>
            Shifts that need additional staff coverage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {coverageGaps.data && coverageGaps.data.length > 0 ? (
            <div className="space-y-3">
              {coverageGaps.data.slice(0, 5).map((gap, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="font-medium text-sm">{gap._id.role}</p>
                      <p className="text-xs text-gray-600">
                        {gap.shifts[0]?.title || 'Multiple shifts'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">-{gap.gap} staff</Badge>
                </div>
              ))}
              {coverageGaps.data.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  +{coverageGaps.data.length - 5} more gaps
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-green-600 font-medium">Full coverage</p>
              <p className="text-sm text-gray-500">All shifts are properly staffed</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Shifts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Upcoming Shifts</span>
          </CardTitle>
          <CardDescription>
            Next scheduled shifts in the next 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingShifts.data && upcomingShifts.data.length > 0 ? (
            <div className="space-y-3">
              {upcomingShifts.data.slice(0, 5).map((shift, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">{shift.title}</p>
                      <p className="text-xs text-gray-600">
                        {shift.time} • {shift.employees}/{shift.required} staff
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{shift.date}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No upcoming shifts</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activities</span>
          </CardTitle>
          <CardDescription>
            Latest system activities and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivities.data && recentActivities.data.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.data.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.severity === 'error' ? 'bg-red-500' :
                    activity.severity === 'warning' ? 'bg-yellow-500' :
                    activity.severity === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No recent activities</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 