<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# 🚀 Employee Daily Scheduler

A production-ready backend service for managing employee schedules, shifts, and coverage analysis built with NestJS, MongoDB, and JWT authentication.

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based authentication** with refresh tokens
- **Role-based access control** for different employee levels
- **Secure password hashing** with bcrypt
- **Rate limiting** and security headers (Helmet, CORS)
- **Input validation** with class-validator

### 👥 Employee Management
- **Comprehensive employee profiles** with roles, skills, and availability
- **Flexible availability windows** (full-time, part-time, overnight)
- **Skill tracking** with certification and experience levels
- **Work preferences** and scheduling constraints
- **Department and team organization**

### ⏰ Shift Management
- **Multiple shift types**: Regular, Overtime, Holiday, Weekend, Night, Split
- **Role-based requirements** with skill matching
- **Employee assignment** with conflict detection
- **Location-based scheduling** with coordinates
- **Recurring shift patterns** support

### 🏖️ Time-off Management
- **Request workflow** with approval system
- **Conflict detection** against scheduled shifts
- **Priority levels** and approval routing
- **Modification tracking** and audit trail
- **Integration with schedule generation**

### 📅 Schedule Management
- **Daily schedule generation** with coverage analysis
- **Conflict detection** (double-bookings, time-off clashes)
- **Coverage gap analysis** by role and skill
- **Schedule states**: Draft, Published, Locked, Archived
- **Team and location-based organization**

### 📊 Analytics & Reporting
- **Coverage metrics** by role, team, and location
- **Conflict analysis** with severity levels
- **Employee workload** and utilization tracking
- **Schedule optimization** recommendations
- **Real-time dashboard** data

## 🏗️ Architecture

### Technology Stack
- **Framework**: NestJS (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Passport.js
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest + Supertest

### Design Principles
- **SOLID principles** implementation
- **Clean Architecture** with separation of concerns
- **Domain-Driven Design** for business logic
- **RESTful API** design patterns
- **Comprehensive error handling**
- **Type safety** with TypeScript

### Database Design
- **Optimized schemas** with proper indexing
- **Aggregation pipelines** for complex queries
- **Data relationships** with references
- **Audit trails** for all operations
- **Performance optimization** strategies

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (running on localhost:27017)
- **pnpm** package manager

### 1. Clone & Install
```bash
git clone <repository-url>
cd employeesheduler
pnpm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start MongoDB
```bash
# Docker (recommended)
docker run -d -p 27017:27017 mongo:latest

# Or local installation
sudo systemctl start mongod
```

### 4. Run the System
```bash
# Use the startup script (recommended)
./start.sh

# Or manually
pnpm run build
pnpm run seed
pnpm run start:dev
```

### 5. Access the System
- **API Base**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/health

## 🔑 Default Credentials

After seeding, use these credentials to test:
- **Email**: employee1@company.com
- **Password**: password123

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/auth/login           # Employee login
POST   /api/auth/refresh         # Refresh access token
POST   /api/auth/change-password # Change password
POST   /api/auth/logout          # Logout
```

### Employee Management
```
GET    /api/employees            # List employees with pagination
POST   /api/employees            # Create new employee
GET    /api/employees/:id        # Get employee by ID
PUT    /api/employees/:id        # Update employee
DELETE /api/employees/:id        # Delete employee
GET    /api/employees/stats      # Employee statistics
GET    /api/employees/by-role    # Filter by role
GET    /api/employees/by-skill   # Filter by skill
GET    /api/employees/available  # Find available employees
```

### Shift Management
```
GET    /api/shifts               # List shifts with pagination
POST   /api/shifts               # Create new shift
GET    /api/shifts/:id           # Get shift by ID
PUT    /api/shifts/:id           # Update shift
DELETE /api/shifts/:id           # Delete shift
POST   /api/shifts/:id/assign    # Assign employees to shift
POST   /api/shifts/:id/start     # Start shift
POST   /api/shifts/:id/complete  # Complete shift
GET    /api/shifts/conflicts     # Check for conflicts
```

### Time-off Management
```
GET    /api/time-off             # List time-off requests
POST   /api/time-off             # Submit time-off request
GET    /api/time-off/:id         # Get request by ID
PUT    /api/time-off/:id         # Update request
DELETE /api/time-off/:id         # Delete request
POST   /api/time-off/:id/approve # Approve request
POST   /api/time-off/:id/reject  # Reject request
POST   /api/time-off/:id/cancel  # Cancel request
GET    /api/time-off/conflicts   # Check for conflicts
```

### Schedule Management
```
GET    /api/schedules            # List schedules with pagination
POST   /api/schedules            # Create new schedule
POST   /api/schedules/generate   # Auto-generate schedule
GET    /api/schedules/:id        # Get schedule by ID
PUT    /api/schedules/:id        # Update schedule
DELETE /api/schedules/:id        # Delete schedule
POST   /api/schedules/:id/publish # Publish schedule
POST   /api/schedules/:id/lock   # Lock schedule
POST   /api/schedules/:id/archive # Archive schedule
GET    /api/schedules/by-date    # Get schedules by date
```

### Analytics & Reporting
```
GET    /api/analytics/daily      # Daily schedule analytics
GET    /api/analytics/coverage   # Coverage analysis
GET    /api/analytics/conflicts  # Conflict analysis
GET    /api/analytics/workload   # Employee workload
GET    /api/analytics/utilization # Resource utilization
```

## 🗄️ Data Model

### Employee Schema
```typescript
interface Employee {
  employeeId: string;           // Unique identifier
  firstName: string;            // First name
  lastName: string;             // Last name
  email: string;                // Email (unique)
  password: string;             // Hashed password
  role: EmployeeRole;           // Role enum
  status: EmployeeStatus;       // Status enum
  department: string;           // Department
  team: string;                 // Team
  location: string;             // Location
  skills: Skill[];              // Skills array
  availabilityWindows: AvailabilityWindow[]; // Availability
  workPreference: WorkPreference; // Preferences
  hireDate: Date;               // Hire date
  totalHoursWorked: number;     // Total hours
}
```

### Shift Schema
```typescript
interface Shift {
  shiftId: string;              // Unique identifier
  title: string;                // Shift title
  date: Date;                   // Shift date
  startTime: string;            // Start time (HH:mm)
  endTime: string;              // End time (HH:mm)
  type: ShiftType;              // Type enum
  status: ShiftStatus;          // Status enum
  location: ShiftLocation;      // Location object
  team: string;                 // Team
  department: string;           // Department
  requirements: ShiftRequirement[]; // Requirements
  assignedEmployees: ObjectId[]; // Assigned employees
  totalHours: number;           // Total hours
  priority: number;             // Priority (1-10)
}
```

### Time-off Schema
```typescript
interface TimeOff {
  requestId: string;            // Unique identifier
  employeeId: ObjectId;         // Employee reference
  type: TimeOffType;            // Type enum
  startDate: Date;              // Start date
  endDate: Date;                // End date
  totalHours: number;           // Total hours
  reason: string;               // Reason
  priority: TimeOffPriority;    // Priority enum
  status: TimeOffStatus;        // Status enum
  approvalWorkflow: TimeOffApproval; // Approval details
}
```

### Schedule Schema
```typescript
interface Schedule {
  scheduleId: string;           // Unique identifier
  date: Date;                   // Schedule date
  location: string;             // Location
  team: string;                 // Team
  department: string;           // Department
  status: ScheduleStatus;       // Status enum
  shifts: ObjectId[];           // Shift references
  employees: ObjectId[];        // Employee references
  timeOffRequests: ObjectId[];  // Time-off references
  coverage: ScheduleCoverage[]; // Coverage metrics
  conflicts: ScheduleConflict[]; // Conflicts
  metrics: ScheduleMetrics;     // Overall metrics
}
```

## 🔍 Index Strategy

### Performance Indexes
```typescript
// Employee indexes
{ employeeId: 1 }               // Unique employee lookup
{ email: 1 }                    // Email authentication
{ role: 1, status: 1 }         // Role-based queries
{ team: 1, location: 1 }       // Team/location filtering
{ skills: 1 }                   // Skill-based search
{ availabilityWindows: 1 }      // Availability queries

// Shift indexes
{ date: 1, status: 1 }         // Date-based queries
{ location: 1, team: 1 }       // Location/team filtering
{ assignedEmployees: 1 }        // Employee assignment
{ requirements: 1 }             // Requirement matching

// Time-off indexes
{ employeeId: 1, status: 1 }   // Employee requests
{ startDate: 1, endDate: 1 }   // Date range queries
{ status: 1, priority: 1 }     // Status/priority filtering

// Schedule indexes
{ date: 1, location: 1 }       // Date/location queries
{ team: 1, status: 1 }         // Team/status filtering
{ shifts: 1, employees: 1 }    // Reference lookups
```

### Text Search Indexes
```typescript
// Full-text search capabilities
{ title: 'text', description: 'text' }           // Shift search
{ firstName: 'text', lastName: 'text' }          // Employee search
{ reason: 'text', notes: 'text' }                // Time-off search
```

## ⚠️ Conflict Rules

### Shift Assignment Conflicts
1. **Double-booking**: Employee assigned to overlapping shifts
2. **Time-off clashes**: Employee scheduled during approved time-off
3. **Availability mismatch**: Employee scheduled outside availability
4. **Skill mismatch**: Employee doesn't meet shift requirements
5. **Location conflicts**: Employee assigned to multiple locations simultaneously

### Resolution Strategies
- **Automatic detection** during schedule generation
- **Conflict severity levels** (low, medium, high, critical)
- **Resolution suggestions** for each conflict type
- **Manual override** with conflict acknowledgment
- **Audit trail** for all conflict resolutions

## 📊 Coverage Logic

### Coverage Calculation
```typescript
coverage = (assignedEmployees / requiredEmployees) * 100

// Gap analysis
gaps = Math.max(0, required - assigned)

// Overlap analysis
overlaps = Math.max(0, assigned - required)

// Utilization metrics
utilization = (actualHours / availableHours) * 100
```

### Coverage Factors
- **Role requirements** by shift
- **Skill matching** and experience levels
- **Availability windows** and preferences
- **Workload distribution** across employees
- **Location constraints** and travel time
- **Team dynamics** and collaboration needs

## 🧪 Testing

### Unit Tests
```bash
# Run unit tests
pnpm run test

# Run with coverage
pnpm run test:cov

# Run specific test file
pnpm run test src/employees/employees.service.spec.ts
```

### E2E Tests
```bash
# Run end-to-end tests
pnpm run test:e2e

# Run with coverage
pnpm run test:e2e:cov
```

### Test Data
- **Mock employees** with various roles and skills
- **Sample shifts** with different requirements
- **Time-off scenarios** for conflict testing
- **Schedule edge cases** for validation

## 🚀 Deployment

### Production Build
```bash
# Build for production
pnpm run build

# Start production server
pnpm run start:prod
```

### Environment Variables
```bash
# Required
MONGODB_URI=mongodb://localhost:27017/employee-scheduler
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret

# Optional
PORT=3000
NODE_ENV=production
LOG_LEVEL=combined
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 🔧 Development

### Available Scripts
```bash
pnpm run build          # Build the project
pnpm run start          # Start production server
pnpm run start:dev      # Start development server
pnpm run start:debug    # Start with debug logging
pnpm run start:prod     # Start production server
pnpm run seed           # Seed database with test data
pnpm run seed:dev       # Seed with development data
pnpm run test           # Run unit tests
pnpm run test:watch     # Run tests in watch mode
pnpm run test:cov       # Run tests with coverage
pnpm run test:debug     # Run tests with debug logging
pnpm run test:e2e       # Run end-to-end tests
```

### Code Quality
- **ESLint** configuration for code standards
- **Prettier** for consistent formatting
- **TypeScript** strict mode enabled
- **Pre-commit hooks** for quality checks

### Development Workflow
1. **Feature branch** creation
2. **TypeScript compilation** check
3. **Linting and formatting** validation
4. **Unit test** execution
5. **Integration test** validation
6. **Code review** and approval
7. **Merge to main** branch

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- **TypeScript** for type safety
- **NestJS** best practices
- **SOLID principles** adherence
- **Comprehensive testing** coverage
- **Clear documentation** for all APIs

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **API Reference**: Swagger documentation at `/api/docs`
- **Code Examples**: See `test-auth.js` for usage examples
- **Configuration**: Check `.env.example` for all options

### Common Issues
- **MongoDB connection**: Ensure MongoDB is running on port 27017
- **Port conflicts**: Change PORT in .env file if 3000 is busy
- **Build errors**: Clear dist/ folder and reinstall dependencies
- **Authentication**: Verify JWT secrets are properly set

### Getting Help
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub discussions for questions
- **Wiki**: Check project wiki for detailed guides

---

**Built with ❤️ using NestJS and MongoDB**
