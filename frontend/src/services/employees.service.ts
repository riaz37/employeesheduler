import { api } from '@/lib/api';
import { Employee, PaginatedResponse, PaginationParams, EmployeeRole, EmployeeStatus } from '@/types';
import { CreateEmployeeFormData, UpdateEmployeeFormData } from '@/lib/validations/employee';

export type CreateEmployeeRequest = CreateEmployeeFormData;
export type UpdateEmployeeRequest = Partial<UpdateEmployeeFormData>;

export interface EmployeeFilters extends PaginationParams {
  location?: string;
  team?: string;
  department?: string;
  role?: EmployeeRole;
  status?: EmployeeStatus;
  skills?: string;
  startDate?: string;
  endDate?: string;
}

export interface EmployeeStats {
  totalHours: number;
  totalShifts: number;
  upcomingShifts: number;
  timeOffRequests: number;
  averageRating?: number;
  skillUtilization: Array<{
    skill: string;
    utilization: number;
    lastUsed: string;
  }>;
  availabilityScore: number;
}

export interface EmployeeSchedule {
  employeeId: string;
  startDate: string;
  endDate: string;
  shifts: Array<{
    _id: string;
    shiftId: string;
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    status: string;
    location: string;
  }>;
  timeOff: Array<{
    _id: string;
    requestId: string;
    startDate: string;
    endDate: string;
    type: string;
    status: string;
  }>;
  totalHours: number;
  totalShifts: number;
}

export class EmployeesService {
  static async getEmployees(params?: EmployeeFilters): Promise<PaginatedResponse<Employee>> {
    const response = await api.get<PaginatedResponse<Employee>>('/employees', { params });
    return response.data;
  }

  static async getEmployee(id: string): Promise<Employee> {
    const response = await api.get<Employee>(`/employees/${id}`);
    return response.data;
  }

  static async getEmployeeByEmployeeId(employeeId: string): Promise<Employee> {
    const response = await api.get<Employee>(`/employees/employee-id/${employeeId}`);
    return response.data;
  }

  static async createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
    const response = await api.post<Employee>('/employees', data);
    return response.data;
  }

  static async updateEmployee(id: string, data: UpdateEmployeeRequest): Promise<Employee> {
    const response = await api.patch<Employee>(`/employees/${id}`, data);
    return response.data;
  }

  static async deleteEmployee(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/employees/${id}`);
    return response.data;
  }

  static async getEmployeesByLocation(location: string, params?: PaginationParams): Promise<PaginatedResponse<Employee>> {
    const response = await api.get<PaginatedResponse<Employee>>(`/employees/by-location/${location}`, { params });
    return response.data;
  }

  static async getEmployeesByTeam(team: string, params?: PaginationParams): Promise<PaginatedResponse<Employee>> {
    const response = await api.get<PaginatedResponse<Employee>>(`/employees/by-team/${team}`, { params });
    return response.data;
  }

  static async getEmployeesByDepartment(department: string, params?: PaginationParams): Promise<PaginatedResponse<Employee>> {
    const response = await api.get<PaginatedResponse<Employee>>(`/employees/by-department/${department}`, { params });
    return response.data;
  }

  static async getEmployeesByRole(role: EmployeeRole, params?: PaginationParams): Promise<PaginatedResponse<Employee>> {
    const response = await api.get<PaginatedResponse<Employee>>(`/employees/by-role/${role}`, { params });
    return response.data;
  }

  static async getEmployeesBySkill(skill: string, params?: PaginationParams): Promise<PaginatedResponse<Employee>> {
    const response = await api.get<PaginatedResponse<Employee>>(`/employees/by-skills`, { 
      params: { skill, ...params } 
    });
    return response.data;
  }

  static async getAvailableEmployees(date: string, location?: string, team?: string): Promise<Employee[]> {
    const response = await api.get<Employee[]>('/employees/available', {
      params: { date, location, team }
    });
    return response.data;
  }

  static async searchEmployees(query: string, params?: PaginationParams): Promise<PaginatedResponse<Employee>> {
    const response = await api.get<PaginatedResponse<Employee>>('/employees/search', {
      params: { search: query, ...params }
    });
    return response.data;
  }

  static async getEmployeeStats(id: string): Promise<EmployeeStats> {
    const response = await api.get<EmployeeStats>(`/employees/${id}/stats`);
    return response.data;
  }

  static async getEmployeeSchedule(id: string, startDate: string, endDate: string): Promise<EmployeeSchedule> {
    const response = await api.get<EmployeeSchedule>(`/employees/${id}/schedule`, {
      params: { startDate, endDate }
    });
    return response.data;
  }

  static async getEmployeesStats(params?: { startDate?: string; endDate?: string; location?: string; team?: string; department?: string }): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    onLeaveEmployees: number;
    terminatedEmployees: number;
    averageTenure: number;
    roleDistribution: Array<{ role: string; count: number }>;
    departmentDistribution: Array<{ department: string; count: number }>;
    locationDistribution: Array<{ location: string; count: number }>;
  }> {
    const response = await api.get('/employees/stats', { params });
    return response.data;
  }

  static async bulkUpdateEmployees(employeeIds: string[], updates: Partial<UpdateEmployeeRequest>): Promise<{ message: string; updatedCount: number }> {
    const response = await api.patch('/employees/bulk-update', { employeeIds, updates });
    return response.data;
  }

  static async importEmployees(file: File): Promise<{ message: string; importedCount: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/employees/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  static async exportEmployees(params?: EmployeeFilters): Promise<Blob> {
    const response = await api.get('/employees/export', { 
      params, 
      responseType: 'blob' 
    });
    return response.data;
  }
} 