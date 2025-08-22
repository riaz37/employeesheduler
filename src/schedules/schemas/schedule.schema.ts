import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ScheduleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  LOCKED = 'locked',
}

export interface ScheduleCoverage {
  role: string;
  required: number;
  assigned: number;
  coverage: number; // percentage
  gaps: number[];
  overlaps: number[];
  employees: Types.ObjectId[];
}

export interface ScheduleConflict {
  type:
    | 'overlap'
    | 'double_booking'
    | 'time_off_clash'
    | 'skill_mismatch'
    | 'availability_mismatch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedEntities: {
    shifts?: Types.ObjectId[];
    employees?: Types.ObjectId[];
    timeOff?: Types.ObjectId[];
  };
  resolution?: string;
}

export interface ScheduleMetrics {
  totalShifts: number;
  totalEmployees: number;
  totalHours: number;
  averageUtilization: number;
  coverageScore: number;
  conflictCount: number;
  criticalConflicts: number;
}

@Schema({
  timestamps: true,
  collection: 'schedules',
})
export class Schedule extends Document {
  @Prop({ required: true, trim: true, unique: true, index: true })
  scheduleId: string;

  @Prop({ required: true, index: true })
  date: Date;

  @Prop({ required: true, trim: true, index: true })
  location: string;

  @Prop({ required: true, trim: true, index: true })
  team: string;

  @Prop({ required: true, trim: true, index: true })
  department: string;

  @Prop({
    required: true,
    enum: ScheduleStatus,
    default: ScheduleStatus.DRAFT,
    index: true,
  })
  status: ScheduleStatus;

  @Prop({ type: [Types.ObjectId], ref: 'Shift', index: true })
  shifts: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Employee', index: true })
  employees: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'TimeOff', index: true })
  timeOffRequests: Types.ObjectId[];

  @Prop({ type: [Object] })
  coverage: ScheduleCoverage[];

  @Prop({ type: [Object] })
  conflicts: ScheduleConflict[];

  @Prop({ type: Object })
  metrics: ScheduleMetrics;

  @Prop({ type: [String], trim: true })
  tags: string[];

  @Prop({ type: String, trim: true })
  notes?: string;

  @Prop({ type: Date, index: true })
  publishedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  publishedBy?: Types.ObjectId;

  @Prop({ type: Date, index: true })
  lockedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  lockedBy?: Types.ObjectId;

  @Prop({ type: Date, index: true })
  archivedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  archivedBy?: Types.ObjectId;

  @Prop({ type: Date, index: true })
  lastModifiedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  lastModifiedBy?: Types.ObjectId;

  @Prop({ type: String, trim: true })
  version: string;

  @Prop({ type: Boolean, default: false })
  isTemplate: boolean;

  @Prop({ type: String, trim: true })
  templateName?: string;

  // Virtual for date string
  get dateString(): string {
    return this.date.toISOString().split('T')[0];
  }

  // Virtual for day of week
  get dayOfWeek(): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[this.date.getDay()];
  }

  // Virtual for is published
  get isPublished(): boolean {
    return this.status === ScheduleStatus.PUBLISHED;
  }

  // Virtual for is locked
  get isLocked(): boolean {
    return this.status === ScheduleStatus.LOCKED;
  }

  // Virtual for is archived
  get isArchived(): boolean {
    return this.status === ScheduleStatus.ARCHIVED;
  }

  // Virtual for has conflicts
  get hasConflicts(): boolean {
    return this.conflicts.length > 0;
  }

  // Virtual for critical conflicts
  get hasCriticalConflicts(): boolean {
    return this.conflicts.some((conflict) => conflict.severity === 'critical');
  }

  // Virtual for coverage percentage
  get overallCoverage(): number {
    if (!this.coverage || this.coverage.length === 0) return 0;
    const totalCoverage = this.coverage.reduce(
      (sum, cov) => sum + cov.coverage,
      0,
    );
    return Math.round(totalCoverage / this.coverage.length);
  }

  // Virtual for shift count by status
  get shiftCountByStatus(): Record<string, number> {
    // This would need to be populated from the shifts collection
    return {};
  }
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

// Indexes for performance
ScheduleSchema.index({ date: 1 });
ScheduleSchema.index({ date: 1, location: 1 });
ScheduleSchema.index({ date: 1, team: 1 });
ScheduleSchema.index({ date: 1, department: 1 });
ScheduleSchema.index({ status: 1, date: 1 });
ScheduleSchema.index({ location: 1, team: 1, date: 1 });
ScheduleSchema.index({ department: 1, location: 1, date: 1 });

// Compound indexes for common queries
ScheduleSchema.index({ date: 1, location: 1, status: 1 });
ScheduleSchema.index({ date: 1, team: 1, status: 1 });
ScheduleSchema.index({ date: 1, department: 1, status: 1 });
ScheduleSchema.index({ location: 1, team: 1, date: 1, status: 1 });

// Date range queries
ScheduleSchema.index({ date: 1, status: 1, location: 1, team: 1 });

// Template queries
ScheduleSchema.index({ isTemplate: 1, templateName: 1 });

// Text index for search
ScheduleSchema.index({
  location: 'text',
  team: 'text',
  department: 'text',
  notes: 'text',
  templateName: 'text',
});

export type ScheduleDocument = Schedule & Document;
