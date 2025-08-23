import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shift, ShiftDocument } from '../shifts/schemas/shift.schema';
import {
  Employee,
  EmployeeDocument,
} from '../employees/schemas/employee.schema';
import { TimeOff, TimeOffDocument } from '../time-off/schemas/time-off.schema';

export interface CoverageAnalytics {
  date: string;
  location: string;
  team: string;
  department: string;
  roleCoverage: any[];
  totalShifts: number;
  totalHours: number;
  averageUtilization: number;
  conflicts: any[];
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Shift.name) private shiftModel: Model<ShiftDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(TimeOff.name) private timeOffModel: Model<TimeOffDocument>,
  ) {}

  async getDailyScheduleAnalytics(
    date: string,
    location?: string,
    team?: string,
    department?: string,
  ): Promise<CoverageAnalytics> {
    // Build match conditions
    const matchConditions: any = {
      date: new Date(date),
    };

    if (location) {
      matchConditions['location.name'] = { $regex: location, $options: 'i' };
    }
    if (team) {
      matchConditions.team = { $regex: team, $options: 'i' };
    }
    if (department) {
      matchConditions.department = { $regex: department, $options: 'i' };
    }

    // Single aggregation pipeline that joins shifts, employees, and time-off
    const analytics = await this.shiftModel.aggregate([
      // Match shifts for the specified date and filters
      { $match: matchConditions },

      // Lookup employees assigned to shifts
      {
        $lookup: {
          from: 'employees',
          localField: 'assignedEmployees',
          foreignField: '_id',
          as: 'assignedEmployeesData',
        },
      },

      // Lookup time-off requests for the date
      {
        $lookup: {
          from: 'timeoffs',
          let: { shiftDate: '$date' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $lte: ['$startDate', '$$shiftDate'] },
                    { $gte: ['$endDate', '$$shiftDate'] },
                    { $eq: ['$status', 'approved'] },
                  ],
                },
              },
            },
          ],
          as: 'timeOffData',
        },
      },

      // Unwind requirements to analyze each role requirement
      { $unwind: '$requirements' },

      // Group by role to calculate coverage
      {
        $group: {
          _id: {
            role: '$requirements.role',
            location: '$location.name',
            team: '$team',
            department: '$department',
          },
          required: { $sum: '$requirements.quantity' },
          assigned: { $sum: { $size: '$assignedEmployees' } },
          shifts: { $push: '$$ROOT' },
          totalHours: { $sum: '$totalHours' },
          conflicts: { $push: '$timeOffData' },
        },
      },

      // Calculate coverage metrics
      {
        $addFields: {
          coverage: {
            $round: [
              { $multiply: [{ $divide: ['$assigned', '$required'] }, 100] },
              2,
            ],
          },
          gaps: { $max: [0, { $subtract: ['$required', '$assigned'] }] },
          overlaps: { $max: [0, { $subtract: ['$assigned', '$required'] }] },
          utilization: {
            $cond: {
              if: { $gt: ['$required', 0] },
              then: { $divide: ['$assigned', '$required'] },
              else: 0,
            },
          },
        },
      },

      // Group by location/team for final structure
      {
        $group: {
          _id: {
            location: '$_id.location',
            team: '$_id.team',
            department: '$_id.department',
          },
          roleCoverage: {
            $push: {
              role: '$_id.role',
              required: '$required',
              assigned: '$assigned',
              coverage: '$coverage',
              gaps: '$gaps',
              overlaps: '$overlaps',
              utilization: '$utilization',
              totalHours: '$totalHours',
            },
          },
          totalShifts: { $sum: { $size: '$shifts' } },
          totalHours: { $sum: '$totalHours' },
          conflicts: { $push: '$conflicts' },
        },
      },

      // Final projection
      {
        $project: {
          _id: 0,
          date: { $dateToString: { format: '%Y-%m-%d', date: new Date(date) } },
          location: '$_id.location',
          team: '$_id.team',
          department: '$_id.department',
          roleCoverage: 1,
          totalShifts: 1,
          totalHours: 1,
          averageUtilization: {
            $round: [{ $avg: '$roleCoverage.utilization' }, 2],
          },
          conflicts: {
            $reduce: {
              input: '$conflicts',
              initialValue: [],
              in: { $concatArrays: ['$$value', '$$this'] },
            },
          },
        },
      },
    ]);

    // If no results, return default structure
    if (analytics.length === 0) {
      return {
        date,
        location: location || 'all',
        team: team || 'all',
        department: department || 'all',
        roleCoverage: [],
        totalShifts: 0,
        totalHours: 0,
        averageUtilization: 0,
        conflicts: [],
      };
    }

    // Process conflicts to remove duplicates and flatten
    const uniqueConflicts = this.processConflicts(analytics[0].conflicts);

    return {
      ...analytics[0],
      conflicts: uniqueConflicts,
    };
  }

  async getEmployeeWorkloadAnalytics(
    employeeId: string,
    startDate: string,
    endDate: string,
  ): Promise<any> {
    // Aggregation pipeline for employee workload
    const workload = await this.shiftModel.aggregate([
      // Match shifts for the employee in date range
      {
        $match: {
          assignedEmployees: new Types.ObjectId(employeeId),
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },

      // Lookup employee details
      {
        $lookup: {
          from: 'employees',
          localField: 'assignedEmployees',
          foreignField: '_id',
          as: 'employeeData',
        },
      },

      // Lookup time-off requests
      {
        $lookup: {
          from: 'timeoffs',
          let: { shiftDate: '$date' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$employeeId', new Types.ObjectId(employeeId)] },
                    { $lte: ['$startDate', '$$shiftDate'] },
                    { $gte: ['$endDate', '$$shiftDate'] },
                    { $eq: ['$status', 'approved'] },
                  ],
                },
              },
            },
          ],
          as: 'timeOffData',
        },
      },

      // Group by date to calculate daily metrics
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            employeeId: '$assignedEmployees',
          },
          shifts: { $push: '$$ROOT' },
          totalHours: { $sum: '$totalHours' },
          timeOffData: { $push: '$timeOffData' },
        },
      },

      {
        $addFields: {
          hasTimeOff: {
            $gt: [{ $size: { $arrayElemAt: ['$timeOffData', 0] } }, 0],
          },
        },
      },

      // Calculate consecutive days
      {
        $sort: { '_id.date': 1 },
      },

      // Final aggregation
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$totalHours' },
          totalShifts: { $sum: { $size: '$shifts' } },
          uniqueDays: { $sum: 1 },
          timeOffDays: { $sum: { $cond: ['$hasTimeOff', 1, 0] } },
          averageHoursPerDay: { $avg: '$totalHours' },
          consecutiveDays: { $max: '$consecutiveDays' },
        },
      },
    ]);

    // Get employee details
    const employee = await this.employeeModel.findById(employeeId);

    if (workload.length === 0) {
      return {
        employeeId,
        employeeName: employee
          ? `${employee.firstName} ${employee.lastName}`
          : 'Unknown',
        totalHours: 0,
        totalShifts: 0,
        averageHoursPerDay: 0,
        consecutiveDays: 0,
        skillUtilization: [],
        availability: [],
      };
    }

    return {
      employeeId,
      employeeName: employee
        ? `${employee.firstName} ${employee.lastName}`
        : 'Unknown',
      ...workload[0],
      skillUtilization: employee?.skills || [],
      availability: employee?.availabilityWindows || [],
    };
  }

  async getConflictAnalysis(date: string, location?: string): Promise<any> {
    // Aggregation pipeline for conflict analysis
    const conflicts = await this.shiftModel.aggregate([
      // Match shifts for the date
      {
        $match: {
          date: new Date(date),
          ...(location && {
            'location.name': { $regex: location, $options: 'i' },
          }),
        },
      },

      // Lookup assigned employees
      {
        $lookup: {
          from: 'employees',
          localField: 'assignedEmployees',
          foreignField: '_id',
          as: 'assignedEmployeesData',
        },
      },

      // Lookup time-off requests
      {
        $lookup: {
          from: 'timeoffs',
          let: { shiftDate: '$date' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $lte: ['$startDate', '$$shiftDate'] },
                    { $gte: ['$endDate', '$$shiftDate'] },
                    { $eq: ['$status', 'approved'] },
                  ],
                },
              },
            },
          ],
          as: 'timeOffData',
        },
      },

      // Detect conflicts
      {
        $addFields: {
          conflicts: {
            $cond: {
              if: { $gt: [{ $size: '$timeOffData' }, 0] },
              then: {
                type: 'time_off_conflict',
                severity: 'high',
                description: 'Employee has approved time-off on this date',
                affectedEmployees: '$assignedEmployees',
              },
              else: null,
            },
          },
        },
      },

      // Filter only shifts with conflicts
      {
        $match: {
          conflicts: { $ne: null },
        },
      },

      // Project conflict details
      {
        $project: {
          shiftId: '$shiftId',
          title: '$title',
          date: '$date',
          location: '$location.name',
          team: '$team',
          conflicts: 1,
          assignedEmployees: '$assignedEmployeesData.firstName',
        },
      },
    ]);

    return conflicts;
  }

  async getCoverageGaps(date: string, location?: string): Promise<any> {
    // Aggregation pipeline for coverage gaps
    const gaps = await this.shiftModel.aggregate([
      // Match shifts for the date
      {
        $match: {
          date: new Date(date),
          ...(location && {
            'location.name': { $regex: location, $options: 'i' },
          }),
        },
      },

      // Unwind requirements
      { $unwind: '$requirements' },

      // Group by role and location
      {
        $group: {
          _id: {
            role: '$requirements.role',
            location: '$location.name',
            team: '$team',
          },
          required: { $sum: '$requirements.quantity' },
          assigned: { $sum: { $size: '$assignedEmployees' } },
          shifts: { $push: '$$ROOT' },
        },
      },

      // Calculate gaps
      {
        $addFields: {
          gap: { $max: [0, { $subtract: ['$required', '$assigned'] }] },
          coverage: {
            $round: [
              { $multiply: [{ $divide: ['$assigned', '$required'] }, 100] },
              2,
            ],
          },
        },
      },

      // Filter only roles with gaps
      {
        $match: {
          gap: { $gt: 0 },
        },
      },

      // Sort by gap size
      {
        $sort: { gap: -1 },
      },
    ]);

    return gaps;
  }

  private processConflicts(conflicts: any[]): any[] {
    // Flatten and deduplicate conflicts
    const flatConflicts = conflicts.flat();
    const uniqueConflicts = [];
    const seen = new Set();

    for (const conflict of flatConflicts) {
      const key = `${conflict.employeeId}-${conflict.startDate}-${conflict.endDate}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueConflicts.push(conflict);
      }
    }

    return uniqueConflicts;
  }
}
