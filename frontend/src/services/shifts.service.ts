import { api } from '@/lib/api';
import { Shift, PaginatedResponse, PaginationParams, ShiftType, ShiftStatus } from '@/types';

export interface CreateShiftRequest {
  shiftId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: ShiftType;
  status?: ShiftStatus;
  title: string;
  description?: string;
  location: {
    name: string;
    address: string;
    coordinates: number[];
    building?: string;
    floor?: string;
    room?: string;
  };
  department: string;
  team: string;
  requirements: {
    role: string;
    quantity: number;
    skills: string[];
    description?: string;
    isCritical?: boolean;
  }[];
  assignedEmployees?: string[];
  backupEmployees?: string[];
  totalHours: number;
  breakMinutes?: number;
  isRecurring?: boolean;
  recurringPattern?: string;
  recurringEndDate?: string;
  priority?: number;
  tags?: string[];
  notes?: string;
  scheduledBy?: string;
}

export interface UpdateShiftRequest {
  shiftId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  type?: ShiftType;
  status?: ShiftStatus;
  title?: string;
  description?: string;
  location?: {
    name?: string;
    address?: string;
    coordinates?: number[];
    building?: string;
    floor?: string;
    room?: string;
  };
  department?: string;
  team?: string;
  requirements?: Array<{
    role: string;
    quantity: number;
    skills: string[];
    description?: string;
    isCritical?: boolean;
  }>;
  assignedEmployees?: string[];
  backupEmployees?: string[];
  totalHours?: number;
  breakMinutes?: number;
  priority?: number;
  tags?: string[];
  notes?: string;
}

export interface ShiftFilters extends PaginationParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  team?: string;
  department?: string;
  status?: ShiftStatus;
  type?: ShiftType;
  assignedEmployee?: string;
  unassigned?: boolean;
}

export interface CreateShiftTemplateRequest extends Omit<CreateShiftRequest, 'shiftId'> {
  templateName: string;
  isRecurring: boolean;
  recurringPattern: string;
  recurringEndDate?: string;
}

export interface CreateRecurringShiftsRequest {
  templateId: string;
  startDate: string;
  endDate: string;
  pattern: 'daily' | 'weekly' | 'monthly';
  interval?: number;
}

export interface AssignEmployeesRequest {
  employeeIds: string[];
  backupEmployeeIds?: string[];
}

export interface ShiftStats {
  totalShifts: number;
  completedShifts: number;
  cancelledShifts: number;
  totalHours: number;
  averageUtilization: number;
  coverageScore: number;
  conflictCount: number;
}

export class ShiftsService {
  static async getShifts(params?: ShiftFilters): Promise<PaginatedResponse<Shift>> {
    const response = await api.get<PaginatedResponse<Shift>>('/shifts', { params });
    return response.data;
  }

  static async getShift(id: string): Promise<Shift> {
    const response = await api.get<Shift>(`/shifts/${id}`);
    return response.data;
  }

  static async getShiftByShiftId(shiftId: string): Promise<Shift> {
    const response = await api.get<Shift>(`/shifts/shift-id/${shiftId}`);
    return response.data;
  }

  static async createShift(data: CreateShiftRequest): Promise<Shift> {
    const response = await api.post<Shift>('/shifts', data);
    return response.data;
  }

  static async createShiftTemplate(data: CreateShiftTemplateRequest): Promise<Shift> {
    const response = await api.post<Shift>('/shifts/template', data);
    return response.data;
  }

  static async createRecurringShifts(templateId: string, data: CreateRecurringShiftsRequest): Promise<Shift[]> {
    const response = await api.post<Shift[]>(`/shifts/template/${templateId}/recurring`, data);
    return response.data;
  }

  static async updateShift(id: string, data: UpdateShiftRequest): Promise<Shift> {
    const response = await api.patch<Shift>(`/shifts/${id}`, data);
    return response.data;
  }

  static async deleteShift(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/shifts/${id}`);
    return response.data;
  }

  static async getShiftsByDate(date: string, params?: PaginationParams): Promise<PaginatedResponse<Shift>> {
    const response = await api.get<PaginatedResponse<Shift>>(`/shifts/by-date/${date}`, { params });
    return response.data;
  }

  static async getShiftsByEmployee(employeeId: string, params?: PaginationParams): Promise<PaginatedResponse<Shift>> {
    const response = await api.get<PaginatedResponse<Shift>>(`/shifts/by-employee/${employeeId}`, { params });
    return response.data;
  }

  static async getShiftsByLocation(location: string, params?: PaginationParams): Promise<PaginatedResponse<Shift>> {
    const response = await api.get<PaginatedResponse<Shift>>(`/shifts/by-location/${location}`, { params });
    return response.data;
  }

  static async getShiftsByTeam(team: string, params?: PaginationParams): Promise<PaginatedResponse<Shift>> {
    const response = await api.get<PaginatedResponse<Shift>>(`/shifts/by-team/${team}`, { params });
    return response.data;
  }

  static async getShiftStats(params?: { startDate?: string; endDate?: string; location?: string; team?: string }): Promise<ShiftStats> {
    const response = await api.get<ShiftStats>('/shifts/stats', { params });
    return response.data;
  }

  static async assignEmployees(shiftId: string, data: AssignEmployeesRequest): Promise<Shift> {
    const response = await api.post<Shift>(`/shifts/${shiftId}/assign`, data);
    return response.data;
  }

  static async assignEmployee(shiftId: string, employeeId: string): Promise<Shift> {
    const response = await api.post<Shift>(`/shifts/${shiftId}/assign`, { employeeIds: [employeeId] });
    return response.data;
  }

  static async unassignEmployees(shiftId: string, employeeIds: string[]): Promise<Shift> {
    const response = await api.post<Shift>(`/shifts/${shiftId}/unassign`, { employeeIds });
    return response.data;
  }

  static async unassignEmployee(shiftId: string, employeeId: string): Promise<Shift> {
    const response = await api.post<Shift>(`/shifts/${shiftId}/unassign`, { employeeIds: [employeeId] });
    return response.data;
  }

  static async assignBackupEmployees(shiftId: string, backupEmployeeIds: string[]): Promise<Shift> {
    const response = await api.post<Shift>(`/shifts/${shiftId}/backup`, { backupEmployeeIds });
    return response.data;
  }

  static async startShift(shiftId: string): Promise<Shift> {
    const response = await api.post<Shift>(`/shifts/${shiftId}/start`);
    return response.data;
  }

  static async completeShift(shiftId: string): Promise<Shift> {
    const response = await api.post<Shift>(`/shifts/${shiftId}/complete`);
    return response.data;
  }

  static async cancelShift(shiftId: string, reason?: string): Promise<Shift> {
    const response = await api.post<Shift>(`/shifts/${shiftId}/cancel`, { reason });
    return response.data;
  }
} 