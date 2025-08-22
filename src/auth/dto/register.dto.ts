import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import {
  EmployeeRole,
  EmployeeStatus,
} from '../../employees/schemas/employee.schema';

export class RegisterDto {
  @ApiProperty({
    description: 'Unique employee identifier',
    example: 'EMP001',
  })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({
    description: 'Employee first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Employee last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Employee email address',
    example: 'john.doe@company.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Employee password',
    example: 'securePassword123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Employee phone number',
    example: '+1-555-123-4567',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Employee role in the organization',
    enum: EmployeeRole,
    example: EmployeeRole.STAFF,
  })
  @IsEnum(EmployeeRole)
  @IsNotEmpty()
  role: EmployeeRole;

  @ApiProperty({
    description: 'Employee department',
    example: 'Technology',
  })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({
    description: 'Employee team',
    example: 'Engineering',
  })
  @IsString()
  @IsNotEmpty()
  team: string;

  @ApiProperty({
    description: 'Employee work location',
    example: 'Downtown Office',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Employee status',
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVE,
    default: EmployeeStatus.ACTIVE,
  })
  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus = EmployeeStatus.ACTIVE;
}
