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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Employee, EmployeeDocument } from './schemas/employee.schema';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({
    status: 201,
    description: 'Employee created successfully',
    type: Employee,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Employee ID or email already exists',
  })
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
  ): Promise<EmployeeDocument> {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees with pagination and filtering' })
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
    name: 'role',
    required: false,
    type: String,
    description: 'Filter by role',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status',
  })
  @ApiResponse({
    status: 200,
    description: 'Employees retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Employee' },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          },
        },
        message: { type: 'string' },
      },
    },
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.employeesService.findAll(paginationDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get employee statistics and analytics' })
  @ApiResponse({
    status: 200,
    description: 'Employee statistics retrieved successfully',
  })
  async getStats() {
    return this.employeesService.getEmployeeStats();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search employees by various criteria' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search query',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: [Employee],
  })
  async search(@Query('q') query: string) {
    // This would use the text search index we created
    return this.employeesService.findAll({ search: query, limit: 20 });
  }

  @Get('by-role/:role')
  @ApiOperation({ summary: 'Get employees by role' })
  @ApiParam({ name: 'role', description: 'Employee role' })
  @ApiResponse({
    status: 200,
    description: 'Employees by role retrieved successfully',
    type: [Employee],
  })
  async findByRole(@Param('role') role: string) {
    return this.employeesService.findByRole(role as any);
  }

  @Get('by-location/:location')
  @ApiOperation({ summary: 'Get employees by location' })
  @ApiParam({ name: 'location', description: 'Employee location' })
  @ApiResponse({
    status: 200,
    description: 'Employees by location retrieved successfully',
    type: [Employee],
  })
  async findByLocation(@Param('location') location: string) {
    return this.employeesService.findByLocation(location);
  }

  @Get('by-team/:team')
  @ApiOperation({ summary: 'Get employees by team' })
  @ApiParam({ name: 'team', description: 'Employee team' })
  @ApiResponse({
    status: 200,
    description: 'Employees by team retrieved successfully',
    type: [Employee],
  })
  async findByTeam(@Param('team') team: string) {
    return this.employeesService.findByTeam(team);
  }

  @Get('by-skills')
  @ApiOperation({ summary: 'Get employees by skills' })
  @ApiQuery({
    name: 'skills',
    required: true,
    type: String,
    description: 'Comma-separated skills',
  })
  @ApiResponse({
    status: 200,
    description: 'Employees by skills retrieved successfully',
    type: [Employee],
  })
  async findBySkills(@Query('skills') skills: string) {
    const skillsArray = skills.split(',').map((s) => s.trim());
    return this.employeesService.findBySkills(skillsArray);
  }

  @Get('available')
  @ApiOperation({
    summary: 'Get available employees for a specific time and location',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    description: 'Date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'startTime',
    required: true,
    type: String,
    description: 'Start time (HH:MM)',
  })
  @ApiQuery({
    name: 'endTime',
    required: true,
    type: String,
    description: 'End time (HH:MM)',
  })
  @ApiQuery({
    name: 'location',
    required: true,
    type: String,
    description: 'Location',
  })
  @ApiResponse({
    status: 200,
    description: 'Available employees retrieved successfully',
    type: [Employee],
  })
  async findAvailableEmployees(
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('location') location: string,
  ) {
    const dateObj = new Date(date);
    return this.employeesService.findAvailableEmployees(
      dateObj,
      startTime,
      endTime,
      location,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee retrieved successfully',
    type: Employee,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findOne(@Param('id') id: string): Promise<EmployeeDocument> {
    return this.employeesService.findOne(id);
  }

  @Get('employee-id/:employeeId')
  @ApiOperation({ summary: 'Get employee by employee ID' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee retrieved successfully',
    type: Employee,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findByEmployeeId(
    @Param('employeeId') employeeId: string,
  ): Promise<EmployeeDocument> {
    return this.employeesService.findByEmployeeId(employeeId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee updated successfully',
    type: Employee,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email or employee ID already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<EmployeeDocument> {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete employee (soft delete)' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.employeesService.remove(id);
  }
}
