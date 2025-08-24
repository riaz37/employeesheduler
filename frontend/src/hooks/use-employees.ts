import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EmployeesService, CreateEmployeeRequest, UpdateEmployeeRequest, EmployeeFilters } from '@/services/employees.service';
import { Employee, PaginationParams, EmployeeRole } from '@/types';

export const useEmployees = (filters?: EmployeeFilters) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => EmployeesService.getEmployees(filters),
  });
};

export const useEmployee = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => EmployeesService.getEmployee(id),
    enabled: enabled && !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => EmployeesService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) =>
      EmployeesService.updateEmployee(id, data),
    onSuccess: (updatedEmployee: Employee) => {
      queryClient.setQueryData(['employees', updatedEmployee._id], updatedEmployee);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => EmployeesService.deleteEmployee(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: ['employees', deletedId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useEmployeesByLocation = (location: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['employees', 'location', location, params],
    queryFn: () => EmployeesService.getEmployeesByLocation(location, params),
    enabled: !!location,
  });
};

export const useEmployeesByTeam = (team: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['employees', 'team', team, params],
    queryFn: () => EmployeesService.getEmployeesByTeam(team, params),
    enabled: !!team,
  });
};

export const useEmployeesByDepartment = (department: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['employees', 'department', department, params],
    queryFn: () => EmployeesService.getEmployeesByDepartment(department, params),
    enabled: !!department,
  });
};

export const useEmployeesByRole = (role: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['employees', 'role', role, params],
    queryFn: () => EmployeesService.getEmployeesByRole(role as EmployeeRole, params),
    enabled: !!role,
  });
};

export const useEmployeesBySkill = (skill: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['employees', 'skill', skill, params],
    queryFn: () => EmployeesService.getEmployeesBySkill(skill, params),
    enabled: !!skill,
  });
};

export const useAvailableEmployees = (date: string, location?: string, team?: string) => {
  return useQuery({
    queryKey: ['employees', 'available', date, location, team],
    queryFn: () => EmployeesService.getAvailableEmployees(date, location, team),
    enabled: !!date,
  });
};

export const useSearchEmployees = (query: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['employees', 'search', query, params],
    queryFn: () => EmployeesService.searchEmployees(query, params),
    enabled: !!query && query.length > 2,
  });
};

export const useEmployeeStats = (id: string) => {
  return useQuery({
    queryKey: ['employees', id, 'stats'],
    queryFn: () => EmployeesService.getEmployeeStats(id),
    enabled: !!id,
  });
};

export const useEmployeeSchedule = (id: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['employees', id, 'schedule', startDate, endDate],
    queryFn: () => EmployeesService.getEmployeeSchedule(id, startDate, endDate),
    enabled: !!id && !!startDate && !!endDate,
  });
}; 