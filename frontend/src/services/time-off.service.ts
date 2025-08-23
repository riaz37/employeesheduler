import { api } from '@/lib/api';
import { TimeOff, PaginatedResponse, PaginationParams, TimeOffType, TimeOffStatus, TimeOffPriority } from '@/types';

export interface CreateTimeOffRequest {
  requestId: string;
  employeeId: string;
  type: TimeOffType;
  status?: TimeOffStatus;
  priority?: TimeOffPriority;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  totalDays: number;
  reason: string;
  description?: string;
  attachments?: string[];
  isHalfDay?: boolean;
  isEmergency?: boolean;
  requiresCoverage?: boolean;
  coverageEmployees?: string[];
  affectedShifts?: string[];
  notes?: string;
}

export interface UpdateTimeOffRequest {
  type?: TimeOffType;
  status?: TimeOffStatus;
  priority?: TimeOffPriority;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  totalHours?: number;
  totalDays?: number;
  reason?: string;
  description?: string;
  attachments?: string[];
  isHalfDay?: boolean;
  isEmergency?: boolean;
  requiresCoverage?: boolean;
  coverageEmployees?: string[];
  affectedShifts?: string[];
  notes?: string;
}

export interface TimeOffFilters extends PaginationParams {
  employeeId?: string;
  type?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  isEmergency?: boolean;
  requiresCoverage?: boolean;
}

export class TimeOffService {
  static async getTimeOffRequests(params?: TimeOffFilters): Promise<PaginatedResponse<TimeOff>> {
    const response = await api.get<PaginatedResponse<TimeOff>>('/time-off', { params });
    return response.data;
  }

  static async getTimeOffRequest(id: string): Promise<TimeOff> {
    const response = await api.get<TimeOff>(`/time-off/${id}`);
    return response.data;
  }

  static async createTimeOffRequest(data: CreateTimeOffRequest): Promise<TimeOff> {
    const response = await api.post<TimeOff>('/time-off', data);
    return response.data;
  }

  static async updateTimeOffRequest(id: string, data: UpdateTimeOffRequest): Promise<TimeOff> {
    const response = await api.patch<TimeOff>(`/time-off/${id}`, data);
    return response.data;
  }

  static async deleteTimeOffRequest(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/time-off/${id}`);
    return response.data;
  }

  static async approveTimeOff(id: string, comments?: string): Promise<TimeOff> {
    const response = await api.post<TimeOff>(`/time-off/${id}/approve`, { comments });
    return response.data;
  }

  static async rejectTimeOff(id: string, reason: string): Promise<TimeOff> {
    const response = await api.post<TimeOff>(`/time-off/${id}/reject`, { reason });
    return response.data;
  }

  static async cancelTimeOff(id: string, reason: string): Promise<TimeOff> {
    const response = await api.post<TimeOff>(`/time-off/${id}/cancel`, { reason });
    return response.data;
  }

  static async getTimeOffByEmployee(employeeId: string, params?: PaginationParams): Promise<PaginatedResponse<TimeOff>> {
    const response = await api.get<PaginatedResponse<TimeOff>>(`/time-off/employee/${employeeId}`, { params });
    return response.data;
  }

  static async getTimeOffByType(type: string, params?: PaginationParams): Promise<PaginatedResponse<TimeOff>> {
    const response = await api.get<PaginatedResponse<TimeOff>>(`/time-off/type/${type}`, { params });
    return response.data;
  }

  static async getTimeOffByStatus(status: string, params?: PaginationParams): Promise<PaginatedResponse<TimeOff>> {
    const response = await api.get<PaginatedResponse<TimeOff>>(`/time-off/status/${status}`, { params });
    return response.data;
  }

  static async getPendingApprovals(params?: PaginationParams): Promise<PaginatedResponse<TimeOff>> {
    const response = await api.get<PaginatedResponse<TimeOff>>('/time-off/pending-approvals', { params });
    return response.data;
  }

  static async getTimeOffByDateRange(startDate: string, endDate: string, params?: PaginationParams): Promise<PaginatedResponse<TimeOff>> {
    const response = await api.get<PaginatedResponse<TimeOff>>('/time-off/date-range', {
      params: { startDate, endDate, ...params }
    });
    return response.data;
  }

  static async getTimeOffConflicts(id: string): Promise<{
    conflicts: Array<{
      type: string;
      severity: string;
      description: string;
      affectedShifts: string[];
      affectedEmployees: string[];
    }>;
  }> {
    const response = await api.get(`/time-off/${id}/conflicts`);
    return response.data;
  }

  static async getTimeOffStats(employeeId?: string): Promise<{
    totalRequests: number;
    approvedRequests: number;
    pendingRequests: number;
    rejectedRequests: number;
    totalDays: number;
    remainingDays: number;
    byType: Record<string, number>;
  }> {
    const response = await api.get('/time-off/stats', {
      params: employeeId ? { employeeId } : undefined
    });
    return response.data;
  }

  static async getTimeOffCalendar(startDate: string, endDate: string, employeeId?: string): Promise<Array<{
    date: string;
    requests: TimeOff[];
    totalEmployeesOff: number;
  }>> {
    const response = await api.get('/time-off/calendar', {
      params: { startDate, endDate, employeeId }
    });
    return response.data;
  }

  static async bulkApprove(requestIds: string[], comments?: string): Promise<{ message: string; approved: number }> {
    const response = await api.post('/time-off/bulk-approve', {
      requestIds,
      comments
    });
    return response.data;
  }

  static async bulkReject(requestIds: string[], reason: string): Promise<{ message: string; rejected: number }> {
    const response = await api.post('/time-off/bulk-reject', {
      requestIds,
      reason
    });
    return response.data;
  }
} 