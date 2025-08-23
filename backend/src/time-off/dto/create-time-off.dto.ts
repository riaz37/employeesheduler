import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TimeOffType,
  TimeOffStatus,
  TimeOffPriority,
} from '../schemas/time-off.schema';

export class CreateTimeOffDto {
  @ApiProperty({
    description: 'Unique time-off request identifier (alphanumeric)',
    example: 'TO001',
    pattern: '^[A-Z0-9]{3,15}$',
    minLength: 3,
    maxLength: 15,
  })
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({
    description: 'MongoDB ObjectId of the employee requesting time off',
    example: '507f1f77bcf86cd799439011',
    format: 'MongoDB ObjectId',
  })
  @IsMongoId()
  employeeId: string;

  @ApiProperty({
    enum: TimeOffType,
    description: 'Type of time off being requested',
    example: TimeOffType.VACATION,
  })
  @IsEnum(TimeOffType)
  type: TimeOffType;

  @ApiPropertyOptional({
    enum: TimeOffStatus,
    default: TimeOffStatus.PENDING,
    description: 'Current status of the time-off request',
    example: TimeOffStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(TimeOffStatus)
  status?: TimeOffStatus;

  @ApiPropertyOptional({
    enum: TimeOffPriority,
    default: TimeOffPriority.MEDIUM,
    description: 'Priority level of the time-off request',
    example: TimeOffPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TimeOffPriority)
  priority?: TimeOffPriority;

  @ApiProperty({
    description: 'Start date of the time-off period (ISO 8601 format)',
    example: '2024-06-15T00:00:00.000Z',
    format: 'date',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date of the time-off period (ISO 8601 format)',
    example: '2024-06-20T00:00:00.000Z',
    format: 'date',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description:
      'Start time in 24-hour HH:mm format (for partial day requests)',
    example: '09:00',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'End time in 24-hour HH:mm format (for partial day requests)',
    example: '17:00',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({
    minimum: 0.5,
    maximum: 24,
    description: 'Total hours of time off requested',
    example: 40.0,
    default: 8.0,
  })
  @IsNumber()
  @Min(0.5)
  @Max(24)
  totalHours: number;

  @ApiProperty({
    minimum: 0.5,
    maximum: 365,
    description: 'Total days of time off requested',
    example: 5.0,
    default: 1.0,
  })
  @IsNumber()
  @Min(0.5)
  @Max(365)
  totalDays: number;

  @ApiProperty({
    description: 'Primary reason for the time-off request',
    example: 'Annual family vacation to Hawaii',
    minLength: 10,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Detailed description or additional context for the request',
    example:
      'Family vacation planned for months. Will ensure all projects are completed before departure and provide handover documentation.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'File attachments (URLs or file paths) supporting the request',
    example: [
      'https://example.com/doctor-note.pdf',
      'https://example.com/travel-itinerary.pdf',
    ],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({
    description: 'Whether this is a half-day time-off request',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isHalfDay?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this is an emergency or urgent time-off request',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isEmergency?: boolean;

  @ApiPropertyOptional({
    description: 'Whether work coverage is required during the time off',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresCoverage?: boolean;

  @ApiPropertyOptional({
    type: [String],
    description: 'MongoDB ObjectIds of employees who can provide coverage',
    example: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
    format: 'MongoDB ObjectId array',
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  coverageEmployees?: string[];

  @ApiPropertyOptional({
    type: [String],
    description:
      'MongoDB ObjectIds of shifts that will be affected by this time off',
    example: ['507f1f77bcf86cd799439014', '507f1f77bcf86cd799439015'],
    format: 'MongoDB ObjectId array',
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  affectedShifts?: string[];

  @ApiPropertyOptional({
    description: 'Additional notes, special requests, or instructions',
    example:
      'Will be available by phone for urgent matters. Returning on June 21st.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Date when the time-off request was approved (ISO 8601 format)',
    example: '2024-06-10T10:30:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  approvedAt?: string;
}
