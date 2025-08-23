import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TimeOffService, CreateTimeOffRequest, UpdateTimeOffRequest, TimeOffFilters } from '@/services/time-off.service';
import { TimeOff, PaginationParams } from '@/types';

export const useTimeOffRequests = (filters?: TimeOffFilters) => {
  return useQuery({
    queryKey: ['time-off', filters],
    queryFn: () => TimeOffService.getTimeOffRequests(filters),
  });
};

export const useTimeOffRequest = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['time-off', id],
    queryFn: () => TimeOffService.getTimeOffRequest(id),
    enabled: enabled && !!id,
  });
};

export const useCreateTimeOffRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimeOffRequest) => TimeOffService.createTimeOffRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off'] });
    },
  });
};

export const useUpdateTimeOffRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTimeOffRequest }) =>
      TimeOffService.updateTimeOffRequest(id, data),
    onSuccess: (updatedTimeOff) => {
      queryClient.setQueryData(['time-off', updatedTimeOff._id], updatedTimeOff);
      queryClient.invalidateQueries({ queryKey: ['time-off'] });
    },
  });
};

export const useDeleteTimeOffRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TimeOffService.deleteTimeOffRequest(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: ['time-off', deletedId] });
      queryClient.invalidateQueries({ queryKey: ['time-off'] });
    },
  });
};

export const useApproveTimeOff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      TimeOffService.approveTimeOff(id, comments),
    onSuccess: (updatedTimeOff) => {
      queryClient.setQueryData(['time-off', updatedTimeOff._id], updatedTimeOff);
      queryClient.invalidateQueries({ queryKey: ['time-off'] });
    },
  });
};

export const useRejectTimeOff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      TimeOffService.rejectTimeOff(id, reason),
    onSuccess: (updatedTimeOff) => {
      queryClient.setQueryData(['time-off', updatedTimeOff._id], updatedTimeOff);
      queryClient.invalidateQueries({ queryKey: ['time-off'] });
    },
  });
};

export const useCancelTimeOff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      TimeOffService.cancelTimeOff(id, reason),
    onSuccess: (updatedTimeOff) => {
      queryClient.setQueryData(['time-off', updatedTimeOff._id], updatedTimeOff);
      queryClient.invalidateQueries({ queryKey: ['time-off'] });
    },
  });
};

export const useTimeOffByEmployee = (employeeId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['time-off', 'by-employee', employeeId, params],
    queryFn: () => TimeOffService.getTimeOffByEmployee(employeeId, params),
    enabled: !!employeeId,
  });
};

export const useTimeOffByType = (type: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['time-off', 'by-type', type, params],
    queryFn: () => TimeOffService.getTimeOffByType(type, params),
    enabled: !!type,
  });
};

export const useTimeOffByStatus = (status: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['time-off', 'by-status', status, params],
    queryFn: () => TimeOffService.getTimeOffByStatus(status, params),
    enabled: !!status,
  });
};

export const usePendingApprovals = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['time-off', 'pending-approvals', params],
    queryFn: () => TimeOffService.getPendingApprovals(params),
  });
};

export const useTimeOffByDateRange = (startDate: string, endDate: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['time-off', 'by-date-range', startDate, endDate, params],
    queryFn: () => TimeOffService.getTimeOffByDateRange(startDate, endDate, params),
    enabled: !!startDate && !!endDate,
  });
};

export const useTimeOffConflicts = (id: string) => {
  return useQuery({
    queryKey: ['time-off', id, 'conflicts'],
    queryFn: () => TimeOffService.getTimeOffConflicts(id),
    enabled: !!id,
  });
};

export const useTimeOffStats = (employeeId?: string) => {
  return useQuery({
    queryKey: ['time-off', 'stats', employeeId],
    queryFn: () => TimeOffService.getTimeOffStats(employeeId),
  });
};

export const useTimeOffCalendar = (startDate: string, endDate: string, employeeId?: string) => {
  return useQuery({
    queryKey: ['time-off', 'calendar', startDate, endDate, employeeId],
    queryFn: () => TimeOffService.getTimeOffCalendar(startDate, endDate, employeeId),
    enabled: !!startDate && !!endDate,
  });
};

export const useBulkApprove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestIds, comments }: { requestIds: string[]; comments?: string }) =>
      TimeOffService.bulkApprove(requestIds, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off'] });
    },
  });
};

export const useBulkReject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestIds, reason }: { requestIds: string[]; reason: string }) =>
      TimeOffService.bulkReject(requestIds, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off'] });
    },
  });
}; 