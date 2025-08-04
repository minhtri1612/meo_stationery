# Meo Stationery - System Monitoring

A Flask-based monitoring dashboard using psutil to track your Meo Stationery application's performance.

## 🚀 Quick Start

### Option 1: Docker (Recommended)

Run the entire stack including monitoring:

```bash
# From the project root directory
docker-compose up -d
```

This will start:
- Main application on http://localhost:3000
- Monitoring dashboard on http://localhost:5000

### Option 2: Standalone Python

If you want to run just the monitoring service locally:

```bash
# Run the setup script
./monitoring/setup.sh

# Start the monitoring service
cd monitoring
source venv/bin/activate
python app.py
```

### Option 3: Manual Setup

```bash
# Create virtual environment
cd monitoring
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

## 📊 Features

- **Real-time Metrics**: CPU, Memory, Disk usage
- **Application Health**: Response time and status monitoring
- **Docker Integration**: Container status and statistics  
- **Historical Data**: Performance trends over time
- **Alerts System**: Automatic alerts for high resource usage
- **Web Dashboard**: Beautiful responsive interface

## 🔧 Configuration

The monitoring service can be configured via environment variables:

```bash
# Application URL to monitor (default: http://localhost:3000)
export MEO_APP_URL=http://your-app-url:3000

# Container name to monitor (default: meo-stationery)
export MEO_CONTAINER_NAME=your-container-name
```

## 📈 Dashboard

Once running, visit http://localhost:5000 to see:

- System resource usage graphs
- Application health status
- Docker container information
- Performance trends chart
- Recent alerts and notifications

## 🚨 Alert Thresholds

Default alert thresholds:
- CPU Usage: > 80%
- Memory Usage: > 85% 
- Disk Usage: > 90%
- Response Time: > 5 seconds

## 📁 Data Storage

- Monitoring data is stored in SQLite database
- Historical metrics retained for 24 hours by default
- Database location: `monitoring/monitoring.db`

## 🐳 Docker Integration

The monitoring service can track Docker containers when:
- Docker socket is mounted: `/var/run/docker.sock:/var/run/docker.sock:ro`
- Python docker library is installed
- Proper permissions are set

## 🔍 API Endpoints

- `GET /` - Dashboard UI
- `GET /api/metrics/current` - Current system metrics
- `GET /api/metrics/history?hours=24` - Historical data
- `GET /api/docker/status` - Container status
- `GET /api/alerts` - Recent alerts
- `GET /api/health` - Monitoring service health

## 🛠️ Troubleshooting

**Permission Denied on Docker Socket:**
```bash
sudo usermod -aG docker $USER
# Then logout and login again
```

**Python Dependencies Issues:**
```bash
# Update pip first
pip install --upgrade pip
pip install -r requirements.txt
```

**Container Not Found:**
- Check container name matches your docker-compose service name
- Ensure containers are running: `docker ps`
