#!/bin/bash

# Setup script for Docker deployment

echo "Setting up Docker environment for MERN backend..."

# Create necessary directories
mkdir -p mongo-init
mkdir -p logs

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual values before running docker-compose up"
fi

# Set permissions for mongo-init script
chmod +x mongo-init/init-mongo.js

# Build and start containers
echo "Building and starting containers..."
docker-compose up --build -d

echo "✅ Setup complete!"
echo ""
echo "Your backend will be available at: http://localhost:3001"
echo "MongoDB will be available at: localhost:3002"
echo ""
echo "To check logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo "To stop and remove volumes: docker-compose down -v"

# Display container status
echo ""
echo "Container status:"
docker-compose ps