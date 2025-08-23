import { api } from '@/lib/api';
import { Schedule, PaginatedResponse, PaginationParams, ScheduleStatus } from '@/types';

export interface CreateScheduleRequest {
  scheduleId: string;
  date: string;
  location: string;
  team: string;
  department: string;
  status?: ScheduleStatus;
  shifts?: string[];
  employees?: string[];
  timeOffRequests?: string[];
  tags?: string[];
  notes?: string;
  isTemplate?: boolean;
  templateName?: string;
}

export interface UpdateScheduleRequest {
  date?: string;
  location?: string;
  team?: string;
  department?: string;
  status?: ScheduleStatus;
  shifts?: string[];
  employees?: string[];
  timeOffRequests?: string[];
  tags?: string[];
  notes?: string;
}

export interface ScheduleFilters extends PaginationParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  team?: string;
  department?: string;
  status?: ScheduleStatus;
  isTemplate?: boolean;
}

export interface GenerateScheduleRequest {
  date: string;
  location: string;
  team: string;
  department: string;
}

export interface ScheduleStats {
  totalSchedules: number;
  publishedSchedules: number;
  draftSchedules: number;
  archivedSchedules: number;
  totalShifts: number;
  totalEmployees: number;
  averageUtilization: number;
  conflictCount: number;
}

export class SchedulesService {
  static async getSchedules(params?: ScheduleFilters): Promise<PaginatedResponse<Schedule>> {
    const response = await api.get<PaginatedResponse<Schedule>>('/schedules', { params });
    return response.data;
  }

  static async getSchedule(id: string): Promise<Schedule> {
    const response = await api.get<Schedule>(`/schedules/${id}`);
    return response.data;
  }

  static async createSchedule(data: CreateScheduleRequest): Promise<Schedule> {
    const response = await api.post<Schedule>('/schedules', data);
    return response.data;
  }

  static async generateSchedule(params: GenerateScheduleRequest): Promise<Schedule> {
    const response = await api.post<Schedule>('/schedules/generate', null, { params });
    return response.data;
  }

  static async updateSchedule(id: string, data: UpdateScheduleRequest): Promise<Schedule> {
    const response = await api.patch<Schedule>(`/schedules/${id}`, data);
    return response.data;
  }

  static async deleteSchedule(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/schedules/${id}`);
    return response.data;
  }

  static async publishSchedule(id: string): Promise<Schedule> {
    const response = await api.post<Schedule>(`/schedules/${id}/publish`);
    return response.data;
  }

  static async archiveSchedule(id: string): Promise<Schedule> {
    const response = await api.post<Schedule>(`/schedules/${id}/archive`);
    return response.data;
  }

  static async lockSchedule(id: string): Promise<Schedule> {
    const response = await api.post<Schedule>(`/schedules/${id}/lock`);
    return response.data;
  }

  static async unlockSchedule(id: string): Promise<Schedule> {
    const response = await api.post<Schedule>(`/schedules/${id}/unlock`);
    return response.data;
  }

  static async getSchedulesByDate(date: string, params?: PaginationParams): Promise<PaginatedResponse<Schedule>> {
    const response = await api.get<PaginatedResponse<Schedule>>(`/schedules/by-date/${date}`, { params });
    return response.data;
  }

  static async getScheduleStats(params?: { startDate?: string; endDate?: string; location?: string; team?: string; department?: string }): Promise<ScheduleStats> {
    const response = await api.get<ScheduleStats>('/schedules/stats', { params });
    return response.data;
  }

  static async duplicateSchedule(id: string, newDate: string): Promise<Schedule> {
    const response = await api.post<Schedule>(`/schedules/${id}/duplicate`, { newDate });
    return response.data;
  }

  static async getScheduleTemplates(params?: PaginationParams): Promise<PaginatedResponse<Schedule>> {
    const response = await api.get<PaginatedResponse<Schedule>>('/schedules/templates', { params });
    return response.data;
  }

  static async createScheduleFromTemplate(templateId: string, data: { date: string; location?: string; team?: string; department?: string }): Promise<Schedule> {
    const response = await api.post<Schedule>(`/schedules/templates/${templateId}/create`, data);
    return response.data;
  }

  static async getScheduleConflicts(id: string): Promise<{
    conflicts: Array<{
      type: string;
      severity: string;
      description: string;
      affectedShifts: string[];
      affectedEmployees: string[];
    }>;
  }> {
    const response = await api.get(`/schedules/${id}/conflicts`);
    return response.data;
  }

  static async getScheduleCoverage(id: string): Promise<{
    totalShifts: number;
    assignedShifts: number;
    coveragePercentage: number;
    roleBreakdown: Array<{
      role: string;
      required: number;
      assigned: number;
      coverage: number;
    }>;
  }> {
    const response = await api.get(`/schedules/${id}/coverage`);
    return response.data;
  }
} 