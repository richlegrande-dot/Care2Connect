/**
 * Health Check Endpoint
 * Provides real-time status of server health metrics
 */

const os = require('os');

// Health status tracking
const healthStatus = {
  uptime: process.uptime(),
  status: 'ok',
  timestamp: Date.now(),
  lastCheck: null,
  metrics: {
    memory: null,
    cpu: null,
    eventLoop: null,
    network: null
  },
  issues: []
};

/**
 * Calculate memory usage percentage
 */
function getMemoryUsage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const usagePercent = (usedMemory / totalMemory) * 100;
  
  return {
    total: Math.round(totalMemory / 1024 / 1024), // MB
    used: Math.round(usedMemory / 1024 / 1024),   // MB
    free: Math.round(freeMemory / 1024 / 1024),   // MB
    usagePercent: Math.round(usagePercent)
  };
}

/**
 * Calculate CPU load average
 */
function getCPUUsage() {
  const loadAvg = os.loadavg();
  const cpuCount = os.cpus().length;
  
  return {
    loadAverage1m: loadAvg[0].toFixed(2),
    loadAverage5m: loadAvg[1].toFixed(2),
    loadAverage15m: loadAvg[2].toFixed(2),
    cpuCount,
    utilization: Math.round((loadAvg[0] / cpuCount) * 100)
  };
}

/**
 * Update health metrics
 */
function updateHealthMetrics() {
  healthStatus.uptime = process.uptime();
  healthStatus.timestamp = Date.now();
  healthStatus.lastCheck = new Date().toISOString();
  healthStatus.metrics.memory = getMemoryUsage();
  healthStatus.metrics.cpu = getCPUUsage();
  
  // Determine overall status
  const issues = [];
  
  // Check memory threshold (warning at 80%, critical at 90%)
  if (healthStatus.metrics.memory.usagePercent > 90) {
    issues.push({ type: 'memory', level: 'critical', message: 'Memory usage above 90%' });
    healthStatus.status = 'critical';
  } else if (healthStatus.metrics.memory.usagePercent > 80) {
    issues.push({ type: 'memory', level: 'warning', message: 'Memory usage above 80%' });
    healthStatus.status = 'warning';
  }
  
  // Check CPU threshold (warning at 70%, critical at 90%)
  if (healthStatus.metrics.cpu.utilization > 90) {
    issues.push({ type: 'cpu', level: 'critical', message: 'CPU utilization above 90%' });
    healthStatus.status = 'critical';
  } else if (healthStatus.metrics.cpu.utilization > 70) {
    issues.push({ type: 'cpu', level: 'warning', message: 'CPU utilization above 70%' });
    if (healthStatus.status === 'ok') healthStatus.status = 'warning';
  }
  
  healthStatus.issues = issues;
  
  if (issues.length === 0) {
    healthStatus.status = 'ok';
  }
}

/**
 * Health check endpoint handler
 */
function healthHandler(req, res) {
  updateHealthMetrics();
  
  const statusCode = healthStatus.status === 'critical' ? 503 : 200;
  
  res.status(statusCode).json({
    status: healthStatus.status,
    uptime: Math.round(healthStatus.uptime),
    timestamp: healthStatus.timestamp,
    lastCheck: healthStatus.lastCheck,
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid
    },
    metrics: healthStatus.metrics,
    issues: healthStatus.issues,
    message: healthStatus.status === 'ok' 
      ? 'Server is healthy' 
      : `Server health: ${healthStatus.status}`
  });
}

/**
 * Lightweight ping endpoint (minimal overhead)
 */
function pingHandler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: Date.now()
  });
}

module.exports = {
  healthStatus,
  healthHandler,
  pingHandler,
  updateHealthMetrics,
  getMemoryUsage,
  getCPUUsage
};
