import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Schedule,
  ScheduleDocument,
  ScheduleStatus,
} from './schemas/schedule.schema';
import { Shift, ShiftDocument } from '../shifts/schemas/shift.schema';
import {
  Employee,
  EmployeeDocument,
} from '../employees/schemas/employee.schema';
import { TimeOff, TimeOffDocument } from '../time-off/schemas/time-off.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
    @InjectModel(Shift.name) private shiftModel: Model<ShiftDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(TimeOff.name) private timeOffModel: Model<TimeOffDocument>,
  ) {}

  async create(scheduleData: CreateScheduleDto): Promise<ScheduleDocument> {
    // Check if schedule already exists for the date/location/team
    const existingSchedule = await this.scheduleModel.findOne({
      date: new Date(scheduleData.date),
      location: scheduleData.location,
      team: scheduleData.team,
    });

    if (existingSchedule) {
      throw new ConflictException(
        'Schedule already exists for this date, location, and team',
      );
    }

    const schedule = new this.scheduleModel({
      ...scheduleData,
      date: new Date(scheduleData.date),
      status: ScheduleStatus.DRAFT,
      lastModifiedAt: new Date(),
    });

    return schedule.save();
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<ScheduleDocument>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      date,
      location,
      team,
      department,
      status,
    } = paginationDto;

    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};

    if (date) filter.date = new Date(date);
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (team) filter.team = { $regex: team, $options: 'i' };
    if (department) filter.department = { $regex: department, $options: 'i' };
    if (status) filter.status = status;

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort query
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [schedules, total] = await Promise.all([
      this.scheduleModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('shifts', 'title startTime endTime status')
        .populate('employees', 'firstName lastName email role')
        .populate('timeOffRequests', 'reason status startDate endDate')
        .exec(),
      this.scheduleModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: schedules,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      message: 'Schedules retrieved successfully',
    };
  }

  async findOne(id: string): Promise<ScheduleDocument> {
    const schedule = await this.scheduleModel
      .findById(id)
      .populate(
        'shifts',
        'title startTime endTime status requirements assignedEmployees',
      )
      .populate('employees', 'firstName lastName email role department')
      .populate('timeOffRequests', 'reason status startDate endDate employeeId')
      .exec();

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async findByDate(
    date: string,
    location?: string,
    team?: string,
  ): Promise<ScheduleDocument[]> {
    const filter: any = { date: new Date(date) };

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (team) {
      filter.team = { $regex: team, $options: 'i' };
    }

    return this.scheduleModel
      .find(filter)
      .populate(
        'shifts',
        'title startTime endTime status requirements assignedEmployees',
      )
      .populate('employees', 'firstName lastName email role department')
      .populate('timeOffRequests', 'reason status startDate endDate employeeId')
      .exec();
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<ScheduleDocument> {
    const schedule = await this.scheduleModel.findById(id).exec();

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Check if schedule can be modified
    if (
      schedule.status === ScheduleStatus.LOCKED ||
      schedule.status === ScheduleStatus.ARCHIVED
    ) {
      throw new BadRequestException(
        'Cannot modify locked or archived schedule',
      );
    }

    // Convert date if provided
    if (updateScheduleDto.date) {
      // Ensure date is in ISO string format
      const dateObj = new Date(updateScheduleDto.date);
      if (isNaN(dateObj.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
      updateScheduleDto.date = dateObj.toISOString().split('T')[0];
    }

    const updatedSchedule = await this.scheduleModel
      .findByIdAndUpdate(id, updateScheduleDto, {
        new: true,
        runValidators: true,
      })
      .populate(
        'shifts',
        'title startTime endTime status requirements assignedEmployees',
      )
      .populate('employees', 'firstName lastName email role department')
      .populate('timeOffRequests', 'reason status startDate endDate employeeId')
      .exec();

    return updatedSchedule;
  }

  async remove(id: string): Promise<void> {
    const schedule = await this.scheduleModel.findById(id).exec();

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (
      schedule.status === ScheduleStatus.PUBLISHED ||
      schedule.status === ScheduleStatus.LOCKED
    ) {
      throw new BadRequestException(
        'Cannot delete published or locked schedule',
      );
    }

    await this.scheduleModel.findByIdAndDelete(id).exec();
  }

  async publish(id: string, publishedBy: string): Promise<ScheduleDocument> {
    const schedule = await this.scheduleModel.findById(id).exec();

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (schedule.status !== ScheduleStatus.DRAFT) {
      throw new BadRequestException('Can only publish draft schedules');
    }

    // Check for conflicts before publishing
    const conflicts = await this.detectConflicts(schedule);
    if (conflicts.length > 0) {
      throw new ConflictException('Cannot publish schedule with conflicts');
    }

    schedule.status = ScheduleStatus.PUBLISHED;
    schedule.publishedAt = new Date();
    schedule.publishedBy = new Types.ObjectId(publishedBy);
    schedule.lastModifiedAt = new Date();

    return schedule.save();
  }

  async lock(id: string, lockedBy: string): Promise<ScheduleDocument> {
    const schedule = await this.scheduleModel.findById(id).exec();

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (schedule.status !== ScheduleStatus.PUBLISHED) {
      throw new BadRequestException('Can only lock published schedules');
    }

    schedule.status = ScheduleStatus.LOCKED;
    schedule.lockedAt = new Date();
    schedule.lockedBy = new Types.ObjectId(lockedBy);
    schedule.lastModifiedAt = new Date();

    return schedule.save();
  }

  async archive(id: string, archivedBy: string): Promise<ScheduleDocument> {
    const schedule = await this.scheduleModel.findById(id).exec();

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (schedule.status === ScheduleStatus.ARCHIVED) {
      throw new BadRequestException('Schedule is already archived');
    }

    schedule.status = ScheduleStatus.ARCHIVED;
    schedule.archivedAt = new Date();
    schedule.archivedBy = new Types.ObjectId(archivedBy);
    schedule.lastModifiedAt = new Date();

    return schedule.save();
  }

  async generateSchedule(
    date: string,
    location: string,
    team: string,
    department: string,
  ): Promise<ScheduleDocument> {
    // Get all shifts for the date and location/team
    const shifts = await this.shiftModel
      .find({
        date: new Date(date),
        'location.name': { $regex: location, $options: 'i' },
        team: { $regex: team, $options: 'i' },
      })
      .exec();

    // Get all employees for the location/team
    const employees = await this.employeeModel
      .find({
        location: { $regex: location, $options: 'i' },
        team: { $regex: team, $options: 'i' },
        status: 'active',
      })
      .exec();

    // Get time-off requests for the date
    const timeOffRequests = await this.timeOffModel
      .find({
        startDate: { $lte: new Date(date) },
        endDate: { $gte: new Date(date) },
        status: 'approved',
      })
      .exec();

    // Calculate coverage and detect conflicts
    const coverage = await this.calculateCoverage(shifts, employees);
    const conflicts = await this.detectConflicts({
      shifts: shifts.map((s) => s._id),
      employees: employees.map((e) => e._id),
      timeOffRequests: timeOffRequests.map((t) => t._id),
    });

    // Calculate metrics
    const metrics = this.calculateMetrics(
      shifts,
      employees,
      coverage,
      conflicts,
    );

    const schedule = new this.scheduleModel({
      scheduleId: `SCHEDULE${Date.now()}`,
      date: new Date(date),
      location,
      team,
      department,
      status: ScheduleStatus.DRAFT,
      shifts: shifts.map((s) => s._id),
      employees: employees.map((e) => e._id),
      timeOffRequests: timeOffRequests.map((t) => t._id),
      coverage,
      conflicts,
      metrics,
      tags: ['auto-generated', 'daily'],
      notes: `Auto-generated schedule for ${date}`,
      version: '1.0',
      lastModifiedAt: new Date(),
    });

    return schedule.save();
  }

  async getScheduleStats(): Promise<any> {
    const stats = await this.scheduleModel.aggregate([
      {
        $group: {
          _id: null,
          totalSchedules: { $sum: 1 },
          draftSchedules: {
            $sum: { $cond: [{ $eq: ['$status', ScheduleStatus.DRAFT] }, 1, 0] },
          },
          publishedSchedules: {
            $sum: {
              $cond: [{ $eq: ['$status', ScheduleStatus.PUBLISHED] }, 1, 0],
            },
          },
          lockedSchedules: {
            $sum: {
              $cond: [{ $eq: ['$status', ScheduleStatus.LOCKED] }, 1, 0],
            },
          },
          archivedSchedules: {
            $sum: {
              $cond: [{ $eq: ['$status', ScheduleStatus.ARCHIVED] }, 1, 0],
            },
          },
        },
      },
    ]);

    const locationStats = await this.scheduleModel.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const teamStats = await this.scheduleModel.aggregate([
      {
        $group: {
          _id: '$team',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      ...stats[0],
      locationDistribution: locationStats,
      teamDistribution: teamStats,
    };
  }

  private async calculateCoverage(
    shifts: ShiftDocument[],
    employees: EmployeeDocument[],
  ): Promise<any[]> {
    const coverage = [];

    // Group employees by role
    const employeesByRole = employees.reduce((acc, emp) => {
      if (!acc[emp.role]) {
        acc[emp.role] = [];
      }
      acc[emp.role].push(emp);
      return acc;
    }, {});

    // Calculate coverage for each role
    for (const shift of shifts) {
      for (const requirement of shift.requirements) {
        const role = requirement.role;
        const required = requirement.quantity;
        const assigned = shift.assignedEmployees.length;
        const availableEmployees = employeesByRole[role] || [];

        coverage.push({
          role,
          required,
          assigned,
          coverage: Math.round((assigned / required) * 100),
          gaps: Math.max(0, required - assigned),
          overlaps: Math.max(0, assigned - required),
          employees: availableEmployees.map((e) => ({
            id: e._id,
            name: `${e.firstName} ${e.lastName}`,
            skills: e.skills.map((s) => s.name),
            totalHours: e.totalHoursWorked,
          })),
        });
      }
    }

    return coverage;
  }

  private async detectConflicts(scheduleData: any): Promise<any[]> {
    const conflicts = [];

    // Get detailed data for conflict detection
    const shifts = await this.shiftModel
      .find({ _id: { $in: scheduleData.shifts } })
      .populate('assignedEmployees', 'firstName lastName availabilityWindows')
      .exec();

    const employees = await this.employeeModel
      .find({ _id: { $in: scheduleData.employees } })
      .exec();

    const timeOffRequests = await this.timeOffModel
      .find({ _id: { $in: scheduleData.timeOffRequests } })
      .exec();

    // 1. Detect double-bookings (employee assigned to overlapping shifts)
    const employeeShifts: { [key: string]: any[] } = {};
    for (const shift of shifts) {
      for (const employeeId of shift.assignedEmployees) {
        const empId = employeeId.toString();
        if (!employeeShifts[empId]) {
          employeeShifts[empId] = [];
        }
        employeeShifts[empId].push(shift);
      }
    }

    for (const [employeeId, employeeShiftsList] of Object.entries(
      employeeShifts,
    )) {
      if (employeeShiftsList.length > 1) {
        // Check for overlapping shifts on the same date
        for (let i = 0; i < employeeShiftsList.length; i++) {
          for (let j = i + 1; j < employeeShiftsList.length; j++) {
            const shift1 = employeeShiftsList[i];
            const shift2 = employeeShiftsList[j];

            if (shift1.date.toDateString() === shift2.date.toDateString()) {
              // Check if shifts overlap in time
              const start1 = new Date(`2000-01-01 ${shift1.startTime}`);
              const end1 = new Date(`2000-01-01 ${shift1.endTime}`);
              const start2 = new Date(`2000-01-01 ${shift2.startTime}`);
              const end2 = new Date(`2000-01-01 ${shift2.endTime}`);

              if (start1 < end2 && start2 < end1) {
                conflicts.push({
                  type: 'double_booking',
                  severity: 'high',
                  description: `Employee ${employeeId} is assigned to overlapping shifts`,
                  affectedShifts: [shift1._id, shift2._id],
                  affectedEmployees: [employeeId],
                  resolution: 'Reassign one of the shifts',
                  details: {
                    shift1: {
                      id: shift1._id,
                      title: shift1.title,
                      time: `${shift1.startTime}-${shift1.endTime}`,
                    },
                    shift2: {
                      id: shift2._id,
                      title: shift2.title,
                      time: `${shift2.startTime}-${shift2.endTime}`,
                    },
                  },
                });
              }
            }
          }
        }
      }
    }

    // 2. Detect time-off conflicts (employee scheduled during approved time-off)
    for (const timeOff of timeOffRequests) {
      if (timeOff.status === 'approved') {
        for (const shift of shifts) {
          if (
            shift.date >= timeOff.startDate &&
            shift.date <= timeOff.endDate
          ) {
            if (shift.assignedEmployees.includes(timeOff.employeeId)) {
              conflicts.push({
                type: 'time_off_conflict',
                severity: 'medium',
                description: `Employee ${timeOff.employeeId} is assigned to shift during approved time-off`,
                affectedShifts: [shift._id],
                affectedEmployees: [timeOff.employeeId],
                resolution: 'Reassign shift to available employee',
                details: {
                  timeOff: {
                    type: timeOff.type,
                    dates: `${timeOff.startDate.toDateString()} - ${timeOff.endDate.toDateString()}`,
                  },
                  shift: {
                    id: shift._id,
                    title: shift.title,
                    date: shift.date.toDateString(),
                  },
                },
              });
            }
          }
        }
      }
    }

    // 3. Detect availability conflicts (employee scheduled outside availability windows)
    for (const shift of shifts) {
      const shiftDate = shift.date;
      const dayOfWeek = shiftDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

      for (const employeeId of shift.assignedEmployees) {
        const employee = employees.find(
          (emp) => emp._id.toString() === employeeId.toString(),
        );
        if (employee && employee.availabilityWindows) {
          const availability = employee.availabilityWindows.find(
            (aw) => aw.dayOfWeek === dayOfWeek,
          );

          if (availability && availability.isAvailable) {
            const shiftStart = new Date(`2000-01-01 ${shift.startTime}`);
            const shiftEnd = new Date(`2000-01-01 ${shift.endTime}`);
            const availStart = new Date(`2000-01-01 ${availability.startTime}`);
            const availEnd = new Date(`2000-01-01 ${availability.endTime}`);

            if (shiftStart < availStart || shiftEnd > availEnd) {
              conflicts.push({
                type: 'availability_conflict',
                severity: 'medium',
                description: `Employee ${employee.firstName} ${employee.lastName} scheduled outside availability window`,
                affectedShifts: [shift._id],
                affectedEmployees: [employeeId],
                resolution:
                  'Adjust shift time or reassign to available employee',
                details: {
                  employee: `${employee.firstName} ${employee.lastName}`,
                  availability: `${availability.startTime}-${availability.endTime}`,
                  shift: `${shift.startTime}-${shift.endTime}`,
                  day: [
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                  ][dayOfWeek],
                },
              });
            }
          } else if (!availability || !availability.isAvailable) {
            conflicts.push({
              type: 'availability_conflict',
              severity: 'high',
              description: `Employee ${employee.firstName} ${employee.lastName} scheduled on unavailable day`,
              affectedShifts: [shift._id],
              affectedEmployees: [employeeId],
              resolution: 'Reassign shift to available employee',
              details: {
                employee: `${employee.firstName} ${employee.lastName}`,
                day: [
                  'Sunday',
                  'Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                  'Friday',
                  'Saturday',
                ][dayOfWeek],
              },
            });
          }
        }
      }
    }

    // 4. Detect skill mismatches (employee assigned without required skills)
    for (const shift of shifts) {
      for (const requirement of shift.requirements) {
        for (const employeeId of shift.assignedEmployees) {
          const employee = employees.find(
            (emp) => emp._id.toString() === employeeId.toString(),
          );
          if (employee) {
            // Check if employee has the required role
            if (employee.role !== requirement.role) {
              conflicts.push({
                type: 'role_mismatch',
                severity: 'medium',
                description: `Employee ${employee.firstName} ${employee.lastName} assigned to shift requiring different role`,
                affectedShifts: [shift._id],
                affectedEmployees: [employeeId],
                resolution:
                  'Reassign to employee with correct role or adjust requirements',
                details: {
                  employee: `${employee.firstName} ${employee.lastName}`,
                  employeeRole: employee.role,
                  requiredRole: requirement.role,
                },
              });
            }
          }
        }
      }
    }

    return conflicts;
  }

  private calculateMetrics(
    shifts: ShiftDocument[],
    employees: EmployeeDocument[],
    coverage: any[],
    conflicts: any[],
  ): any {
    return {
      totalShifts: shifts.length,
      totalEmployees: employees.length,
      totalHours: shifts.reduce((sum, shift) => sum + shift.totalHours, 0),
      averageUtilization:
        coverage.length > 0
          ? coverage.reduce((sum, c) => sum + c.coverage, 0) / coverage.length
          : 0,
      coverageScore:
        coverage.length > 0
          ? coverage.reduce((sum, c) => sum + c.coverage, 0) / coverage.length
          : 0,
      conflictCount: conflicts.length,
      criticalConflicts: conflicts.filter((c) => c.severity === 'critical')
        .length,
    };
  }
}
