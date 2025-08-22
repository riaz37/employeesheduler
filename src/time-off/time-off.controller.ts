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
import { TimeOffService } from './time-off.service';
import { CreateTimeOffDto } from './dto/create-time-off.dto';
import { UpdateTimeOffDto } from './dto/update-time-off.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TimeOff, TimeOffDocument } from './schemas/time-off.schema';

@ApiTags('Time Off')
@Controller('time-off')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TimeOffController {
  constructor(private readonly timeOffService: TimeOffService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new time-off request' })
  @ApiResponse({
    status: 201,
    description: 'Time-off request created successfully',
    type: TimeOff,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Request ID already exists',
  })
  async create(
    @Body() createTimeOffDto: CreateTimeOffDto,
  ): Promise<TimeOffDocument> {
    return this.timeOffService.create(createTimeOffDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all time-off requests with pagination and filtering',
  })
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
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter by start date',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter by end date',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Filter by type',
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    type: String,
    description: 'Filter by priority',
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    type: String,
    description: 'Filter by employee',
  })
  @ApiResponse({
    status: 200,
    description: 'Time-off requests retrieved successfully',
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.timeOffService.findAll(paginationDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get time-off statistics and analytics' })
  @ApiResponse({
    status: 200,
    description: 'Time-off statistics retrieved successfully',
  })
  async getStats() {
    return this.timeOffService.getTimeOffStats();
  }

  @Get('by-employee/:employeeId')
  @ApiOperation({ summary: 'Get time-off requests by employee' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date',
  })
  @ApiResponse({
    status: 200,
    description: 'Time-off requests by employee retrieved successfully',
    type: [TimeOff],
  })
  async getTimeOffByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.timeOffService.getTimeOffByEmployee(
      employeeId,
      startDate,
      endDate,
    );
  }

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Get time-off requests by status' })
  @ApiParam({ name: 'status', description: 'Request status' })
  @ApiResponse({
    status: 200,
    description: 'Time-off requests by status retrieved successfully',
    type: [TimeOff],
  })
  async getTimeOffByStatus(@Param('status') status: string) {
    return this.timeOffService.getTimeOffByStatus(status as any);
  }

  @Get('by-type/:type')
  @ApiOperation({ summary: 'Get time-off requests by type' })
  @ApiParam({ name: 'type', description: 'Request type' })
  @ApiResponse({
    status: 200,
    description: 'Time-off requests by type retrieved successfully',
    type: [TimeOff],
  })
  async getTimeOffByType(@Param('type') type: string) {
    return this.timeOffService.getTimeOffByType(type);
  }

  @Get('conflicts')
  @ApiOperation({ summary: 'Check for time-off conflicts' })
  @ApiQuery({
    name: 'employeeId',
    required: true,
    type: String,
    description: 'Employee ID',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Start date',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'End date',
  })
  @ApiQuery({
    name: 'excludeId',
    required: false,
    type: String,
    description: 'Exclude request ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Conflict check completed successfully',
  })
  async checkConflicts(
    @Query('employeeId') employeeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('excludeId') excludeId?: string,
  ) {
    return this.timeOffService.checkConflicts(
      employeeId,
      startDate,
      endDate,
      excludeId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get time-off request by ID' })
  @ApiParam({ name: 'id', description: 'Time-off request ID' })
  @ApiResponse({
    status: 200,
    description: 'Time-off request retrieved successfully',
    type: TimeOff,
  })
  @ApiResponse({ status: 404, description: 'Time-off request not found' })
  async findOne(@Param('id') id: string): Promise<TimeOffDocument> {
    return this.timeOffService.findOne(id);
  }

  @Get('request-id/:requestId')
  @ApiOperation({ summary: 'Get time-off request by request ID' })
  @ApiParam({ name: 'requestId', description: 'Request ID' })
  @ApiResponse({
    status: 200,
    description: 'Time-off request retrieved successfully',
    type: TimeOff,
  })
  @ApiResponse({ status: 404, description: 'Time-off request not found' })
  async findByRequestId(
    @Param('requestId') requestId: string,
  ): Promise<TimeOffDocument> {
    return this.timeOffService.findByRequestId(requestId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update time-off request' })
  @ApiParam({ name: 'id', description: 'Time-off request ID' })
  @ApiResponse({
    status: 200,
    description: 'Time-off request updated successfully',
    type: TimeOff,
  })
  @ApiResponse({ status: 404, description: 'Time-off request not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot modify approved/rejected request',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTimeOffDto: UpdateTimeOffDto,
  ): Promise<TimeOffDocument> {
    return this.timeOffService.update(id, updateTimeOffDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete time-off request' })
  @ApiParam({ name: 'id', description: 'Time-off request ID' })
  @ApiResponse({
    status: 200,
    description: 'Time-off request deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Time-off request not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot delete approved request',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.timeOffService.remove(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve time-off request' })
  @ApiParam({ name: 'id', description: 'Time-off request ID' })
  @ApiResponse({
    status: 200,
    description: 'Time-off request approved successfully',
    type: TimeOff,
  })
  @ApiResponse({ status: 404, description: 'Time-off request not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot approve request',
  })
  async approve(
    @Param('id') id: string,
    @Body() body: { comments?: string },
    @Request() req,
  ): Promise<TimeOffDocument> {
    return this.timeOffService.approve(id, req.user._id, body.comments);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject time-off request' })
  @ApiParam({ name: 'id', description: 'Time-off request ID' })
  @ApiResponse({
    status: 200,
    description: 'Time-off request rejected successfully',
    type: TimeOff,
  })
  @ApiResponse({ status: 404, description: 'Time-off request not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot reject request',
  })
  async reject(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Request() req,
  ): Promise<TimeOffDocument> {
    return this.timeOffService.reject(id, req.user._id, body.reason);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel time-off request' })
  @ApiParam({ name: 'id', description: 'Time-off request ID' })
  @ApiResponse({
    status: 200,
    description: 'Time-off request cancelled successfully',
    type: TimeOff,
  })
  @ApiResponse({ status: 404, description: 'Time-off request not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot cancel request',
  })
  async cancel(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Request() req,
  ): Promise<TimeOffDocument> {
    return this.timeOffService.cancel(id, req.user._id, body.reason);
  }
}
