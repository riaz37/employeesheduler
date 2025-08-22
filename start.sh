#!/bin/bash

echo "🚀 Employee Scheduler - Startup Script"
echo "======================================"

# Check if MongoDB is running
echo "📊 Checking MongoDB connection..."
if ! nc -z localhost 27017 2>/dev/null; then
    echo "❌ MongoDB is not running on localhost:27017"
    echo "   Please start MongoDB first:"
    echo "   - Docker: docker run -d -p 27017:27017 mongo:latest"
    echo "   - Local: sudo systemctl start mongod"
    echo "   - Or update MONGODB_URI in .env file"
    exit 1
fi
echo "✅ MongoDB is running"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file exists"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Build the project
echo "🔨 Building project..."
pnpm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Seed the database
echo "🌱 Seeding database..."
pnpm run seed
if [ $? -eq 0 ]; then
    echo "✅ Database seeded successfully"
else
    echo "❌ Database seeding failed"
    exit 1
fi

# Start the application
echo "🚀 Starting application..."
echo "   API will be available at: http://localhost:3000"
echo "   Swagger docs at: http://localhost:3000/api/docs"
echo "   Press Ctrl+C to stop"
echo ""

pnpm run start:dev 