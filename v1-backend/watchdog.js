/**
 * Auto-Healing Watchdog System with Self-Troubleshooting
 * Monitors server health, diagnoses issues, and triggers intelligent recovery
 */

const dns = require('dns');
const { healthStatus, updateHealthMetrics } = require('./health');
const { runDiagnostics } = require('./diagnostics');
const {
  applyFallbackDNS,
  reRegisterStripeWebhook,
  clearTempAndRotateLogs,
  forceGarbageCollection,
  captureEventLoopSnapshot,
  incrementAttemptCount,
  maxAttemptsReached,
  resetAttemptCount
} = require('./troubleshoot');

// Watchdog configuration
const WATCHDOG_CONFIG = {
  checkInterval: 5000,              // Check every 5 seconds
  eventLoopThreshold: 250,          // Event loop lag threshold (ms)
  memoryThreshold: 90,              // Memory usage threshold (%)
  cpuThreshold: 95,                 // CPU usage threshold (%)
  networkCheckDomain: 'google.com', // Domain for network connectivity check
  maxConsecutiveFailures: 3,        // Max failures before recovery
  cooldownPeriod: 30000            // Cooldown after recovery (ms)
};

// Watchdog state
const watchdogState = {
  isRunning: false,
  intervalId: null,
  consecutiveFailures: {
    eventLoop: 0,
    network: 0,
    memory: 0,
    cpu: 0
  },
  lastRecovery: null,
  recoveryCount: 0,
  logs: []
};

/**
 * Log watchdog event
 */
function logEvent(level, type, message, details = {}) {
  const event = {
    timestamp: new Date().toISOString(),
    level,
    type,
    message,
    details
  };
  
  watchdogState.logs.push(event);
  
  // Keep only last 100 logs
  if (watchdogState.logs.length > 100) {
    watchdogState.logs.shift();
  }
  
  // Console output with color coding
  const icon = level === 'error' ? '🛑' : level === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${icon} [Watchdog] ${type}: ${message}`, details);
  
  return event;
}

/**
 * Check if in cooldown period
 */
function isInCooldown() {
  if (!watchdogState.lastRecovery) return false;
  
  const timeSinceRecovery = Date.now() - watchdogState.lastRecovery;
  return timeSinceRecovery < WATCHDOG_CONFIG.cooldownPeriod;
}

/**
 * Intelligent auto-troubleshoot before restart
 */
async function autoTroubleshoot(reason, details = {}) {
  console.warn('\n========================================');
  console.warn('🔍 AUTO-TROUBLESHOOT INITIATED');
  console.warn(`Reason: ${reason}`);
  console.warn('Running diagnostics...');
  console.warn('========================================\n');
  
  logEvent('info', 'troubleshoot_started', `Auto-troubleshooting: ${reason}`, details);
  
  // Run full diagnostics
  const diagnostics = await runDiagnostics();
  
  const fixes = [];
  let needsRestart = false;
  
  // Analyze diagnostics and apply fixes
  
  // 1. DNS/Network Issues
  if (diagnostics.checks.dns?.status === 'fail' || diagnostics.checks.network?.status === 'fail') {
    logEvent('warning', 'dns_issue_detected', 'DNS/Network failure detected');
    
    const attempts = incrementAttemptCount('dns_network');
    
    if (!maxAttemptsReached('dns_network')) {
      const dnsResult = await applyFallbackDNS();
      fixes.push({ action: 'dns_fallback', result: dnsResult });
      
      if (dnsResult.success) {
        resetAttemptCount('dns_network');
      }
    } else {
      needsRestart = true;
      logEvent('error', 'dns_max_attempts', `DNS fixes failed after ${attempts} attempts`);
    }
  }
  
  // 2. Webhook Issues
  if (diagnostics.checks.webhook?.status === 'error') {
    logEvent('warning', 'webhook_issue_detected', 'Stripe webhook issue detected');
    
    const attempts = incrementAttemptCount('webhook');
    
    if (!maxAttemptsReached('webhook')) {
      const webhookResult = await reRegisterStripeWebhook();
      fixes.push({ action: 'webhook_reregister', result: webhookResult });
      
      if (webhookResult.success) {
        resetAttemptCount('webhook');
      }
    } else {
      logEvent('warning', 'webhook_max_attempts', `Webhook fixes failed after ${attempts} attempts`);
    }
  }
  
  // 3. Disk Issues
  if (diagnostics.checks.disk?.status === 'critical' || diagnostics.checks.disk?.status === 'warning') {
    logEvent('warning', 'disk_issue_detected', 'Disk space or I/O issue detected');
    
    const diskResult = await clearTempAndRotateLogs();
    fixes.push({ action: 'disk_cleanup', result: diskResult });
  }
  
  // 4. Memory Issues
  if (diagnostics.checks.memory?.status === 'critical' || diagnostics.checks.memory?.status === 'warning') {
    logEvent('warning', 'memory_issue_detected', 'Memory pressure detected');
    
    const attempts = incrementAttemptCount('memory');
    
    if (!maxAttemptsReached('memory')) {
      const gcResult = forceGarbageCollection();
      fixes.push({ action: 'garbage_collection', result: gcResult });
      
      if (gcResult.success && diagnostics.checks.memory?.heapUsagePercent < 85) {
        resetAttemptCount('memory');
      }
    } else {
      needsRestart = true;
      logEvent('error', 'memory_max_attempts', `Memory cleanup failed after ${attempts} attempts`);
    }
  }
  
  // 5. Event Loop Lag
  if (diagnostics.checks.eventLoop?.lagMs > 300) {
    logEvent('warning', 'event_loop_lag_detected', `Event loop lag: ${diagnostics.checks.eventLoop.lagMs}ms`);
    
    const attempts = incrementAttemptCount('event_loop');
    
    // Capture snapshot before any action
    const snapshotResult = captureEventLoopSnapshot();
    fixes.push({ action: 'snapshot_capture', result: snapshotResult });
    
    // Try GC first
    const gcResult = forceGarbageCollection();
    fixes.push({ action: 'garbage_collection', result: gcResult });
    
    if (maxAttemptsReached('event_loop')) {
      needsRestart = true;
      logEvent('error', 'event_loop_max_attempts', `Event loop issues persist after ${attempts} attempts`);
    }
  }
  
  // Log all fixes applied
  console.log('\n========================================');
  console.log('🔧 TROUBLESHOOTING RESULTS');
  console.log(`Overall Status: ${diagnostics.overall}`);
  console.log(`Fixes Applied: ${fixes.length}`);
  fixes.forEach((fix, i) => {
    console.log(`  ${i + 1}. ${fix.action}: ${fix.result.success ? '✅ Success' : '❌ Failed'}`);
  });
  console.log(`Restart Required: ${needsRestart ? 'YES' : 'NO'}`);
  console.log('========================================\n');
  
  logEvent('info', 'troubleshoot_complete', 'Auto-troubleshooting complete', {
    diagnostics: diagnostics.overall,
    fixesApplied: fixes.length,
    needsRestart
  });
  
  return { diagnostics, fixes, needsRestart };
}

/**
 * Trigger recovery action (now with troubleshooting)
 */
async function triggerRecovery(reason, details = {}) {
  if (isInCooldown()) {
    logEvent('warning', 'recovery_skipped', `Recovery skipped (cooldown): ${reason}`, details);
    return;
  }
  
  logEvent('error', 'recovery_triggered', `Recovery initiated: ${reason}`, details);
  
  watchdogState.lastRecovery = Date.now();
  watchdogState.recoveryCount++;
  
  // Run intelligent troubleshooting first
  const troubleshootResult = await autoTroubleshoot(reason, details);
  
  // Only restart if troubleshooting determines it's necessary
  if (troubleshootResult.needsRestart) {
    // Log recovery action
    console.error('\n========================================');
    console.error('🛑 AUTO-RESTART REQUIRED');
    console.error(`Reason: ${reason}`);
    console.error(`Recovery Count: ${watchdogState.recoveryCount}`);
    console.error(`Troubleshooting: ${troubleshootResult.fixes.length} fixes attempted`);
    console.error(`Details:`, details);
    console.error('========================================\n');
    
    // In production with PM2, this will trigger auto-restart
    // For development, we'll just log the action
    if (process.env.NODE_ENV === 'production') {
      setTimeout(() => {
        process.exit(1); // PM2 will restart the process
      }, 1000);
    } else {
      logEvent('warning', 'restart_simulated', 'Restart simulated (dev mode)');
    }
  } else {
    logEvent('info', 'recovery_without_restart', 'Issue resolved without restart', {
      fixesApplied: troubleshootResult.fixes.length
    });
  }
}

/**
 * Check event loop health
 */
function checkEventLoop() {
  const start = Date.now();
  
  setImmediate(() => {
    const latency = Date.now() - start;
    
    if (latency > WATCHDOG_CONFIG.eventLoopThreshold) {
      watchdogState.consecutiveFailures.eventLoop++;
      
      logEvent('warning', 'event_loop_lag', `Event loop lag detected: ${latency}ms`, { latency });
      
      if (watchdogState.consecutiveFailures.eventLoop >= WATCHDOG_CONFIG.maxConsecutiveFailures) {
        triggerRecovery('event_loop_blocked', { latency, threshold: WATCHDOG_CONFIG.eventLoopThreshold });
        watchdogState.consecutiveFailures.eventLoop = 0;
      }
    } else {
      watchdogState.consecutiveFailures.eventLoop = 0;
    }
  });
}

/**
 * Check network connectivity
 */
function checkNetwork() {
  dns.resolve(WATCHDOG_CONFIG.networkCheckDomain, (err) => {
    if (err) {
      watchdogState.consecutiveFailures.network++;
      
      logEvent('warning', 'network_check_failed', 'Network connectivity issue', { error: err.message });
      
      if (watchdogState.consecutiveFailures.network >= WATCHDOG_CONFIG.maxConsecutiveFailures) {
        triggerRecovery('network_down', { domain: WATCHDOG_CONFIG.networkCheckDomain, error: err.message });
        watchdogState.consecutiveFailures.network = 0;
      }
    } else {
      watchdogState.consecutiveFailures.network = 0;
    }
  });
}

/**
 * Check memory and CPU thresholds
 */
function checkResources() {
  updateHealthMetrics();
  
  const memory = healthStatus.metrics.memory;
  const cpu = healthStatus.metrics.cpu;
  
  // Check memory
  if (memory && memory.usagePercent > WATCHDOG_CONFIG.memoryThreshold) {
    watchdogState.consecutiveFailures.memory++;
    
    logEvent('warning', 'memory_high', `Memory usage: ${memory.usagePercent}%`, memory);
    
    if (watchdogState.consecutiveFailures.memory >= WATCHDOG_CONFIG.maxConsecutiveFailures) {
      triggerRecovery('memory_threshold_exceeded', memory);
      watchdogState.consecutiveFailures.memory = 0;
    }
  } else {
    watchdogState.consecutiveFailures.memory = 0;
  }
  
  // Check CPU
  if (cpu && cpu.utilization > WATCHDOG_CONFIG.cpuThreshold) {
    watchdogState.consecutiveFailures.cpu++;
    
    logEvent('warning', 'cpu_high', `CPU utilization: ${cpu.utilization}%`, cpu);
    
    if (watchdogState.consecutiveFailures.cpu >= WATCHDOG_CONFIG.maxConsecutiveFailures) {
      triggerRecovery('cpu_threshold_exceeded', cpu);
      watchdogState.consecutiveFailures.cpu = 0;
    }
  } else {
    watchdogState.consecutiveFailures.cpu = 0;
  }
}

/**
 * Main watchdog loop
 */
function runWatchdog() {
  if (!watchdogState.isRunning) return;
  
  try {
    checkEventLoop();
    checkNetwork();
    checkResources();
  } catch (err) {
    logEvent('error', 'watchdog_error', 'Watchdog check failed', { error: err.message, stack: err.stack });
  }
}

/**
 * Start watchdog monitoring
 */
function startWatchdog() {
  if (watchdogState.isRunning) {
    console.log('⚠️ Watchdog already running');
    return;
  }
  
  watchdogState.isRunning = true;
  watchdogState.intervalId = setInterval(runWatchdog, WATCHDOG_CONFIG.checkInterval);
  
  logEvent('info', 'watchdog_started', 'Watchdog monitoring started', {
    checkInterval: WATCHDOG_CONFIG.checkInterval,
    eventLoopThreshold: WATCHDOG_CONFIG.eventLoopThreshold,
    memoryThreshold: WATCHDOG_CONFIG.memoryThreshold,
    cpuThreshold: WATCHDOG_CONFIG.cpuThreshold
  });
  
  console.log('🐕 Watchdog started - monitoring server health');
}

/**
 * Stop watchdog monitoring
 */
function stopWatchdog() {
  if (!watchdogState.isRunning) {
    console.log('⚠️ Watchdog not running');
    return;
  }
  
  watchdogState.isRunning = false;
  
  if (watchdogState.intervalId) {
    clearInterval(watchdogState.intervalId);
    watchdogState.intervalId = null;
  }
  
  logEvent('info', 'watchdog_stopped', 'Watchdog monitoring stopped');
  
  console.log('🐕 Watchdog stopped');
}

/**
 * Get watchdog status
 */
function getWatchdogStatus() {
  return {
    isRunning: watchdogState.isRunning,
    consecutiveFailures: watchdogState.consecutiveFailures,
    lastRecovery: watchdogState.lastRecovery,
    recoveryCount: watchdogState.recoveryCount,
    recentLogs: watchdogState.logs.slice(-10),
    config: WATCHDOG_CONFIG
  };
}

/**
 * Attempt Stripe webhook reconnection
 */
function attemptWebhookReconnect() {
  logEvent('info', 'webhook_reconnect', 'Attempting Stripe webhook reconnection');
  
  // In production, re-verify webhook endpoint
  // For now, just log the attempt
  setTimeout(() => {
    logEvent('info', 'webhook_reconnect_complete', 'Webhook reconnection attempt complete');
  }, 1000);
}

module.exports = {
  startWatchdog,
  stopWatchdog,
  getWatchdogStatus,
  attemptWebhookReconnect,
  triggerRecovery,
  watchdogState,
  WATCHDOG_CONFIG
};
