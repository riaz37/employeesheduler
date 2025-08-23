import { api } from '@/lib/api';

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
    employees: string[];
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

export interface EmployeeWorkloadAnalytics {
  employeeId: string;
  period: string;
  totalHours: number;
  totalShifts: number;
  averageShiftDuration: number;
  skillUtilization: Array<{
    skill: string;
    utilization: number;
    lastUsed: string;
  }>;
  availabilityPattern: Array<{
    dayOfWeek: number;
    availableHours: number;
    preferredHours: number;
  }>;
  workloadTrend: Array<{
    date: string;
    hours: number;
    shifts: number;
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
  gaps: Array<{
    role: string;
    date: string;
    startTime: string;
    endTime: string;
    shortage: number;
    availableEmployees: string[];
  }>;
  optimizationSuggestions: Array<{
    type: 'reassign' | 'hire' | 'train' | 'overtime';
    description: string;
    impact: number;
    cost: number;
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

export interface DashboardStats {
  totalEmployees: number;
  activeShifts: number;
  upcomingShifts: number;
  pendingTimeOff: number;
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

export class AnalyticsService {
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

  static async getTeamPerformanceAnalytics(
    teamId: string,
    startDate: string,
    endDate: string
  ): Promise<TeamPerformanceAnalytics> {
    const response = await api.get<TeamPerformanceAnalytics>(`/analytics/team-performance/${teamId}`, {
      params: { startDate, endDate }
    });
    return response.data;
  }

  static async getLocationUtilizationAnalytics(
    locationId: string,
    startDate: string,
    endDate: string
  ): Promise<LocationUtilizationAnalytics> {
    const response = await api.get<LocationUtilizationAnalytics>(`/analytics/location-utilization/${locationId}`, {
      params: { startDate, endDate }
    });
    return response.data;
  }

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

  static async getCustomAnalytics(
    query: string,
    params?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const response = await api.post('/analytics/custom', { query }, { params });
    return response.data;
  }

  static async exportAnalytics(
    type: 'daily' | 'weekly' | 'monthly' | 'employee' | 'team' | 'location',
    params: Record<string, unknown>,
    format: 'csv' | 'excel' | 'pdf' = 'csv'
  ): Promise<Blob> {
    const response = await api.get(`/analytics/export/${type}`, {
      params: { ...params, format },
      responseType: 'blob'
    });
    return response.data;
  }

  static async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/analytics/dashboard/stats');
    return response.data;
  }

  static async getRecentActivities(): Promise<DashboardActivity[]> {
    const response = await api.get<DashboardActivity[]>('/analytics/dashboard/activities');
    return response.data;
  }

  static async getUpcomingShifts(): Promise<DashboardShift[]> {
    const response = await api.get<DashboardShift[]>('/analytics/dashboard/shifts');
    return response.data;
  }
} 