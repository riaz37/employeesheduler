import {
  IsString,
  IsEmail,
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
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeRole, EmployeeStatus } from '../schemas/employee.schema';

export class SkillDto {
  @ApiProperty({
    description: 'Skill name',
    example: 'JavaScript Development',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    description: 'Skill proficiency level',
    example: 'intermediate',
    default: 'beginner',
  })
  @IsString()
  @IsNotEmpty()
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';

  @ApiProperty({
    description: 'Whether the skill is certified by an accredited organization',
    example: true,
    default: false,
  })
  @IsBoolean()
  certified: boolean;

  @ApiPropertyOptional({
    description: 'Skill certification expiry date (ISO 8601 format)',
    example: '2025-12-31T23:59:59.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}

export class AvailabilityWindowDto {
  @ApiProperty({
    minimum: 0,
    maximum: 6,
    description:
      'Day of week (0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday)',
    example: 1,
    enum: [0, 1, 2, 3, 4, 5, 6],
  })
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({
    description: 'Start time in 24-hour HH:mm format',
    example: '09:00',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'End time in 24-hour HH:mm format',
    example: '17:00',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({
    description: 'Timezone identifier (IANA timezone database)',
    example: 'America/New_York',
    default: 'UTC',
  })
  @IsString()
  @IsNotEmpty()
  timezone: string;

  @ApiProperty({
    description: 'Whether the employee is available during this time window',
    example: true,
    default: true,
  })
  @IsBoolean()
  isAvailable: boolean;
}

export class WorkPreferenceDto {
  @ApiProperty({
    minimum: 1,
    maximum: 168,
    description: 'Maximum hours per week the employee is willing to work',
    example: 40,
    default: 40,
  })
  @IsNumber()
  @Min(1)
  @Max(168)
  maxHoursPerWeek: number;

  @ApiProperty({
    type: [String],
    description:
      'Preferred shift types (e.g., morning, afternoon, night, weekend)',
    example: ['morning', 'afternoon'],
    default: [],
  })
  @IsArray()
  @IsString({ each: true })
  preferredShifts: string[];

  @ApiProperty({
    type: [String],
    description: 'Preferred work locations or office branches',
    example: ['Main Office', 'Downtown Branch'],
    default: [],
  })
  @IsArray()
  @IsString({ each: true })
  preferredLocations: string[];

  @ApiProperty({
    minimum: 1,
    maximum: 7,
    description: 'Maximum consecutive work days before requiring a day off',
    example: 5,
    default: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(7)
  maxConsecutiveDays: number;
}

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Unique employee identifier (alphanumeric)',
    example: 'EMP001',
    pattern: '^[A-Z0-9]{3,10}$',
    minLength: 3,
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({
    description: 'Employee first name',
    example: 'John',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Employee last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Employee email address (must be unique)',
    example: 'john.doe@company.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Employee password (minimum 8 characters)',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    enum: EmployeeRole,
    description: 'Employee role in the organization',
    example: EmployeeRole.STAFF,
  })
  @IsEnum(EmployeeRole)
  role: EmployeeRole;

  @ApiPropertyOptional({
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
    description: 'Current employment status',
    example: EmployeeStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiProperty({
    description: 'Employee department or division',
    example: 'Engineering',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({
    description: 'Primary work location or office',
    example: 'Main Office - Floor 3',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Employee team or squad',
    example: 'Frontend Team',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  team: string;

  @ApiProperty({
    type: [SkillDto],
    description: 'Employee skills and competencies',
    example: [
      {
        name: 'JavaScript Development',
        level: 'intermediate',
        certified: false,
      },
      {
        name: 'Project Management',
        level: 'advanced',
        certified: true,
        validUntil: '2025-12-31T23:59:59.000Z',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills: SkillDto[];

  @ApiProperty({
    type: [AvailabilityWindowDto],
    description: 'Employee weekly availability schedule',
    example: [
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'America/New_York',
        isAvailable: true,
      },
      {
        dayOfWeek: 2,
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'America/New_York',
        isAvailable: true,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityWindowDto)
  availabilityWindows: AvailabilityWindowDto[];

  @ApiProperty({
    type: WorkPreferenceDto,
    description: 'Employee work preferences and constraints',
    example: {
      maxHoursPerWeek: 40,
      preferredShifts: ['morning', 'afternoon'],
      preferredLocations: ['Main Office'],
      maxConsecutiveDays: 5,
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => WorkPreferenceDto)
  workPreference: WorkPreferenceDto;

  @ApiProperty({
    description: 'Employee hire date (ISO 8601 format)',
    example: '2023-01-15T00:00:00.000Z',
    format: 'date',
  })
  @IsDateString()
  hireDate: string;

  @ApiPropertyOptional({
    description: 'Employee phone number (with country code)',
    example: '+1-555-123-4567',
    pattern: '^\\+[1-9]\\d{1,14}$',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact information (name and phone)',
    example: 'Jane Doe (Spouse): +1-555-987-6543',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({
    description: 'Additional notes or special requirements',
    example: 'Requires ergonomic chair due to back condition',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Whether the employee works part-time schedule',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPartTime?: boolean;
}
