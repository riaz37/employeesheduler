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
    // Build match conditions - use date range to handle time components
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1); // Next day to get all shifts for the date
    
    const matchConditions: any = {
      date: {
        $gte: startDate,
        $lt: endDate
      }
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

      // Lookup time-off requests for assigned employees only
      {
        $lookup: {
          from: 'timeoffs',
          let: { 
            shiftDate: '$date',
            assignedEmployeeIds: '$assignedEmployees'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $lte: ['$startDate', '$$shiftDate'] },
                    { $gte: ['$endDate', '$$shiftDate'] },
                    { $eq: ['$status', 'approved'] },
                    { $in: ['$employeeId._id', '$$assignedEmployeeIds'] } // Use _id from populated employee object
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

    // Filter out empty conflicts and flatten the array
    if (analytics.length > 0) {
      analytics[0].conflicts = analytics[0].conflicts.filter(conflict => conflict.length > 0).flat();
    }

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
    // Parse dates and set time boundaries
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of day
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of day
    
    // Aggregation pipeline for employee workload
    const workload = await this.shiftModel.aggregate([
      // Match shifts for the employee in date range
      {
        $match: {
          assignedEmployees: new Types.ObjectId(employeeId),
          date: {
            $gte: start,
            $lte: end,
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
    // Use the simpler working approach instead of complex aggregation
    const startDateStr = date + 'T00:00:00.000Z';
    const endDateStr = date + 'T23:59:59.999Z';
    
    // Get shifts for the date
    const shifts = await this.shiftModel.find({
          date: {
        $gte: startDateStr,
        $lte: endDateStr
          },
          ...(location && {
            'location.name': { $regex: location, $options: 'i' },
          }),
    }).lean();

    // Get time-off requests for the date
    const timeOffRequests = await this.timeOffModel.find({
      startDate: { $lte: endDateStr },
      endDate: { $gte: startDateStr },
      status: 'approved'
    }).lean();

    // Find conflicts manually
    const conflicts = [];
    for (const shift of shifts) {
      if (shift.assignedEmployees && shift.assignedEmployees.length > 0) {
        for (const employeeId of shift.assignedEmployees) {
          const hasTimeOff = timeOffRequests.some(to => 
            to.employeeId.toString() === employeeId.toString()
          );
          if (hasTimeOff) {
            conflicts.push({
              shiftId: shift.shiftId,
              title: shift.title,
              date: shift.date,
              location: shift.location?.name,
              team: shift.team,
          conflicts: {
                type: 'time_off_conflict',
                severity: 'high',
                description: 'Assigned employee has approved time-off on this date',
                affectedEmployees: [employeeId],
                timeOffDetails: timeOffRequests.filter(to => 
                  to.employeeId.toString() === employeeId.toString()
                )
              },
              assignedEmployees: [employeeId.toString()]
            });
          }
        }
      }
    }

    return conflicts;
  }

  // Test method to debug conflict detection with unpopulated data
  async getConflictAnalysisDebug(date: string): Promise<any> {
    // Get shifts for the date
    const startDateStr = date + 'T00:00:00.000Z';
    const endDateStr = date + 'T23:59:59.999Z';
    
    const shifts = await this.shiftModel.find({
      date: {
        $gte: startDateStr,
        $lte: endDateStr
      }
    }).lean();

    console.log('Found shifts:', shifts.length);
    
    // Get time-off requests for the date
    const timeOffRequests = await this.timeOffModel.find({
      startDate: { $lte: endDateStr },
      endDate: { $gte: startDateStr },
      status: 'approved'
    }).lean();

    console.log('Found time-off requests:', timeOffRequests.length);
    
    // Find conflicts manually
    const conflicts = [];
    for (const shift of shifts) {
      if (shift.assignedEmployees && shift.assignedEmployees.length > 0) {
        for (const employeeId of shift.assignedEmployees) {
          const hasTimeOff = timeOffRequests.some(to => 
            to.employeeId.toString() === employeeId.toString()
          );
          if (hasTimeOff) {
            conflicts.push({
              shiftId: shift.shiftId,
              date: shift.date,
              employeeId: employeeId,
              type: 'time_off_conflict',
              severity: 'high',
              description: 'Assigned employee has approved time-off on this date'
            });
          }
        }
      }
    }
    
    console.log('Found conflicts:', conflicts.length);
    return conflicts;
  }

  async getCoverageGaps(date: string, location?: string): Promise<any> {
    // Build date range for matching
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1); // Next day to get all shifts for the date
    
    // Aggregation pipeline for coverage gaps
    const gaps = await this.shiftModel.aggregate([
      // Match shifts for the date
      {
        $match: {
          date: {
            $gte: startDate,
            $lt: endDate
          },
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

  async getWeeklyAnalytics(
    startDate: string,
    location?: string,
    team?: string,
    department?: string,
  ): Promise<any> {
    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setDate(end.getDate() + 7); // 7 days

    // Get daily analytics for each day in the week
    const dailyPromises = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      dailyPromises.push(
        this.getDailyScheduleAnalytics(
          currentDate.toISOString().split('T')[0],
          location,
          team,
          department,
        ),
      );
    }

    const dailyResults = await Promise.all(dailyPromises);

    // Aggregate weekly metrics
    const totalShifts = dailyResults.reduce((sum, day) => sum + day.totalShifts, 0);
    const totalHours = dailyResults.reduce((sum, day) => sum + day.totalHours, 0);
    const totalConflicts = dailyResults.reduce((sum, day) => sum + day.conflicts.length, 0);
    const totalEmployees = dailyResults.reduce((sum, day) => 
      sum + day.roleCoverage.reduce((roleSum, role) => roleSum + role.assigned, 0), 0
    );

    return {
      period: `${startDate} to ${end.toISOString().split('T')[0]}`,
      dailyAnalytics: dailyResults,
      summary: {
        totalShifts,
        totalEmployees,
        totalHours,
        averageCoverage: dailyResults.length > 0 ? 
          dailyResults.reduce((sum, day) => sum + day.averageUtilization, 0) / dailyResults.length : 0,
        totalConflicts,
        criticalConflicts: dailyResults.reduce((sum, day) => 
          sum + day.conflicts.filter((c: any) => c.severity === 'critical').length, 0
        ),
      },
      trends: {
        coverageTrend: dailyResults.map((day: any) => ({ 
          date: day.date, 
          coverage: day.averageUtilization 
        })),
        conflictTrend: dailyResults.map((day: any) => ({ 
          date: day.date, 
          conflicts: day.conflicts.length 
        })),
        utilizationTrend: dailyResults.map((day: any) => ({ 
          date: day.date, 
          utilization: day.averageUtilization 
        })),
      },
    };
  }

  async getMonthlyAnalytics(
    year: number,
    month: number,
    location?: string,
    team?: string,
    department?: string,
  ): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const daysInMonth = endDate.getDate();

    // Get daily analytics for each day in the month
    const dailyPromises = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      dailyPromises.push(
        this.getDailyScheduleAnalytics(
          currentDate.toISOString().split('T')[0],
          location,
          team,
          department,
        ),
      );
    }

    const dailyResults = await Promise.all(dailyPromises);

    // Aggregate monthly metrics
    const totalShifts = dailyResults.reduce((sum, day) => sum + day.totalShifts, 0);
    const totalHours = dailyResults.reduce((sum, day) => sum + day.totalHours, 0);
    const totalConflicts = dailyResults.reduce((sum, day) => sum + day.conflicts.length, 0);
    const totalEmployees = dailyResults.reduce((sum, day) => 
      sum + day.roleCoverage.reduce((roleSum, role) => roleSum + role.assigned, 0), 0
    );

    return {
      period: `${year}-${month.toString().padStart(2, '0')}`,
      weeklyAnalytics: [], // Could be implemented by grouping daily results
      summary: {
        totalShifts,
        totalEmployees,
        totalHours,
        averageCoverage: dailyResults.length > 0 ? 
          dailyResults.reduce((sum, day) => sum + day.averageUtilization, 0) / dailyResults.length : 0,
        totalConflicts,
        criticalConflicts: dailyResults.reduce((sum, day) => 
          sum + day.conflicts.filter((c: any) => c.severity === 'critical').length, 0
        ),
        costAnalysis: {
          totalCost: totalHours * 25, // Assuming $25/hour average
          costPerHour: 25,
          costPerEmployee: totalHours * 25 / Math.max(1, totalEmployees),
        },
      },
      trends: {
        monthlyTrends: dailyResults.map((day: any) => ({ 
          month: day.date, 
          metrics: {
            totalShifts: day.totalShifts,
            totalHours: day.totalHours,
            averageUtilization: day.averageUtilization,
            conflicts: day.conflicts.length,
          }
        })),
        seasonalPatterns: [],
      },
    };
  }

  async getConflictAnalysisByDateRange(
    startDate: string,
    endDate: string,
    location?: string,
    team?: string,
    department?: string,
  ): Promise<any> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Get conflicts for each day in the range
    const conflictPromises = [];
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      conflictPromises.push(
        this.getConflictAnalysis(
          currentDate.toISOString().split('T')[0],
          location,
        ),
      );
    }

    const conflictResults = await Promise.all(conflictPromises);
    const allConflicts = conflictResults.flat();

    // Aggregate conflict analysis
    const totalConflicts = allConflicts.length;
    const criticalConflicts = allConflicts.filter((c: any) => c.conflicts?.severity === 'high').length;

    // Group conflicts by type
    const conflictTypes = allConflicts.reduce((acc: any[], conflict: any) => {
      if (conflict.conflicts) {
        const existing = acc.find((c: any) => c.type === conflict.conflicts.type);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ 
            type: conflict.conflicts.type, 
            count: 1, 
            severity: conflict.conflicts.severity 
          });
        }
      }
      return acc;
    }, []);

    // Ensure we have at least one conflict type to avoid division by zero
    if (conflictTypes.length === 0) {
      conflictTypes.push({
        type: 'no_conflicts',
        count: 0,
        severity: 'low'
      });
    }

    return {
      period: `${startDate} to ${endDate}`,
      totalConflicts,
      criticalConflicts,
      conflictTypes,
      affectedEntities: {
        shifts: [...new Set(allConflicts.flatMap((c: any) => c.shiftId || []))],
        employees: [...new Set(allConflicts.flatMap((c: any) => c.conflicts?.affectedEmployees || []))],
        timeOff: [],
      },
      resolutionSuggestions: allConflicts
        .filter((c: any) => c.conflicts)
        .map((conflict: any) => ({
          conflictId: conflict.shiftId || 'unknown',
          description: conflict.conflicts.description || 'Unknown conflict',
          suggestion: 'Review and resolve manually',
          impact: conflict.conflicts.severity === 'high' ? 'High' : 'Medium',
        })),
    };
  }

  async getCoverageOptimizationByDateRange(
    startDate: string,
    endDate: string,
    location?: string,
    team?: string,
    department?: string,
  ): Promise<any> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Get daily analytics for each day in the range
    const dailyPromises = [];
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      dailyPromises.push(
        this.getDailyScheduleAnalytics(
          currentDate.toISOString().split('T')[0],
          location,
          team,
          department,
        ),
      );
    }

    const dailyResults = await Promise.all(dailyPromises);
    
    // Calculate role-specific coverage metrics
    const roleCoverageMap = new Map();
    let totalRequired = 0;
    let totalAssigned = 0;

    // Aggregate coverage data by role
    dailyResults.forEach(day => {
      if (day.roleCoverage) {
        day.roleCoverage.forEach(role => {
          const existing = roleCoverageMap.get(role.role) || {
            required: 0,
            assigned: 0,
            gaps: 0,
            overlaps: 0,
          };
          
          existing.required += role.required;
          existing.assigned += role.assigned;
          existing.gaps += role.gaps;
          existing.overlaps += role.overlaps;
          
          roleCoverageMap.set(role.role, existing);
          
          totalRequired += role.required;
          totalAssigned += role.assigned;
        });
      }
    });

    // Convert role coverage map to array and calculate percentages
    const roleCoverageMetrics = Array.from(roleCoverageMap.entries()).map(([role, metrics]) => ({
      role,
      coverage: metrics.required > 0 ? Math.round((metrics.assigned / metrics.required) * 100) : 100,
      required: metrics.required,
      assigned: metrics.assigned,
      gaps: metrics.gaps,
      overlaps: metrics.overlaps,
    }));

    // Calculate overall coverage considering gaps
    const overallCoverage = totalRequired > 0 ? Math.round((totalAssigned / totalRequired) * 100) : 100;

    // Get gaps for each day
    const gapPromises = [];
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      gapPromises.push(
        this.getCoverageGaps(
          currentDate.toISOString().split('T')[0],
          location,
        ),
      );
    }

    const gapResults = await Promise.all(gapPromises);
    const allGaps = gapResults.flat();

    // Transform gaps to optimization format
    const gaps = allGaps.map((gap: any) => ({
      role: gap._id?.role || 'unknown',
      date: gap.date || startDate,
      startTime: gap.startTime || '09:00',
      endTime: gap.endTime || '17:00',
      shortage: gap.gap || 0,
      availableEmployees: [],
    }));

    // Generate optimization suggestions based on gaps
    const optimizationSuggestions = [];
    
    // Add reassignment suggestion if there are overlaps
    if (roleCoverageMetrics.some(r => r.overlaps > 0)) {
      optimizationSuggestions.push({
        type: 'reassign',
        description: 'Redistribute employees across shifts to optimize coverage',
        impact: 0.8,
        cost: 0,
      });
    }

    // Add hiring suggestion if there are persistent gaps
    if (roleCoverageMetrics.some(r => r.gaps > 0)) {
      optimizationSuggestions.push({
        type: 'hire',
        description: `Hire additional staff for ${roleCoverageMetrics.filter(r => r.gaps > 0).map(r => r.role).join(', ')}`,
        impact: 0.9,
        cost: 5000,
      });
    }

    // Add training suggestion if there are role-specific shortages
    if (roleCoverageMetrics.some(r => r.coverage < 95)) {
      optimizationSuggestions.push({
        type: 'train',
        description: 'Cross-train employees for roles with coverage gaps',
        impact: 0.7,
        cost: 2000,
      });
    }

    return {
      period: `${startDate} to ${endDate}`,
      currentCoverage: overallCoverage,
      targetCoverage: 95,
      roleCoverageMetrics,
      gaps,
      optimizationSuggestions: optimizationSuggestions.length > 0 ? optimizationSuggestions : [
        {
          type: 'maintain',
          description: 'Current coverage is optimal',
          impact: 1.0,
          cost: 0,
        }
      ],
    };
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

  async getTeamPerformanceAnalytics(
    startDate: string,
    endDate: string,
    teamId: string,
    location?: string,
    department?: string,
  ): Promise<any> {
    const endDateObj = new Date(endDate);
    const startDateObj = new Date(startDate);
    const daysDiff = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    const dailyPromises = [];
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      dailyPromises.push(
        this.getDailyScheduleAnalytics(
          currentDate.toISOString().split('T')[0],
          location,
          teamId,
          department,
        ),
      );
    }
    
    const dailyResults = await Promise.all(dailyPromises);
    
    // Aggregate daily results into team performance format
    const totalShifts = dailyResults.reduce((sum, day) => sum + day.totalShifts, 0);
    const totalHours = dailyResults.reduce((sum, day) => sum + day.totalHours, 0);
    const totalConflicts = dailyResults.reduce((sum, day) => sum + day.conflicts.length, 0);
    
    // Get employee details for the team
    const teamEmployees = await this.employeeModel.find({
      team: { $regex: teamId, $options: 'i' },
      ...(location && { 'location.name': { $regex: location, $options: 'i' } }),
      ...(department && { department: { $regex: department, $options: 'i' } }),
    });
    
    // Calculate employee utilization from daily data
    const employeeUtilization = teamEmployees.map(employee => {
      const employeeShifts = dailyResults.reduce((total, day) => {
        const roleCoverage = day.roleCoverage.find(role => 
          role.role === employee.role || employee.skills?.some(skill => skill.name === role.role)
        );
        return total + (roleCoverage?.assigned || 0);
      }, 0);
      
      const employeeHours = dailyResults.reduce((total, day) => {
        const roleCoverage = day.roleCoverage.find(role => 
          role.role === employee.role || employee.skills?.some(skill => skill.name === role.role)
        );
        return total + (roleCoverage?.totalHours || 0);
      }, 0);
      
      return {
        employeeId: employee._id.toString(),
        firstName: employee.firstName,
        lastName: employee.lastName,
        totalHours: employeeHours,
        utilization: employeeShifts > 0 ? (employeeHours / (employeeShifts * 8)) : 0, // Assuming 8-hour shifts
        skillMatch: employee.skills?.length || 1, // Number of skills
      };
    });
    
    // Calculate performance metrics
    const averageUtilization = dailyResults.length > 0 ? 
      dailyResults.reduce((sum, day) => sum + day.averageUtilization, 0) / dailyResults.length : 0;
    
    const efficiency = averageUtilization;
    const reliability = 1 - (totalConflicts / Math.max(1, totalShifts));
    
    // Calculate flexibility based on role diversity
    const uniqueRoles = new Set();
    dailyResults.forEach(day => {
      day.roleCoverage.forEach(role => uniqueRoles.add(role.role));
    });
    const flexibility = uniqueRoles.size / Math.max(1, teamEmployees.length);
    
    return {
      teamId,
      period: `${startDate} to ${endDate}`,
      totalShifts,
      totalHours,
      averageCoverage: averageUtilization,
      conflictCount: totalConflicts,
      employeeUtilization,
      performanceMetrics: {
        efficiency,
        reliability,
        flexibility: Math.min(flexibility, 1), // Cap at 1.0
      },
    };
  }

  async getLocationUtilizationAnalytics(
    startDate: string,
    endDate: string,
    locationId: string,
    team?: string,
    department?: string,
  ): Promise<any> {
    const endDateObj = new Date(endDate);
    const startDateObj = new Date(startDate);
    const daysDiff = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    const dailyPromises = [];
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      dailyPromises.push(
        this.getDailyScheduleAnalytics(
          currentDate.toISOString().split('T')[0],
          locationId,
          team,
          department,
        ),
      );
    }
    
    const dailyResults = await Promise.all(dailyPromises);
    
    // Aggregate daily results into location utilization format
    const totalShifts = dailyResults.reduce((sum, day) => sum + day.totalShifts, 0);
    const totalHours = dailyResults.reduce((sum, day) => sum + day.totalHours, 0);
    
    // Calculate peak hours based on shift distribution
    const hourUtilization = new Array(24).fill(0);
    dailyResults.forEach(day => {
      // This would need actual shift time data to be accurate
      // For now, we'll use placeholder data
    });
    
    return {
      locationId,
      period: `${startDate} to ${endDate}`,
      totalShifts,
      totalHours,
      averageUtilization: dailyResults.length > 0 ? 
        dailyResults.reduce((sum, day) => sum + day.averageUtilization, 0) / dailyResults.length : 0,
      peakHours: [
        { hour: 9, utilization: 0.9 },
        { hour: 12, utilization: 0.7 },
        { hour: 17, utilization: 0.8 },
      ],
      spaceEfficiency: 0.85,
      costPerHour: 15,
      recommendations: [
        'Optimize shift scheduling during peak hours',
        'Consider flexible work arrangements',
        'Implement cross-training programs',
      ],
    };
  }

  async getDashboardStats(
    date: string,
    location?: string,
    team?: string,
    department?: string,
  ): Promise<any> {
    // Calculate date range for the last 7 days to get meaningful stats
    const targetDate = new Date(date);
    const startDate = new Date(targetDate);
    startDate.setDate(startDate.getDate() - 7);
    
    // Build match conditions for the date range
    const matchConditions: any = {
      date: {
        $gte: startDate,
        $lte: targetDate
      }
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

    // Get total shifts in the date range
    const totalShifts = await this.shiftModel.countDocuments(matchConditions);
    
    // Get active shifts (scheduled and in progress) for today
    const todayStart = new Date(targetDate);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(targetDate);
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayMatchConditions = {
      ...matchConditions,
      date: {
        $gte: todayStart,
        $lte: todayEnd
      }
    };
    
    const activeShifts = await this.shiftModel.countDocuments(todayMatchConditions);
    
    // Get upcoming shifts (future dates)
    const futureMatchConditions = {
      ...matchConditions,
      date: {
        $gt: targetDate
      }
    };
    
    const upcomingShifts = await this.shiftModel.countDocuments(futureMatchConditions);
    
    // Get total employees
    const employeeMatchConditions: any = {};
    if (location) {
      employeeMatchConditions.location = { $regex: location, $options: 'i' };
    }
    if (team) {
      employeeMatchConditions.team = { $regex: team, $options: 'i' };
    }
    if (department) {
      employeeMatchConditions.department = { $regex: department, $options: 'i' };
    }
    
    const totalEmployees = await this.employeeModel.countDocuments({
      ...employeeMatchConditions,
      status: 'active'
    });
    
    // Get pending time-off requests
    const timeOffMatchConditions: any = {
      status: 'pending'
    };
    
    if (location) {
      timeOffMatchConditions.location = { $regex: location, $options: 'i' };
    }
    if (team) {
      timeOffMatchConditions.team = { $regex: team, $options: 'i' };
    }
    if (department) {
      timeOffMatchConditions.department = { $regex: department, $options: 'i' };
    }
    
    const pendingTimeOff = await this.timeOffModel.countDocuments(timeOffMatchConditions);
    
    return {
      totalEmployees,
      activeShifts,
      upcomingShifts,
      pendingTimeOff,
      totalShifts, // Add total shifts for the period
    };
  }

  async getRecentActivities(
    date: string,
    location?: string,
    team?: string,
    department?: string,
  ): Promise<any> {
    // Get daily analytics to derive recent activities
    const dailyAnalytics = await this.getDailyScheduleAnalytics(date, location, team, department);
    
    const activities = [];
    
    // Add shift-related activities
    if (dailyAnalytics.totalShifts > 0) {
      activities.push({
        id: 1,
        type: 'shift',
        message: `${dailyAnalytics.totalShifts} shifts scheduled for ${date}`,
        time: new Date().toISOString(),
        severity: 'info'
      });
    }
    
    // Add conflict-related activities
    if (dailyAnalytics.conflicts.length > 0) {
      activities.push({
        id: 2,
        type: 'conflict',
        message: `${dailyAnalytics.conflicts.length} conflicts detected`,
        time: new Date().toISOString(),
        severity: 'warning'
      });
    }
    
    // Add coverage-related activities
    const understaffedRoles = dailyAnalytics.roleCoverage.filter(role => role.gaps > 0);
    if (understaffedRoles.length > 0) {
      activities.push({
        id: 3,
        type: 'coverage',
        message: `${understaffedRoles.length} roles have coverage gaps`,
        time: new Date().toISOString(),
        severity: 'warning'
      });
    }
    
    return activities;
  }

  async getUpcomingShifts(
    date: string,
    location?: string,
    team?: string,
    department?: string,
  ): Promise<any> {
    // Get daily analytics to derive upcoming shifts
    const dailyAnalytics = await this.getDailyScheduleAnalytics(date, location, team, department);
    
    // Convert role coverage data to shift format
    const shifts = dailyAnalytics.roleCoverage.map((role, index) => ({
      id: index + 1,
      title: `${role.role} Shift`,
      time: '09:00 - 17:00', // Default time, could be enhanced with actual shift times
      date: date,
      employees: role.assigned,
      required: role.required,
    }));
    
    return shifts;
  }

  async getAnalyticsSummary(
    startDate: string,
    endDate: string,
    location?: string,
    team?: string,
    department?: string,
  ): Promise<any> {
    const endDateObj = new Date(endDate);
    const startDateObj = new Date(startDate);
    const daysDiff = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    // Get daily analytics for the period
    const dailyPromises = [];
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      dailyPromises.push(
        this.getDailyScheduleAnalytics(
          currentDate.toISOString().split('T')[0],
          location,
          team,
          department,
        ),
      );
    }
    
    const dailyResults = await Promise.all(dailyPromises);
    
    // Calculate summary metrics
    const totalShifts = dailyResults.reduce((sum, day) => sum + day.totalShifts, 0);
    const totalHours = dailyResults.reduce((sum, day) => sum + day.totalHours, 0);
    const totalConflicts = dailyResults.reduce((sum, day) => sum + day.conflicts.length, 0);
    const totalEmployees = dailyResults.reduce((sum, day) => 
      sum + day.roleCoverage.reduce((roleSum, role) => roleSum + role.assigned, 0), 0
    );
    
    // Calculate trends
    const coverageTrend = dailyResults.map(day => ({ 
      date: day.date, 
      coverage: day.averageUtilization 
    }));
    
    const conflictTrend = dailyResults.map(day => ({ 
      date: day.date, 
      conflicts: day.conflicts.length 
    }));
    
    const utilizationTrend = dailyResults.map(day => ({ 
      date: day.date, 
      utilization: day.averageUtilization 
    }));
    
    return {
      period: `${startDate} to ${endDate}`,
      summary: {
        totalShifts,
        totalEmployees,
        totalHours,
        averageCoverage: dailyResults.length > 0 ? 
          dailyResults.reduce((sum, day) => sum + day.averageUtilization, 0) / dailyResults.length : 0,
        totalConflicts,
        criticalConflicts: dailyResults.reduce((sum, day) => 
          sum + day.conflicts.filter((c: any) => c.severity === 'critical').length, 0
        ),
      },
      trends: {
        coverageTrend,
        conflictTrend,
        utilizationTrend,
      },
      dailyBreakdown: dailyResults,
    };
  }

  async exportAnalytics(
    format: string,
    startDate: string,
    endDate: string,
    type: string,
    location?: string,
    team?: string,
    department?: string,
  ): Promise<any> {
    let data;
    
    switch (type) {
      case 'daily':
        data = await this.getDailyScheduleAnalytics(startDate, location, team, department);
        break;
      case 'weekly':
        data = await this.getWeeklyAnalytics(startDate, location, team, department);
        break;
      case 'monthly':
        const [year, month] = startDate.split('-').map(Number);
        data = await this.getMonthlyAnalytics(year, month, location, team, department);
        break;
      case 'team':
        data = await this.getTeamPerformanceAnalytics(startDate, endDate, team || '', location, department);
        break;
      case 'location':
        data = await this.getLocationUtilizationAnalytics(startDate, endDate, location || '', team, department);
        break;
      default:
        throw new Error(`Unsupported analytics type: ${type}`);
    }
    
    if (format === 'csv') {
      // Convert data to CSV format
      return this.convertToCSV(data, type);
    } else if (format === 'json') {
      return data;
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private convertToCSV(data: any, type: string): string {
    // Simple CSV conversion - could be enhanced with a proper CSV library
    if (type === 'daily') {
      const headers = ['Date', 'Location', 'Team', 'Department', 'Total Shifts', 'Total Hours', 'Average Utilization'];
      const rows = [
        [
          data.date,
          data.location,
          data.team,
          data.department,
          data.totalShifts,
          data.totalHours,
          data.averageUtilization,
        ]
      ];
      
      return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    }
    
    // Default CSV format for other types
    return JSON.stringify(data, null, 2);
  }
}
