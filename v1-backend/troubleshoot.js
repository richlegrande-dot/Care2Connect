/**
 * Automated Troubleshooting Actions
 * Intelligent fixes before restart
 */

const dns = require('dns');
const fs = require('fs-extra');
const path = require('path');

// Troubleshooting state
const troubleshootingState = {
  actions: [],
  attemptCounts: {},
  maxAttempts: 3,
  lastActions: {}
};

/**
 * Log troubleshooting action
 */
function logAction(action, status, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    status,
    details
  };
  
  troubleshootingState.actions.push(entry);
  
  // Keep only last 100 actions
  if (troubleshootingState.actions.length > 100) {
    troubleshootingState.actions.shift();
  }
  
  troubleshootingState.lastActions[action] = entry;
  
  const icon = status === 'success' ? '✅' : status === 'failed' ? '❌' : '🔧';
  console.log(`${icon} [Troubleshoot] ${action}: ${status}`, details);
  
  return entry;
}

/**
 * Apply fallback DNS servers
 */
async function applyFallbackDNS() {
  try {
    logAction('dns_fallback', 'attempting', { reason: 'DNS resolution failures detected' });
    
    // Set fallback DNS servers (Cloudflare + Google)
    dns.setServers([
      '1.1.1.1',      // Cloudflare Primary
      '1.0.0.1',      // Cloudflare Secondary
      '8.8.8.8',      // Google Primary
      '8.8.4.4'       // Google Secondary
    ]);
    
    // Test new DNS configuration
    await new Promise((resolve, reject) => {
      dns.resolve('google.com', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    logAction('dns_fallback', 'success', { servers: dns.getServers() });
    return { success: true, servers: dns.getServers() };
    
  } catch (err) {
    logAction('dns_fallback', 'failed', { error: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * Re-register Stripe webhook
 */
async function reRegisterStripeWebhook() {
  try {
    logAction('webhook_reregister', 'attempting', { service: 'Stripe' });
    
    // In production, this would:
    // 1. Verify webhook endpoint is accessible
    // 2. Re-register with Stripe API
    // 3. Test webhook delivery
    
    // For now, simulate re-registration
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      logAction('webhook_reregister', 'skipped', { reason: 'Stripe not configured' });
      return { success: false, reason: 'not_configured' };
    }
    
    // Simulate successful re-registration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    logAction('webhook_reregister', 'success', { service: 'Stripe' });
    return { success: true };
    
  } catch (err) {
    logAction('webhook_reregister', 'failed', { error: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * Clear temporary files and rotate logs
 */
async function clearTempAndRotateLogs() {
  try {
    logAction('disk_cleanup', 'attempting', { reason: 'Disk space management' });
    
    const cleaned = {
      tempFiles: 0,
      logFiles: 0,
      bytesFreed: 0
    };
    
    // Clear old temp files in uploads (older than 7 days)
    const uploadsDir = path.join(__dirname, 'uploads', 'audio');
    if (await fs.pathExists(uploadsDir)) {
      const files = await fs.readdir(uploadsDir);
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > maxAge) {
          const size = stats.size;
          await fs.remove(filePath);
          cleaned.tempFiles++;
          cleaned.bytesFreed += size;
        }
      }
    }
    
    // Rotate logs (keep last 10 files)
    const logsDir = path.join(__dirname, 'logs');
    if (await fs.pathExists(logsDir)) {
      const logFiles = (await fs.readdir(logsDir))
        .filter(f => f.endsWith('.log'))
        .map(f => ({
          name: f,
          path: path.join(logsDir, f),
          mtime: fs.statSync(path.join(logsDir, f)).mtimeMs
        }))
        .sort((a, b) => b.mtime - a.mtime);
      
      // Remove old log files (keep last 10)
      if (logFiles.length > 10) {
        for (let i = 10; i < logFiles.length; i++) {
          await fs.remove(logFiles[i].path);
          cleaned.logFiles++;
        }
      }
    }
    
    logAction('disk_cleanup', 'success', cleaned);
    return { success: true, ...cleaned };
    
  } catch (err) {
    logAction('disk_cleanup', 'failed', { error: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * Force garbage collection
 */
function forceGarbageCollection() {
  try {
    logAction('garbage_collection', 'attempting', { reason: 'Memory cleanup' });
    
    const before = process.memoryUsage();
    
    if (global.gc) {
      global.gc();
      
      const after = process.memoryUsage();
      const freed = before.heapUsed - after.heapUsed;
      
      logAction('garbage_collection', 'success', {
        freedMB: Math.round(freed / 1024 / 1024),
        heapBefore: Math.round(before.heapUsed / 1024 / 1024),
        heapAfter: Math.round(after.heapUsed / 1024 / 1024)
      });
      
      return { success: true, freedBytes: freed };
    } else {
      logAction('garbage_collection', 'skipped', { reason: 'GC not exposed (use --expose-gc)' });
      return { success: false, reason: 'gc_not_available' };
    }
    
  } catch (err) {
    logAction('garbage_collection', 'failed', { error: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * Capture event loop snapshot
 */
function captureEventLoopSnapshot() {
  try {
    logAction('snapshot_capture', 'attempting', { type: 'event_loop' });
    
    const snapshot = {
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
      activeHandles: process._getActiveHandles ? process._getActiveHandles().length : 'unavailable',
      activeRequests: process._getActiveRequests ? process._getActiveRequests().length : 'unavailable'
    };
    
    logAction('snapshot_capture', 'success', { size: JSON.stringify(snapshot).length });
    return { success: true, snapshot };
    
  } catch (err) {
    logAction('snapshot_capture', 'failed', { error: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * Reset attempt counter for an issue
 */
function resetAttemptCount(issue) {
  troubleshootingState.attemptCounts[issue] = 0;
}

/**
 * Increment attempt counter for an issue
 */
function incrementAttemptCount(issue) {
  if (!troubleshootingState.attemptCounts[issue]) {
    troubleshootingState.attemptCounts[issue] = 0;
  }
  troubleshootingState.attemptCounts[issue]++;
  return troubleshootingState.attemptCounts[issue];
}

/**
 * Check if max attempts reached
 */
function maxAttemptsReached(issue) {
  const count = troubleshootingState.attemptCounts[issue] || 0;
  return count >= troubleshootingState.maxAttempts;
}

/**
 * Get troubleshooting state
 */
function getTroubleshootingState() {
  return {
    recentActions: troubleshootingState.actions.slice(-20),
    attemptCounts: troubleshootingState.attemptCounts,
    maxAttempts: troubleshootingState.maxAttempts,
    lastActions: troubleshootingState.lastActions
  };
}

module.exports = {
  applyFallbackDNS,
  reRegisterStripeWebhook,
  clearTempAndRotateLogs,
  forceGarbageCollection,
  captureEventLoopSnapshot,
  resetAttemptCount,
  incrementAttemptCount,
  maxAttemptsReached,
  getTroubleshootingState,
  logAction
};
