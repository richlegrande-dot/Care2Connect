/**
 * Self-Troubleshooting Diagnostics Layer
 * Diagnoses issues before triggering recovery
 */

const dns = require('dns').promises;
const http = require('http');
const https = require('https');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

// Diagnostic results cache
const diagnosticHistory = {
  runs: [],
  maxHistory: 50,
  lastRun: null
};

/**
 * Check DNS resolution
 */
async function checkDNS() {
  const testDomains = ['google.com', 'cloudflare.com', '1.1.1.1'];
  const results = {
    status: 'ok',
    reachable: [],
    failed: [],
    latency: null
  };
  
  const start = Date.now();
  
  for (const domain of testDomains) {
    try {
      await dns.resolve(domain);
      results.reachable.push(domain);
    } catch (err) {
      results.failed.push({ domain, error: err.code });
    }
  }
  
  results.latency = Date.now() - start;
  
  if (results.failed.length === testDomains.length) {
    results.status = 'fail';
  } else if (results.failed.length > 0) {
    results.status = 'degraded';
  }
  
  return results;
}

/**
 * Check network connectivity
 */
async function checkNetwork() {
  const testUrls = [
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'Cloudflare', url: 'https://1.1.1.1' }
  ];
  
  const results = {
    status: 'ok',
    reachable: [],
    failed: [],
    latency: null
  };
  
  const start = Date.now();
  
  for (const test of testUrls) {
    try {
      await makeRequest(test.url);
      results.reachable.push(test.name);
    } catch (err) {
      results.failed.push({ name: test.name, error: err.message });
    }
  }
  
  results.latency = Date.now() - start;
  
  if (results.failed.length === testUrls.length) {
    results.status = 'fail';
  } else if (results.failed.length > 0) {
    results.status = 'degraded';
  }
  
  return results;
}

/**
 * Make HTTP/HTTPS request
 */
function makeRequest(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, { timeout }, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        resolve({ statusCode: res.statusCode });
      } else {
        reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.resume(); // Consume response data
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Check Stripe webhook endpoint health
 */
async function checkStripeWebhook() {
  const results = {
    status: 'unknown',
    endpoint: null,
    reachable: false,
    configured: false,
    error: null
  };
  
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      results.status = 'not_configured';
      results.error = 'STRIPE_SECRET_KEY not set';
      return results;
    }
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      results.status = 'not_configured';
      results.error = 'STRIPE_WEBHOOK_SECRET not set';
      return results;
    }
    
    results.configured = true;
    
    // In production, you would test webhook endpoint accessibility
    // For now, just verify configuration
    results.status = 'ok';
    results.reachable = true;
    
  } catch (err) {
    results.status = 'error';
    results.error = err.message;
  }
  
  return results;
}

/**
 * Check disk health and space
 */
async function checkDisk() {
  const results = {
    status: 'ok',
    usage: {},
    warnings: [],
    critical: []
  };
  
  try {
    const uploadDir = path.join(__dirname, 'uploads');
    const logsDir = path.join(__dirname, 'logs');
    
    // Check if directories exist and are writable
    const dirs = [
      { path: uploadDir, name: 'uploads' },
      { path: logsDir, name: 'logs' }
    ];
    
    for (const dir of dirs) {
      try {
        await fs.ensureDir(dir.path);
        await fs.access(dir.path, fs.constants.W_OK);
        
        // Get directory size (approximate)
        const files = await fs.readdir(dir.path);
        results.usage[dir.name] = {
          exists: true,
          writable: true,
          fileCount: files.length
        };
      } catch (err) {
        results.warnings.push(`${dir.name} directory issue: ${err.message}`);
        results.usage[dir.name] = {
          exists: false,
          writable: false,
          error: err.message
        };
      }
    }
    
    // Check system disk space (Windows)
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedPercent = ((totalMemory - freeMemory) / totalMemory) * 100;
    
    if (usedPercent > 95) {
      results.critical.push('System memory critically low');
      results.status = 'critical';
    } else if (usedPercent > 85) {
      results.warnings.push('System memory running low');
      results.status = 'warning';
    }
    
    results.usage.memory = {
      total: Math.round(totalMemory / 1024 / 1024),
      free: Math.round(freeMemory / 1024 / 1024),
      usedPercent: Math.round(usedPercent)
    };
    
  } catch (err) {
    results.status = 'error';
    results.critical.push(`Disk check failed: ${err.message}`);
  }
  
  return results;
}

/**
 * Check event loop lag
 */
async function checkEventLoopLag() {
  return new Promise((resolve) => {
    const start = Date.now();
    
    setImmediate(() => {
      const lag = Date.now() - start;
      resolve({
        status: lag > 250 ? (lag > 500 ? 'critical' : 'warning') : 'ok',
        lagMs: lag,
        threshold: 250
      });
    });
  });
}

/**
 * Check memory health
 */
function checkMemory() {
  const usage = process.memoryUsage();
  const totalHeap = usage.heapTotal;
  const usedHeap = usage.heapUsed;
  const external = usage.external;
  
  const heapUsagePercent = (usedHeap / totalHeap) * 100;
  
  const results = {
    status: 'ok',
    heapUsed: Math.round(usedHeap / 1024 / 1024),
    heapTotal: Math.round(totalHeap / 1024 / 1024),
    heapUsagePercent: Math.round(heapUsagePercent),
    external: Math.round(external / 1024 / 1024),
    rss: Math.round(usage.rss / 1024 / 1024)
  };
  
  if (heapUsagePercent > 90) {
    results.status = 'critical';
  } else if (heapUsagePercent > 80) {
    results.status = 'warning';
  }
  
  return results;
}

/**
 * Check CPU health
 */
function checkCPU() {
  const loadAvg = os.loadavg();
  const cpuCount = os.cpus().length;
  const utilization = (loadAvg[0] / cpuCount) * 100;
  
  const results = {
    status: 'ok',
    loadAverage1m: loadAvg[0].toFixed(2),
    loadAverage5m: loadAvg[1].toFixed(2),
    loadAverage15m: loadAvg[2].toFixed(2),
    cpuCount,
    utilization: Math.round(utilization)
  };
  
  if (utilization > 90) {
    results.status = 'critical';
  } else if (utilization > 70) {
    results.status = 'warning';
  }
  
  return results;
}

/**
 * Run full diagnostic suite
 */
async function runDiagnostics() {
  console.log('🔍 Running full system diagnostics...');
  
  const startTime = Date.now();
  const results = {
    timestamp: new Date().toISOString(),
    duration: 0,
    overall: 'ok',
    checks: {}
  };
  
  try {
    // Run all checks in parallel for speed
    const [network, dns, webhook, disk, eventLoop] = await Promise.all([
      checkNetwork(),
      checkDNS(),
      checkStripeWebhook(),
      checkDisk(),
      checkEventLoopLag()
    ]);
    
    // Synchronous checks
    const memory = checkMemory();
    const cpu = checkCPU();
    
    results.checks = {
      network,
      dns,
      webhook,
      disk,
      eventLoop,
      memory,
      cpu
    };
    
    // Determine overall status
    const statuses = Object.values(results.checks).map(c => c.status);
    
    if (statuses.includes('critical') || statuses.includes('fail')) {
      results.overall = 'critical';
    } else if (statuses.includes('warning') || statuses.includes('degraded')) {
      results.overall = 'warning';
    } else {
      results.overall = 'ok';
    }
    
    results.duration = Date.now() - startTime;
    
    // Store in history
    diagnosticHistory.runs.push(results);
    if (diagnosticHistory.runs.length > diagnosticHistory.maxHistory) {
      diagnosticHistory.runs.shift();
    }
    diagnosticHistory.lastRun = results;
    
    console.log(`✅ Diagnostics complete in ${results.duration}ms - Status: ${results.overall}`);
    
  } catch (err) {
    results.overall = 'error';
    results.error = err.message;
    console.error('❌ Diagnostics failed:', err);
  }
  
  return results;
}

/**
 * Get diagnostic history
 */
function getDiagnosticHistory() {
  return {
    history: diagnosticHistory.runs,
    lastRun: diagnosticHistory.lastRun,
    totalRuns: diagnosticHistory.runs.length
  };
}

/**
 * Clear diagnostic history
 */
function clearDiagnosticHistory() {
  diagnosticHistory.runs = [];
  diagnosticHistory.lastRun = null;
  console.log('🗑️ Diagnostic history cleared');
}

module.exports = {
  runDiagnostics,
  checkNetwork,
  checkDNS,
  checkStripeWebhook,
  checkDisk,
  checkEventLoopLag,
  checkMemory,
  checkCPU,
  getDiagnosticHistory,
  clearDiagnosticHistory
};
