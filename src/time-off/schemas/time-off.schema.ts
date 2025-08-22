import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TimeOffType {
  VACATION = 'vacation',
  SICK_LEAVE = 'sick_leave',
  PERSONAL_LEAVE = 'personal_leave',
  MATERNITY_LEAVE = 'maternity_leave',
  PATERNITY_LEAVE = 'paternity_leave',
  BEREAVEMENT = 'bereavement',
  UNPAID_LEAVE = 'unpaid_leave',
  COMPENSATORY_TIME = 'compensatory_time',
  OTHER = 'other',
}

export enum TimeOffStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  MODIFIED = 'modified',
}

export enum TimeOffPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface TimeOffApproval {
  approverId: Types.ObjectId;
  approvedAt: Date;
  comments?: string;
  level: number; // approval level
}

export interface TimeOffModification {
  modifiedBy: Types.ObjectId;
  modifiedAt: Date;
  reason: string;
  previousData: any;
}

@Schema({
  timestamps: true,
  collection: 'time_off',
})
export class TimeOff extends Document {
  @Prop({ required: true, trim: true, unique: true, index: true })
  requestId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee', index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, enum: TimeOffType, index: true })
  type: TimeOffType;

  @Prop({
    required: true,
    enum: TimeOffStatus,
    default: TimeOffStatus.PENDING,
    index: true,
  })
  status: TimeOffStatus;

  @Prop({
    required: true,
    enum: TimeOffPriority,
    default: TimeOffPriority.MEDIUM,
    index: true,
  })
  priority: TimeOffPriority;

  @Prop({ required: true, index: true })
  startDate: Date;

  @Prop({ required: true, index: true })
  endDate: Date;

  @Prop({ required: true, trim: true })
  startTime: string; // HH:mm format, for partial day requests

  @Prop({ required: true, trim: true })
  endTime: string; // HH:mm format, for partial day requests

  @Prop({ required: true, type: Number })
  totalHours: number;

  @Prop({ required: true, type: Number })
  totalDays: number;

  @Prop({ required: true, trim: true })
  reason: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: [String], trim: true })
  attachments?: string[]; // file paths or URLs

  @Prop({ type: [Object] })
  approvals: TimeOffApproval[];

  @Prop({ type: [Object] })
  modifications: TimeOffModification[];

  @Prop({ type: String, trim: true })
  rejectionReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  rejectedBy?: Types.ObjectId;

  @Prop({ type: Date })
  rejectedAt?: Date;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  cancelledBy?: Types.ObjectId;

  @Prop({ type: String, trim: true })
  cancellationReason?: string;

  @Prop({ type: Boolean, default: false })
  isHalfDay: boolean;

  @Prop({ type: Boolean, default: false })
  isEmergency: boolean;

  @Prop({ type: Boolean, default: false })
  requiresCoverage: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'Employee' })
  coverageEmployees?: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Shift' })
  affectedShifts?: Types.ObjectId[];

  @Prop({ type: String, trim: true })
  notes?: string;

  @Prop({ type: Date, index: true })
  submittedAt?: Date;

  @Prop({ type: Date, index: true })
  lastModifiedAt?: Date;

  // Virtual for request duration
  get duration(): string {
    if (this.totalDays === 1) {
      return `${this.totalHours} hours`;
    }
    return `${this.totalDays} days (${this.totalHours} hours)`;
  }

  // Virtual for is approved
  get isApproved(): boolean {
    return this.status === TimeOffStatus.APPROVED;
  }

  // Virtual for is pending
  get isPending(): boolean {
    return this.status === TimeOffStatus.PENDING;
  }

  // Virtual for is rejected
  get isRejected(): boolean {
    return this.status === TimeOffStatus.REJECTED;
  }

  // Virtual for is cancelled
  get isCancelled(): boolean {
    return this.status === TimeOffStatus.CANCELLED;
  }

  // Virtual for approval level
  get currentApprovalLevel(): number {
    if (this.approvals.length === 0) return 0;
    return Math.max(...this.approvals.map((a) => a.level));
  }

  // Virtual for is fully approved
  get isFullyApproved(): boolean {
    // This would depend on your approval workflow
    return this.status === TimeOffStatus.APPROVED;
  }
}

export const TimeOffSchema = SchemaFactory.createForClass(TimeOff);

// Indexes for performance
TimeOffSchema.index({ employeeId: 1 });
TimeOffSchema.index({ status: 1 });
TimeOffSchema.index({ type: 1 });
TimeOffSchema.index({ startDate: 1 });
TimeOffSchema.index({ endDate: 1 });
TimeOffSchema.index({ priority: 1 });
TimeOffSchema.index({ 'approvals.approverId': 1 });
TimeOffSchema.index({ affectedShifts: 1 });

// Compound indexes for common queries
TimeOffSchema.index({ employeeId: 1, status: 1 });
TimeOffSchema.index({ employeeId: 1, startDate: 1 });
TimeOffSchema.index({ status: 1, startDate: 1 });
TimeOffSchema.index({ type: 1, status: 1 });
TimeOffSchema.index({ startDate: 1, endDate: 1 });
TimeOffSchema.index({ employeeId: 1, type: 1, status: 1 });

// Date range queries
TimeOffSchema.index({ startDate: 1, endDate: 1, status: 1 });
TimeOffSchema.index({ startDate: 1, endDate: 1, employeeId: 1 });

// Text index for search
TimeOffSchema.index({
  reason: 'text',
  description: 'text',
  notes: 'text',
});

export type TimeOffDocument = TimeOff & Document;
