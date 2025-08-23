import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Employee email address (must be registered in the system)',
    example: 'john.doe@company.com',
    format: 'email',
    minLength: 5,
    maxLength: 100,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Employee password (minimum 8 characters)',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 128,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
