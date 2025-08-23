import { connect, disconnect, model } from 'mongoose';
import { config } from 'dotenv';
import {
  EmployeeRole,
  EmployeeStatus,
  EmployeeSchema,
} from '../employees/schemas/employee.schema';
import { 
  ShiftStatus, 
  ShiftType, 
  ShiftSchema 
} from '../shifts/schemas/shift.schema';
import {
  TimeOffType,
  TimeOffStatus,
  TimeOffPriority,
  TimeOffSchema,
} from '../time-off/schemas/time-off.schema';
import { 
  ScheduleStatus, 
  ScheduleSchema 
} from '../schedules/schemas/schedule.schema';
import { hash } from 'bcryptjs';

// Load environment variables
config();

// Configuration
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/employee-scheduler';

// Create Mongoose models from schemas
const EmployeeModel = model('Employee', EmployeeSchema);
const ShiftModel = model('Shift', ShiftSchema);
const TimeOffModel = model('TimeOff', TimeOffSchema);
const ScheduleModel = model('Schedule', ScheduleSchema);

// Sample data
const LOCATIONS = [
  {
    name: 'Downtown Office',
    address: '123 Main St, Downtown',
    coordinates: [-73.935242, 40.73061],
  },
  {
    name: 'West Campus',
    address: '456 West Ave, Suburbs',
    coordinates: [-73.945242, 40.72061],
  },
  {
    name: 'East Warehouse',
    address: '789 East Blvd, Industrial',
    coordinates: [-73.925242, 40.74061],
  },
];

const TEAMS = [
  { name: 'Engineering', department: 'Technology' },
  { name: 'Sales', department: 'Business' },
  { name: 'Operations', department: 'Support' },
  { name: 'Customer Service', department: 'Support' },
];

const SKILLS = [
  { name: 'JavaScript', level: 'advanced' },
  { name: 'Python', level: 'intermediate' },
  { name: 'React', level: 'advanced' },
  { name: 'Node.js', level: 'advanced' },
  { name: 'MongoDB', level: 'intermediate' },
  { name: 'Project Management', level: 'advanced' },
  { name: 'Communication', level: 'advanced' },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      EmployeeModel.deleteMany({}),
      ShiftModel.deleteMany({}),
      TimeOffModel.deleteMany({}),
      ScheduleModel.deleteMany({}),
    ]);
    console.log('🧹 Cleared existing data');

    // Create employees
    const employees = await createEmployees();
    console.log(`👥 Created ${employees.length} employees`);

    // Create shifts
    const shifts = await createShifts(employees);
    console.log(`⏰ Created ${shifts.length} shifts`);

    // Create time-off requests
    const timeOffRequests = await createTimeOffRequests(employees);
    console.log(`🏖️ Created ${timeOffRequests.length} time-off requests`);

    // Create schedules
    const schedules = await createSchedules(shifts, employees, timeOffRequests);
    console.log(`📅 Created ${schedules.length} schedules`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n🔑 Default Login Credentials:');
    console.log('Email: employee1@company.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

async function createEmployees() {
  const employees = [];
  const roles = Object.values(EmployeeRole);

  for (let i = 1; i <= 20; i++) {
    const role = roles[i % roles.length];
    const team = TEAMS[i % TEAMS.length];
    const location = LOCATIONS[i % LOCATIONS.length];
    const isPartTime = i % 5 === 0;

    // Generate skills for the employee
    const employeeSkills = SKILLS.slice(0, 2 + (i % 3)).map(skill => ({
      name: skill.name,
      level: skill.level,
      certified: Math.random() > 0.5,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    }));

    // Generate availability windows
    const availabilityWindows = [
      {
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC',
        isAvailable: true,
      },
      {
        dayOfWeek: 2, // Tuesday
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC',
        isAvailable: true,
      },
      {
        dayOfWeek: 3, // Wednesday
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC',
        isAvailable: true,
      },
      {
        dayOfWeek: 4, // Thursday
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC',
        isAvailable: true,
      },
      {
        dayOfWeek: 5, // Friday
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC',
        isAvailable: true,
      },
    ];

    const employee = new EmployeeModel({
      employeeId: `EMP${String(i).padStart(3, '0')}`,
      firstName: `Employee${i}`,
      lastName: `LastName${i}`,
      email: `employee${i}@company.com`,
      password: await hash('password123', 10),
      phone: `+1-555-${String(i).padStart(3, '0')}-${String(i).padStart(4, '0')}`,
      role,
      status: EmployeeStatus.ACTIVE,
      department: team.department,
      team: team.name,
      location: location.name,
      skills: employeeSkills,
      availabilityWindows,
      workPreference: {
        maxHoursPerWeek: isPartTime ? 20 : 40,
        preferredShifts: ['morning', 'afternoon'],
        preferredLocations: [location.name],
        maxConsecutiveDays: 5,
      },
      hireDate: new Date(2020 + (i % 4), i % 12, (i % 28) + 1),
      isPartTime,
      totalHoursWorked: Math.floor(Math.random() * 2000) + 500,
      lastActiveDate: new Date(),
    });

    const savedEmployee = await employee.save();
    employees.push(savedEmployee);
  }

  return employees;
}

async function createShifts(employees) {
  const shifts = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7); // Start 7 days ago

  for (let day = 0; day < 14; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);

    // Skip weekends
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    for (const location of LOCATIONS) {
      for (const team of TEAMS) {
        // Find employees for this team and location
        const teamEmployees = employees.filter(
          emp => emp.team === team.name && emp.location === location.name
        );

        if (teamEmployees.length === 0) continue;

        // Create morning shift
        const morningShift = new ShiftModel({
          shiftId: `SHIFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: new Date(currentDate),
          startTime: '09:00',
          endTime: '17:00',
          type: ShiftType.REGULAR,
          status: ShiftStatus.SCHEDULED,
          title: `${team.name} Morning Shift`,
          description: `Regular morning shift for ${team.name} team`,
          location: {
            name: location.name,
            address: location.address,
            coordinates: location.coordinates,
          },
          department: team.department,
          team: team.name,
          requirements: [
            {
              role: 'staff',
              quantity: Math.min(2, teamEmployees.length),
              skills: ['Communication'],
              description: 'General staff requirements',
              isCritical: false,
            },
          ],
          assignedEmployees: teamEmployees.slice(0, 2).map(emp => emp._id),
          backupEmployees: [],
          totalHours: 8,
          breakMinutes: 60,
          isRecurring: false,
          priority: 1,
          tags: [team.name.toLowerCase(), 'morning'],
          notes: 'Auto-generated shift',
          scheduledAt: new Date(),
          scheduledBy: employees[0]._id,
        });

        const savedShift = await morningShift.save();
        shifts.push(savedShift);
      }
    }
  }

  return shifts;
}

async function createTimeOffRequests(employees) {
  const timeOffRequests = [];
  const types = Object.values(TimeOffType);
  const priorities = Object.values(TimeOffPriority);
  const statuses = Object.values(TimeOffStatus);

  for (let i = 0; i < 10; i++) {
    const employee = employees[i % employees.length];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30)); // Future dates

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 3) + 1); // 1-3 days

    const type = types[Math.floor(Math.random() * types.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const timeOffRequest = new TimeOffModel({
      requestId: `TO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      employeeId: employee._id,
      type,
      status,
      priority,
      startDate,
      endDate,
      startTime: '09:00',
      endTime: '17:00',
      totalHours: 8,
      totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      reason: `${type} request`,
      description: `Auto-generated ${type} request`,
      attachments: [],
      approvals: [],
      modifications: [],
      isHalfDay: false,
      isEmergency: type === TimeOffType.SICK_LEAVE,
      requiresCoverage: true,
      coverageEmployees: [],
      affectedShifts: [],
      notes: 'Auto-generated time-off request',
      submittedAt: new Date(),
    });

    const savedTimeOff = await timeOffRequest.save();
    timeOffRequests.push(savedTimeOff);
  }

  return timeOffRequests;
}

async function createSchedules(shifts, employees, timeOffRequests) {
  const schedules = [];
  const dates = [...new Set(shifts.map(shift => {
    const shiftDate = shift.date instanceof Date ? shift.date : new Date(shift.date);
    return shiftDate.toDateString();
  }))];

  for (const dateStr of dates) {
    const date = new Date(dateStr as string);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateStr}, skipping...`);
      continue;
    }
    const dayShifts = shifts.filter(shift => {
      const shiftDate = shift.date instanceof Date ? shift.date : new Date(shift.date);
      return shiftDate.toDateString() === dateStr;
    });

    for (const location of LOCATIONS) {
      for (const team of TEAMS) {
        const teamShifts = dayShifts.filter(
          shift => shift.location.name === location.name && shift.team === team.name
        );

        if (teamShifts.length === 0) continue;

        const teamEmployees = employees.filter(
          emp => emp.team === team.name && emp.location === location.name
        );

        const schedule = new ScheduleModel({
          scheduleId: `SCHEDULE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date,
          location: location.name,
          team: team.name,
          department: team.department,
          status: ScheduleStatus.DRAFT,
          shifts: teamShifts.map(shift => shift._id),
          employees: teamEmployees.map(emp => emp._id),
          timeOffRequests: timeOffRequests
            .filter(to => to.startDate <= date && to.endDate >= date)
            .map(to => to._id),
          coverage: [
            {
              role: 'staff',
              required: 2,
              assigned: teamShifts.reduce((sum, shift) => sum + shift.assignedEmployees.length, 0),
              coverage: 100,
              assignedEmployees: teamEmployees.slice(0, 2).map(emp => emp._id.toString()),
              backupEmployees: [],
            },
          ],
          conflicts: [],
          metrics: {
            totalShifts: teamShifts.length,
            totalHours: teamShifts.reduce((sum, shift) => sum + shift.totalHours, 0),
            totalEmployees: teamEmployees.length,
            coveragePercentage: 100,
            conflictCount: 0,
            criticalConflictCount: 0,
            overtimeHours: 0,
            understaffedShifts: 0,
          },
          tags: [team.name.toLowerCase(), location.name.toLowerCase()],
          notes: 'Auto-generated schedule',
          version: '1.0',
          isTemplate: false,
          lastModifiedAt: new Date(),
        });

        const savedSchedule = await schedule.save();
        schedules.push(savedSchedule);
      }
    }
  }

  return schedules;
}

// Run the seeding
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
