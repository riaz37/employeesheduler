import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShiftsService, CreateShiftRequest, UpdateShiftRequest, ShiftFilters } from '@/services/shifts.service';
import { Shift, PaginationParams } from '@/types';

export const useShifts = (filters?: ShiftFilters) => {
  return useQuery({
    queryKey: ['shifts', filters],
    queryFn: () => ShiftsService.getShifts(filters),
  });
};

export const useShift = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['shifts', id],
    queryFn: () => ShiftsService.getShift(id),
    enabled: enabled && !!id,
  });
};

export const useCreateShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShiftRequest) => ShiftsService.createShift(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShiftRequest) => ShiftsService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const useGenerateRecurringShifts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, startDate, endDate, pattern }: {
      templateId: string;
      startDate: string;
      endDate: string;
      pattern: string;
    }) => ShiftsService.generateRecurringShifts(templateId, startDate, endDate, pattern),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const useUpdateShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShiftRequest }) =>
      ShiftsService.updateShift(id, data),
    onSuccess: (updatedShift) => {
      queryClient.setQueryData(['shifts', updatedShift._id], updatedShift);
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const useDeleteShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ShiftsService.deleteShift(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: ['shifts', deletedId] });
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const useAssignEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shiftId, employeeId }: { shiftId: string; employeeId: string }) =>
      ShiftsService.assignEmployee(shiftId, employeeId),
    onSuccess: (updatedShift) => {
      queryClient.setQueryData(['shifts', updatedShift._id], updatedShift);
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const useUnassignEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shiftId, employeeId }: { shiftId: string; employeeId: string }) =>
      ShiftsService.unassignEmployee(shiftId, employeeId),
    onSuccess: (updatedShift) => {
      queryClient.setQueryData(['shifts', updatedShift._id], updatedShift);
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const useStartShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ShiftsService.startShift(id),
    onSuccess: (updatedShift) => {
      queryClient.setQueryData(['shifts', updatedShift._id], updatedShift);
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const useCompleteShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ShiftsService.completeShift(id),
    onSuccess: (updatedShift) => {
      queryClient.setQueryData(['shifts', updatedShift._id], updatedShift);
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const useCancelShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      ShiftsService.cancelShift(id, reason),
    onSuccess: (updatedShift) => {
      queryClient.setQueryData(['shifts', updatedShift._id], updatedShift);
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const useShiftsByDate = (date: string, location?: string, team?: string) => {
  return useQuery({
    queryKey: ['shifts', 'by-date', date, location, team],
    queryFn: () => ShiftsService.getShiftsByDate(date, location, team),
    enabled: !!date,
  });
};

export const useShiftsByEmployee = (employeeId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['shifts', 'by-employee', employeeId, startDate, endDate],
    queryFn: () => ShiftsService.getShiftsByEmployee(employeeId, startDate, endDate),
    enabled: !!employeeId,
  });
};

export const useUnassignedShifts = (date?: string, location?: string) => {
  return useQuery({
    queryKey: ['shifts', 'unassigned', date, location],
    queryFn: () => ShiftsService.getUnassignedShifts(date, location),
  });
};

export const useShiftConflicts = (shiftId: string) => {
  return useQuery({
    queryKey: ['shifts', shiftId, 'conflicts'],
    queryFn: () => ShiftsService.getShiftConflicts(shiftId),
    enabled: !!shiftId,
  });
};

export const useShiftCoverage = (date: string, location?: string, team?: string) => {
  return useQuery({
    queryKey: ['shifts', 'coverage', date, location, team],
    queryFn: () => ShiftsService.getShiftCoverage(date, location, team),
    enabled: !!date,
  });
};

export const useDuplicateShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newDate }: { id: string; newDate: string }) =>
      ShiftsService.duplicateShift(id, newDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}; 