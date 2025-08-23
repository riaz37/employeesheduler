import {
  IsString,
  IsDateString,
  IsEnum,
  IsArray,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScheduleStatus } from '../schemas/schedule.schema';

export class CreateScheduleDto {
  @ApiProperty({
    description: 'Unique schedule identifier',
    example: 'SCHED001',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  scheduleId: string;

  @ApiProperty({
    description: 'Schedule date (ISO 8601 format)',
    example: '2024-01-15',
    format: 'date',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Work location for this schedule',
    example: 'Main Office - Floor 3',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Team assigned to this schedule',
    example: 'Frontend Team',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  team: string;

  @ApiProperty({
    description: 'Department for this schedule',
    example: 'Engineering',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiPropertyOptional({
    enum: ScheduleStatus,
    default: ScheduleStatus.DRAFT,
    description: 'Schedule status',
    example: ScheduleStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;

  @ApiPropertyOptional({
    type: [String],
    description: 'Array of shift IDs assigned to this schedule',
    example: ['SHIFT001', 'SHIFT002'],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  shifts?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Array of employee IDs assigned to this schedule',
    example: ['EMP001', 'EMP002'],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  employees?: string[];

  @ApiPropertyOptional({
    description: 'Additional notes about the schedule',
    example: 'Weekend coverage schedule',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  notes?: string;
} 