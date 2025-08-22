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
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Shift, ShiftDocument } from './schemas/shift.schema';

@ApiTags('Shifts')
@Controller('shifts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shift' })
  @ApiResponse({
    status: 201,
    description: 'Shift created successfully',
    type: Shift,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Shift ID already exists',
  })
  async create(@Body() createShiftDto: CreateShiftDto): Promise<ShiftDocument> {
    return this.shiftsService.create(createShiftDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shifts with pagination and filtering' })
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
    description: 'Shifts retrieved successfully',
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.shiftsService.findAll(paginationDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get shift statistics and analytics' })
  @ApiResponse({
    status: 200,
    description: 'Shift statistics retrieved successfully',
  })
  async getStats() {
    return this.shiftsService.getShiftStats();
  }

  @Get('by-date/:date')
  @ApiOperation({ summary: 'Get shifts by date' })
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
    description: 'Shifts by date retrieved successfully',
    type: [Shift],
  })
  async getShiftsByDate(
    @Param('date') date: string,
    @Query('location') location?: string,
    @Query('team') team?: string,
  ) {
    return this.shiftsService.getShiftsByDate(date, location, team);
  }

  @Get('by-employee/:employeeId')
  @ApiOperation({ summary: 'Get shifts by employee' })
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
    description: 'Shifts by employee retrieved successfully',
    type: [Shift],
  })
  async getShiftsByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.shiftsService.getShiftsByEmployee(
      employeeId,
      startDate,
      endDate,
    );
  }

  @Get('by-location/:location')
  @ApiOperation({ summary: 'Get shifts by location' })
  @ApiParam({ name: 'location', description: 'Location name' })
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
    description: 'Shifts by location retrieved successfully',
    type: [Shift],
  })
  async getShiftsByLocation(
    @Param('location') location: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.shiftsService.getShiftsByLocation(location, startDate, endDate);
  }

  @Get('by-team/:team')
  @ApiOperation({ summary: 'Get shifts by team' })
  @ApiParam({ name: 'team', description: 'Team name' })
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
    description: 'Shifts by team retrieved successfully',
    type: [Shift],
  })
  async getShiftsByTeam(
    @Param('team') team: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.shiftsService.getShiftsByTeam(team, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shift by ID' })
  @ApiParam({ name: 'id', description: 'Shift ID' })
  @ApiResponse({
    status: 200,
    description: 'Shift retrieved successfully',
    type: Shift,
  })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  async findOne(@Param('id') id: string): Promise<ShiftDocument> {
    return this.shiftsService.findOne(id);
  }

  @Get('shift-id/:shiftId')
  @ApiOperation({ summary: 'Get shift by shift ID' })
  @ApiParam({ name: 'shiftId', description: 'Shift ID' })
  @ApiResponse({
    status: 200,
    description: 'Shift retrieved successfully',
    type: Shift,
  })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  async findByShiftId(
    @Param('shiftId') shiftId: string,
  ): Promise<ShiftDocument> {
    return this.shiftsService.findByShiftId(shiftId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update shift' })
  @ApiParam({ name: 'id', description: 'Shift ID' })
  @ApiResponse({
    status: 200,
    description: 'Shift updated successfully',
    type: Shift,
  })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Shift ID already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateShiftDto: UpdateShiftDto,
  ): Promise<ShiftDocument> {
    return this.shiftsService.update(id, updateShiftDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete shift' })
  @ApiParam({ name: 'id', description: 'Shift ID' })
  @ApiResponse({ status: 200, description: 'Shift deleted successfully' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot delete active shift',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.shiftsService.remove(id);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign employees to shift' })
  @ApiParam({ name: 'id', description: 'Shift ID' })
  @ApiResponse({
    status: 200,
    description: 'Employees assigned successfully',
    type: Shift,
  })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid assignment' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Assignment conflicts detected',
  })
  async assignEmployees(
    @Param('id') id: string,
    @Body() body: { employeeIds: string[] },
  ): Promise<ShiftDocument> {
    return this.shiftsService.assignEmployees(id, body.employeeIds);
  }

  @Post(':id/unassign')
  @ApiOperation({ summary: 'Unassign employees from shift' })
  @ApiParam({ name: 'id', description: 'Shift ID' })
  @ApiResponse({
    status: 200,
    description: 'Employees unassigned successfully',
    type: Shift,
  })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  async unassignEmployees(
    @Param('id') id: string,
    @Body() body: { employeeIds: string[] },
  ): Promise<ShiftDocument> {
    return this.shiftsService.unassignEmployees(id, body.employeeIds);
  }

  @Post(':id/backup')
  @ApiOperation({ summary: 'Add backup employees to shift' })
  @ApiParam({ name: 'id', description: 'Shift ID' })
  @ApiResponse({
    status: 200,
    description: 'Backup employees added successfully',
    type: Shift,
  })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  async addBackupEmployees(
    @Param('id') id: string,
    @Body() body: { employeeIds: string[] },
  ): Promise<ShiftDocument> {
    return this.shiftsService.addBackupEmployees(id, body.employeeIds);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a scheduled shift' })
  @ApiParam({ name: 'id', description: 'Shift ID' })
  @ApiResponse({
    status: 200,
    description: 'Shift started successfully',
    type: Shift,
  })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Cannot start shift' })
  async startShift(@Param('id') id: string): Promise<ShiftDocument> {
    return this.shiftsService.startShift(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete an in-progress shift' })
  @ApiParam({ name: 'id', description: 'Shift ID' })
  @ApiResponse({
    status: 200,
    description: 'Shift completed successfully',
    type: Shift,
  })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot complete shift',
  })
  async completeShift(@Param('id') id: string): Promise<ShiftDocument> {
    return this.shiftsService.completeShift(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a shift' })
  @ApiParam({ name: 'id', description: 'Shift ID' })
  @ApiResponse({
    status: 200,
    description: 'Shift cancelled successfully',
    type: Shift,
  })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot cancel shift',
  })
  async cancelShift(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Request() req,
  ): Promise<ShiftDocument> {
    return this.shiftsService.cancelShift(id, body.reason, req.user._id);
  }
}
