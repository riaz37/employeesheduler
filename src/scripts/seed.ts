import { connect, disconnect } from 'mongoose';
import {
  Employee,
  EmployeeRole,
  EmployeeStatus,
} from '../employees/schemas/employee.schema';
import { Shift, ShiftStatus, ShiftType } from '../shifts/schemas/shift.schema';
import {
  TimeOff,
  TimeOffType,
  TimeOffStatus,
  TimeOffPriority,
} from '../time-off/schemas/time-off.schema';
import { Schedule, ScheduleStatus } from '../schedules/schemas/schedule.schema';
import { hash } from 'bcryptjs';

// Configuration
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/employee-scheduler';

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
  {
    name: 'North Branch',
    address: '321 North Rd, Residential',
    coordinates: [-73.935242, 40.75061],
  },
];

const TEAMS = [
  { name: 'Engineering', department: 'Technology' },
  { name: 'Sales', department: 'Business' },
  { name: 'Marketing', department: 'Business' },
  { name: 'Operations', department: 'Support' },
  { name: 'Customer Service', department: 'Support' },
  { name: 'Finance', department: 'Business' },
  { name: 'HR', department: 'Support' },
];

const SKILLS = [
  { name: 'JavaScript', level: 'advanced', category: 'Programming' },
  { name: 'Python', level: 'intermediate', category: 'Programming' },
  { name: 'React', level: 'advanced', category: 'Frontend' },
  { name: 'Node.js', level: 'advanced', category: 'Backend' },
  { name: 'MongoDB', level: 'intermediate', category: 'Database' },
  { name: 'Sales', level: 'advanced', category: 'Business' },
  { name: 'Customer Support', level: 'intermediate', category: 'Service' },
  { name: 'Project Management', level: 'advanced', category: 'Management' },
  { name: 'Data Analysis', level: 'intermediate', category: 'Analytics' },
  { name: 'Communication', level: 'advanced', category: 'Soft Skills' },
];

const SHIFT_TEMPLATES = [
  {
    name: 'Morning Shift',
    startTime: '08:00',
    endTime: '16:00',
    type: ShiftType.REGULAR,
  },
  {
    name: 'Afternoon Shift',
    startTime: '16:00',
    endTime: '00:00',
    type: ShiftType.REGULAR,
  },
  {
    name: 'Night Shift',
    startTime: '00:00',
    endTime: '08:00',
    type: ShiftType.NIGHT,
  },
  {
    name: 'Weekend Shift',
    startTime: '10:00',
    endTime: '18:00',
    type: ShiftType.WEEKEND,
  },
  {
    name: 'Overtime Shift',
    startTime: '18:00',
    endTime: '22:00',
    type: ShiftType.OVERTIME,
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    const { connection } = await connect(MONGODB_URI);
    await Promise.all([
      connection.collection('employees').deleteMany({}),
      connection.collection('shifts').deleteMany({}),
      connection.collection('timeoffs').deleteMany({}),
      connection.collection('schedules').deleteMany({}),
    ]);
    console.log('🧹 Cleared existing data');

    // Create employees with mixed roles, skills, and availability
    const employees = await createEmployees();
    console.log(`👥 Created ${employees.length} employees`);

    // Create shifts with various types and requirements
    const shifts = await createShifts(employees);
    console.log(`⏰ Created ${shifts.length} shifts`);

    // Create time-off requests with varying statuses
    const timeOffRequests = await createTimeOffRequests(employees);
    console.log(`🏖️ Created ${timeOffRequests.length} time-off requests`);

    // Create daily schedules
    const schedules = await createSchedules(shifts, employees, timeOffRequests);
    console.log(`📅 Created ${schedules.length} daily schedules`);

    console.log('🎉 Database seeding completed successfully!');

    // Display summary
    await displaySummary(employees, shifts, timeOffRequests, schedules);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

async function createEmployees(): Promise<any[]> {
  const employees = [];
  const roles = Object.values(EmployeeRole);

  for (let i = 1; i <= 50; i++) {
    const role = roles[i % roles.length];
    const team = TEAMS[i % TEAMS.length];
    const location = LOCATIONS[i % LOCATIONS.length];
    const isPartTime = i % 5 === 0; // 20% part-time employees
    const isOvernight = i % 7 === 0; // 14% overnight workers

    // Generate skills based on role
    const employeeSkills = generateSkillsForRole(role);

    // Generate availability windows
    const availabilityWindows = generateAvailabilityWindows(
      role,
      isPartTime,
      isOvernight,
    );

    const employee = new Employee({
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
        preferredShifts: isOvernight ? ['night'] : ['morning', 'afternoon'],
        preferredLocations: [location.name],
        maxConsecutiveDays: 5,
      },
      hireDate: new Date(2020 + (i % 4), i % 12, (i % 28) + 1),
      totalHoursWorked: Math.floor(Math.random() * 2000) + 500,
      lastActiveDate: new Date(),
    });

    employees.push(await employee.save());
  }

  return employees;
}

function generateSkillsForRole(role: EmployeeRole): any[] {
  const roleSkills = {
    [EmployeeRole.MANAGER]: [
      'Project Management',
      'Communication',
      'Data Analysis',
    ],
    [EmployeeRole.SUPERVISOR]: [
      'Project Management',
      'Communication',
      'Data Analysis',
    ],
    [EmployeeRole.STAFF]: [
      'JavaScript',
      'Python',
      'React',
      'Node.js',
      'MongoDB',
    ],
    [EmployeeRole.SPECIALIST]: [
      'Data Analysis',
      'Communication',
      'Customer Support',
    ],
    [EmployeeRole.TRAINEE]: ['Communication', 'JavaScript', 'Python'],
  };

  const skills = roleSkills[role] || ['Communication'];
  return skills.map((skillName) => {
    const skill = SKILLS.find((s) => s.name === skillName);
    return {
      name: skillName,
      level: skill?.level || 'intermediate',
      category: skill?.category || 'General',
      certified: Math.random() > 0.5,
      validUntil: new Date(
        Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000,
      ),
    };
  });
}

function generateAvailabilityWindows(
  role: EmployeeRole,
  isPartTime: boolean,
  isOvernight: boolean,
): any[] {
  if (isPartTime) {
    return [
      {
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '13:00',
        timezone: 'America/New_York',
        isAvailable: true,
      },
      {
        dayOfWeek: 3, // Wednesday
        startTime: '14:00',
        endTime: '18:00',
        timezone: 'America/New_York',
        isAvailable: true,
      },
      {
        dayOfWeek: 5, // Friday
        startTime: '10:00',
        endTime: '14:00',
        timezone: 'America/New_York',
        isAvailable: true,
      },
    ];
  }

  if (isOvernight) {
    return [
      {
        dayOfWeek: 1, // Monday
        startTime: '22:00',
        endTime: '06:00',
        timezone: 'America/New_York',
        isAvailable: true,
      },
      {
        dayOfWeek: 2, // Tuesday
        startTime: '22:00',
        endTime: '06:00',
        timezone: 'America/New_York',
        isAvailable: true,
      },
      {
        dayOfWeek: 3, // Wednesday
        startTime: '22:00',
        endTime: '06:00',
        timezone: 'America/New_York',
        isAvailable: true,
      },
      {
        dayOfWeek: 4, // Thursday
        startTime: '22:00',
        endTime: '06:00',
        timezone: 'America/New_York',
        isAvailable: true,
      },
      {
        dayOfWeek: 5, // Friday
        startTime: '22:00',
        endTime: '06:00',
        timezone: 'America/New_York',
        isAvailable: true,
      },
    ];
  }

  // Regular full-time availability
  return [
    {
      dayOfWeek: 1, // Monday
      startTime: '08:00',
      endTime: '17:00',
      timezone: 'America/New_York',
      isAvailable: true,
    },
    {
      dayOfWeek: 2, // Tuesday
      startTime: '08:00',
      endTime: '17:00',
      timezone: 'America/New_York',
      isAvailable: true,
    },
    {
      dayOfWeek: 3, // Wednesday
      startTime: '08:00',
      endTime: '17:00',
      timezone: 'America/New_York',
      isAvailable: true,
    },
    {
      dayOfWeek: 4, // Thursday
      startTime: '08:00',
      endTime: '17:00',
      timezone: 'America/New_York',
      isAvailable: true,
    },
    {
      dayOfWeek: 5, // Friday
      startTime: '08:00',
      endTime: '17:00',
      timezone: 'America/New_York',
      isAvailable: true,
    },
  ];
}

async function createShifts(employees: any[]): Promise<any[]> {
  const shifts = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Start 30 days ago

  for (let day = 0; day < 30; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);

    // Skip weekends for regular shifts
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    for (const location of LOCATIONS) {
      for (const team of TEAMS) {
        // Create shifts based on team requirements
        const teamShifts = generateTeamShifts(
          currentDate,
          location,
          team,
          employees,
        );
        shifts.push(...teamShifts);
      }
    }
  }

  // Save all shifts
  const savedShifts = [];
  for (const shift of shifts) {
    savedShifts.push(await shift.save());
  }

  return savedShifts;
}

function generateTeamShifts(
  date: Date,
  location: any,
  team: any,
  employees: any[],
): any[] {
  const shifts = [];
  const teamEmployees = employees.filter((emp) => emp.team === team.name);

  if (teamEmployees.length === 0) return shifts;

  // Determine shift requirements based on team
  const requirements = determineTeamRequirements(
    team.name,
    teamEmployees.length,
  );

  for (const requirement of requirements) {
    const template = SHIFT_TEMPLATES.find((t) =>
      t.name.includes(requirement.shiftType),
    );
    if (!template) continue;

    // Find available employees for this role
    const availableEmployees = teamEmployees.filter(
      (emp) => emp.role === requirement.role && emp.status === 'active',
    );

    // Assign employees (some shifts might be understaffed for realism)
    const assignedEmployees = availableEmployees.slice(
      0,
      Math.min(requirement.quantity, availableEmployees.length),
    );

    const shift = new Shift({
      shiftId: `SHIFT${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `${team.name} ${template.name}`,
      description: `${team.name} team ${template.name.toLowerCase()} for ${date.toDateString()}`,
      date: new Date(date),
      startTime: template.startTime,
      endTime: template.endTime,
      type: template.type,
      status: ShiftStatus.SCHEDULED,
      location: {
        name: location.name,
        address: location.address,
        coordinates: {
          latitude: location.coordinates[1],
          longitude: location.coordinates[0],
        },
        timezone: 'America/New_York',
      },
      team: team.name,
      department: team.department,
      requirements: [requirement],
      assignedEmployees: assignedEmployees.map((emp) => emp._id),
      totalHours: 8,
      breakMinutes: 30,
      priority: Math.floor(Math.random() * 5) + 1,
      tags: [team.name.toLowerCase(), template.type.toLowerCase()],
      notes: `Auto-generated shift for ${team.name}`,
      scheduledAt: new Date(),
      scheduledBy: employees[0]._id, // First employee as scheduler
    });

    shifts.push(shift);
  }

  return shifts;
}

function determineTeamRequirements(
  teamName: string,
  employeeCount: number,
): any[] {
  const baseRequirements = {
    Engineering: [
      { role: 'staff', quantity: Math.max(2, Math.floor(employeeCount * 0.6)) },
      {
        role: 'specialist',
        quantity: Math.max(1, Math.floor(employeeCount * 0.3)),
      },
      {
        role: 'supervisor',
        quantity: Math.max(1, Math.floor(employeeCount * 0.1)),
      },
    ],
    Sales: [
      { role: 'staff', quantity: Math.max(2, Math.floor(employeeCount * 0.7)) },
      {
        role: 'manager',
        quantity: Math.max(1, Math.floor(employeeCount * 0.3)),
      },
    ],
    'Customer Service': [
      { role: 'staff', quantity: Math.max(3, Math.floor(employeeCount * 0.8)) },
      {
        role: 'supervisor',
        quantity: Math.max(1, Math.floor(employeeCount * 0.2)),
      },
    ],
    Operations: [
      {
        role: 'manager',
        quantity: Math.max(1, Math.floor(employeeCount * 0.4)),
      },
      {
        role: 'specialist',
        quantity: Math.max(1, Math.floor(employeeCount * 0.3)),
      },
      { role: 'staff', quantity: Math.max(1, Math.floor(employeeCount * 0.3)) },
    ],
  };

  return (
    baseRequirements[teamName] || [
      { role: 'staff', quantity: Math.max(2, Math.floor(employeeCount * 0.5)) },
    ]
  );
}

async function createTimeOffRequests(employees: any[]): Promise<any[]> {
  const timeOffRequests = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (let i = 0; i < 25; i++) {
    const employee = employees[i % employees.length];
    const requestDate = new Date(startDate);
    requestDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));

    const duration = Math.floor(Math.random() * 5) + 1; // 1-5 days
    const endDate = new Date(requestDate);
    endDate.setDate(requestDate.getDate() + duration);

    const timeOffType =
      Object.values(TimeOffType)[
        Math.floor(Math.random() * Object.values(TimeOffType).length)
      ];
    const priority =
      Object.values(TimeOffPriority)[
        Math.floor(Math.random() * Object.values(TimeOffPriority).length)
      ];

    // 70% approved, 20% pending, 10% rejected
    const statusRoll = Math.random();
    let status: TimeOffStatus;
    if (statusRoll < 0.7) status = TimeOffStatus.APPROVED;
    else if (statusRoll < 0.9) status = TimeOffStatus.PENDING;
    else status = TimeOffStatus.REJECTED;

    const timeOffRequest = new TimeOff({
      requestId: `TO${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      employeeId: employee._id,
      type: timeOffType,
      startDate: requestDate,
      endDate: endDate,
      totalHours: duration * 8,
      reason: `Time off request for ${timeOffType.toLowerCase()}`,
      priority,
      status,
      approvalWorkflow: {
        submittedAt: new Date(requestDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before
        submittedBy: employee._id,
        approvedAt:
          status === TimeOffStatus.APPROVED
            ? new Date(requestDate.getTime() - 3 * 24 * 60 * 60 * 1000)
            : undefined,
        approvedBy:
          status === TimeOffStatus.APPROVED ? employees[0]._id : undefined,
        rejectedAt:
          status === TimeOffStatus.REJECTED
            ? new Date(requestDate.getTime() - 2 * 24 * 60 * 60 * 1000)
            : undefined,
        rejectedBy:
          status === TimeOffStatus.REJECTED ? employees[0]._id : undefined,
        rejectionReason:
          status === TimeOffStatus.REJECTED
            ? 'Insufficient coverage'
            : undefined,
      },
      tags: [timeOffType.toLowerCase(), priority.toLowerCase()],
      notes: `Auto-generated time-off request`,
    });

    timeOffRequests.push(await timeOffRequest.save());
  }

  return timeOffRequests;
}

async function createSchedules(
  shifts: any[],
  employees: any[],
  timeOffRequests: any[],
): Promise<any[]> {
  const schedules = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (let day = 0; day < 30; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);

    // Get shifts for this date
    const dayShifts = shifts.filter(
      (shift) => shift.date.toDateString() === currentDate.toDateString(),
    );

    // Get time-off requests for this date
    const dayTimeOff = timeOffRequests.filter(
      (to) =>
        to.startDate <= currentDate &&
        to.endDate >= currentDate &&
        to.status === 'approved',
    );

    // Get employees working on this date
    const dayEmployees = employees.filter((emp) =>
      dayShifts.some((shift) => shift.assignedEmployees.includes(emp._id)),
    );

    // Calculate coverage metrics
    const coverage = calculateCoverage(dayShifts, dayEmployees);
    const conflicts = detectConflicts(dayShifts, dayTimeOff);
    const metrics = calculateMetrics(
      dayShifts,
      dayEmployees,
      coverage,
      conflicts,
    );

    for (const location of LOCATIONS) {
      for (const team of TEAMS) {
        const teamShifts = dayShifts.filter(
          (shift) =>
            shift.location.name === location.name && shift.team === team.name,
        );

        if (teamShifts.length > 0) {
          const schedule = new Schedule({
            scheduleId: `SCHEDULE${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            date: new Date(currentDate),
            location: location.name,
            team: team.name,
            department: team.department,
            status: ScheduleStatus.DRAFT,
            shifts: teamShifts.map((s) => s._id),
            employees: dayEmployees.map((e) => e._id),
            timeOffRequests: dayTimeOff.map((t) => t._id),
            coverage,
            conflicts,
            metrics,
            tags: [team.name.toLowerCase(), location.name.toLowerCase()],
            notes: `Auto-generated schedule for ${team.name} at ${location.name}`,
            version: '1.0',
            lastModifiedAt: new Date(),
          });

          schedules.push(await schedule.save());
        }
      }
    }
  }

  return schedules;
}

function calculateCoverage(shifts: any[], employees: any[]): any[] {
  const coverage = [];

  // Group employees by role
  const employeesByRole = employees.reduce((acc, emp) => {
    if (!acc[emp.role]) acc[emp.role] = [];
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

function detectConflicts(shifts: any[], timeOffRequests: any[]): any[] {
  const conflicts = [];

  // Check for double-booked employees
  const employeeShifts: { [key: string]: any[] } = {};
  for (const shift of shifts) {
    for (const employeeId of shift.assignedEmployees) {
      if (!employeeShifts[employeeId.toString()])
        employeeShifts[employeeId.toString()] = [];
      employeeShifts[employeeId.toString()].push(shift);
    }
  }

  // Detect overlapping shifts for same employee
  for (const [employeeId, employeeShiftsList] of Object.entries(
    employeeShifts,
  )) {
    if (employeeShiftsList.length > 1) {
      for (let i = 0; i < employeeShiftsList.length; i++) {
        for (let j = i + 1; j < employeeShiftsList.length; j++) {
          const shift1 = employeeShiftsList[i];
          const shift2 = employeeShiftsList[j];

          if (shift1.date.toDateString() === shift2.date.toDateString()) {
            conflicts.push({
              type: 'double_booking',
              severity: 'high',
              description: `Employee ${employeeId} is assigned to overlapping shifts`,
              affectedShifts: [shift1._id, shift2._id],
              affectedEmployees: [employeeId],
              resolution: 'Reassign one of the shifts',
            });
          }
        }
      }
    }
  }

  // Check for time-off conflicts
  for (const timeOff of timeOffRequests) {
    for (const shift of shifts) {
      if (shift.date >= timeOff.startDate && shift.date <= timeOff.endDate) {
        if (shift.assignedEmployees.includes(timeOff.employeeId)) {
          conflicts.push({
            type: 'time_off_conflict',
            severity: 'medium',
            description: `Employee ${timeOff.employeeId} is assigned to shift during approved time-off`,
            affectedShifts: [shift._id],
            affectedEmployees: [timeOff.employeeId],
            resolution: 'Reassign shift to available employee',
          });
        }
      }
    }
  }

  return conflicts;
}

function calculateMetrics(
  shifts: any[],
  employees: any[],
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

async function displaySummary(
  employees: any[],
  shifts: any[],
  timeOffRequests: any[],
  schedules: any[],
) {
  console.log('\n📊 SEEDING SUMMARY:');
  console.log('==================');
  console.log(`👥 Employees: ${employees.length}`);
  console.log(
    `   - Managers: ${employees.filter((e) => e.role === 'manager').length}`,
  );
  console.log(
    `   - Supervisors: ${employees.filter((e) => e.role === 'supervisor').length}`,
  );
  console.log(
    `   - Staff: ${employees.filter((e) => e.role === 'staff').length}`,
  );
  console.log(
    `   - Specialists: ${employees.filter((e) => e.role === 'specialist').length}`,
  );
  console.log(
    `   - Trainees: ${employees.filter((e) => e.role === 'trainee').length}`,
  );
  console.log(
    `   - Part-time: ${employees.filter((e) => e.workPreference.maxHoursPerWeek === 20).length}`,
  );
  console.log(
    `   - Overnight workers: ${employees.filter((e) => e.workPreference.preferredShifts.includes('night')).length}`,
  );

  console.log(`⏰ Shifts: ${shifts.length}`);
  console.log(
    `   - Regular: ${shifts.filter((s) => s.type === 'regular').length}`,
  );
  console.log(`   - Night: ${shifts.filter((s) => s.type === 'night').length}`);
  console.log(
    `   - Weekend: ${shifts.filter((s) => s.type === 'weekend').length}`,
  );
  console.log(
    `   - Overtime: ${shifts.filter((s) => s.type === 'overtime').length}`,
  );

  console.log(`🏖️ Time-off Requests: ${timeOffRequests.length}`);
  console.log(
    `   - Approved: ${timeOffRequests.filter((t) => t.status === 'approved').length}`,
  );
  console.log(
    `   - Pending: ${timeOffRequests.filter((t) => t.status === 'pending').length}`,
  );
  console.log(
    `   - Rejected: ${timeOffRequests.filter((t) => t.status === 'rejected').length}`,
  );

  console.log(`📅 Schedules: ${schedules.length}`);
  console.log(
    `   - Draft: ${schedules.filter((s) => s.status === 'draft').length}`,
  );
  console.log(
    `   - Published: ${schedules.filter((s) => s.status === 'published').length}`,
  );

  console.log('\n🔑 Default Login Credentials:');
  console.log('Email: employee1@company.com');
  console.log('Password: password123');
  console.log('\n🌍 Test Data Includes:');
  console.log('✅ Mixed roles and skills across teams');
  console.log('✅ Multiple locations with coordinates');
  console.log('✅ Varying availability patterns');
  console.log('✅ Part-time and overnight workers');
  console.log('✅ Time-off requests with approval workflow');
  console.log('✅ Schedule conflicts and coverage gaps');
  console.log('✅ Realistic shift patterns and requirements');
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
