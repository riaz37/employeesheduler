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

@Schema()
export class Skill {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, enum: ['beginner', 'intermediate', 'advanced', 'expert'] })
  level: string;

  @Prop({ required: true, type: Boolean })
  certified: boolean;

  @Prop({ type: Date })
  validUntil?: Date;
}

@Schema()
export class AvailabilityWindow {
  @Prop({ required: true, type: Number, min: 0, max: 6 })
  dayOfWeek: number;

  @Prop({ required: true, type: String })
  startTime: string;

  @Prop({ required: true, type: String })
  endTime: string;

  @Prop({ required: true, type: String })
  timezone: string;

  @Prop({ required: true, type: Boolean })
  isAvailable: boolean;
}

@Schema()
export class WorkPreference {
  @Prop({ required: true, type: Number })
  maxHoursPerWeek: number;

  @Prop({ required: true, type: [String] })
  preferredShifts: string[];

  @Prop({ required: true, type: [String] })
  preferredLocations: string[];

  @Prop({ required: true, type: Number })
  maxConsecutiveDays: number;
}

@Schema({
  timestamps: true,
  collection: 'employees',
})
export class Employee extends Document {
  @Prop({ required: true, type: String, unique: true })
  employeeId: string;

  @Prop({ required: true, type: String })
  firstName: string;

  @Prop({ required: true, type: String })
  lastName: string;

  @Prop({ required: true, type: String, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true, type: String, select: false })
  password: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ required: true, enum: EmployeeRole })
  role: EmployeeRole;

  @Prop({ required: true, enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
  status: EmployeeStatus;

  @Prop({ required: true, type: String })
  department: string;

  @Prop({ required: true, type: String })
  location: string;

  @Prop({ required: true, type: String })
  team: string;

  @Prop({ required: true, type: [Skill] })
  skills: Skill[];

  @Prop({ required: true, type: [AvailabilityWindow] })
  availabilityWindows: AvailabilityWindow[];

  @Prop({ required: true, type: WorkPreference })
  workPreference: WorkPreference;

  @Prop({ required: true, type: Date })
  hireDate: Date;

  @Prop({ type: Date })
  terminationDate?: Date;

  @Prop({ type: String })
  emergencyContact?: string;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: Boolean, default: false })
  isPartTime: boolean;

  @Prop({ type: Number, default: 0 })
  totalHoursWorked: number;

  @Prop({ type: Date })
  lastActiveDate?: Date;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

// Add indexes for performance
EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ employeeId: 1 });
EmployeeSchema.index({ role: 1 });
EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ location: 1 });
EmployeeSchema.index({ team: 1 });
EmployeeSchema.index({ hireDate: 1 });

export type EmployeeDocument = Employee & Document;
