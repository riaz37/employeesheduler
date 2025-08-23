import * as z from 'zod';
import { TimeOffType, TimeOffStatus, TimeOffPriority } from '@/types';

export const createTimeOffSchema = z.object({
  requestId: z.string().min(3, 'Request ID must be at least 3 characters').max(15, 'Request ID must be at most 15 characters'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  type: z.nativeEnum(TimeOffType),
  status: z.nativeEnum(TimeOffStatus).optional().default(TimeOffStatus.PENDING),
  priority: z.nativeEnum(TimeOffPriority).optional().default(TimeOffPriority.MEDIUM),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  startTime: z.string().min(1, 'Start time is required').regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:mm format'),
  endTime: z.string().min(1, 'End time is required').regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:mm format'),
  totalHours: z.number().min(0.5, 'Total hours must be at least 0.5').max(24, 'Total hours cannot exceed 24'),
  totalDays: z.number().min(0.5, 'Total days must be at least 0.5').max(365, 'Total days cannot exceed 365'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(200, 'Reason must be at most 200 characters'),
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),
  attachments: z.array(z.string()).optional().default([]),
  isHalfDay: z.boolean().default(false),
  isEmergency: z.boolean().default(false),
  requiresCoverage: z.boolean().default(false),
  coverageEmployees: z.array(z.string()).optional().default([]),
  affectedShifts: z.array(z.string()).optional().default([]),
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
});

export const updateTimeOffSchema = createTimeOffSchema.partial();

export type CreateTimeOffFormData = z.infer<typeof createTimeOffSchema>;
export type UpdateTimeOffFormData = z.infer<typeof updateTimeOffSchema>; 