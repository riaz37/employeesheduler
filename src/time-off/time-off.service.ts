import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  TimeOff,
  TimeOffDocument,
  TimeOffStatus,
} from './schemas/time-off.schema';
import { CreateTimeOffDto } from './dto/create-time-off.dto';
import { UpdateTimeOffDto } from './dto/update-time-off.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class TimeOffService {
  constructor(
    @InjectModel(TimeOff.name) private timeOffModel: Model<TimeOffDocument>,
  ) {}

  async create(createTimeOffDto: CreateTimeOffDto): Promise<TimeOffDocument> {
    // Check if request ID already exists
    const existingRequest = await this.timeOffModel.findOne({
      requestId: createTimeOffDto.requestId,
    });

    if (existingRequest) {
      throw new ConflictException('Request ID already exists');
    }

    const timeOff = new this.timeOffModel({
      ...createTimeOffDto,
      startDate: new Date(createTimeOffDto.startDate),
      endDate: new Date(createTimeOffDto.endDate),
      submittedAt: new Date(),
      lastModifiedAt: new Date(),
    });

    return timeOff.save();
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<TimeOffDocument>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'submittedAt',
      sortOrder = 'desc',
      startDate,
      endDate,
      status,
      type,
      priority,
      employeeId,
    } = paginationDto;

    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};

    if (startDate && endDate) {
      filter.$or = [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
        {
          startDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      ];
    }

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (employeeId) filter.employeeId = new Types.ObjectId(employeeId);

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort query
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [timeOffRequests, total] = await Promise.all([
      this.timeOffModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('employeeId', 'firstName lastName email')
        .populate('coverageEmployees', 'firstName lastName email')
        .exec(),
      this.timeOffModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: timeOffRequests,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      message: 'Time-off requests retrieved successfully',
    };
  }

  async findOne(id: string): Promise<TimeOffDocument> {
    const timeOff = await this.timeOffModel
      .findById(id)
      .populate('employeeId', 'firstName lastName email role department')
      .populate('coverageEmployees', 'firstName lastName email role')
      .populate('affectedShifts', 'title date startTime endTime')
      .exec();

    if (!timeOff) {
      throw new NotFoundException('Time-off request not found');
    }

    return timeOff;
  }

  async findByRequestId(requestId: string): Promise<TimeOffDocument> {
    const timeOff = await this.timeOffModel
      .findOne({ requestId })
      .populate('employeeId', 'firstName lastName email role department')
      .populate('coverageEmployees', 'firstName lastName email role')
      .populate('affectedShifts', 'title date startTime endTime')
      .exec();

    if (!timeOff) {
      throw new NotFoundException('Time-off request not found');
    }

    return timeOff;
  }

  async update(
    id: string,
    updateTimeOffDto: UpdateTimeOffDto,
  ): Promise<TimeOffDocument> {
    const timeOff = await this.timeOffModel.findById(id).exec();

    if (!timeOff) {
      throw new NotFoundException('Time-off request not found');
    }

    // Check if request can be modified
    if (
      timeOff.status === TimeOffStatus.APPROVED ||
      timeOff.status === TimeOffStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Cannot modify approved or rejected requests',
      );
    }

    // Update last modified date
    (updateTimeOffDto as any).lastModifiedAt = new Date();

    // Convert dates if provided
    if (updateTimeOffDto.startDate) {
      (updateTimeOffDto as any).startDate = new Date(
        updateTimeOffDto.startDate,
      );
    }
    if (updateTimeOffDto.endDate) {
      (updateTimeOffDto as any).endDate = new Date(updateTimeOffDto.endDate);
    }

    const updatedTimeOff = await this.timeOffModel
      .findByIdAndUpdate(id, updateTimeOffDto, {
        new: true,
        runValidators: true,
      })
      .populate('employeeId', 'firstName lastName email role department')
      .populate('coverageEmployees', 'firstName lastName email role')
      .populate('affectedShifts', 'title date startTime endTime')
      .exec();

    return updatedTimeOff;
  }

  async remove(id: string): Promise<void> {
    const timeOff = await this.timeOffModel.findById(id).exec();

    if (!timeOff) {
      throw new NotFoundException('Time-off request not found');
    }

    if (timeOff.status === TimeOffStatus.APPROVED) {
      throw new BadRequestException('Cannot delete approved time-off request');
    }

    await this.timeOffModel.findByIdAndDelete(id).exec();
  }

  async approve(
    id: string,
    approverId: string,
    comments?: string,
  ): Promise<TimeOffDocument> {
    const timeOff = await this.timeOffModel.findById(id).exec();

    if (!timeOff) {
      throw new NotFoundException('Time-off request not found');
    }

    if (timeOff.status !== TimeOffStatus.PENDING) {
      throw new BadRequestException('Can only approve pending requests');
    }

    // Add approval record
    const approval = {
      approverId: new Types.ObjectId(approverId),
      approvedAt: new Date(),
      comments,
      level: 1, // Assuming single level approval
    };

    timeOff.status = TimeOffStatus.APPROVED;
    timeOff.approvals = [...(timeOff.approvals || []), approval];
    timeOff.lastModifiedAt = new Date();

    return timeOff.save();
  }

  async reject(
    id: string,
    rejectorId: string,
    reason: string,
  ): Promise<TimeOffDocument> {
    const timeOff = await this.timeOffModel.findById(id).exec();

    if (!timeOff) {
      throw new NotFoundException('Time-off request not found');
    }

    if (timeOff.status !== TimeOffStatus.PENDING) {
      throw new BadRequestException('Can only reject pending requests');
    }

    timeOff.status = TimeOffStatus.REJECTED;
    timeOff.rejectedBy = new Types.ObjectId(rejectorId);
    timeOff.rejectedAt = new Date();
    timeOff.rejectionReason = reason;
    timeOff.lastModifiedAt = new Date();

    return timeOff.save();
  }

  async cancel(
    id: string,
    cancellerId: string,
    reason: string,
  ): Promise<TimeOffDocument> {
    const timeOff = await this.timeOffModel.findById(id).exec();

    if (!timeOff) {
      throw new NotFoundException('Time-off request not found');
    }

    if (timeOff.status === TimeOffStatus.REJECTED) {
      throw new BadRequestException('Cannot cancel rejected requests');
    }

    timeOff.status = TimeOffStatus.CANCELLED;
    timeOff.cancelledBy = new Types.ObjectId(cancellerId);
    timeOff.cancelledAt = new Date();
    timeOff.cancellationReason = reason;
    timeOff.lastModifiedAt = new Date();

    return timeOff.save();
  }

  async getTimeOffByEmployee(
    employeeId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<TimeOffDocument[]> {
    const filter: any = { employeeId: new Types.ObjectId(employeeId) };

    if (startDate && endDate) {
      filter.$or = [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
        {
          startDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      ];
    }

    return this.timeOffModel
      .find(filter)
      .populate('employeeId', 'firstName lastName email role department')
      .populate('coverageEmployees', 'firstName lastName email role')
      .populate('affectedShifts', 'title date startTime endTime')
      .exec();
  }

  async getTimeOffByStatus(status: TimeOffStatus): Promise<TimeOffDocument[]> {
    return this.timeOffModel
      .find({ status })
      .populate('employeeId', 'firstName lastName email role department')
      .populate('coverageEmployees', 'firstName lastName email role')
      .populate('affectedShifts', 'title date startTime endTime')
      .exec();
  }

  async getTimeOffByType(type: string): Promise<TimeOffDocument[]> {
    return this.timeOffModel
      .find({ type })
      .populate('employeeId', 'firstName lastName email role department')
      .populate('coverageEmployees', 'firstName lastName email role')
      .populate('affectedShifts', 'title date startTime endTime')
      .exec();
  }

  async getTimeOffStats(): Promise<any> {
    const stats = await this.timeOffModel.aggregate([
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          pendingRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', TimeOffStatus.PENDING] }, 1, 0],
            },
          },
          approvedRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', TimeOffStatus.APPROVED] }, 1, 0],
            },
          },
          rejectedRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', TimeOffStatus.REJECTED] }, 1, 0],
            },
          },
          cancelledRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', TimeOffStatus.CANCELLED] }, 1, 0],
            },
          },
          totalDays: { $sum: '$totalDays' },
          totalHours: { $sum: '$totalHours' },
        },
      },
    ]);

    const typeStats = await this.timeOffModel.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalDays: { $sum: '$totalDays' },
          totalHours: { $sum: '$totalHours' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const priorityStats = await this.timeOffModel.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      ...stats[0],
      typeDistribution: typeStats,
      priorityDistribution: priorityStats,
    };
  }

  async checkConflicts(
    employeeId: string,
    startDate: string,
    endDate: string,
    excludeId?: string,
  ): Promise<any[]> {
    const filter: any = {
      employeeId: new Types.ObjectId(employeeId),
      status: { $in: [TimeOffStatus.PENDING, TimeOffStatus.APPROVED] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
        {
          startDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      ],
    };

    if (excludeId) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }

    return this.timeOffModel
      .find(filter)
      .populate('employeeId', 'firstName lastName email')
      .exec();
  }
}
