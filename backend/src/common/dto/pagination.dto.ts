import {
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsString,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class PaginationDto {
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
    description: 'Page number for pagination (starts from 1)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 10,
    description: 'Number of items per page (maximum 100)',
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field name to sort by (e.g., "createdAt", "name", "date")',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    enum: SortOrder,
    default: SortOrder.DESC,
    description: 'Sort order (ascending or descending)',
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description:
      'Search query for filtering results (searches across multiple fields)',
    example: 'john doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter results from this date onwards (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter results up to this date (ISO 8601 format)',
    example: '2024-12-31T23:59:59.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by specific location or office',
    example: 'Main Office',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Filter by specific team or squad',
    example: 'Frontend Team',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  team?: string;

  @ApiPropertyOptional({
    description: 'Filter by specific department or division',
    example: 'Engineering',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: 'Filter by status (e.g., "active", "pending", "completed")',
    example: 'active',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description:
      'Filter by employee role (e.g., "manager", "staff", "specialist")',
    example: 'staff',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: 'Filter by specific date (ISO 8601 format)',
    example: '2024-01-15T00:00:00.000Z',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Filter by start date range (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date range (ISO 8601 format)',
    example: '2024-12-31T00:00:00.000Z',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by type (e.g., "shift", "time-off", "schedule")',
    example: 'shift',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description:
      'Filter by priority level (e.g., "low", "medium", "high", "critical")',
    example: 'high',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({
    description: 'Filter by specific employee ID (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
    format: 'MongoDB ObjectId',
  })
  @IsOptional()
  @IsString()
  employeeId?: string;
}

export class PaginatedResponseDto<T> {
  @ApiPropertyOptional({
    description: 'Array of items for the current page',
    type: 'array',
    items: { type: 'object' },
  })
  data: T[];

  @ApiPropertyOptional({
    description: 'Pagination metadata and navigation information',
    type: 'object',
    properties: {
      page: { type: 'number', example: 1, description: 'Current page number' },
      limit: { type: 'number', example: 20, description: 'Items per page' },
      total: {
        type: 'number',
        example: 150,
        description: 'Total number of items',
      },
      totalPages: {
        type: 'number',
        example: 8,
        description: 'Total number of pages',
      },
      hasNextPage: {
        type: 'boolean',
        example: true,
        description: 'Whether there is a next page',
      },
      hasPrevPage: {
        type: 'boolean',
        example: false,
        description: 'Whether there is a previous page',
      },
    },
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  @ApiPropertyOptional({
    description: 'Response message or status description',
    example: 'Data retrieved successfully',
    maxLength: 200,
  })
  message?: string;
}

export class ApiResponseDto<T> {
  @ApiPropertyOptional({
    description: 'Response data payload',
    type: 'object',
  })
  data?: T;

  @ApiPropertyOptional({
    description: 'Response message or status description',
    example: 'Operation completed successfully',
    maxLength: 200,
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Response status (success, error, warning)',
    example: 'success',
    enum: ['success', 'error', 'warning'],
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Response timestamp (ISO 8601 format)',
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
  @ApiPropertyOptional({
    description: 'Error message describing what went wrong',
    example: 'Employee not found with the specified ID',
    maxLength: 500,
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Error status (always "error")',
    example: 'error',
    enum: ['error'],
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Unique error code for programmatic handling',
    example: 'EMPLOYEE_NOT_FOUND',
    maxLength: 100,
  })
  errorCode?: string;

  @ApiPropertyOptional({
    description: 'Additional error details or validation errors',
    type: 'object',
  })
  details?: any;

  @ApiPropertyOptional({
    description: 'Error timestamp (ISO 8601 format)',
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
