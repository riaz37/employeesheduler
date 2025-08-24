import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AnalyticsService,
  DailyScheduleAnalytics,
  WeeklyAnalytics,
  MonthlyAnalytics,
  EmployeeWorkloadAnalytics,
  TeamPerformanceAnalytics,
  LocationUtilizationAnalytics,
  ConflictAnalysis,
  CoverageOptimization,
  DashboardStats,
  DashboardActivity,
  DashboardShift,
  AnalyticsSummary,
  SingleDateConflict,
  CoverageGap,
} from '@/services/analytics.service';

export const useAnalytics = () => {
  const queryClient = useQueryClient();

  // Daily Schedule Analytics
  const useDailyScheduleAnalytics = (
    date: string,
    location?: string,
    team?: string,
    department?: string
  ) => {
    return useQuery({
      queryKey: ['daily-schedule', date, location, team, department],
      queryFn: () => AnalyticsService.getDailyScheduleAnalytics(date, location, team, department),
      enabled: !!date,
    });
  };

  // Weekly Analytics
  const useWeeklyAnalytics = (
    startDate: string,
    location?: string,
    team?: string,
    department?: string
  ) => {
    return useQuery({
      queryKey: ['weekly-analytics', startDate, location, team, department],
      queryFn: () => AnalyticsService.getWeeklyAnalytics(startDate, location, team, department),
      enabled: !!startDate,
    });
  };

  // Monthly Analytics
  const useMonthlyAnalytics = (
    year: number,
    month: number,
    location?: string,
    team?: string,
    department?: string
  ) => {
    return useQuery({
      queryKey: ['monthly-analytics', year, month, location, team, department],
      queryFn: () => AnalyticsService.getMonthlyAnalytics(year, month, location, team, department),
      enabled: !!year && !!month,
    });
  };

  // Employee Workload Analytics
  const useEmployeeWorkloadAnalytics = (
    employeeId: string,
    startDate: string,
    endDate: string
  ) => {
    return useQuery({
      queryKey: ['employee-workload', employeeId, startDate, endDate],
      queryFn: () => AnalyticsService.getEmployeeWorkloadAnalytics(employeeId, startDate, endDate),
      enabled: !!employeeId && !!startDate && !!endDate,
    });
  };

  // Team Performance Analytics
  const useTeamPerformanceAnalytics = (
    teamId: string,
    startDate: string,
    endDate: string,
    location?: string,
    department?: string
  ) => {
    return useQuery({
      queryKey: ['team-performance', teamId, startDate, endDate, location, department],
      queryFn: () => AnalyticsService.getTeamPerformanceAnalytics(teamId, startDate, endDate, location, department),
      enabled: !!teamId && !!startDate && !!endDate,
    });
  };

  // Location Utilization Analytics
  const useLocationUtilizationAnalytics = (
    locationId: string,
    startDate: string,
    endDate: string,
    team?: string,
    department?: string
  ) => {
    return useQuery({
      queryKey: ['location-utilization', locationId, startDate, endDate, team, department],
      queryFn: () => AnalyticsService.getLocationUtilizationAnalytics(locationId, startDate, endDate, team, department),
      enabled: !!locationId && !!startDate && !!endDate,
    });
  };

  // Conflict Analysis
  const useConflictAnalysis = (
    startDate: string,
    endDate: string,
    location?: string,
    team?: string,
    department?: string
  ) => {
    return useQuery({
      queryKey: ['conflict-analysis', startDate, endDate, location, team, department],
      queryFn: () => AnalyticsService.getConflictAnalysis(startDate, endDate, location, team, department),
      enabled: !!startDate && !!endDate,
    });
  };

  // Single Date Conflicts
  const useConflictsForDate = (
    date: string,
    location?: string
  ) => {
    return useQuery({
      queryKey: ['conflicts-for-date', date, location],
      queryFn: () => AnalyticsService.getConflictsForDate(date, location),
      enabled: !!date,
    });
  };

  // Coverage Optimization
  const useCoverageOptimization = (
    startDate: string,
    endDate: string,
    location?: string,
    team?: string,
    department?: string
  ) => {
    return useQuery({
      queryKey: ['coverage-optimization', startDate, endDate, location, team, department],
      queryFn: () => AnalyticsService.getCoverageOptimization(startDate, endDate, location, team, department),
      enabled: !!startDate && !!endDate,
    });
  };

  // Coverage Gaps
  const useCoverageGaps = (
    date: string,
    location?: string
  ) => {
    return useQuery({
      queryKey: ['coverage-gaps', date, location],
      queryFn: () => AnalyticsService.getCoverageGaps(date, location),
      enabled: !!date,
    });
  };

  // Dashboard Stats
  const useDashboardStats = (
    date?: string,
    location?: string,
    team?: string,
    department?: string
  ) => {
    return useQuery({
      queryKey: ['dashboard-stats', date, location, team, department],
      queryFn: () => AnalyticsService.getDashboardStats(date, location, team, department),
    });
  };

  // Recent Activities
  const useRecentActivities = (
    date?: string,
    location?: string,
    team?: string,
    department?: string
  ) => {
    return useQuery({
      queryKey: ['recent-activities', date, location, team, department],
      queryFn: () => AnalyticsService.getRecentActivities(date, location, team, department),
    });
  };

  // Upcoming Shifts
  const useUpcomingShifts = (
    date?: string,
    location?: string,
    team?: string,
    department?: string
  ) => {
    return useQuery({
      queryKey: ['upcoming-shifts', date, location, team, department],
      queryFn: () => AnalyticsService.getUpcomingShifts(date, location, team, department),
    });
  };

  // Analytics Summary
  const useAnalyticsSummary = (
    startDate: string,
    endDate: string,
    location?: string,
    team?: string,
    department?: string
  ) => {
    return useQuery({
      queryKey: ['analytics-summary', startDate, endDate, location, team, department],
      queryFn: () => AnalyticsService.getAnalyticsSummary(startDate, endDate, location, team, department),
      enabled: !!startDate && !!endDate,
    });
  };

  // Export Analytics
  const exportAnalyticsMutation = useMutation({
    mutationFn: ({
      format,
      startDate,
      endDate,
      type,
      location,
      team,
      department,
    }: {
      format: 'csv' | 'json';
      startDate: string;
      endDate: string;
      type: 'daily' | 'weekly' | 'monthly' | 'employee' | 'team' | 'location';
      location?: string;
      team?: string;
      department?: string;
    }) => AnalyticsService.exportAnalytics(format, startDate, endDate, type, location, team, department),
    onSuccess: (data, variables) => {
      if (variables.format === 'csv' && data instanceof Blob) {
        const filename = `analytics-${variables.type}-${variables.startDate}-${variables.endDate}.csv`;
        AnalyticsService.downloadCSV(data, filename);
      }
    },
  });

  // Refresh all analytics data
  const refreshAllAnalytics = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['daily-schedule'] });
    queryClient.invalidateQueries({ queryKey: ['weekly-analytics'] });
    queryClient.invalidateQueries({ queryKey: ['monthly-analytics'] });
    queryClient.invalidateQueries({ queryKey: ['employee-workload'] });
    queryClient.invalidateQueries({ queryKey: ['team-performance'] });
    queryClient.invalidateQueries({ queryKey: ['location-utilization'] });
    queryClient.invalidateQueries({ queryKey: ['conflict-analysis'] });
    queryClient.invalidateQueries({ queryKey: ['coverage-optimization'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['recent-activities'] });
    queryClient.invalidateQueries({ queryKey: ['upcoming-shifts'] });
  }, [queryClient]);

  return {
    // Query hooks
    useDailyScheduleAnalytics,
    useWeeklyAnalytics,
    useMonthlyAnalytics,
    useEmployeeWorkloadAnalytics,
    useTeamPerformanceAnalytics,
    useLocationUtilizationAnalytics,
    useConflictAnalysis,
    useConflictsForDate,
    useCoverageOptimization,
    useCoverageGaps,
    useDashboardStats,
    useRecentActivities,
    useUpcomingShifts,
    useAnalyticsSummary,
    
    // Mutations
    exportAnalytics: exportAnalyticsMutation.mutate,
    exportAnalyticsAsync: exportAnalyticsMutation.mutateAsync,
    
    // Utilities
    refreshAllAnalytics,
    isExporting: exportAnalyticsMutation.isPending,
    exportError: exportAnalyticsMutation.error,
  };
}; 