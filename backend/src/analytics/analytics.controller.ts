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
@ApiBearerAuth('JWT-auth')
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

  @Get('conflicts-debug')
  @ApiOperation({
    summary: 'Debug conflict detection with unpopulated data',
    description: 'Test endpoint to debug conflict detection issues',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiResponse({
    status: 200,
    description: 'Debug conflict analysis completed',
  })
  async getConflictAnalysisDebug(
    @Query('date') date: string,
  ) {
    return this.analyticsService.getConflictAnalysisDebug(date);
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

  @Get('weekly')
  @ApiOperation({
    summary: 'Get weekly analytics with aggregated daily data',
    description:
      'Aggregates daily schedule analytics over a 7-day period starting from the specified date.',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'team',
    required: false,
    description: 'Filter by team',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department',
  })
  @ApiResponse({
    status: 200,
    description: 'Weekly analytics retrieved successfully',
  })
  async getWeeklyAnalytics(
    @Query('startDate') startDate: string,
    @Query('location') location?: string,
    @Query('team') team?: string,
    @Query('department') department?: string,
  ) {
    return this.analyticsService.getWeeklyAnalytics(
      startDate,
      location,
      team,
      department,
    );
  }

  @Get('monthly')
  @ApiOperation({
    summary: 'Get monthly analytics with aggregated daily data',
    description:
      'Aggregates daily schedule analytics over a specified month.',
  })
  @ApiQuery({
    name: 'year',
    required: true,
    description: 'Year (e.g., 2025)',
  })
  @ApiQuery({
    name: 'month',
    required: true,
    description: 'Month (1-12)',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'team',
    required: false,
    description: 'Filter by team',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department',
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly analytics retrieved successfully',
  })
  async getMonthlyAnalytics(
    @Query('year') year: number,
    @Query('month') month: number,
    @Query('location') location?: string,
    @Query('team') team?: string,
    @Query('department') department?: string,
  ) {
    return this.analyticsService.getMonthlyAnalytics(
      year,
      month,
      location,
      team,
      department,
    );
  }

  @Get('conflict-analysis')
  @ApiOperation({
    summary: 'Analyze conflicts over a date range',
    description:
      'Detects and analyzes conflicts across multiple days with aggregated insights.',
  })
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
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'team',
    required: false,
    description: 'Filter by team',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department',
  })
  @ApiResponse({
    status: 200,
    description: 'Conflict analysis completed successfully',
  })
  async getConflictAnalysisByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('location') location?: string,
    @Query('team') team?: string,
    @Query('department') department?: string,
  ) {
    return this.analyticsService.getConflictAnalysisByDateRange(
      startDate,
      endDate,
      location,
      team,
      department,
    );
  }

  @Get('coverage-optimization')
  @ApiOperation({
    summary: 'Get coverage optimization suggestions over a date range',
    description:
      'Analyzes coverage gaps and provides optimization suggestions across multiple days.',
  })
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
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'team',
    required: false,
    description: 'Filter by team',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department',
  })
  @ApiResponse({
    status: 200,
    description: 'Coverage optimization analysis completed successfully',
  })
  async getCoverageOptimizationByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('location') location?: string,
    @Query('team') team?: string,
    @Query('department') department?: string,
  ) {
    return this.analyticsService.getCoverageOptimizationByDateRange(
      startDate,
      endDate,
      location,
      team,
      department,
    );
  }

  @Get('team-performance')
  @ApiOperation({
    summary: 'Get team performance analytics over a date range',
    description:
      'Aggregates daily analytics to provide team performance metrics including efficiency, reliability, and flexibility.',
  })
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
  @ApiQuery({
    name: 'teamId',
    required: true,
    description: 'Team ID to analyze',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department',
  })
  @ApiResponse({
    status: 200,
    description: 'Team performance analytics retrieved successfully',
  })
  async getTeamPerformanceAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('teamId') teamId: string,
    @Query('location') location?: string,
    @Query('department') department?: string,
  ) {
    return this.analyticsService.getTeamPerformanceAnalytics(
      startDate,
      endDate,
      teamId,
      location,
      department,
    );
  }

  @Get('location-utilization')
  @ApiOperation({
    summary: 'Get location utilization analytics over a date range',
    description:
      'Analyzes location utilization patterns, peak hours, and provides optimization recommendations.',
  })
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
  @ApiQuery({
    name: 'locationId',
    required: true,
    description: 'Location ID to analyze',
  })
  @ApiQuery({
    name: 'team',
    required: false,
    description: 'Filter by team',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department',
  })
  @ApiResponse({
    status: 200,
    description: 'Location utilization analytics retrieved successfully',
  })
  async getLocationUtilizationAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('locationId') locationId: string,
    @Query('team') team?: string,
    @Query('department') department?: string,
  ) {
    return this.analyticsService.getLocationUtilizationAnalytics(
      startDate,
      endDate,
      locationId,
      team,
      department,
    );
  }

  @Get('dashboard-stats')
  @ApiOperation({
    summary: 'Get dashboard statistics for the current day',
    description:
      'Provides aggregated dashboard statistics including total employees, active shifts, and pending time-off requests.',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date in YYYY-MM-DD format (defaults to today)',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'team',
    required: false,
    description: 'Filter by team',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  async getDashboardStats(
    @Query('date') date?: string,
    @Query('location') location?: string,
    @Query('team') team?: string,
    @Query('department') department?: string,
  ) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.analyticsService.getDashboardStats(
      targetDate,
      location,
      team,
      department,
    );
  }

  @Get('recent-activities')
  @ApiOperation({
    summary: 'Get recent activities and notifications',
    description:
      'Provides a feed of recent activities including conflicts, coverage gaps, and shift updates.',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date in YYYY-MM-DD format (defaults to today)',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'team',
    required: false,
    description: 'Filter by team',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent activities retrieved successfully',
  })
  async getRecentActivities(
    @Query('date') date?: string,
    @Query('location') location?: string,
    @Query('team') team?: string,
    @Query('department') department?: string,
  ) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.analyticsService.getRecentActivities(
      targetDate,
      location,
      team,
      department,
    );
  }

  @Get('upcoming-shifts')
  @ApiOperation({
    summary: 'Get upcoming shifts for the current day',
    description:
      'Provides upcoming shift information converted from role coverage data.',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date in YYYY-MM-DD format (defaults to today)',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'team',
    required: false,
    description: 'Filter by team',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department',
  })
  @ApiResponse({
    status: 200,
    description: 'Upcoming shifts retrieved successfully',
  })
  async getUpcomingShifts(
    @Query('date') date?: string,
    @Query('location') location?: string,
    @Query('team') team?: string,
    @Query('department') department?: string,
  ) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.analyticsService.getUpcomingShifts(
      targetDate,
      location,
      team,
      department,
    );
  }

  @Get('analytics-summary')
  @ApiOperation({
    summary: 'Get comprehensive analytics summary',
    description:
      'Provides a comprehensive summary of all analytics including daily, weekly, and monthly overviews.',
  })
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
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'team',
    required: false,
    description: 'Filter by team',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics summary retrieved successfully',
  })
  async getAnalyticsSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('location') location?: string,
    @Query('team') team?: string,
    @Query('department') department?: string,
  ) {
    return this.analyticsService.getAnalyticsSummary(
      startDate,
      endDate,
      location,
      team,
      department,
    );
  }

  @Get('export/:format')
  @ApiOperation({
    summary: 'Export analytics data',
    description:
      'Exports analytics data in various formats (CSV, JSON) for reporting purposes.',
  })
  @ApiParam({
    name: 'format',
    description: 'Export format (csv, json)',
    example: 'csv',
  })
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
  @ApiQuery({
    name: 'type',
    required: true,
    description: 'Analytics type (daily, weekly, monthly, employee, team, location)',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'team',
    required: false,
    description: 'Filter by team',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics data exported successfully',
  })
  async exportAnalytics(
    @Param('format') format: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('type') type: string,
    @Query('location') location?: string,
    @Query('team') team?: string,
    @Query('department') department?: string,
  ) {
    return this.analyticsService.exportAnalytics(
      format,
      startDate,
      endDate,
      type,
      location,
      team,
      department,
    );
  }
}
