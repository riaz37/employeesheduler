import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics.service';

export const useDailyScheduleAnalytics = (
  date: string,
  location?: string,
  team?: string,
  department?: string
) => {
  return useQuery({
    queryKey: ['analytics', 'daily-schedule', date, location, team, department],
    queryFn: () => AnalyticsService.getDailyScheduleAnalytics(date, location, team, department),
    enabled: !!date,
  });
};

export const useWeeklyAnalytics = (
  startDate: string,
  location?: string,
  team?: string,
  department?: string
) => {
  return useQuery({
    queryKey: ['analytics', 'weekly', startDate, location, team, department],
    queryFn: () => AnalyticsService.getWeeklyAnalytics(startDate, location, team, department),
    enabled: !!startDate,
  });
};

export const useMonthlyAnalytics = (
  year: number,
  month: number,
  location?: string,
  team?: string,
  department?: string
) => {
  return useQuery({
    queryKey: ['analytics', 'monthly', year, month, location, team, department],
    queryFn: () => AnalyticsService.getMonthlyAnalytics(year, month, location, team, department),
    enabled: !!year && !!month,
  });
};

export const useEmployeeWorkloadAnalytics = (
  employeeId: string,
  startDate: string,
  endDate: string
) => {
  return useQuery({
    queryKey: ['analytics', 'employee-workload', employeeId, startDate, endDate],
    queryFn: () => AnalyticsService.getEmployeeWorkloadAnalytics(employeeId, startDate, endDate),
    enabled: !!employeeId && !!startDate && !!endDate,
  });
};

export const useTeamPerformanceAnalytics = (
  teamId: string,
  startDate: string,
  endDate: string
) => {
  return useQuery({
    queryKey: ['analytics', 'team-performance', teamId, startDate, endDate],
    queryFn: () => AnalyticsService.getTeamPerformanceAnalytics(teamId, startDate, endDate),
    enabled: !!teamId && !!startDate && !!endDate,
  });
};

export const useLocationUtilizationAnalytics = (
  locationId: string,
  startDate: string,
  endDate: string
) => {
  return useQuery({
    queryKey: ['analytics', 'location-utilization', locationId, startDate, endDate],
    queryFn: () => AnalyticsService.getLocationUtilizationAnalytics(locationId, startDate, endDate),
    enabled: !!locationId && !!startDate && !!endDate,
  });
};

export const useConflictAnalysis = (
  startDate: string,
  endDate: string,
  location?: string,
  team?: string,
  department?: string
) => {
  return useQuery({
    queryKey: ['analytics', 'conflict-analysis', startDate, endDate, location, team, department],
    queryFn: () => AnalyticsService.getConflictAnalysis(startDate, endDate, location, team, department),
    enabled: !!startDate && !!endDate,
  });
};

export const useCoverageOptimization = (
  startDate: string,
  endDate: string,
  location?: string,
  team?: string,
  department?: string
) => {
  return useQuery({
    queryKey: ['analytics', 'coverage-optimization', startDate, endDate, location, team, department],
    queryFn: () => AnalyticsService.getCoverageOptimization(startDate, endDate, location, team, department),
    enabled: !!startDate && !!endDate,
  });
};

export const useCustomAnalytics = (
  query: string,
  params?: Record<string, unknown>
) => {
  return useQuery({
    queryKey: ['analytics', 'custom', query, params],
    queryFn: () => AnalyticsService.getCustomAnalytics(query, params),
    enabled: !!query,
  });
};

// Legacy hooks for backward compatibility
export const useEmployeeAnalytics = useEmployeeWorkloadAnalytics;
export const useLocationAnalytics = useLocationUtilizationAnalytics;
export const useTeamAnalytics = useTeamPerformanceAnalytics;

// Dashboard stats hook that combines multiple analytics
export const useDashboardStats = (
  startDate: string,
  endDate: string,
  location?: string,
  team?: string,
  department?: string
) => {
  const dailyAnalytics = useDailyScheduleAnalytics(startDate, location, team, department);
  const conflictAnalysis = useConflictAnalysis(startDate, endDate, location, team, department);
  const coverageOptimization = useCoverageOptimization(startDate, endDate, location, team, department);

  return {
    dailyAnalytics: dailyAnalytics.data,
    conflictAnalysis: conflictAnalysis.data,
    coverageOptimization: coverageOptimization.data,
    isLoading: dailyAnalytics.isLoading || conflictAnalysis.isLoading || coverageOptimization.isLoading,
    error: dailyAnalytics.error || conflictAnalysis.error || coverageOptimization.error,
  };
};

// Performance metrics hook that combines relevant analytics
export const usePerformanceMetrics = (
  startDate: string,
  endDate: string,
  location?: string,
  team?: string,
  department?: string
) => {
  const weeklyAnalytics = useWeeklyAnalytics(startDate, location, team, department);
  const monthlyAnalytics = useMonthlyAnalytics(
    new Date(startDate).getFullYear(),
    new Date(startDate).getMonth() + 1,
    location,
    team,
    department
  );

  return {
    weeklyAnalytics: weeklyAnalytics.data,
    monthlyAnalytics: monthlyAnalytics.data,
    isLoading: weeklyAnalytics.isLoading || monthlyAnalytics.isLoading,
    error: weeklyAnalytics.error || monthlyAnalytics.error,
  };
};

// Export analytics hook
export const useExportAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'export'],
    queryFn: () => AnalyticsService.exportAnalytics('daily', {}, 'csv'),
    enabled: false, // This should be called manually, not automatically
  });
}; 