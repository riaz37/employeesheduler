import * as z from 'zod';
import { ShiftType, ShiftStatus } from '@/types';

export const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  address: z.string().min(1, 'Address is required'),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  timezone: z.string().min(1, 'Timezone is required'),
});

export const requirementSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  skillRequirements: z.array(z.string()).min(1, 'At least one skill is required'),
  minExperience: z.number().min(0),
  certificationRequired: z.boolean(),
  quantity: z.number().min(1),
});

export const createShiftSchema = z.object({
  shiftId: z.string().min(3, 'Shift ID must be at least 3 characters'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  type: z.nativeEnum(ShiftType),
  status: z.nativeEnum(ShiftStatus).optional(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  location: z.object({
    name: z.string().min(2, 'Location name must be at least 2 characters'),
    address: z.string().min(10, 'Address must be at least 10 characters'),
    coordinates: z.array(z.number()).length(2, 'Coordinates must be [longitude, latitude]'),
    building: z.string().optional(),
    floor: z.string().optional(),
    room: z.string().optional(),
  }),
  department: z.string().min(2, 'Department must be at least 2 characters'),
  team: z.string().min(2, 'Team must be at least 2 characters'),
  requirements: z.array(z.object({
    role: z.string().min(2, 'Role must be at least 2 characters'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    skills: z.array(z.string()).min(1, 'At least one skill is required'),
    description: z.string().optional(),
    isCritical: z.boolean().optional(),
  })).min(1, 'At least one requirement is needed'),
  assignedEmployees: z.array(z.string()).optional(),
  backupEmployees: z.array(z.string()).optional(),
  totalHours: z.number().min(0.5, 'Total hours must be at least 0.5'),
  breakMinutes: z.number().min(0).optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z.string().optional(),
  recurringEndDate: z.string().optional(),
  priority: z.number().min(0).max(10).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  scheduledBy: z.string().optional(),
});

export const updateShiftSchema = createShiftSchema.partial();

export type CreateShiftFormData = z.infer<typeof createShiftSchema>;
export type UpdateShiftFormData = z.infer<typeof updateShiftSchema>;
export type LocationFormData = z.infer<typeof locationSchema>;
export type RequirementFormData = z.infer<typeof requirementSchema>; 