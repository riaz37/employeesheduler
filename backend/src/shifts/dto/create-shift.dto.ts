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
  @ApiProperty({
    description: 'Required role for this shift position',
    example: 'Software Developer',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    minimum: 1,
    description: 'Number of employees needed for this role',
    example: 2,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    type: [String],
    description: 'Required skills or certifications for this shift',
    example: ['JavaScript', 'React', 'Node.js'],
    default: [],
  })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiPropertyOptional({
    description: 'Additional description or requirements for this role',
    example: 'Must have experience with React hooks and TypeScript',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether this requirement is critical for the shift',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;
}

export class ShiftLocationDto {
  @ApiProperty({
    description: 'Location name or identifier',
    example: 'Main Office - Conference Room A',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Full address of the location',
    example: '123 Business St, Suite 100, City, State 12345',
    minLength: 10,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    type: [Number],
    description: 'Geographic coordinates as [longitude, latitude] array',
    example: [-74.006, 40.7128],
    minItems: 2,
    maxItems: 2,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  coordinates: number[];

  @ApiPropertyOptional({
    description: 'Building name or identifier',
    example: 'Tower A',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiPropertyOptional({
    description: 'Floor number or name',
    example: '3rd Floor',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiPropertyOptional({
    description: 'Room number or name',
    example: 'Conference Room 301',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  room?: string;
}

export class CreateShiftDto {
  @ApiProperty({
    description: 'Unique shift identifier (alphanumeric)',
    example: 'SHIFT001',
    pattern: '^[A-Z0-9]{3,15}$',
    minLength: 3,
    maxLength: 15,
  })
  @IsString()
  @IsNotEmpty()
  shiftId: string;

  @ApiProperty({
    description: 'Shift date (ISO 8601 format)',
    example: '2024-01-15T00:00:00.000Z',
    format: 'date',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Shift start time in 24-hour HH:mm format',
    example: '09:00',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'Shift end time in 24-hour HH:mm format',
    example: '17:00',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({
    enum: ShiftType,
    description: 'Type of shift (e.g., regular, overtime, holiday)',
    example: ShiftType.REGULAR,
  })
  @IsEnum(ShiftType)
  type: ShiftType;

  @ApiPropertyOptional({
    enum: ShiftStatus,
    default: ShiftStatus.SCHEDULED,
    description: 'Current status of the shift',
    example: ShiftStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(ShiftStatus)
  status?: ShiftStatus;

  @ApiProperty({
    description: 'Shift title or brief description',
    example: 'Morning Development Team Shift',
    minLength: 5,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the shift responsibilities',
    example:
      'Handle frontend development tasks, code reviews, and team collaboration',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: ShiftLocationDto,
    description: 'Physical location where the shift will take place',
    example: {
      name: 'Main Office - Floor 3',
      address: '123 Business St, Floor 3, City, State 12345',
      timezone: 'America/New_York',
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ShiftLocationDto)
  location: ShiftLocationDto;

  @ApiProperty({
    description: 'Department responsible for this shift',
    example: 'Engineering',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({
    description: 'Team or squad assigned to this shift',
    example: 'Frontend Development Team',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  team: string;

  @ApiProperty({
    type: [ShiftRequirementDto],
    description: 'Requirements and qualifications needed for this shift',
    example: [
      {
        role: 'Frontend Developer',
        skillRequirements: ['React', 'TypeScript', 'CSS'],
        minExperience: 12,
        certificationRequired: false,
        quantity: 2,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShiftRequirementDto)
  requirements: ShiftRequirementDto[];

  @ApiPropertyOptional({
    type: [String],
    description: 'MongoDB ObjectIds of assigned employees',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    format: 'MongoDB ObjectId',
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  assignedEmployees?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'MongoDB ObjectIds of backup employees',
    example: ['507f1f77bcf86cd799439013'],
    format: 'MongoDB ObjectId',
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  backupEmployees?: string[];

  @ApiProperty({
    minimum: 0.5,
    maximum: 24,
    description: 'Total shift duration in hours',
    example: 8.0,
    default: 8.0,
  })
  @IsNumber()
  @Min(0.5)
  @Max(24)
  totalHours: number;

  @ApiProperty({
    minimum: 0,
    maximum: 120,
    description: 'Break time allocated during the shift in minutes',
    example: 60,
    default: 60,
  })
  @IsNumber()
  @Min(0)
  @Max(120)
  breakMinutes: number;

  @ApiPropertyOptional({
    description: 'Whether this shift repeats on a schedule',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description:
      'Cron-like pattern for recurring shifts (e.g., "0 9 * * 1-5" for weekdays at 9 AM)',
    example: '0 9 * * 1-5',
    pattern: '^((\\*|([0-5]?[0-9](-[0-5]?[0-9])?(,\\d+)*))\\s*){5}$',
  })
  @IsOptional()
  @IsString()
  recurringPattern?: string;

  @ApiPropertyOptional({
    description: 'End date for recurring shifts (ISO 8601 format)',
    example: '2024-12-31T23:59:59.000Z',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  recurringEndDate?: string;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: 10,
    description: 'Shift priority level (0=lowest, 10=highest)',
    example: 5,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  priority?: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'Tags for categorizing and filtering shifts',
    example: ['development', 'morning', 'team-collaboration'],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Additional notes or special instructions for the shift',
    example: 'Bring laptop and development tools. Team meeting at 10 AM.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'MongoDB ObjectId of employee who scheduled this shift',
    example: '507f1f77bcf86cd799439011',
    format: 'MongoDB ObjectId',
  })
  @IsOptional()
  @IsMongoId()
  scheduledBy?: string;
}
