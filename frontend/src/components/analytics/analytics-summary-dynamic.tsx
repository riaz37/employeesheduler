'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, BarChart3, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';

interface AnalyticsSummaryDynamicProps {
  startDate: string;
  endDate: string;
  location?: string;
  team?: string;
  department?: string;
}

export function AnalyticsSummaryDynamic({ startDate, endDate, location, team, department }: AnalyticsSummaryDynamicProps) {
  const {
    useAnalyticsSummary,
    useDailyScheduleAnalytics,
    useConflictAnalysis
  } = useAnalytics();

  // Get current period data
  const currentAnalytics = useAnalyticsSummary(startDate, endDate, location, team, department);
  
  // Get previous period data for trend calculation
  const previousStartDate = new Date(startDate);
  previousStartDate.setDate(previousStartDate.getDate() - (new Date(endDate).getDate() - new Date(startDate).getDate()));
  const previousEndDate = new Date(startDate);
  previousEndDate.setDate(previousEndDate.getDate() - 1);
  
  const previousAnalytics = useAnalyticsSummary(
    previousStartDate.toISOString().split('T')[0],
    previousEndDate.toISOString().split('T')[0],
    location,
    team,
    department
  );

  // Calculate trends from real data
  const metrics = useMemo(() => {
    if (!currentAnalytics.data || !previousAnalytics.data) {
      return [];
    }

    const current = currentAnalytics.data.summary;
    const previous = previousAnalytics.data.summary;

    const calculateChange = (currentValue: number, previousValue: number): { change: number; changeType: 'increase' | 'decrease' | 'neutral' } => {
      if (previousValue === 0) return { change: 0, changeType: 'neutral' };
      const change = ((currentValue - previousValue) / previousValue) * 100;
      return {
        change: Math.round(change * 10) / 10,
        changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral'
      };
    };

    return [
      {
        label: 'Total Shifts',
        value: current.totalShifts,
        ...calculateChange(current.totalShifts, previous.totalShifts),
        format: 'number',
        icon: Clock,
        color: '#3b82f6'
      },
      {
        label: 'Total Hours',
        value: current.totalHours,
        ...calculateChange(current.totalHours, previous.totalHours),
        format: 'number',
        icon: Calendar,
        color: '#10b981'
      },
      {
        label: 'Average Coverage',
        value: `${current.averageCoverage}%`,
        ...calculateChange(current.averageCoverage, previous.averageCoverage),
        format: 'percentage',
        icon: BarChart3,
        color: '#f59e0b'
      },
      {
        label: 'Total Conflicts',
        value: current.totalConflicts,
        ...calculateChange(current.totalConflicts, previous.totalConflicts),
        format: 'number',
        icon: AlertTriangle,
        color: '#ef4444'
      }
    ];
  }, [currentAnalytics.data, previousAnalytics.data]);

  const isLoading = currentAnalytics.isLoading || previousAnalytics.isLoading;

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Period Overview</CardTitle>
          <CardDescription>Loading analytics summary...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentAnalytics.data) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Period Overview</CardTitle>
          <CardDescription>No analytics data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'neutral':
        return <Minus className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Period Overview</CardTitle>
        <CardDescription>
          Analytics summary for {startDate} to {endDate} with trend comparison to previous period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center space-x-2">
                <metric.icon className="h-4 w-4" style={{ color: metric.color }} />
                <span className="text-sm font-medium text-gray-600">{metric.label}</span>
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className={`flex items-center space-x-1 text-xs ${getChangeColor(metric.changeType)}`}>
                {getChangeIcon(metric.changeType)}
                <span>
                  {metric.changeType === 'neutral' 
                    ? 'No change' 
                    : `${metric.change > 0 ? '+' : ''}${metric.change}% from previous period`
                  }
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 