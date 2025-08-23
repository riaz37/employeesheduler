import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shift, ShiftDocument, ShiftStatus } from './schemas/shift.schema';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectModel(Shift.name) private shiftModel: Model<ShiftDocument>,
  ) {}

  async create(createShiftDto: CreateShiftDto): Promise<ShiftDocument> {
    // Check if shift ID already exists
    const existingShift = await this.shiftModel.findOne({
      shiftId: createShiftDto.shiftId,
    });

    if (existingShift) {
      throw new ConflictException('Shift ID already exists');
    }

    const shift = new this.shiftModel({
      ...createShiftDto,
      date: new Date(createShiftDto.date),
      scheduledAt: new Date(),
      status: createShiftDto.status || ShiftStatus.SCHEDULED,
    });

    return shift.save();
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<ShiftDocument>> {
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
    if (location) filter['location.name'] = { $regex: location, $options: 'i' };
    if (team) filter.team = { $regex: team, $options: 'i' };
    if (department) filter.department = { $regex: department, $options: 'i' };
    if (status) filter.status = status;

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort query
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [shifts, total] = await Promise.all([
      this.shiftModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('assignedEmployees', 'firstName lastName email')
        .populate('backupEmployees', 'firstName lastName email')
        .exec(),
      this.shiftModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: shifts,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      message: 'Shifts retrieved successfully',
    };
  }

  async findOne(id: string): Promise<ShiftDocument> {
    const shift = await this.shiftModel
      .findById(id)
      .populate('assignedEmployees', 'firstName lastName email role')
      .populate('backupEmployees', 'firstName lastName email role')
      .exec();

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    return shift;
  }

  async findByShiftId(shiftId: string): Promise<ShiftDocument> {
    const shift = await this.shiftModel
      .findOne({ shiftId })
      .populate('assignedEmployees', 'firstName lastName email role')
      .populate('backupEmployees', 'firstName lastName email role')
      .exec();

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    return shift;
  }

  async update(
    id: string,
    updateShiftDto: UpdateShiftDto,
  ): Promise<ShiftDocument> {
    const shift = await this.shiftModel.findById(id).exec();

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    // Check for conflicts if updating shift ID
    if (updateShiftDto.shiftId && updateShiftDto.shiftId !== shift.shiftId) {
      const existingShift = await this.shiftModel.findOne({
        shiftId: updateShiftDto.shiftId,
        _id: { $ne: id },
      });

      if (existingShift) {
        throw new ConflictException('Shift ID already exists');
      }
    }

    // Update last modified date
    (updateShiftDto as any).lastModifiedAt = new Date();

    const updatedShift = await this.shiftModel
      .findByIdAndUpdate(
        id,
        {
          ...updateShiftDto,
          date: updateShiftDto.date ? new Date(updateShiftDto.date) : undefined,
        },
        { new: true, runValidators: true },
      )
      .populate('assignedEmployees', 'firstName lastName email role')
      .populate('backupEmployees', 'firstName lastName email role')
      .exec();

    return updatedShift;
  }

  async remove(id: string): Promise<void> {
    const shift = await this.shiftModel.findById(id).exec();

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    // Check if shift is in progress or completed
    if (
      shift.status === ShiftStatus.IN_PROGRESS ||
      shift.status === ShiftStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Cannot delete shift that is in progress or completed',
      );
    }

    await this.shiftModel.findByIdAndDelete(id).exec();
  }

  async assignEmployees(
    shiftId: string,
    employeeIds: string[],
  ): Promise<ShiftDocument> {
    const shift = await this.shiftModel.findById(shiftId).exec();

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    // Validate shift status
    if (shift.status !== ShiftStatus.SCHEDULED) {
      throw new BadRequestException(
        'Can only assign employees to scheduled shifts',
      );
    }

    // Check for conflicts
    await this.checkAssignmentConflicts(shiftId, employeeIds);

    shift.assignedEmployees = employeeIds.map((id) => new Types.ObjectId(id));
    shift.lastModifiedAt = new Date();

    return shift.save();
  }

  async unassignEmployees(
    shiftId: string,
    employeeIds: string[],
  ): Promise<ShiftDocument> {
    const shift = await this.shiftModel.findById(shiftId).exec();

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    const objectIds = employeeIds.map((id) => new Types.ObjectId(id));
    shift.assignedEmployees = shift.assignedEmployees.filter(
      (id) => !objectIds.includes(id),
    );
    shift.lastModifiedAt = new Date();

    return shift.save();
  }

  async addBackupEmployees(
    shiftId: string,
    employeeIds: string[],
  ): Promise<ShiftDocument> {
    const shift = await this.shiftModel.findById(shiftId).exec();

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    const newBackupIds = employeeIds.map((id) => new Types.ObjectId(id));
    shift.backupEmployees = [...shift.backupEmployees, ...newBackupIds];
    shift.lastModifiedAt = new Date();

    return shift.save();
  }

  async startShift(shiftId: string): Promise<ShiftDocument> {
    const shift = await this.shiftModel.findById(shiftId).exec();

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (shift.status !== ShiftStatus.SCHEDULED) {
      throw new BadRequestException('Shift is not in scheduled status');
    }

    if (shift.assignedEmployees.length === 0) {
      throw new BadRequestException(
        'Cannot start shift without assigned employees',
      );
    }

    shift.status = ShiftStatus.IN_PROGRESS;
    shift.startedAt = new Date();
    shift.lastModifiedAt = new Date();

    return shift.save();
  }

  async completeShift(shiftId: string): Promise<ShiftDocument> {
    const shift = await this.shiftModel.findById(shiftId).exec();

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (shift.status !== ShiftStatus.IN_PROGRESS) {
      throw new BadRequestException('Shift is not in progress');
    }

    shift.status = ShiftStatus.COMPLETED;
    shift.completedAt = new Date();
    shift.lastModifiedAt = new Date();

    return shift.save();
  }

  async cancelShift(
    shiftId: string,
    reason: string,
    cancelledBy: string,
  ): Promise<ShiftDocument> {
    const shift = await this.shiftModel.findById(shiftId).exec();

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (shift.status === ShiftStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed shift');
    }

    shift.status = ShiftStatus.CANCELLED;
    shift.cancelledAt = new Date();
    shift.cancelledBy = new Types.ObjectId(cancelledBy);
    shift.cancellationReason = reason;
    shift.lastModifiedAt = new Date();

    return shift.save();
  }

  async getShiftsByDate(
    date: string,
    location?: string,
    team?: string,
  ): Promise<ShiftDocument[]> {
    const filter: any = { date: new Date(date) };

    if (location) {
      filter['location.name'] = { $regex: location, $options: 'i' };
    }

    if (team) {
      filter.team = { $regex: team, $options: 'i' };
    }

    return this.shiftModel
      .find(filter)
      .populate('assignedEmployees', 'firstName lastName email role')
      .populate('backupEmployees', 'firstName lastName email role')
      .exec();
  }

  async getShiftsByEmployee(
    employeeId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ShiftDocument[]> {
    const filter: any = { assignedEmployees: new Types.ObjectId(employeeId) };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    return this.shiftModel
      .find(filter)
      .populate('assignedEmployees', 'firstName lastName email role')
      .populate('backupEmployees', 'firstName lastName email role')
      .exec();
  }

  async getShiftsByLocation(
    location: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ShiftDocument[]> {
    const filter: any = {
      'location.name': { $regex: location, $options: 'i' },
    };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    return this.shiftModel
      .find(filter)
      .populate('assignedEmployees', 'firstName lastName email role')
      .populate('backupEmployees', 'firstName lastName email role')
      .exec();
  }

  async getShiftsByTeam(
    team: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ShiftDocument[]> {
    const filter: any = { team: { $regex: team, $options: 'i' } };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    return this.shiftModel
      .find(filter)
      .populate('assignedEmployees', 'firstName lastName email role')
      .populate('backupEmployees', 'firstName lastName email role')
      .exec();
  }

  async getShiftStats(): Promise<any> {
    const stats = await this.shiftModel.aggregate([
      {
        $group: {
          _id: null,
          totalShifts: { $sum: 1 },
          scheduledShifts: {
            $sum: {
              $cond: [{ $eq: ['$status', ShiftStatus.SCHEDULED] }, 1, 0],
            },
          },
          inProgressShifts: {
            $sum: {
              $cond: [{ $eq: ['$status', ShiftStatus.IN_PROGRESS] }, 1, 0],
            },
          },
          completedShifts: {
            $sum: {
              $cond: [{ $eq: ['$status', ShiftStatus.COMPLETED] }, 1, 0],
            },
          },
          cancelledShifts: {
            $sum: {
              $cond: [{ $eq: ['$status', ShiftStatus.CANCELLED] }, 1, 0],
            },
          },
          totalHours: { $sum: '$totalHours' },
          averageShiftDuration: { $avg: '$totalHours' },
        },
      },
    ]);

    const locationStats = await this.shiftModel.aggregate([
      {
        $group: {
          _id: '$location.name',
          count: { $sum: 1 },
          totalHours: { $sum: '$totalHours' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const teamStats = await this.shiftModel.aggregate([
      {
        $group: {
          _id: '$team',
          count: { $sum: 1 },
          totalHours: { $sum: '$totalHours' },
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

  async createTemplate(templateData: any): Promise<ShiftDocument> {
    // Check if template ID already exists
    const existingTemplate = await this.shiftModel.findOne({
      shiftId: templateData.shiftId,
    });

    if (existingTemplate) {
      throw new ConflictException('Template ID already exists');
    }

    const template = new this.shiftModel({
      ...templateData,
      date: new Date(templateData.date),
      scheduledAt: new Date(),
      status: ShiftStatus.SCHEDULED,
      isTemplate: true, // Mark as template
    });

    return template.save();
  }

  async generateRecurringShifts(
    templateId: string,
    startDate: string,
    endDate: string,
    pattern: string,
  ): Promise<any> {
    const template = await this.shiftModel.findById(templateId);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Check if shift can be used as template (has template in title or ID)
    const isTemplateShift =
      template.title?.toLowerCase().includes('template') ||
      template.shiftId?.toLowerCase().includes('template');

    if (!isTemplateShift) {
      throw new BadRequestException('Shift is not suitable as a template');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const shifts = [];
    const current = new Date(start);

    while (current <= end) {
      // Check if current date matches pattern
      let shouldCreate = false;

      switch (pattern.toLowerCase()) {
        case 'daily':
          shouldCreate = true;
          break;
        case 'weekly':
          // Create shift on same day of week as template
          shouldCreate = current.getDay() === template.date.getDay();
          break;
        case 'monthly':
          // Create shift on same date of month as template
          shouldCreate = current.getDate() === template.date.getDate();
          break;
        default:
          throw new BadRequestException(
            'Invalid pattern. Use: daily, weekly, or monthly',
          );
      }

      if (shouldCreate) {
        const shiftData = {
          ...template.toObject(),
          _id: undefined, // Remove template ID
          shiftId: `SHIFT${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: new Date(current),
          scheduledAt: new Date(),
          isTemplate: false, // Mark as regular shift
        };

        const shift = new this.shiftModel(shiftData);
        shifts.push(await shift.save());
      }

      // Move to next date
      current.setDate(current.getDate() + 1);
    }

    return {
      message: `Generated ${shifts.length} recurring shifts`,
      templateId,
      pattern,
      startDate,
      endDate,
      shifts: shifts.map((s) => ({
        id: s._id,
        shiftId: s.shiftId,
        date: s.date,
        title: s.title,
      })),
    };
  }

  private async checkAssignmentConflicts(
    shiftId: string,
    employeeIds: string[],
  ): Promise<void> {
    const shift = await this.shiftModel.findById(shiftId).exec();
    if (!shift) return;

    // Check for double bookings
    const conflictingShifts = await this.shiftModel.find({
      _id: { $ne: shiftId },
      date: shift.date,
      assignedEmployees: { $in: employeeIds },
      status: { $in: [ShiftStatus.SCHEDULED, ShiftStatus.IN_PROGRESS] },
    });

    if (conflictingShifts.length > 0) {
      throw new ConflictException(
        'Some employees are already assigned to other shifts on this date',
      );
    }
  }
}
