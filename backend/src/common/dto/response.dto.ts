import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SuccessResponseDto<T> {
  @ApiProperty({
    description: 'Response status indicating success',
    example: 'success',
    enum: ['success'],
  })
  status: string;

  @ApiProperty({
    description: 'Response message describing the operation result',
    example: 'Employee created successfully',
    maxLength: 200,
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Response data payload',
    type: 'object',
  })
  data?: T;

  @ApiProperty({
    description: 'Response timestamp in ISO 8601 format',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  timestamp: string;

  @ApiPropertyOptional({
    description: 'API endpoint path that was called',
    example: '/api/v1/employees',
    maxLength: 200,
  })
  path?: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Response status indicating error',
    example: 'error',
    enum: ['error'],
  })
  status: string;

  @ApiProperty({
    description: 'Error message describing what went wrong',
    example: 'Employee not found with the specified ID',
    maxLength: 500,
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Unique error code for programmatic handling',
    example: 'EMPLOYEE_NOT_FOUND',
    maxLength: 100,
  })
  errorCode?: string;

  @ApiPropertyOptional({
    description: 'Additional error details or validation errors',
    type: 'object',
    example: {
      field: 'email',
      value: 'invalid-email',
      message: 'Invalid email format',
    },
  })
  details?: any;

  @ApiProperty({
    description: 'Error timestamp in ISO 8601 format',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  timestamp: string;

  @ApiPropertyOptional({
    description: 'API endpoint path where the error occurred',
    example: '/api/v1/employees/507f1f77bcf86cd799439011',
    maxLength: 200,
  })
  path?: string;
}

export class ValidationErrorDto {
  @ApiProperty({
    description: 'Field name that failed validation',
    example: 'email',
  })
  field: string;

  @ApiProperty({
    description: 'Value that failed validation',
    example: 'invalid-email',
  })
  value: string;

  @ApiProperty({
    description: 'Validation error message',
    example: 'Invalid email format',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Validation constraint that was violated',
    example: 'isEmail',
  })
  constraint?: string;
}

export class PaginationMetaDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
    minimum: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items across all pages',
    example: 150,
    minimum: 0,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 8,
    minimum: 0,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page available',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page available',
    example: false,
  })
  hasPrevPage: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items for the current page',
    type: 'array',
    items: { type: 'object' },
  })
  data: T[];

  @ApiProperty({
    description: 'Pagination metadata and navigation information',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;

  @ApiPropertyOptional({
    description: 'Response message or status description',
    example: 'Data retrieved successfully',
    maxLength: 200,
  })
  message?: string;
}

export class BulkOperationResponseDto {
  @ApiProperty({
    description: 'Total number of items processed',
    example: 100,
    minimum: 0,
  })
  total: number;

  @ApiProperty({
    description: 'Number of items successfully processed',
    example: 95,
    minimum: 0,
  })
  success: number;

  @ApiProperty({
    description: 'Number of items that failed to process',
    example: 5,
    minimum: 0,
  })
  failed: number;

  @ApiPropertyOptional({
    description: 'Array of errors for failed operations',
    type: [ErrorResponseDto],
  })
  errors?: ErrorResponseDto[];

  @ApiPropertyOptional({
    description: 'Array of successfully processed item IDs',
    type: [String],
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  })
  successIds?: string[];

  @ApiPropertyOptional({
    description: 'Array of failed item IDs',
    type: [String],
    example: ['507f1f77bcf86cd799439013'],
  })
  failedIds?: string[];
}

export class HealthCheckResponseDto {
  @ApiProperty({
    description: 'Service health status',
    example: 'healthy',
    enum: ['healthy', 'unhealthy', 'degraded'],
  })
  status: string;

  @ApiProperty({
    description: 'Service name',
    example: 'Employee Scheduler API',
  })
  service: string;

  @ApiProperty({
    description: 'Service version',
    example: '1.0.0',
  })
  version: string;

  @ApiProperty({
    description: 'Response timestamp in ISO 8601 format',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  timestamp: string;

  @ApiPropertyOptional({
    description: 'Uptime in seconds',
    example: 86400,
  })
  uptime?: number;

  @ApiPropertyOptional({
    description: 'Memory usage information',
    type: 'object',
    example: {
      used: '45.2 MB',
      total: '512 MB',
      percentage: 8.8,
    },
  })
  memory?: {
    used: string;
    total: string;
    percentage: number;
  };
}
