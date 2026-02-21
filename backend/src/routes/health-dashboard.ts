import { Router, Request, Response } from "express";
import { healthMonitor } from "../monitoring/healthMonitor";

const router = Router();

/**
 * GET /health/dashboard
 * Health monitoring dashboard with real-time graphs
 */
router.get("/dashboard", async (req: Request, res: Response) => {
  const snapshot = await healthMonitor.performHealthCheck();
  const history = healthMonitor.getHistory(100);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Care2System - Health Monitoring Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
      color: #333;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    header {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 16px;
      padding: 30px;
      margin-bottom: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }
    
    h1 {
      color: #667eea;
      font-size: 2.5rem;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .pulse {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 1);
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
      }
    }
    
    .subtitle {
      color: #6b7280;
      font-size: 1rem;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }
    
    .stat-card.healthy {
      border-left: 4px solid #10b981;
    }
    
    .stat-card.warning {
      border-left: 4px solid #f59e0b;
    }
    
    .stat-card.error {
      border-left: 4px solid #ef4444;
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 4px;
    }
    
    .stat-detail {
      font-size: 0.875rem;
      color: #6b7280;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .status-badge.ready {
      background: #d1fae5;
      color: #065f46;
    }
    
    .status-badge.degraded {
      background: #fef3c7;
      color: #92400e;
    }
    
    .status-badge.unhealthy {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .chart-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .chart-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 20px;
    }
    
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }
    
    .service-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
    }
    
    .service-status {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    
    .service-status.online {
      background: #10b981;
    }
    
    .service-status.offline {
      background: #ef4444;
    }
    
    .service-name {
      font-weight: 500;
      color: #374151;
    }
    
    .last-updated {
      text-align: center;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.875rem;
      margin-top: 20px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }
    
    @media (max-width: 768px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
      
      h1 {
        font-size: 1.75rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>
        <span class="pulse"></span>
        System Health Dashboard
      </h1>
      <p class="subtitle">Real-time monitoring • Auto-refresh every 10 seconds</p>
    </header>
    
    <div class="stats-grid" id="statsGrid"></div>
    
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-title">System Uptime & Response Time</div>
        <canvas id="uptimeChart"></canvas>
      </div>
      
      <div class="chart-card">
        <div class="chart-title">Memory Usage</div>
        <canvas id="memoryChart"></canvas>
      </div>
      
      <div class="chart-card">
        <div class="chart-title">Service Health Status</div>
        <canvas id="servicesChart"></canvas>
      </div>
      
      <div class="chart-card">
        <div class="chart-title">Database Performance</div>
        <canvas id="databaseChart"></canvas>
      </div>
    </div>
    
    <div class="chart-card">
      <div class="chart-title">All Services Status</div>
      <div class="services-grid" id="servicesGrid"></div>
    </div>
    
    <div class="last-updated" id="lastUpdated"></div>
  </div>
  
  <script>
    let charts = {};
    let historyData = ${JSON.stringify(history)};
    
    // Initialize charts
    function initCharts() {
      const chartConfig = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          }
        }
      };
      
      // Uptime chart
      const uptimeCtx = document.getElementById('uptimeChart').getContext('2d');
      charts.uptime = new Chart(uptimeCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Uptime (seconds)',
            data: [],
            borderColor: 'rgb(102, 126, 234)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          ...chartConfig,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      
      // Memory chart
      const memoryCtx = document.getElementById('memoryChart').getContext('2d');
      charts.memory = new Chart(memoryCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Memory Usage (MB)',
            data: [],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          ...chartConfig,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      
      // Services chart
      const servicesCtx = document.getElementById('servicesChart').getContext('2d');
      charts.services = new Chart(servicesCtx, {
        type: 'bar',
        data: {
          labels: ['Database', 'Storage', 'Stripe', 'OpenAI'],
          datasets: [{
            label: 'Service Status (1=OK, 0=Down)',
            data: [0, 0, 0, 0],
            backgroundColor: [
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(59, 130, 246, 0.8)'
            ]
          }]
        },
        options: {
          ...chartConfig,
          scales: {
            y: {
              beginAtZero: true,
              max: 1,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
      
      // Database chart
      const dbCtx = document.getElementById('databaseChart').getContext('2d');
      charts.database = new Chart(dbCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'DB Status',
            data: [],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            stepped: true
          }]
        },
        options: {
          ...chartConfig,
          scales: {
            y: {
              beginAtZero: true,
              max: 1,
              ticks: {
                stepSize: 1,
                callback: function(value) {
                  return value === 1 ? 'Online' : 'Offline';
                }
              }
            }
          }
        }
      });
      
      // Load initial history
      updateChartsWithHistory();
    }
    
    function updateChartsWithHistory() {
      if (historyData.length === 0) return;
      
      const recentData = historyData.slice(-50);
      const labels = recentData.map((_, i) => \`-\${50-i}s\`);
      
      // Update uptime chart
      charts.uptime.data.labels = labels;
      charts.uptime.data.datasets[0].data = recentData.map(d => d.uptime || d.uptimeSec || 0);
      charts.uptime.update();
      
      // Update memory chart
      charts.memory.data.labels = labels;
      charts.memory.data.datasets[0].data = recentData.map(d => 
        Math.round((d.memoryUsageMB || 0) * 10) / 10
      );
      charts.memory.update();
      
      // Update database chart
      charts.database.data.labels = labels;
      charts.database.data.datasets[0].data = recentData.map(d => 
        d.services?.db?.ok ? 1 : 0
      );
      charts.database.update();
    }
    
    function updateDashboard(data) {
      // Update stats grid
      const statsHtml = \`
        <div class="stat-card healthy">
          <div class="stat-label">System Status</div>
          <div class="stat-value">
            <span class="status-badge \${data.status}">\${data.status}</span>
          </div>
          <div class="stat-detail">Last check: \${new Date(data.timestamp).toLocaleTimeString()}</div>
        </div>
        
        <div class="stat-card healthy">
          <div class="stat-label">Uptime</div>
          <div class="stat-value">\${Math.floor((data.uptime || data.uptimeSec || 0) / 60)}m</div>
          <div class="stat-detail">\${Math.round(data.uptime || data.uptimeSec || 0)} seconds</div>
        </div>
        
        <div class="stat-card \${data.services?.db?.ok ? 'healthy' : 'error'}">
          <div class="stat-label">Database</div>
          <div class="stat-value">\${data.services?.db?.ok ? '✓' : '✗'}</div>
          <div class="stat-detail">\${data.services?.db?.detail || 'Unknown'}</div>
        </div>
        
        <div class="stat-card healthy">
          <div class="stat-label">Memory Usage</div>
          <div class="stat-value">\${Math.round(data.memoryUsageMB || 0)} MB</div>
          <div class="stat-detail">\${Math.round(data.memoryUsagePercent || 0)}% of total</div>
        </div>
      \`;
      document.getElementById('statsGrid').innerHTML = statsHtml;
      
      // Update services chart
      charts.services.data.datasets[0].data = [
        data.services?.db?.ok ? 1 : 0,
        data.services?.storage?.ok ? 1 : 0,
        data.services?.stripe?.ok ? 1 : 0,
        data.services?.openai?.ok ? 1 : 0
      ];
      charts.services.update();
      
      // Update services grid
      const servicesHtml = \`
        <div class="service-item">
          <div class="service-status \${data.services?.db?.ok ? 'online' : 'offline'}"></div>
          <div class="service-name">Database</div>
        </div>
        <div class="service-item">
          <div class="service-status \${data.services?.storage?.ok ? 'online' : 'offline'}"></div>
          <div class="service-name">Storage</div>
        </div>
        <div class="service-item">
          <div class="service-status \${data.services?.stripe?.ok ? 'online' : 'offline'}"></div>
          <div class="service-name">Stripe</div>
        </div>
        <div class="service-item">
          <div class="service-status \${data.services?.openai?.ok ? 'online' : 'offline'}"></div>
          <div class="service-name">OpenAI</div>
        </div>
        <div class="service-item">
          <div class="service-status \${data.integrity?.ready ? 'online' : 'offline'}"></div>
          <div class="service-name">Integrity</div>
        </div>
      \`;
      document.getElementById('servicesGrid').innerHTML = servicesHtml;
      
      // Update last updated timestamp
      document.getElementById('lastUpdated').textContent = 
        \`Last updated: \${new Date().toLocaleString()} • Next update in 10s\`;
    }
    
    async function refreshData() {
      try {
        const [statusResponse, historyResponse] = await Promise.all([
          fetch('/health/status'),
          fetch('/health/history?limit=50')
        ]);
        
        const statusData = await statusResponse.json();
        const historyData = await historyResponse.json();
        
        updateDashboard(statusData);
        
        // Add new data point to charts
        const timestamp = new Date().toLocaleTimeString();
        
        // Shift old data if too many points
        if (charts.uptime.data.labels.length > 50) {
          charts.uptime.data.labels.shift();
          charts.uptime.data.datasets[0].data.shift();
          charts.memory.data.labels.shift();
          charts.memory.data.datasets[0].data.shift();
          charts.database.data.labels.shift();
          charts.database.data.datasets[0].data.shift();
        }
        
        // Add new data points
        charts.uptime.data.labels.push(timestamp);
        charts.uptime.data.datasets[0].data.push(statusData.uptime || statusData.uptimeSec || 0);
        charts.uptime.update();
        
        charts.memory.data.labels.push(timestamp);
        charts.memory.data.datasets[0].data.push(Math.round((statusData.memoryUsageMB || 0) * 10) / 10);
        charts.memory.update();
        
        charts.database.data.labels.push(timestamp);
        charts.database.data.datasets[0].data.push(statusData.services?.db?.ok ? 1 : 0);
        charts.database.update();
        
      } catch (error) {
        console.error('Error refreshing health data:', error);
      }
    }
    
    // Initialize on page load
    initCharts();
    updateDashboard(${JSON.stringify(snapshot)});
    
    // Auto-refresh every 10 seconds
    setInterval(refreshData, 10000);
  </script>
</body>
</html>
  `;

  res.send(html);
});

export default router;
