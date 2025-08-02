#!/bin/bash

echo "🐳 Building Meo Stationery Docker image..."

# Build the Docker image
docker build -t meo-stationery:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo "🚀 To run the container:"
    echo "   docker run -p 3000:3000 meo-stationery:latest"
    echo ""
    echo "📦 Or use docker-compose:"
    echo "   docker-compose up -d"
    echo ""
    echo "🌐 The application will be available at http://localhost:3000"
else
    echo "❌ Docker build failed!"
    exit 1
fi
