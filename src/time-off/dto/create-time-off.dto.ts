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
  @ApiProperty({ description: 'Unique time-off request identifier' })
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({ description: 'Employee ID requesting time off' })
  @IsMongoId()
  employeeId: string;

  @ApiProperty({ enum: TimeOffType, description: 'Type of time off' })
  @IsEnum(TimeOffType)
  type: TimeOffType;

  @ApiPropertyOptional({
    enum: TimeOffStatus,
    default: TimeOffStatus.PENDING,
    description: 'Time-off status',
  })
  @IsOptional()
  @IsEnum(TimeOffStatus)
  status?: TimeOffStatus;

  @ApiPropertyOptional({
    enum: TimeOffPriority,
    default: TimeOffPriority.MEDIUM,
    description: 'Request priority',
  })
  @IsOptional()
  @IsEnum(TimeOffPriority)
  priority?: TimeOffPriority;

  @ApiProperty({ description: 'Start date of time off' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date of time off' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Start time in HH:mm format', example: '09:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: 'End time in HH:mm format', example: '17:00' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({
    minimum: 0.5,
    maximum: 24,
    description: 'Total hours requested',
  })
  @IsNumber()
  @Min(0.5)
  @Max(24)
  totalHours: number;

  @ApiProperty({
    minimum: 0.5,
    maximum: 365,
    description: 'Total days requested',
  })
  @IsNumber()
  @Min(0.5)
  @Max(365)
  totalDays: number;

  @ApiProperty({ description: 'Reason for time off request' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'Detailed description of the request' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String], description: 'File attachments' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({
    description: 'Whether this is a half-day request',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isHalfDay?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this is an emergency request',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isEmergency?: boolean;

  @ApiPropertyOptional({
    description: 'Whether coverage is required',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresCoverage?: boolean;

  @ApiPropertyOptional({
    type: [String],
    description: 'Employee IDs for coverage',
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  coverageEmployees?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Affected shift IDs' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  affectedShifts?: string[];

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
