import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Schedule, ScheduleDocument } from './schemas/schedule.schema';

@ApiTags('Schedules')
@Controller('schedules')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new schedule' })
  @ApiResponse({
    status: 201,
    description: 'Schedule created successfully',
    type: Schedule,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Schedule already exists',
  })
  async create(@Body() scheduleData: any): Promise<ScheduleDocument> {
    return this.schedulesService.create(scheduleData);
  }

  @Post('generate')
  @ApiOperation({
    summary: 'Auto-generate a schedule for a specific date and location',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'location',
    required: true,
    type: String,
    description: 'Location name',
  })
  @ApiQuery({
    name: 'team',
    required: true,
    type: String,
    description: 'Team name',
  })
  @ApiQuery({
    name: 'department',
    required: true,
    type: String,
    description: 'Department name',
  })
  @ApiResponse({
    status: 201,
    description: 'Schedule generated successfully',
    type: Schedule,
  })
  async generateSchedule(
    @Query('date') date: string,
    @Query('location') location: string,
    @Query('team') team: string,
    @Query('department') department: string,
  ): Promise<ScheduleDocument> {
    return this.schedulesService.generateSchedule(
      date,
      location,
      team,
      department,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all schedules with pagination and filtering' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search query',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Filter by date',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'team',
    required: false,
    type: String,
    description: 'Filter by team',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    type: String,
    description: 'Filter by department',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedules retrieved successfully',
  })
  async findAll(@Query() paginationDto: any) {
    return this.schedulesService.findAll(paginationDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get schedule statistics and analytics' })
  @ApiResponse({
    status: 200,
    description: 'Schedule statistics retrieved successfully',
  })
  async getStats() {
    return this.schedulesService.getScheduleStats();
  }

  @Get('by-date/:date')
  @ApiOperation({ summary: 'Get schedules by date' })
  @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format' })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'team',
    required: false,
    type: String,
    description: 'Filter by team',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedules by date retrieved successfully',
    type: [Schedule],
  })
  async getSchedulesByDate(
    @Param('date') date: string,
    @Query('location') location?: string,
    @Query('team') team?: string,
  ) {
    return this.schedulesService.findByDate(date, location, team);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get schedule by ID' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Schedule retrieved successfully',
    type: Schedule,
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async findOne(@Param('id') id: string): Promise<ScheduleDocument> {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Schedule updated successfully',
    type: Schedule,
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot modify locked/archived schedule',
  })
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: any,
  ): Promise<ScheduleDocument> {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({ status: 200, description: 'Schedule deleted successfully' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot delete published/locked schedule',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.schedulesService.remove(id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a draft schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Schedule published successfully',
    type: Schedule,
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Can only publish draft schedules',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Cannot publish schedule with conflicts',
  })
  async publish(
    @Param('id') id: string,
    @Request() req,
  ): Promise<ScheduleDocument> {
    return this.schedulesService.publish(id, req.user._id);
  }

  @Post(':id/lock')
  @ApiOperation({ summary: 'Lock a published schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Schedule locked successfully',
    type: Schedule,
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Can only lock published schedules',
  })
  async lock(
    @Param('id') id: string,
    @Request() req,
  ): Promise<ScheduleDocument> {
    return this.schedulesService.lock(id, req.user._id);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Schedule archived successfully',
    type: Schedule,
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Schedule is already archived',
  })
  async archive(
    @Param('id') id: string,
    @Request() req,
  ): Promise<ScheduleDocument> {
    return this.schedulesService.archive(id, req.user._id);
  }
}
