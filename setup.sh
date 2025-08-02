#!/bin/bash

echo "🚀 Setting up Meo Stationery project..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual database credentials and API keys"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if database is accessible and migrate if needed
echo "🗃️  Setting up database..."
if npx prisma db push 2>/dev/null; then
    echo "✅ Database schema updated successfully"
    
    # Run seed if it exists
    if [ -f prisma/seed.ts ]; then
        echo "🌱 Seeding database with sample data..."
        npx tsx prisma/seed.ts
    fi
else
    echo "⚠️  Database connection failed. Please:"
    echo "   1. Make sure PostgreSQL is running"
    echo "   2. Update DATABASE_URL in .env.local"
    echo "   3. Create the database if it doesn't exist"
fi

echo "🎉 Setup complete! Run 'npm run dev' to start the development server"
