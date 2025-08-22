# 🚀 Employee Scheduler - Quick Start Guide

## Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (running on localhost:27017)
- **pnpm** package manager

## 🚀 Quick Start (Recommended)

1. **Start MongoDB** (choose one):
   ```bash
   # Docker (recommended)
   docker run -d -p 27017:27017 mongo:latest
   
   # Or local installation
   sudo systemctl start mongod
   ```

2. **Run the startup script**:
   ```bash
   ./start.sh
   ```

   This script will:
   - Check MongoDB connection
   - Install dependencies
   - Build the project
   - Seed the database
   - Start the application

## 🔧 Manual Setup

If you prefer manual setup:

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   # Edit .env if needed
   ```

3. **Build the project**:
   ```bash
   pnpm run build
   ```

4. **Seed the database**:
   ```bash
   pnpm run seed
   ```

5. **Start the application**:
   ```bash
   pnpm run start:dev
   ```

## 🌐 Access Points

- **API Base URL**: http://localhost:3000/api
- **Swagger Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/health

## 🔑 Default Login

After seeding, you can login with:
- **Email**: employee1@company.com
- **Password**: password123

## 📊 Seeded Data

The system includes:
- **50 employees** with mixed roles and skills
- **30 days of shifts** with various types
- **25 time-off requests** with approval workflow
- **Daily schedules** with coverage analysis
- **Multiple locations and teams**
- **Part-time and overnight workers**
- **Realistic conflicts and gaps**

## 🧪 Test the System

Run the authentication test:
```bash
node test-auth.js
```

## 📁 Project Structure

```
src/
├── auth/           # Authentication & authorization
├── employees/      # Employee management
├── shifts/         # Shift management
├── time-off/       # Time-off requests
├── schedules/      # Daily schedules
├── analytics/      # Coverage & conflict analysis
├── common/         # Shared DTOs & utilities
└── config/         # Configuration & database
```

## 🚨 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running on port 27017
- Check connection string in `.env` file
- Verify network access

### Build Errors
- Clear `dist/` folder: `rm -rf dist/`
- Reinstall dependencies: `rm -rf node_modules && pnpm install`
- Check TypeScript errors in console

### Port Already in Use
- Change port in `.env` file
- Kill process using port 3000: `lsof -ti:3000 | xargs kill -9`

## 📚 Next Steps

1. **Explore the API** using Swagger docs
2. **Test endpoints** with the provided test script
3. **Customize data** by modifying the seed script
4. **Add business logic** to the services
5. **Implement additional features** as needed

## 🆘 Need Help?

- Check the main `README.md` for detailed documentation
- Review the Swagger API documentation
- Check console logs for error details
- Verify MongoDB connection and data seeding 