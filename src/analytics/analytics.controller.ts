import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('daily-schedule')
  @ApiOperation({
    summary: 'Get daily schedule analytics with coverage and conflicts',
    description:
      'This endpoint uses MongoDB aggregation pipeline to join shifts, employees, and time-off, compute coverage per role, and detect conflicts.',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({ name: 'team', required: false, description: 'Filter by team' })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily schedule analytics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        date: { type: 'string' },
        location: { type: 'string' },
        team: { type: 'string' },
        department: { type: 'string' },
        roleCoverage: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: { type: 'string' },
              required: { type: 'number' },
              assigned: { type: 'number' },
              coverage: { type: 'number' },
              gaps: { type: 'number' },
              overlaps: { type: 'number' },
              employees: { type: 'array' },
            },
          },
        },
        totalShifts: { type: 'number' },
        totalHours: { type: 'number' },
        averageUtilization: { type: 'number' },
        conflicts: { type: 'array' },
      },
    },
  })
  async getDailyScheduleAnalytics(
    @Query('date') date: string,
    @Query('location') location?: string,
    @Query('team') team?: string,
    @Query('department') department?: string,
  ) {
    return this.analyticsService.getDailyScheduleAnalytics(
      date,
      location,
      team,
      department,
    );
  }

  @Get('employee-workload/:employeeId')
  @ApiOperation({
    summary: 'Get employee workload analytics for a date range',
    description:
      'Analyzes employee workload, skill utilization, and availability patterns.',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date in YYYY-MM-DD format',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee workload analytics retrieved successfully',
  })
  async getEmployeeWorkloadAnalytics(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.analyticsService.getEmployeeWorkloadAnalytics(
      employeeId,
      startDate,
      endDate,
    );
  }

  @Get('conflicts')
  @ApiOperation({
    summary: 'Analyze conflicts for a specific date',
    description:
      'Detects double-bookings, time-off clashes, and other scheduling conflicts.',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiResponse({
    status: 200,
    description: 'Conflict analysis completed successfully',
  })
  async getConflictAnalysis(
    @Query('date') date: string,
    @Query('location') location?: string,
  ) {
    return this.analyticsService.getConflictAnalysis(date, location);
  }

  @Get('coverage-gaps')
  @ApiOperation({
    summary: 'Identify coverage gaps by role and location',
    description:
      'Finds roles with insufficient employee coverage for specific dates and locations.',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiResponse({
    status: 200,
    description: 'Coverage gaps analysis completed successfully',
  })
  async getCoverageGaps(
    @Query('date') date: string,
    @Query('location') location?: string,
  ) {
    return this.analyticsService.getCoverageGaps(date, location);
  }
}
