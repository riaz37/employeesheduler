import { api } from '@/lib/api';

// Core Analytics Interfaces
export interface DailyScheduleAnalytics {
  date: string;
  location: string;
  team: string;
  department: string;
  roleCoverage: Array<{
    role: string;
    required: number;
    assigned: number;
    coverage: number;
    gaps: number;
    overlaps: number;
    utilization: number;
    totalHours: number;
  }>;
  totalShifts: number;
  totalHours: number;
  averageUtilization: number;
  conflicts: Array<{
    type: string;
    severity: string;
    description: string;
    affectedShifts: string[];
    affectedEmployees: string[];
  }>;
}

export interface WeeklyAnalytics {
  period: string;
  dailyAnalytics: DailyScheduleAnalytics[];
  summary: {
    totalShifts: number;
    totalEmployees: number;
    totalHours: number;
    averageCoverage: number;
    totalConflicts: number;
    criticalConflicts: number;
  };
  trends: {
    coverageTrend: Array<{ date: string; coverage: number }>;
    conflictTrend: Array<{ date: string; conflicts: number }>;
    utilizationTrend: Array<{ date: string; utilization: number }>;
  };
}

export interface MonthlyAnalytics {
  period: string;
  weeklyAnalytics: WeeklyAnalytics[];
  summary: {
    totalShifts: number;
    totalEmployees: number;
    totalHours: number;
    averageCoverage: number;
    totalConflicts: number;
    criticalConflicts: number;
    costAnalysis: {
      totalCost: number;
      costPerHour: number;
      costPerEmployee: number;
    };
  };
  trends: {
    monthlyTrends: Array<{ month: string; metrics: Record<string, number | string> }>;
    seasonalPatterns: Array<{ season: string; characteristics: string[] }>;
  };
}

export interface EmployeeWorkloadAnalytics {
  employeeId: string;
  employeeName: string;
  totalHours: number;
  totalShifts: number;
  averageHoursPerDay: number;
  uniqueDays: number;
  timeOffDays: number;
  consecutiveDays: number;
  skillUtilization: Array<{
    name: string;
    level: string;
    certified: boolean;
  }>;
  availability: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone: string;
    isAvailable: boolean;
  }>;
}

export interface TeamPerformanceAnalytics {
  teamId: string;
  period: string;
  totalShifts: number;
  totalHours: number;
  averageCoverage: number;
  conflictCount: number;
  employeeUtilization: Array<{
    employeeId: string;
    firstName: string;
    lastName: string;
    totalHours: number;
    utilization: number;
    skillMatch: number;
  }>;
  performanceMetrics: {
    efficiency: number;
    reliability: number;
    flexibility: number;
  };
}

export interface LocationUtilizationAnalytics {
  locationId: string;
  period: string;
  totalShifts: number;
  totalHours: number;
  averageUtilization: number;
  peakHours: Array<{
    hour: number;
    utilization: number;
  }>;
  spaceEfficiency: number;
  costPerHour: number;
  recommendations: string[];
}

export interface ConflictAnalysis {
  period: string;
  totalConflicts: number;
  criticalConflicts: number;
  conflictTypes: Array<{
    type: string;
    count: number;
    severity: string;
  }>;
  affectedEntities: {
    shifts: string[];
    employees: string[];
    timeOff: string[];
  };
  resolutionSuggestions: Array<{
    conflictId: string;
    description: string;
    suggestion: string;
    impact: string;
  }>;
}

export interface CoverageOptimization {
  period: string;
  currentCoverage: number;
  targetCoverage: number;
  roleCoverageMetrics: Array<{
    role: string;
    coverage: number;
    required: number;
    assigned: number;
    gaps: number;
    overlaps: number;
  }>;
  gaps: Array<{
    role: string;
    date: string;
    startTime: string;
    endTime: string;
    shortage: number;
    availableEmployees: string[];
  }>;
  optimizationSuggestions: Array<{
    type: 'reassign' | 'hire' | 'train' | 'maintain';
    description: string;
    impact: number;
    cost: number;
  }>;
}

export interface DashboardStats {
  totalEmployees: number;
  activeShifts: number;
  upcomingShifts: number;
  pendingTimeOff: number;
  totalShifts: number;
}

export interface DashboardActivity {
  id: number;
  type: string;
  message: string;
  time: string;
  severity: 'info' | 'warning' | 'success' | 'error';
}

export interface DashboardShift {
  id: number;
  title: string;
  time: string;
  date: string;
  employees: number;
  required: number;
}

export interface AnalyticsSummary {
  period: string;
  summary: {
    totalShifts: number;
    totalEmployees: number;
    totalHours: number;
    averageCoverage: number;
    totalConflicts: number;
    criticalConflicts: number;
  };
  trends: {
    coverageTrend: Array<{ date: string; coverage: number }>;
    conflictTrend: Array<{ date: string; conflicts: number }>;
    utilizationTrend: Array<{ date: string; utilization: number }>;
  };
  dailyBreakdown: DailyScheduleAnalytics[];
}

export interface SingleDateConflict {
  shiftId: string;
  title: string;
  date: string;
  location: string;
  team: string;
  conflicts: {
    type: string;
    severity: string;
    description: string;
    affectedEmployees: string[];
  };
  assignedEmployees: string[];
}

export interface CoverageGap {
  _id: {
    role: string;
    location: string;
    team: string;
  };
  required: number;
  assigned: number;
  gap: number;
  coverage: number;
  shifts: Array<{
    _id: string;
    title: string;
    date: string;
    requirements: Array<{
      role: string;
      quantity: number;
    }>;
    assignedEmployees: string[];
  }>;
}

export class AnalyticsService {
  // Daily Schedule Analytics
  static async getDailyScheduleAnalytics(
    date: string,
    location?: string,
    team?: string,
    department?: string
  ): Promise<DailyScheduleAnalytics> {
    const response = await api.get<DailyScheduleAnalytics>('/analytics/daily-schedule', {
      params: { date, location, team, department }
    });
    return response.data;
  }

  // Weekly Analytics
  static async getWeeklyAnalytics(
    startDate: string,
    location?: string,
    team?: string,
    department?: string
  ): Promise<WeeklyAnalytics> {
    const response = await api.get<WeeklyAnalytics>('/analytics/weekly', {
      params: { startDate, location, team, department }
    });
    return response.data;
  }

  // Monthly Analytics
  static async getMonthlyAnalytics(
    year: number,
    month: number,
    location?: string,
    team?: string,
    department?: string
  ): Promise<MonthlyAnalytics> {
    const response = await api.get<MonthlyAnalytics>('/analytics/monthly', {
      params: { year, month, location, team, department }
    });
    return response.data;
  }

  // Employee Workload Analytics
  static async getEmployeeWorkloadAnalytics(
    employeeId: string,
    startDate: string,
    endDate: string
  ): Promise<EmployeeWorkloadAnalytics> {
    const response = await api.get<EmployeeWorkloadAnalytics>(`/analytics/employee-workload/${employeeId}`, {
      params: { startDate, endDate }
    });
    return response.data;
  }

  // Team Performance Analytics
  static async getTeamPerformanceAnalytics(
    teamId: string,
    startDate: string,
    endDate: string,
    location?: string,
    department?: string
  ): Promise<TeamPerformanceAnalytics> {
    const response = await api.get<TeamPerformanceAnalytics>('/analytics/team-performance', {
      params: { startDate, endDate, teamId, location, department }
    });
    return response.data;
  }

  // Location Utilization Analytics
  static async getLocationUtilizationAnalytics(
    locationId: string,
    startDate: string,
    endDate: string,
    team?: string,
    department?: string
  ): Promise<LocationUtilizationAnalytics> {
    const response = await api.get<LocationUtilizationAnalytics>('/analytics/location-utilization', {
      params: { startDate, endDate, locationId, team, department }
    });
    return response.data;
  }

  // Conflict Analysis (Date Range)
  static async getConflictAnalysis(
    startDate: string,
    endDate: string,
    location?: string,
    team?: string,
    department?: string
  ): Promise<ConflictAnalysis> {
    const response = await api.get<ConflictAnalysis>('/analytics/conflict-analysis', {
      params: { startDate, endDate, location, team, department }
    });
    return response.data;
  }

  // Single Date Conflicts
  static async getConflictsForDate(
    date: string,
    location?: string
  ): Promise<SingleDateConflict[]> {
    const response = await api.get<SingleDateConflict[]>('/analytics/conflicts', {
      params: { date, location }
    });
    return response.data;
  }

  // Coverage Optimization
  static async getCoverageOptimization(
    startDate: string,
    endDate: string,
    location?: string,
    team?: string,
    department?: string
  ): Promise<CoverageOptimization> {
    const response = await api.get<CoverageOptimization>('/analytics/coverage-optimization', {
      params: { startDate, endDate, location, team, department }
    });
    return response.data;
  }

  // Coverage Gaps
  static async getCoverageGaps(
    date: string,
    location?: string
  ): Promise<CoverageGap[]> {
    const response = await api.get<CoverageGap[]>('/analytics/coverage-gaps', {
      params: { date, location }
    });
    return response.data;
  }

  // Dashboard Stats
  static async getDashboardStats(
    date?: string,
    location?: string,
    team?: string,
    department?: string
  ): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/analytics/dashboard-stats', {
      params: { date, location, team, department }
    });
    return response.data;
  }

  // Recent Activities
  static async getRecentActivities(
    date?: string,
    location?: string,
    team?: string,
    department?: string
  ): Promise<DashboardActivity[]> {
    const response = await api.get<DashboardActivity[]>('/analytics/recent-activities', {
      params: { date, location, team, department }
    });
    return response.data;
  }

  // Upcoming Shifts
  static async getUpcomingShifts(
    date?: string,
    location?: string,
    team?: string,
    department?: string
  ): Promise<DashboardShift[]> {
    const response = await api.get<DashboardShift[]>('/analytics/upcoming-shifts', {
      params: { date, location, team, department }
    });
    return response.data;
  }

  // Analytics Summary
  static async getAnalyticsSummary(
    startDate: string,
    endDate: string,
    location?: string,
    team?: string,
    department?: string
  ): Promise<AnalyticsSummary> {
    const response = await api.get<AnalyticsSummary>('/analytics/analytics-summary', {
      params: { startDate, endDate, location, team, department }
    });
    return response.data;
  }

  // Export Analytics
  static async exportAnalytics(
    format: 'csv' | 'json',
    startDate: string,
    endDate: string,
    type: 'daily' | 'weekly' | 'monthly' | 'employee' | 'team' | 'location',
    location?: string,
    team?: string,
    department?: string
  ): Promise<Blob | Record<string, unknown>> {
    const response = await api.get(`/analytics/export/${format}`, {
      params: { startDate, endDate, type, location, team, department },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  }

  // Utility method to download CSV
  static downloadCSV(data: Blob, filename: string): void {
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
