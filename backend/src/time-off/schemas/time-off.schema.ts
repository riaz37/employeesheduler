import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TimeOffType {
  VACATION = 'vacation',
  SICK_LEAVE = 'sick_leave',
  PERSONAL_LEAVE = 'personal_leave',
  MATERNITY_LEAVE = 'maternity_leave',
  PATERNITY_LEAVE = 'paternity_leave',
  BEREAVEMENT_LEAVE = 'bereavement_leave',
  UNPAID_LEAVE = 'unpaid_leave',
  OTHER = 'other',
}

export enum TimeOffStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  IN_PROGRESS = 'in_progress',
}

export enum TimeOffPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Schema()
export class TimeOffApproval {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  approverId: Types.ObjectId;

  @Prop({ required: true, type: String })
  approverName: string;

  @Prop({ required: true, type: String })
  approverRole: string;

  @Prop({ required: true, type: Number })
  level: number;

  @Prop({ required: true, enum: ['pending', 'approved', 'rejected'] })
  status: string;

  @Prop({ type: String })
  comments?: string;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: Date })
  rejectedAt?: Date;
}

@Schema()
export class TimeOffModification {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  modifiedBy: Types.ObjectId;

  @Prop({ required: true, type: String })
  modifiedByName: string;

  @Prop({ required: true, type: Date })
  modifiedAt: Date;

  @Prop({ required: true, type: String })
  field: string;

  @Prop({ required: true, type: String })
  oldValue: string;

  @Prop({ required: true, type: String })
  newValue: string;

  @Prop({ type: String })
  reason?: string;
}

@Schema({
  timestamps: true,
  collection: 'time_off',
})
export class TimeOff extends Document {
  @Prop({ required: true, type: String, unique: true })
  requestId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  employeeId: Types.ObjectId;

  @Prop({ required: true, enum: TimeOffType })
  type: TimeOffType;

  @Prop({ required: true, enum: TimeOffStatus, default: TimeOffStatus.PENDING })
  status: TimeOffStatus;

  @Prop({ required: true, enum: TimeOffPriority, default: TimeOffPriority.MEDIUM })
  priority: TimeOffPriority;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ required: true, type: String })
  startTime: string;

  @Prop({ required: true, type: String })
  endTime: string;

  @Prop({ required: true, type: Number })
  totalHours: number;

  @Prop({ required: true, type: Number })
  totalDays: number;

  @Prop({ required: true, type: String })
  reason: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: [String] })
  attachments?: string[];

  @Prop({ type: [TimeOffApproval] })
  approvals: TimeOffApproval[];

  @Prop({ type: [TimeOffModification] })
  modifications: TimeOffModification[];

  @Prop({ type: String })
  rejectionReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  rejectedBy?: Types.ObjectId;

  @Prop({ type: Date })
  rejectedAt?: Date;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  cancelledBy?: Types.ObjectId;

  @Prop({ type: String })
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

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: Date })
  submittedAt?: Date;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: Date })
  lastModifiedAt?: Date;
}

export const TimeOffSchema = SchemaFactory.createForClass(TimeOff);

// Add indexes for performance
TimeOffSchema.index({ employeeId: 1 });
TimeOffSchema.index({ status: 1 });
TimeOffSchema.index({ type: 1 });
TimeOffSchema.index({ startDate: 1 });
TimeOffSchema.index({ endDate: 1 });
TimeOffSchema.index({ priority: 1 });
TimeOffSchema.index({ employeeId: 1, status: 1 });
TimeOffSchema.index({ startDate: 1, endDate: 1 });
TimeOffSchema.index({ type: 1, status: 1 });

export type TimeOffDocument = TimeOff & Document;
