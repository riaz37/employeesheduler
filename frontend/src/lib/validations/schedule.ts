import * as z from 'zod';
import { ScheduleStatus } from '@/types';

export const createScheduleSchema = z.object({
  scheduleId: z.string().min(1, 'Schedule ID is required'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required'),
  team: z.string().min(1, 'Team is required'),
  department: z.string().min(1, 'Department is required'),
  status: z.nativeEnum(ScheduleStatus).default(ScheduleStatus.DRAFT),
  shifts: z.array(z.string()).default([]),
  employees: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const updateScheduleSchema = createScheduleSchema.partial();

export type CreateScheduleFormData = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleFormData = z.infer<typeof updateScheduleSchema>; 