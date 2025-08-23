import * as z from 'zod';
import { EmployeeRole, EmployeeStatus } from '@/types';

export const employeeSkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  certified: z.boolean(),
  validUntil: z.string().optional(),
});

export const availabilityWindowSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  isAvailable: z.boolean(),
});

export const workPreferenceSchema = z.object({
  maxHoursPerWeek: z.number().min(1).max(168),
  preferredShifts: z.array(z.string()).default([]),
  preferredLocations: z.array(z.string()).default([]),
  maxConsecutiveDays: z.number().min(1).max(7),
});

export const createEmployeeSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(EmployeeRole),
  status: z.nativeEnum(EmployeeStatus).default(EmployeeStatus.ACTIVE),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  team: z.string().min(1, 'Team is required'),
  hireDate: z.string().min(1, 'Hire date is required'),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  notes: z.string().optional(),
  isPartTime: z.boolean(),
  skills: z.array(employeeSkillSchema).default([]),
  availabilityWindows: z.array(availabilityWindowSchema).default([]),
  workPreference: workPreferenceSchema,
});

export const updateEmployeeSchema = createEmployeeSchema.partial().omit({ password: true });

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;
export type EmployeeSkillFormData = z.infer<typeof employeeSkillSchema>;
export type AvailabilityWindowFormData = z.infer<typeof availabilityWindowSchema>;
export type WorkPreferenceFormData = z.infer<typeof workPreferenceSchema>; 