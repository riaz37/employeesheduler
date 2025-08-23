'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalyticsChart, ChartDataPoint, ChartSeries } from './analytics-chart';
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Zap,
  Shield,
  Building,
  MapPin
} from 'lucide-react';
import { useDailyScheduleAnalytics, useWeeklyAnalytics, useMonthlyAnalytics, useConflictAnalysis, useCoverageOptimization } from '@/hooks/use-analytics';

interface AnalyticsDashboardProps {
  startDate: string;
  endDate: string;
  location?: string;
  team?: string;
  department?: string;
}

export function AnalyticsDashboard({ startDate, endDate, location, team, department }: AnalyticsDashboardProps) {
  // Fetch analytics data
  const dailyAnalytics = useDailyScheduleAnalytics(startDate, location, team, department);
  const weeklyAnalytics = useWeeklyAnalytics(startDate, location, team, department);
  const monthlyAnalytics = useMonthlyAnalytics(
    new Date(startDate).getFullYear(),
    new Date(startDate).getMonth() + 1,
    location,
    team,
    department
  );
  const conflictAnalysis = useConflictAnalysis(startDate, endDate, location, team, department);
  const coverageOptimization = useCoverageOptimization(startDate, endDate, location, team, department);

  const isLoading = dailyAnalytics.isLoading || weeklyAnalytics.isLoading || monthlyAnalytics.isLoading || 
                   conflictAnalysis.isLoading || coverageOptimization.isLoading;
  const error = dailyAnalytics.error || weeklyAnalytics.error || monthlyAnalytics.error || 
                conflictAnalysis.error || coverageOptimization.error;

  // Transform data for charts
  const shiftCoverageData = useMemo(() => {
    if (!dailyAnalytics.data?.roleCoverage) return [];
    return dailyAnalytics.data.roleCoverage.map((role, index) => ({
      label: role.role,
      value: role.coverage,
      color: `hsl(${index * 30}, 70%, 50%)`
    }));
  }, [dailyAnalytics.data]);

  const utilizationTrendData = useMemo(() => {
    if (!weeklyAnalytics.data?.trends?.utilizationTrend) return [];
    return weeklyAnalytics.data.trends.utilizationTrend.map((trend, index) => ({
      label: trend.date,
      value: trend.utilization,
      color: '#3b82f6'
    }));
  }, [weeklyAnalytics.data]);

  const conflictTypeData = useMemo(() => {
    if (!conflictAnalysis.data?.conflictTypes) return [];
    return conflictAnalysis.data.conflictTypes.map((conflict, index) => ({
      label: conflict.type,
      value: conflict.count,
      color: conflict.severity === 'critical' ? '#ef4444' : 
             conflict.severity === 'high' ? '#f59e0b' : 
             conflict.severity === 'medium' ? '#8b5cf6' : '#10b981'
    }));
  }, [conflictAnalysis.data]);

  const coverageGapData = useMemo(() => {
    if (!coverageOptimization.data?.gaps) return [];
    return coverageOptimization.data.gaps.map((gap, index) => ({
      label: `${gap.role} - ${gap.date}`,
      value: gap.shortage,
      color: gap.shortage > 3 ? '#ef4444' : gap.shortage > 1 ? '#f59e0b' : '#10b981'
    }));
  }, [coverageOptimization.data]);

  const timeOffTrendsData = useMemo(() => {
    if (!monthlyAnalytics.data?.trends?.monthlyTrends) return [];
    const trends = monthlyAnalytics.data.trends.monthlyTrends;
    return [
      {
        name: 'Total Shifts',
        data: trends.map(trend => ({ label: trend.month, value: Number(trend.metrics.totalShifts) })),
        color: '#3b82f6'
      },
      {
        name: 'Total Hours',
        data: trends.map(trend => ({ label: trend.month, value: Number(trend.metrics.totalHours) })),
        color: '#10b981'
      }
    ];
  }, [monthlyAnalytics.data]);

  // Stats cards data
  const statsCards = useMemo(() => {
    if (!dailyAnalytics.data) return [];
    
    return [
      {
        title: 'Total Shifts',
        value: dailyAnalytics.data.totalShifts || 0,
        icon: Clock,
        trend: 0,
        trendType: 'neutral' as const,
        color: '#3b82f6'
      },
      {
        title: 'Total Hours',
        value: dailyAnalytics.data.totalHours || 0,
        icon: Calendar,
        trend: 0,
        trendType: 'neutral' as const,
        color: '#10b981'
      },
      {
        title: 'Utilization Rate',
        value: `${dailyAnalytics.data.averageUtilization || 0}%`,
        icon: TrendingUp,
        trend: 0,
        trendType: 'neutral' as const,
        color: '#f59e0b'
      },
      {
        title: 'Conflicts',
        value: conflictAnalysis.data?.totalConflicts || 0,
        icon: AlertTriangle,
        trend: 0,
        trendType: 'neutral' as const,
        color: '#ef4444'
      }
    ];
  }, [dailyAnalytics.data, conflictAnalysis.data]);

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error loading analytics: {error.message}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-full" style={{ height: '300px' }} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" style={{ color: stat.color }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.trend !== 0 && stat.trendType !== 'neutral' && (
                <p className={`text-xs ${stat.trendType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend > 0 ? '+' : ''}{stat.trend}% from last period
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsChart
              title="Role Coverage"
              description="Shift coverage percentage by role"
              data={shiftCoverageData}
              height={300}
              config={{
                type: 'bar',
                showGrid: true,
                showLegend: true,
                showTooltip: true,
                yAxisLabel: 'Coverage %'
              }}
            />
            <AnalyticsChart
              title="Utilization Trends"
              description="Employee utilization over time"
              data={utilizationTrendData}
              height={300}
              config={{
                type: 'line',
                showGrid: true,
                showLegend: false,
                showTooltip: true,
                yAxisLabel: 'Utilization %'
              }}
            />
          </div>
        </TabsContent>

        {/* Coverage Tab */}
        <TabsContent value="coverage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsChart
              title="Coverage Gaps"
              description="Employee shortage by role and date"
              data={coverageGapData}
              height={300}
              config={{
                type: 'bar',
                showGrid: true,
                showLegend: false,
                showTooltip: true,
                yAxisLabel: 'Shortage Count'
              }}
            />
            <AnalyticsChart
              title="Coverage Distribution"
              description="Coverage score distribution"
              data={[
                { label: 'Excellent (90-100%)', value: 45, color: '#10b981' },
                { label: 'Good (80-89%)', value: 30, color: '#3b82f6' },
                { label: 'Fair (70-79%)', value: 20, color: '#f59e0b' },
                { label: 'Poor (<70%)', value: 5, color: '#ef4444' }
              ]}
              height={300}
              config={{
                type: 'pie',
                showLegend: true,
                showTooltip: true
              }}
            />
          </div>
        </TabsContent>

        {/* Conflicts Tab */}
        <TabsContent value="conflicts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsChart
              title="Conflict Types"
              description="Distribution of different conflict types"
              data={conflictTypeData}
              height={300}
              config={{
                type: 'pie',
                showLegend: true,
                showTooltip: true
              }}
            />
            <AnalyticsChart
              title="Conflict Severity"
              description="Conflicts by severity level"
              data={[
                { label: 'Critical', value: conflictAnalysis.data?.criticalConflicts || 0, color: '#ef4444' },
                { label: 'High', value: (conflictAnalysis.data?.totalConflicts || 0) - (conflictAnalysis.data?.criticalConflicts || 0), color: '#f59e0b' },
                { label: 'Medium', value: 0, color: '#8b5cf6' },
                { label: 'Low', value: 0, color: '#10b981' }
              ]}
              height={300}
              config={{
                type: 'bar',
                showGrid: true,
                showLegend: false,
                showTooltip: true,
                yAxisLabel: 'Count'
              }}
            />
          </div>
          
          {/* Critical Conflicts Alert */}
          {conflictAnalysis.data && conflictAnalysis.data.criticalConflicts > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Critical Conflicts Detected</span>
                </CardTitle>
                <CardDescription>
                  {conflictAnalysis.data.criticalConflicts} critical conflicts require immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {conflictAnalysis.data.conflictTypes
                    .filter(conflict => conflict.severity === 'critical')
                    .slice(0, 3)
                    .map((conflict, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-red-100 rounded">
                        <span className="font-medium">{conflict.type}</span>
                        <Badge variant="destructive">{conflict.count} conflicts</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsChart
              title="Monthly Trends"
              description="Shifts and hours trends over months"
              data={timeOffTrendsData}
              height={300}
              config={{
                type: 'line',
                showGrid: true,
                showLegend: true,
                showTooltip: true,
                yAxisLabel: 'Count'
              }}
            />
            <AnalyticsChart
              title="Weekly Performance"
              description="Weekly performance metrics"
              data={utilizationTrendData}
              height={300}
              config={{
                type: 'area',
                showGrid: true,
                showLegend: false,
                showTooltip: true,
                yAxisLabel: 'Performance %'
              }}
            />
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsChart
              title="Optimization Suggestions"
              description="Coverage optimization recommendations"
              data={coverageOptimization.data?.optimizationSuggestions?.map((suggestion, index) => ({
                label: suggestion.type,
                value: suggestion.impact,
                color: suggestion.type === 'hire' ? '#ef4444' : 
                       suggestion.type === 'train' ? '#f59e0b' : 
                       suggestion.type === 'overtime' ? '#8b5cf6' : '#10b981'
              })) || []}
              height={300}
              config={{
                type: 'bar',
                showGrid: true,
                showLegend: false,
                showTooltip: true,
                yAxisLabel: 'Impact Score'
              }}
            />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Coverage Targets</span>
                </CardTitle>
                <CardDescription>
                  Current vs. target coverage metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {coverageOptimization.data ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Current Coverage</span>
                      <Badge variant="outline">{coverageOptimization.data.currentCoverage}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Target Coverage</span>
                      <Badge variant="default">{coverageOptimization.data.targetCoverage}%</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (coverageOptimization.data.currentCoverage / coverageOptimization.data.targetCoverage) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No optimization data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 