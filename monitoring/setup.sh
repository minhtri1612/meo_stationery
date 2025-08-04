#!/bin/bash

echo "🏪 Meo Stationery - Monitoring Setup"
echo "=================================="

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ to continue."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Check if we're in the right directory
if [ ! -f "monitoring/app.py" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "monitoring/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    cd monitoring
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment and install dependencies
echo "📦 Installing Python dependencies..."
cd monitoring
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

echo ""
echo "🎉 Monitoring setup complete!"
echo ""
echo "To start the monitoring service:"
echo "1. Standalone mode:"
echo "   cd monitoring && source venv/bin/activate && python app.py"
echo ""
echo "2. Docker mode (recommended):"
echo "   docker-compose up -d"
echo ""
echo "📊 Dashboard will be available at:"
echo "   http://localhost:5000"
echo ""
echo "🔧 Monitoring Features:"
echo "   • Real-time system metrics (CPU, Memory, Disk)"
echo "   • Application health monitoring"
echo "   • Docker container status"
echo "   • Performance trends and alerts"
echo "   • SQLite database for historical data"
echo ""
echo "⚙️  Configuration:"
echo "   • Monitor checks every 30 seconds"
echo "   • Alerts for high resource usage"
echo "   • 24-hour data retention by default"
echo ""

deactivate
cd ..
