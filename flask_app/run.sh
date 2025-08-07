#!/bin/bash

echo "🚀 Setting up Flask Meo Stationery App"
echo "======================================"

# Navigate to flask_app directory
cd /home/minhtri/cloud/project_new/meo_stationery/flask_app

# Install dependencies
pip3 install -r requirements.txt

echo "✅ Setup complete!"
echo ""
echo "🚀 Starting Flask app..."
echo "Access at: http://localhost:5000"
echo "Admin login: username=admin, password=admin123"
echo ""

# Start the application
python3 app.py
