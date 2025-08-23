import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Employee,
  EmployeeDocument,
  EmployeeRole,
  EmployeeStatus,
} from './schemas/employee.schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  async create(
    createEmployeeDto: CreateEmployeeDto,
  ): Promise<EmployeeDocument> {
    // Check if employee ID already exists
    const existingEmployee = await this.employeeModel.findOne({
      $or: [
        { employeeId: createEmployeeDto.employeeId },
        { email: createEmployeeDto.email.toLowerCase() },
      ],
    });

    if (existingEmployee) {
      throw new ConflictException('Employee ID or email already exists');
    }

    const employee = new this.employeeModel({
      ...createEmployeeDto,
      email: createEmployeeDto.email.toLowerCase(),
      status: createEmployeeDto.status || EmployeeStatus.ACTIVE,
      hireDate: new Date(createEmployeeDto.hireDate),
      lastActiveDate: new Date(),
    });

    return employee.save();
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<EmployeeDocument>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      location,
      team,
      department,
      role,
      status,
    } = paginationDto;

    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};

    if (location) filter.location = { $regex: location, $options: 'i' };
    if (team) filter.team = { $regex: team, $options: 'i' };
    if (department) filter.department = { $regex: department, $options: 'i' };
    if (role) filter.role = role;
    if (status) filter.status = status;

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort query
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [employees, total] = await Promise.all([
      this.employeeModel
        .find(filter)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.employeeModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: employees,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      message: 'Employees retrieved successfully',
    };
  }

  async findOne(id: string): Promise<EmployeeDocument> {
    const employee = await this.employeeModel
      .findById(id)
      .select('-password')
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async findByEmployeeId(employeeId: string): Promise<EmployeeDocument> {
    const employee = await this.employeeModel
      .findOne({ employeeId })
      .select('-password')
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async findByEmail(email: string): Promise<EmployeeDocument> {
    const employee = await this.employeeModel
      .findOne({ email: email.toLowerCase() })
      .select('-password')
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<EmployeeDocument> {
    const employee = await this.employeeModel.findById(id).exec();

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check for conflicts if updating email or employeeId
    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existingEmail = await this.employeeModel.findOne({
        email: updateEmployeeDto.email.toLowerCase(),
        _id: { $ne: id },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    if (
      updateEmployeeDto.employeeId &&
      updateEmployeeDto.employeeId !== employee.employeeId
    ) {
      const existingEmployeeId = await this.employeeModel.findOne({
        employeeId: updateEmployeeDto.employeeId,
        _id: { $ne: id },
      });

      if (existingEmployeeId) {
        throw new ConflictException('Employee ID already exists');
      }
    }

    // Update last modified date
    (updateEmployeeDto as any).lastActiveDate = new Date();

    const updatedEmployee = await this.employeeModel
      .findByIdAndUpdate(
        id,
        { ...updateEmployeeDto, email: updateEmployeeDto.email?.toLowerCase() },
        { new: true, runValidators: true },
      )
      .select('-password')
      .exec();

    return updatedEmployee;
  }

  async remove(id: string): Promise<void> {
    const employee = await this.employeeModel.findById(id).exec();

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Soft delete - change status to terminated
    await this.employeeModel.findByIdAndUpdate(id, {
      status: EmployeeStatus.TERMINATED,
      terminationDate: new Date(),
    });
  }

  async findByRole(role: EmployeeRole): Promise<EmployeeDocument[]> {
    return this.employeeModel
      .find({ role, status: EmployeeStatus.ACTIVE })
      .select('-password')
      .exec();
  }

  async findByLocation(location: string): Promise<EmployeeDocument[]> {
    return this.employeeModel
      .find({
        location: { $regex: location, $options: 'i' },
        status: EmployeeStatus.ACTIVE,
      })
      .select('-password')
      .exec();
  }

  async findByTeam(team: string): Promise<EmployeeDocument[]> {
    return this.employeeModel
      .find({
        team: { $regex: team, $options: 'i' },
        status: EmployeeStatus.ACTIVE,
      })
      .select('-password')
      .exec();
  }

  async findBySkills(skills: string[]): Promise<EmployeeDocument[]> {
    return this.employeeModel
      .find({
        'skills.name': { $in: skills },
        status: EmployeeStatus.ACTIVE,
      })
      .select('-password')
      .exec();
  }

  async findAvailableEmployees(
    date: Date,
    startTime: string,
    endTime: string,
    location: string,
  ): Promise<EmployeeDocument[]> {
    const dayOfWeek = date.getDay();

    return this.employeeModel
      .find({
        status: EmployeeStatus.ACTIVE,
        location: { $regex: location, $options: 'i' },
        'availabilityWindows.dayOfWeek': dayOfWeek,
        'availabilityWindows.isAvailable': true,
        $or: [
          { 'availabilityWindows.startTime': { $lte: startTime } },
          { 'availabilityWindows.endTime': { $gte: endTime } },
        ],
      })
      .select('-password')
      .exec();
  }

  async updateWorkload(employeeId: string, hours: number): Promise<void> {
    await this.employeeModel.findByIdAndUpdate(employeeId, {
      $inc: { totalHoursWorked: hours },
      lastActiveDate: new Date(),
    });
  }

  async getEmployeeStats(): Promise<any> {
    const stats = await this.employeeModel.aggregate([
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          activeEmployees: {
            $sum: {
              $cond: [{ $eq: ['$status', EmployeeStatus.ACTIVE] }, 1, 0],
            },
          },
          partTimeEmployees: {
            $sum: { $cond: [{ $eq: ['$isPartTime', true] }, 1, 0] },
          },
          averageHoursWorked: { $avg: '$totalHoursWorked' },
          totalHoursWorked: { $sum: '$totalHoursWorked' },
        },
      },
    ]);

    const roleStats = await this.employeeModel.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const locationStats = await this.employeeModel.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      ...stats[0],
      roleDistribution: roleStats,
      locationDistribution: locationStats,
    };
  }
}
