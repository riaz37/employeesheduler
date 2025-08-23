import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ScheduleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  LOCKED = 'locked',
  ARCHIVED = 'archived',
}

@Schema()
export class ScheduleCoverage {
  @Prop({ required: true, type: String })
  role: string;

  @Prop({ required: true, type: Number })
  required: number;

  @Prop({ required: true, type: Number })
  assigned: number;

  @Prop({ required: true, type: Number })
  coverage: number;

  @Prop({ type: [Types.ObjectId], ref: 'Employee' })
  assignedEmployees: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Employee' })
  backupEmployees: Types.ObjectId[];
}

@Schema()
export class ScheduleConflict {
  @Prop({ required: true, type: String })
  type: string;

  @Prop({ required: true, type: String })
  severity: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: [Types.ObjectId] })
  affectedShifts: Types.ObjectId[];

  @Prop({ required: true, type: [Types.ObjectId] })
  affectedEmployees: Types.ObjectId[];

  @Prop({ type: String })
  resolution?: string;

  @Prop({ type: Boolean, default: false })
  isResolved: boolean;
}

@Schema()
export class ScheduleMetrics {
  @Prop({ required: true, type: Number })
  totalShifts: number;

  @Prop({ required: true, type: Number })
  totalHours: number;

  @Prop({ required: true, type: Number })
  totalEmployees: number;

  @Prop({ required: true, type: Number })
  coveragePercentage: number;

  @Prop({ required: true, type: Number })
  conflictCount: number;

  @Prop({ required: true, type: Number })
  criticalConflictCount: number;

  @Prop({ type: Number })
  overtimeHours?: number;

  @Prop({ type: Number })
  understaffedShifts?: number;
}

@Schema({
  timestamps: true,
  collection: 'schedules',
})
export class Schedule extends Document {
  @Prop({ required: true, type: String, unique: true })
  scheduleId: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true, type: String })
  location: string;

  @Prop({ required: true, type: String })
  team: string;

  @Prop({ required: true, type: String })
  department: string;

  @Prop({ required: true, enum: ScheduleStatus, default: ScheduleStatus.DRAFT })
  status: ScheduleStatus;

  @Prop({ type: [Types.ObjectId], ref: 'Shift' })
  shifts: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Employee' })
  employees: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'TimeOff' })
  timeOffRequests: Types.ObjectId[];

  @Prop({ type: [ScheduleCoverage] })
  coverage: ScheduleCoverage[];

  @Prop({ type: [ScheduleConflict] })
  conflicts: ScheduleConflict[];

  @Prop({ type: ScheduleMetrics })
  metrics: ScheduleMetrics;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: Date })
  publishedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  publishedBy?: Types.ObjectId;

  @Prop({ type: Date })
  lockedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  lockedBy?: Types.ObjectId;

  @Prop({ type: Date })
  archivedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  archivedBy?: Types.ObjectId;

  @Prop({ type: Date })
  lastModifiedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  lastModifiedBy?: Types.ObjectId;

  @Prop({ type: String })
  version: string;

  @Prop({ type: Boolean, default: false })
  isTemplate: boolean;

  @Prop({ type: String })
  templateName?: string;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

// Add indexes for performance
ScheduleSchema.index({ date: 1 });
ScheduleSchema.index({ status: 1 });
ScheduleSchema.index({ location: 1 });
ScheduleSchema.index({ team: 1 });
ScheduleSchema.index({ department: 1 });
ScheduleSchema.index({ date: 1, status: 1 });
ScheduleSchema.index({ date: 1, location: 1 });
ScheduleSchema.index({ date: 1, team: 1 });
ScheduleSchema.index({ isTemplate: 1 });

export type ScheduleDocument = Schedule & Document;
