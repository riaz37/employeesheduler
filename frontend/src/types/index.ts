// Employee types
export enum EmployeeRole {
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  STAFF = 'staff',
  SPECIALIST = 'specialist',
  TRAINEE = 'trainee',
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  certified: boolean;
  validUntil?: string;
}

export interface AvailabilityWindow {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isAvailable: boolean;
}

export interface WorkPreference {
  maxHoursPerWeek: number;
  preferredShifts: string[];
  preferredLocations: string[];
  maxConsecutiveDays: number;
}

export interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  department: string;
  location: string;
  team: string;
  skills: Skill[];
  availabilityWindows: AvailabilityWindow[];
  workPreference: WorkPreference;
  hireDate: string;
  terminationDate?: string;
  emergencyContact?: string;
  notes?: string;
  isPartTime: boolean;
  totalHoursWorked: number;
  lastActiveDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Shift types
export enum ShiftStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum ShiftType {
  REGULAR = 'regular',
  OVERTIME = 'overtime',
  NIGHT = 'night',
  WEEKEND = 'weekend',
  HOLIDAY = 'holiday',
  EMERGENCY = 'emergency',
}

export interface ShiftRequirement {
  role: string;
  quantity: number;
  skills: string[];
  description?: string;
  isCritical: boolean;
}

export interface ShiftLocation {
  name: string;
  address: string;
  coordinates: number[];
  building?: string;
  floor?: string;
  room?: string;
}

export interface Shift {
  _id: string;
  shiftId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: ShiftType;
  status: ShiftStatus;
  title: string;
  description?: string;
  location: ShiftLocation;
  department: string;
  team: string;
  requirements: ShiftRequirement[];
  assignedEmployees: string[];
  backupEmployees: string[];
  totalHours: number;
  breakMinutes: number;
  isRecurring: boolean;
  recurringPattern?: string;
  recurringEndDate?: string;
  parentShiftId?: string;
  childShiftIds: string[];
  priority: number;
  tags: string[];
  notes?: string;
  scheduledAt?: string;
  scheduledBy?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  lastModifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Time-off types
export enum TimeOffType {
  VACATION = 'vacation',
  SICK_LEAVE = 'sick_leave',
  PERSONAL_LEAVE = 'personal_leave',
  MATERNITY_LEAVE = 'maternity_leave',
  PATERNITY_LEAVE = 'paternity_leave',
  BEREAVEMENT_LEAVE = 'bereavement_leave',
  UNPAID_LEAVE = 'unpaid_leave',
  OTHER = 'other',
  COMPENSATORY_TIME = 'compensatory_time',
}

export enum TimeOffStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  IN_PROGRESS = 'in_progress',
  MODIFIED = 'modified',
}

export enum TimeOffPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface TimeOffApproval {
  approverId: string;
  approverName: string;
  approverRole: string;
  status: string;
  level: number;
  comments?: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface TimeOffModification {
  modifiedBy: string;
  modifiedByName: string;
  modifiedAt: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason?: string;
}

export interface TimeOff {
  _id: string;
  requestId: string;
  employeeId: string | Pick<Employee, 'firstName' | 'lastName' | 'email'>;
  type: TimeOffType;
  status: TimeOffStatus;
  priority: TimeOffPriority;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  totalDays: number;
  reason: string;
  description?: string;
  attachments?: string[];
  approvals: TimeOffApproval[];
  modifications: TimeOffModification[];
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  isHalfDay: boolean;
  isEmergency: boolean;
  requiresCoverage: boolean;
  coverageEmployees?: string[];
  affectedShifts?: string[];
  notes?: string;
  submittedAt?: string;
  approvedAt?: string;
  lastModifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Schedule types
export enum ScheduleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  LOCKED = 'locked',
  ARCHIVED = 'archived',
}

export interface ScheduleCoverage {
  role: string;
  required: number;
  assigned: number;
  coverage: number;
  assignedEmployees: string[];
  backupEmployees: string[];
}

export interface ScheduleConflict {
  type: string;
  severity: string;
  description: string;
  affectedShifts: string[];
  affectedEmployees: string[];
  resolution?: string;
  isResolved: boolean;
}

export interface ScheduleMetrics {
  totalShifts: number;
  totalHours: number;
  totalEmployees: number;
  coveragePercentage: number;
  conflictCount: number;
  criticalConflictCount: number;
  overtimeHours?: number;
  understaffedShifts?: number;
}

export interface Schedule {
  _id: string;
  scheduleId: string;
  date: string;
  location: string;
  team: string;
  department: string;
  status: ScheduleStatus;
  shifts: string[];
  employees: string[];
  timeOffRequests: string[];
  coverage: ScheduleCoverage[];
  conflicts: ScheduleConflict[];
  metrics: ScheduleMetrics;
  tags: string[];
  notes?: string;
  publishedAt?: string;
  publishedBy?: string;
  lockedAt?: string;
  lockedBy?: string;
  archivedAt?: string;
  archivedBy?: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
  version: string;
  isTemplate: boolean;
  templateName?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  employee: Employee;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Coverage types
export interface RoleCoverageMetric {
  role: string;
  coverage: number;
  required: number;
  assigned: number;
  gaps: number;
  overlaps: number;
}

export interface CoverageOptimization {
  period: string;
  currentCoverage: number;
  targetCoverage: number;
  roleCoverageMetrics: RoleCoverageMetric[];
  gaps: {
    role: string;
    date: string;
    startTime: string;
    endTime: string;
    shortage: number;
    availableEmployees: string[];
  }[];
  optimizationSuggestions: {
    type: 'reassign' | 'hire' | 'train' | 'maintain';
    description: string;
    impact: number;
    cost: number;
  }[];
}

// API Response types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
} 