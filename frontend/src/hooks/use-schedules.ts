import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SchedulesService, CreateScheduleRequest, UpdateScheduleRequest, ScheduleFilters } from '@/services/schedules.service';
import { Schedule, PaginationParams } from '@/types';

export const useSchedules = (filters?: ScheduleFilters) => {
  return useQuery({
    queryKey: ['schedules', filters],
    queryFn: () => SchedulesService.getSchedules(filters),
  });
};

export const useSchedule = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['schedules', id],
    queryFn: () => SchedulesService.getSchedule(id),
    enabled: enabled && !!id,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduleRequest) => SchedulesService.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useGenerateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { date: string; location: string; team: string; department: string }) =>
      SchedulesService.generateSchedule(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScheduleRequest }) =>
      SchedulesService.updateSchedule(id, data),
    onSuccess: (updatedSchedule) => {
      queryClient.setQueryData(['schedules', updatedSchedule._id], updatedSchedule);
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SchedulesService.deleteSchedule(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: ['schedules', deletedId] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const usePublishSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SchedulesService.publishSchedule(id),
    onSuccess: (updatedSchedule) => {
      queryClient.setQueryData(['schedules', updatedSchedule._id], updatedSchedule);
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useArchiveSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SchedulesService.archiveSchedule(id),
    onSuccess: (updatedSchedule) => {
      queryClient.setQueryData(['schedules', updatedSchedule._id], updatedSchedule);
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useLockSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SchedulesService.lockSchedule(id),
    onSuccess: (updatedSchedule) => {
      queryClient.setQueryData(['schedules', updatedSchedule._id], updatedSchedule);
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useUnlockSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SchedulesService.unlockSchedule(id),
    onSuccess: (updatedSchedule) => {
      queryClient.setQueryData(['schedules', updatedSchedule._id], updatedSchedule);
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useSchedulesByDate = (date: string, location?: string, team?: string) => {
  return useQuery({
    queryKey: ['schedules', 'by-date', date, location, team],
    queryFn: () => SchedulesService.getSchedulesByDate(date, location, team),
    enabled: !!date,
  });
};

export const useSchedulesByLocation = (location: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['schedules', 'by-location', location, params],
    queryFn: () => SchedulesService.getSchedulesByLocation(location, params),
    enabled: !!location,
  });
};

export const useSchedulesByTeam = (team: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['schedules', 'by-team', team, params],
    queryFn: () => SchedulesService.getSchedulesByTeam(team, params),
    enabled: !!team,
  });
};

export const useSchedulesByDepartment = (department: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['schedules', 'by-department', department, params],
    queryFn: () => SchedulesService.getSchedulesByDepartment(department, params),
    enabled: !!department,
  });
};

export const useScheduleTemplates = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['schedules', 'templates', params],
    queryFn: () => SchedulesService.getScheduleTemplates(params),
  });
};

export const useCreateFromTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, date }: { templateId: string; date: string }) =>
      SchedulesService.createFromTemplate(templateId, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useScheduleConflicts = (id: string) => {
  return useQuery({
    queryKey: ['schedules', id, 'conflicts'],
    queryFn: () => SchedulesService.getScheduleConflicts(id),
    enabled: !!id,
  });
};

export const useScheduleMetrics = (id: string) => {
  return useQuery({
    queryKey: ['schedules', id, 'metrics'],
    queryFn: () => SchedulesService.getScheduleMetrics(id),
    enabled: !!id,
  });
};

export const useOptimizeSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SchedulesService.optimizeSchedule(id),
    onSuccess: (updatedSchedule) => {
      queryClient.setQueryData(['schedules', updatedSchedule._id], updatedSchedule);
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useDuplicateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newDate }: { id: string; newDate: string }) =>
      SchedulesService.duplicateSchedule(id, newDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useWeeklySchedule = (startDate: string, location?: string, team?: string) => {
  return useQuery({
    queryKey: ['schedules', 'weekly', startDate, location, team],
    queryFn: () => SchedulesService.getWeeklySchedule(startDate, location, team),
    enabled: !!startDate,
  });
};

export const useMonthlySchedule = (year: number, month: number, location?: string, team?: string) => {
  return useQuery({
    queryKey: ['schedules', 'monthly', year, month, location, team],
    queryFn: () => SchedulesService.getMonthlySchedule(year, month, location, team),
    enabled: !!year && !!month,
  });
}; 