import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Employee email address',
    example: 'employee@company.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Employee password', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
