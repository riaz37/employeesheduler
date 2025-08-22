import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ShiftStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PENDING_APPROVAL = 'pending_approval',
}

export enum ShiftType {
  REGULAR = 'regular',
  OVERTIME = 'overtime',
  HOLIDAY = 'holiday',
  WEEKEND = 'weekend',
  NIGHT = 'night',
  SPLIT = 'split',
}

export interface ShiftRequirement {
  role: string;
  skillRequirements: string[];
  minExperience: number; // in months
  certificationRequired: boolean;
  quantity: number; // how many employees needed
}

export interface ShiftLocation {
  name: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
}

@Schema({
  timestamps: true,
  collection: 'shifts',
})
export class Shift extends Document {
  @Prop({ required: true, trim: true, unique: true, index: true })
  shiftId: string;

  @Prop({ required: true, index: true })
  date: Date;

  @Prop({ required: true, trim: true })
  startTime: string; // HH:mm format

  @Prop({ required: true, trim: true })
  endTime: string; // HH:mm format

  @Prop({ required: true, enum: ShiftType, index: true })
  type: ShiftType;

  @Prop({
    required: true,
    enum: ShiftStatus,
    default: ShiftStatus.SCHEDULED,
    index: true,
  })
  status: ShiftStatus;

  @Prop({ required: true, trim: true, index: true })
  title: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: Object, required: true })
  location: ShiftLocation;

  @Prop({ required: true, trim: true, index: true })
  department: string;

  @Prop({ required: true, trim: true, index: true })
  team: string;

  @Prop({ type: [Object], required: true })
  requirements: ShiftRequirement[];

  @Prop({ type: [Types.ObjectId], ref: 'Employee', index: true })
  assignedEmployees: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Employee', index: true })
  backupEmployees: Types.ObjectId[];

  @Prop({ type: Number, required: true })
  totalHours: number;

  @Prop({ type: Number, required: true })
  breakMinutes: number;

  @Prop({ type: Boolean, default: false })
  isRecurring: boolean;

  @Prop({ type: String, trim: true })
  recurringPattern?: string; // cron-like pattern

  @Prop({ type: Date })
  recurringEndDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Shift' })
  parentShiftId?: Types.ObjectId; // for recurring shifts

  @Prop({ type: [Types.ObjectId], ref: 'Shift' })
  childShiftIds: Types.ObjectId[]; // for recurring shifts

  @Prop({ type: Number, default: 0 })
  priority: number; // 0-10, higher is more important

  @Prop({ type: [String], trim: true })
  tags: string[];

  @Prop({ type: String, trim: true })
  notes?: string;

  @Prop({ type: Date, index: true })
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

  @Prop({ type: String, trim: true })
  cancellationReason?: string;

  @Prop({ type: Date, index: true })
  lastModifiedAt?: Date;

  // Virtual for shift duration in hours
  get durationHours(): number {
    return this.totalHours;
  }

  // Virtual for shift status
  get isActive(): boolean {
    return this.status === ShiftStatus.IN_PROGRESS;
  }

  // Virtual for shift date string
  get dateString(): string {
    return this.date.toISOString().split('T')[0];
  }

  // Virtual for time range
  get timeRange(): string {
    return `${this.startTime} - ${this.endTime}`;
  }

  // Virtual for assigned count
  get assignedCount(): number {
    return this.assignedEmployees.length;
  }

  // Virtual for required count
  get requiredCount(): number {
    return this.requirements.reduce((total, req) => total + req.quantity, 0);
  }

  // Virtual for coverage percentage
  get coveragePercentage(): number {
    if (this.requiredCount === 0) return 100;
    return Math.round((this.assignedCount / this.requiredCount) * 100);
  }
}

export const ShiftSchema = SchemaFactory.createForClass(Shift);

// Indexes for performance
ShiftSchema.index({ date: 1 });
ShiftSchema.index({ date: 1, status: 1 });
ShiftSchema.index({ date: 1, location: 1 });
ShiftSchema.index({ date: 1, team: 1 });
ShiftSchema.index({ date: 1, department: 1 });
ShiftSchema.index({ status: 1, date: 1 });
ShiftSchema.index({ type: 1, date: 1 });
ShiftSchema.index({ 'location.name': 1, date: 1 });
ShiftSchema.index({ assignedEmployees: 1, date: 1 });
ShiftSchema.index({ 'requirements.role': 1, date: 1 });

// Compound indexes for common queries
ShiftSchema.index({ date: 1, location: 1, status: 1 });
ShiftSchema.index({ date: 1, team: 1, status: 1 });
ShiftSchema.index({ date: 1, department: 1, status: 1 });
ShiftSchema.index({ date: 1, 'requirements.role': 1, status: 1 });

// Geospatial index for location-based queries
ShiftSchema.index({ 'location.coordinates': '2dsphere' });

// Text index for search
ShiftSchema.index({
  title: 'text',
  description: 'text',
  'location.name': 'text',
  tags: 'text',
});

export type ShiftDocument = Shift & Document;
