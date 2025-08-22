import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum EmployeeRole {
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  STAFF = 'staff',
  SPECIALIST = 'specialist',
  TRAINEE = 'trainee',
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  certified: boolean;
  validUntil?: Date;
}

export interface AvailabilityWindow {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string;
  isAvailable: boolean;
}

export interface WorkPreference {
  maxHoursPerWeek: number;
  preferredShifts: string[]; // 'morning', 'afternoon', 'night'
  preferredLocations: string[];
  maxConsecutiveDays: number;
}

@Schema({
  timestamps: true,
  collection: 'employees',
})
export class Employee extends Document {
  @Prop({ required: true, trim: true, index: true })
  employeeId: string;

  @Prop({ required: true, trim: true, index: true })
  firstName: string;

  @Prop({ required: true, trim: true, index: true })
  lastName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, enum: EmployeeRole, index: true })
  role: EmployeeRole;

  @Prop({
    required: true,
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
    index: true,
  })
  status: EmployeeStatus;

  @Prop({ required: true, trim: true, index: true })
  department: string;

  @Prop({ required: true, trim: true, index: true })
  location: string;

  @Prop({ required: true, trim: true, index: true })
  team: string;

  @Prop({ type: [Object], required: true })
  skills: Skill[];

  @Prop({ type: [Object], required: true })
  availabilityWindows: AvailabilityWindow[];

  @Prop({ type: Object, required: true })
  workPreference: WorkPreference;

  @Prop({ type: Date, index: true })
  hireDate: Date;

  @Prop({ type: Date })
  terminationDate?: Date;

  @Prop({ type: String, trim: true })
  phoneNumber?: string;

  @Prop({ type: String, trim: true })
  emergencyContact?: string;

  @Prop({ type: String, trim: true })
  notes?: string;

  @Prop({ type: Boolean, default: false })
  isPartTime: boolean;

  @Prop({ type: Number, default: 0 })
  totalHoursWorked: number;

  @Prop({ type: Date, index: true })
  lastActiveDate?: Date;

  // Virtual for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Virtual for skill names
  get skillNames(): string[] {
    return this.skills.map((skill) => skill.name);
  }

  // Virtual for available days
  get availableDays(): number[] {
    return this.availabilityWindows
      .filter((window) => window.isAvailable)
      .map((window) => window.dayOfWeek);
  }
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

// Indexes for performance
EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ employeeId: 1 });
EmployeeSchema.index({ role: 1, status: 1 });
EmployeeSchema.index({ department: 1, location: 1 });
EmployeeSchema.index({ team: 1, status: 1 });
EmployeeSchema.index({ 'skills.name': 1 });
EmployeeSchema.index({
  'availabilityWindows.dayOfWeek': 1,
  'availabilityWindows.isAvailable': 1,
});
EmployeeSchema.index({ hireDate: 1, status: 1 });
EmployeeSchema.index({ location: 1, status: 1, role: 1 });

// Compound indexes for common queries
EmployeeSchema.index({ location: 1, team: 1, status: 1 });
EmployeeSchema.index({ role: 1, location: 1, status: 1 });
EmployeeSchema.index({ department: 1, location: 1, status: 1 });

// Text index for search
EmployeeSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  department: 'text',
  location: 'text',
  team: 'text',
});

export type EmployeeDocument = Employee & Document;
