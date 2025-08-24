# Employee Scheduler 🕐👥

A comprehensive employee scheduling and management system built with NestJS backend and Next.js frontend, featuring real-time analytics, shift management, and employee coverage optimization.

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication system
- Role-based access control
- Secure password hashing with bcrypt
- Rate limiting and security headers
- CORS configuration

### 👥 Employee Management
- Complete employee profiles and information
- Employee search and filtering
- Bulk operations support
- Employee status tracking

### 📅 Schedule Management
- Flexible scheduling system
- Shift assignment and management
- Time-off request handling
- Schedule conflict detection
- Calendar view integration

### 🕐 Shift Management
- Customizable shift types
- Employee shift assignment
- Shift coverage optimization
- Real-time shift updates

### 📊 Analytics & Reporting
- Real-time dashboard analytics
- Employee performance metrics
- Schedule coverage reports
- Export functionality
- Interactive charts and graphs

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Dark/light theme support
- Mobile-optimized interface
- Accessible components
- Smooth animations

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with JWT
- **Validation**: Class-validator & Joi
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest with E2E support

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React

### Development Tools
- **Package Manager**: pnpm (backend), npm (frontend)
- **Linting**: ESLint with TypeScript support
- **Code Formatting**: Prettier
- **Type Safety**: TypeScript
- **Build Tool**: Turbopack

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- pnpm (for backend)
- npm (for frontend)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/employee-scheduler
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=24h
   API_PREFIX=api/v1
   ```

4. **Start the development server**
   ```bash
   pnpm run dev
   ```

5. **Seed the database (optional)**
   ```bash
   pnpm run seed
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the frontend directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
   NEXT_PUBLIC_APP_NAME=Employee Scheduler
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/change-password` - Change user password

### Employee Endpoints
- `GET /employees` - List all employees
- `POST /employees` - Create new employee
- `GET /employees/:id` - Get employee details
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

### Schedule Endpoints
- `GET /schedules` - List all schedules
- `POST /schedules` - Create new schedule
- `GET /schedules/:id` - Get schedule details
- `PUT /schedules/:id` - Update schedule
- `DELETE /schedules/:id` - Delete schedule

### Shift Endpoints
- `GET /shifts` - List all shifts
- `POST /shifts` - Create new shift
- `GET /shifts/:id` - Get shift details
- `PUT /shifts/:id` - Update shift
- `DELETE /shifts/:id` - Delete shift

### Time-off Endpoints
- `GET /time-off` - List all time-off requests
- `POST /time-off` - Create time-off request
- `GET /time-off/:id` - Get time-off details
- `PUT /time-off/:id` - Update time-off request
- `DELETE /time-off/:id` - Delete time-off request

### Analytics Endpoints
- `GET /analytics/overview` - Dashboard overview
- `GET /analytics/employee-stats` - Employee statistics
- `GET /analytics/schedule-coverage` - Schedule coverage data
- `GET /analytics/export` - Export analytics data

### Interactive API Documentation
Visit `http://localhost:3001/api/docs` for interactive Swagger documentation.

## 🗄️ Database Schema

### Employee Schema
```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: Date;
  status: 'active' | 'inactive';
  skills: string[];
}
```

### Schedule Schema
```typescript
{
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  employees: Employee[];
  shifts: Shift[];
  status: 'draft' | 'published' | 'archived';
}
```

### Shift Schema
```typescript
{
  name: string;
  startTime: string;
  endTime: string;
  employees: Employee[];
  maxEmployees: number;
  minEmployees: number;
  requirements: string[];
}
```

### Time-off Schema
```typescript
{
  employee: Employee;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'vacation' | 'sick' | 'personal' | 'other';
}
```

## 🧪 Testing

### Backend Testing
```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov

# Watch mode
pnpm run test:watch
```

### Frontend Testing
```bash
# Lint code
npm run lint

# Build for production
npm run build
```

## 🚀 Deployment

### Backend Production
```bash
# Build the application
pnpm run build

# Start production server
pnpm run start:prod
```

### Frontend Production
```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=24h
API_PREFIX=api/v1
```

## 📁 Project Structure

```
employeesheduler/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── employees/      # Employee management
│   │   ├── schedules/      # Schedule management
│   │   ├── shifts/         # Shift management
│   │   ├── time-off/       # Time-off management
│   │   ├── analytics/      # Analytics and reporting
│   │   ├── common/         # Shared DTOs and utilities
│   │   └── config/         # Configuration files
│   ├── test/               # Test files
│   └── scripts/            # Database seeding scripts
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and API client
│   │   ├── services/       # API service functions
│   │   └── types/          # TypeScript type definitions
│   └── public/             # Static assets
└── README.md               # This file
```

## 🔧 Configuration

### Backend Configuration
The backend uses a configuration service that loads settings from:
- Environment variables
- `.env` file
- Configuration files in `src/config/`

### Frontend Configuration
The frontend configuration is handled through:
- Environment variables (`.env.local`)
- Next.js configuration (`next.config.ts`)
- Tailwind CSS configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [API documentation](http://localhost:3001/api/docs)
2. Review the existing issues
3. Create a new issue with detailed information

## 🚀 Roadmap

- [ ] Mobile application
- [ ] Advanced reporting features
- [ ] Integration with payroll systems
- [ ] Multi-language support
- [ ] Advanced notification system
- [ ] API rate limiting dashboard
- [ ] Backup and restore functionality

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/) and [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Charts powered by [Recharts](https://recharts.org/)

---

**Happy Scheduling! 🎉** 