import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getDatabaseConfig = (): MongooseModuleOptions => ({
  uri:
    process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_scheduler',
  connectionFactory: (connection) => {
    connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    return connection;
  },
  // Production optimizations
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  // bufferMaxEntries: 0, // Removed as it's not supported in newer versions
});
