import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ShiftType {
  REGULAR = 'regular',
  OVERTIME = 'overtime',
  NIGHT = 'night',
  WEEKEND = 'weekend',
  HOLIDAY = 'holiday',
  EMERGENCY = 'emergency',
}

export enum ShiftStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

@Schema()
export class ShiftLocation {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  address: string;

  @Prop({ required: true, type: [Number] })
  coordinates: number[];

  @Prop({ type: String })
  building?: string;

  @Prop({ type: String })
  floor?: string;

  @Prop({ type: String })
  room?: string;
}

@Schema()
export class ShiftRequirement {
  @Prop({ required: true, type: String })
  role: string;

  @Prop({ required: true, type: Number, min: 1 })
  quantity: number;

  @Prop({ required: true, type: [String] })
  skills: string[];

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Boolean, default: false })
  isCritical: boolean;
}

@Schema({
  timestamps: true,
  collection: 'shifts',
})
export class Shift extends Document {
  @Prop({ required: true, type: String, unique: true })
  shiftId: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true, type: String })
  startTime: string;

  @Prop({ required: true, type: String })
  endTime: string;

  @Prop({ required: true, enum: ShiftType })
  type: ShiftType;

  @Prop({ required: true, enum: ShiftStatus, default: ShiftStatus.SCHEDULED })
  status: ShiftStatus;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ required: true, type: ShiftLocation })
  location: ShiftLocation;

  @Prop({ required: true, type: String })
  department: string;

  @Prop({ required: true, type: String })
  team: string;

  @Prop({ required: true, type: [ShiftRequirement] })
  requirements: ShiftRequirement[];

  @Prop({ type: [Types.ObjectId], ref: 'Employee' })
  assignedEmployees: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Employee' })
  backupEmployees: Types.ObjectId[];

  @Prop({ required: true, type: Number })
  totalHours: number;

  @Prop({ required: true, type: Number, default: 0 })
  breakMinutes: number;

  @Prop({ type: Boolean, default: false })
  isRecurring: boolean;

  @Prop({ type: String })
  recurringPattern?: string;

  @Prop({ type: Date })
  recurringEndDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Shift' })
  parentShiftId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Shift' })
  childShiftIds: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  priority: number;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: Date })
  scheduledAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  scheduledBy?: Types.ObjectId;

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  cancelledBy?: Types.ObjectId;

  @Prop({ type: String })
  cancellationReason?: string;

  @Prop({ type: Date })
  lastModifiedAt?: Date;
}

export const ShiftSchema = SchemaFactory.createForClass(Shift);

// Add indexes for performance
ShiftSchema.index({ date: 1 });
ShiftSchema.index({ status: 1 });
ShiftSchema.index({ type: 1 });
ShiftSchema.index({ department: 1 });
ShiftSchema.index({ team: 1 });
ShiftSchema.index({ 'location.name': 1 });
ShiftSchema.index({ assignedEmployees: 1 });
ShiftSchema.index({ date: 1, status: 1 });
ShiftSchema.index({ date: 1, location: 1 });
ShiftSchema.index({ date: 1, team: 1 });

export type ShiftDocument = Shift & Document;
