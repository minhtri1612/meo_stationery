#!/usr/bin/env python3
"""
Meo Stationery Application Monitor
A Flask-based monitoring application using psutil to track system and application metrics
"""

import os
import time
import json
import psutil
import requests
from datetime import datetime, timedelta
from flask import Flask, jsonify, render_template, request
from threading import Thread
import sqlite3
import logging
from dataclasses import dataclass
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

@dataclass
class SystemMetrics:
    """Data class for system metrics"""
    timestamp: str
    cpu_percent: float
    memory_percent: float
    memory_used: float
    memory_total: float
    disk_usage: float
    disk_free: float
    network_sent: int
    network_recv: int
    process_count: int
    app_status: str
    app_response_time: Optional[float] = None

class MonitoringDatabase:
    """SQLite database for storing monitoring data"""
    
    def __init__(self, db_path: str = "monitoring.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the monitoring database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS system_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    cpu_percent REAL,
                    memory_percent REAL,
                    memory_used REAL,
                    memory_total REAL,
                    disk_usage REAL,
                    disk_free REAL,
                    network_sent INTEGER,
                    network_recv INTEGER,
                    process_count INTEGER,
                    app_status TEXT,
                    app_response_time REAL
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS alerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    alert_type TEXT NOT NULL,
                    message TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    resolved BOOLEAN DEFAULT FALSE
                )
            ''')
            conn.commit()
    
    def save_metrics(self, metrics: SystemMetrics):
        """Save system metrics to database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO system_metrics 
                (timestamp, cpu_percent, memory_percent, memory_used, memory_total,
                 disk_usage, disk_free, network_sent, network_recv, process_count,
                 app_status, app_response_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                metrics.timestamp, metrics.cpu_percent, metrics.memory_percent,
                metrics.memory_used, metrics.memory_total, metrics.disk_usage,
                metrics.disk_free, metrics.network_sent, metrics.network_recv,
                metrics.process_count, metrics.app_status, metrics.app_response_time
            ))
            conn.commit()
    
    def get_recent_metrics(self, hours: int = 24) -> List[Dict]:
        """Get recent metrics from database"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT * FROM system_metrics 
                WHERE datetime(timestamp) > datetime('now', '-{} hours')
                ORDER BY timestamp DESC
            '''.format(hours))
            
            columns = [description[0] for description in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    def save_alert(self, alert_type: str, message: str, severity: str = "warning"):
        """Save alert to database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO alerts (timestamp, alert_type, message, severity)
                VALUES (?, ?, ?, ?)
            ''', (datetime.now().isoformat(), alert_type, message, severity))
            conn.commit()

class ApplicationMonitor:
    """Main monitoring class"""
    
    def __init__(self, app_url: str = "http://localhost:3000", app_name: str = "meo-stationery"):
        self.app_url = app_url
        self.app_name = app_name
        self.db = MonitoringDatabase()
        self.running = False
        self.network_baseline = None
        
        # Thresholds for alerts
        self.thresholds = {
            'cpu_high': 80.0,
            'memory_high': 85.0,
            'disk_high': 90.0,
            'response_time_slow': 5.0  # seconds
        }
    
    def get_system_metrics(self) -> SystemMetrics:
        """Collect current system metrics"""
        try:
            # CPU and Memory
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            
            # Disk usage
            disk = psutil.disk_usage('/')
            disk_usage_percent = (disk.used / disk.total) * 100
            
            # Network statistics
            network = psutil.net_io_counters()
            
            # Process count
            process_count = len(psutil.pids())
            
            # Application health check
            app_status, response_time = self.check_app_health()
            
            return SystemMetrics(
                timestamp=datetime.now().isoformat(),
                cpu_percent=cpu_percent,
                memory_percent=memory.percent,
                memory_used=memory.used / (1024**3),  # GB
                memory_total=memory.total / (1024**3),  # GB
                disk_usage=disk_usage_percent,
                disk_free=disk.free / (1024**3),  # GB
                network_sent=network.bytes_sent,
                network_recv=network.bytes_recv,
                process_count=process_count,
                app_status=app_status,
                app_response_time=response_time
            )
        except Exception as e:
            logger.error(f"Error collecting metrics: {e}")
            return None
    
    def check_app_health(self) -> tuple:
        """Check application health and response time"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.app_url}/api/health", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                return "healthy", response_time
            else:
                return f"unhealthy (HTTP {response.status_code})", response_time
                
        except requests.exceptions.RequestException as e:
            logger.warning(f"App health check failed: {e}")
            return "unreachable", None
    
    def check_docker_container(self) -> Dict:
        """Check Docker container status"""
        try:
            import docker
            client = docker.from_env()
            
            try:
                container = client.containers.get(self.app_name)
                return {
                    "status": container.status,
                    "name": container.name,
                    "image": container.image.tags[0] if container.image.tags else "unknown",
                    "created": container.attrs['Created'],
                    "started": container.attrs['State']['StartedAt']
                }
            except docker.errors.NotFound:
                return {"status": "not_found", "error": "Container not found"}
                
        except ImportError:
            return {"status": "docker_unavailable", "error": "Docker library not available"}
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def check_alerts(self, metrics: SystemMetrics):
        """Check for alert conditions"""
        alerts = []
        
        if metrics.cpu_percent > self.thresholds['cpu_high']:
            alert_msg = f"High CPU usage: {metrics.cpu_percent:.1f}%"
            alerts.append(("cpu_high", alert_msg, "warning"))
        
        if metrics.memory_percent > self.thresholds['memory_high']:
            alert_msg = f"High memory usage: {metrics.memory_percent:.1f}%"
            alerts.append(("memory_high", alert_msg, "warning"))
        
        if metrics.disk_usage > self.thresholds['disk_high']:
            alert_msg = f"High disk usage: {metrics.disk_usage:.1f}%"
            alerts.append(("disk_high", alert_msg, "critical"))
        
        if metrics.app_response_time and metrics.app_response_time > self.thresholds['response_time_slow']:
            alert_msg = f"Slow response time: {metrics.app_response_time:.2f}s"
            alerts.append(("response_slow", alert_msg, "warning"))
        
        if metrics.app_status != "healthy":
            alert_msg = f"Application unhealthy: {metrics.app_status}"
            alerts.append(("app_unhealthy", alert_msg, "critical"))
        
        # Save alerts to database
        for alert_type, message, severity in alerts:
            self.db.save_alert(alert_type, message, severity)
        
        return alerts
    
    def monitor_loop(self):
        """Main monitoring loop"""
        logger.info("Starting monitoring loop...")
        
        while self.running:
            try:
                metrics = self.get_system_metrics()
                if metrics:
                    # Save metrics
                    self.db.save_metrics(metrics)
                    
                    # Check for alerts
                    alerts = self.check_alerts(metrics)
                    
                    if alerts:
                        logger.warning(f"Generated {len(alerts)} alerts")
                
                time.sleep(30)  # Monitor every 30 seconds
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                time.sleep(60)  # Wait longer on error
    
    def start_monitoring(self):
        """Start the monitoring background thread"""
        if not self.running:
            self.running = True
            monitor_thread = Thread(target=self.monitor_loop, daemon=True)
            monitor_thread.start()
            logger.info("Monitoring started")
    
    def stop_monitoring(self):
        """Stop the monitoring"""
        self.running = False
        logger.info("Monitoring stopped")

# Initialize monitor
monitor = ApplicationMonitor()

# Flask Routes
@app.route('/')
def dashboard():
    """Main dashboard"""
    return render_template('dashboard.html')

@app.route('/api/metrics/current')
def current_metrics():
    """Get current system metrics"""
    metrics = monitor.get_system_metrics()
    if metrics:
        return jsonify({
            'timestamp': metrics.timestamp,
            'cpu_percent': metrics.cpu_percent,
            'memory_percent': metrics.memory_percent,
            'memory_used': metrics.memory_used,
            'memory_total': metrics.memory_total,
            'disk_usage': metrics.disk_usage,
            'disk_free': metrics.disk_free,
            'network_sent': metrics.network_sent,
            'network_recv': metrics.network_recv,
            'process_count': metrics.process_count,
            'app_status': metrics.app_status,
            'app_response_time': metrics.app_response_time
        })
    else:
        return jsonify({'error': 'Failed to collect metrics'}), 500

@app.route('/api/metrics/history')
def metrics_history():
    """Get historical metrics"""
    hours = request.args.get('hours', 24, type=int)
    metrics = monitor.db.get_recent_metrics(hours)
    return jsonify(metrics)

@app.route('/api/docker/status')
def docker_status():
    """Get Docker container status"""
    status = monitor.check_docker_container()
    return jsonify(status)

@app.route('/api/health')
def health_check():
    """Monitor service health check"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'monitoring_active': monitor.running
    })

@app.route('/api/alerts')
def get_alerts():
    """Get recent alerts"""
    with sqlite3.connect(monitor.db.db_path) as conn:
        cursor = conn.execute('''
            SELECT * FROM alerts 
            WHERE datetime(timestamp) > datetime('now', '-24 hours')
            ORDER BY timestamp DESC
            LIMIT 50
        ''')
        columns = [description[0] for description in cursor.description]
        alerts = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    return jsonify(alerts)

if __name__ == '__main__':
    # Start monitoring in background
    monitor.start_monitoring()
    
    # Run Flask app
    try:
        app.run(host='0.0.0.0', port=5000, debug=False)
    except KeyboardInterrupt:
        logger.info("Shutting down...")
        monitor.stop_monitoring()
