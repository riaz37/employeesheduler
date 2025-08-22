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
  @ApiProperty({ description: 'Skill name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    description: 'Skill level',
  })
  @IsString()
  @IsNotEmpty()
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';

  @ApiProperty({ description: 'Whether the skill is certified' })
  @IsBoolean()
  certified: boolean;

  @ApiPropertyOptional({ description: 'Skill certification expiry date' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}

export class AvailabilityWindowDto {
  @ApiProperty({
    minimum: 0,
    maximum: 6,
    description: 'Day of week (0=Sunday, 6=Saturday)',
  })
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ description: 'Start time in HH:mm format', example: '09:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: 'End time in HH:mm format', example: '17:00' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ description: 'Timezone', example: 'UTC' })
  @IsString()
  @IsNotEmpty()
  timezone: string;

  @ApiProperty({
    description: 'Whether the employee is available during this window',
  })
  @IsBoolean()
  isAvailable: boolean;
}

export class WorkPreferenceDto {
  @ApiProperty({
    minimum: 1,
    maximum: 168,
    description: 'Maximum hours per week',
  })
  @IsNumber()
  @Min(1)
  @Max(168)
  maxHoursPerWeek: number;

  @ApiProperty({ type: [String], description: 'Preferred shift types' })
  @IsArray()
  @IsString({ each: true })
  preferredShifts: string[];

  @ApiProperty({ type: [String], description: 'Preferred work locations' })
  @IsArray()
  @IsString({ each: true })
  preferredLocations: string[];

  @ApiProperty({
    minimum: 1,
    maximum: 7,
    description: 'Maximum consecutive work days',
  })
  @IsNumber()
  @Min(1)
  @Max(7)
  maxConsecutiveDays: number;
}

export class CreateEmployeeDto {
  @ApiProperty({ description: 'Unique employee identifier' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ description: 'Employee first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Employee last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Employee email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Employee password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: EmployeeRole, description: 'Employee role' })
  @IsEnum(EmployeeRole)
  role: EmployeeRole;

  @ApiPropertyOptional({
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
    description: 'Employee status',
  })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiProperty({ description: 'Employee department' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ description: 'Employee work location' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ description: 'Employee team' })
  @IsString()
  @IsNotEmpty()
  team: string;

  @ApiProperty({ type: [SkillDto], description: 'Employee skills' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills: SkillDto[];

  @ApiProperty({
    type: [AvailabilityWindowDto],
    description: 'Employee availability windows',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityWindowDto)
  availabilityWindows: AvailabilityWindowDto[];

  @ApiProperty({
    type: WorkPreferenceDto,
    description: 'Employee work preferences',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => WorkPreferenceDto)
  workPreference: WorkPreferenceDto;

  @ApiProperty({ description: 'Employee hire date' })
  @IsDateString()
  hireDate: string;

  @ApiPropertyOptional({ description: 'Employee phone number' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Emergency contact information' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({ description: 'Additional notes about the employee' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Whether the employee is part-time',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPartTime?: boolean;
}
