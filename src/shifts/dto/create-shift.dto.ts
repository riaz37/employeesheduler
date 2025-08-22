import {
  IsString,
  IsEnum,
  IsArray,
  IsObject,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  ValidateNested,
  IsNotEmpty,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShiftStatus, ShiftType } from '../schemas/shift.schema';

export class ShiftRequirementDto {
  @ApiProperty({ description: 'Required role for this shift' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    type: [String],
    description: 'Required skills for this shift',
  })
  @IsArray()
  @IsString({ each: true })
  skillRequirements: string[];

  @ApiProperty({
    minimum: 0,
    description: 'Minimum experience required in months',
  })
  @IsNumber()
  @Min(0)
  minExperience: number;

  @ApiProperty({ description: 'Whether certification is required' })
  @IsBoolean()
  certificationRequired: boolean;

  @ApiProperty({
    minimum: 1,
    description: 'Number of employees needed for this role',
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ShiftLocationDto {
  @ApiProperty({ description: 'Location name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Location address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ description: 'Location coordinates' })
  @IsOptional()
  @IsObject()
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  @ApiProperty({ description: 'Location timezone' })
  @IsString()
  @IsNotEmpty()
  timezone: string;
}

export class CreateShiftDto {
  @ApiProperty({ description: 'Unique shift identifier' })
  @IsString()
  @IsNotEmpty()
  shiftId: string;

  @ApiProperty({ description: 'Shift date' })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Shift start time in HH:mm format',
    example: '09:00',
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'Shift end time in HH:mm format',
    example: '17:00',
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ enum: ShiftType, description: 'Shift type' })
  @IsEnum(ShiftType)
  type: ShiftType;

  @ApiPropertyOptional({
    enum: ShiftStatus,
    default: ShiftStatus.SCHEDULED,
    description: 'Shift status',
  })
  @IsOptional()
  @IsEnum(ShiftStatus)
  status?: ShiftStatus;

  @ApiProperty({ description: 'Shift title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Shift description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: ShiftLocationDto, description: 'Shift location' })
  @IsObject()
  @ValidateNested()
  @Type(() => ShiftLocationDto)
  location: ShiftLocationDto;

  @ApiProperty({ description: 'Department for this shift' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ description: 'Team for this shift' })
  @IsString()
  @IsNotEmpty()
  team: string;

  @ApiProperty({
    type: [ShiftRequirementDto],
    description: 'Shift requirements',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShiftRequirementDto)
  requirements: ShiftRequirementDto[];

  @ApiPropertyOptional({ type: [String], description: 'Assigned employee IDs' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  assignedEmployees?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Backup employee IDs' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  backupEmployees?: string[];

  @ApiProperty({ minimum: 0.5, maximum: 24, description: 'Total shift hours' })
  @IsNumber()
  @Min(0.5)
  @Max(24)
  totalHours: number;

  @ApiProperty({
    minimum: 0,
    maximum: 120,
    description: 'Break time in minutes',
  })
  @IsNumber()
  @Min(0)
  @Max(120)
  breakMinutes: number;

  @ApiPropertyOptional({
    description: 'Whether this is a recurring shift',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({ description: 'Recurring pattern (cron-like)' })
  @IsOptional()
  @IsString()
  recurringPattern?: string;

  @ApiPropertyOptional({ description: 'Recurring end date' })
  @IsOptional()
  @IsDateString()
  recurringEndDate?: string;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: 10,
    description: 'Shift priority',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  priority?: number;

  @ApiPropertyOptional({ type: [String], description: 'Shift tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Additional notes about the shift' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'ID of employee who scheduled this shift',
  })
  @IsOptional()
  @IsMongoId()
  scheduledBy?: string;
}
