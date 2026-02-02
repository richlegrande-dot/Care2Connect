# Auto-Healing & Health Monitoring System

## Overview

The CareConnect backend now includes a robust **auto-healing watchdog system** that monitors server health and automatically recovers from common failure scenarios without manual intervention.

## Features

### 1. Health Monitoring
- **Real-time metrics**: Memory, CPU, uptime tracking
- **Event loop monitoring**: Detects blocking operations
- **Network connectivity**: Checks DNS resolution
- **Resource thresholds**: Configurable memory/CPU limits

### 2. Auto-Recovery
- **Automatic restarts**: Graceful recovery on critical failures
- **Memory cleanup**: Triggers garbage collection before restart
- **Cache clearing**: Removes stale data
- **Cooldown periods**: Prevents restart loops

### 3. Failure Detection
- **Event loop blocking** (>250ms lag)
- **Network connectivity loss**
- **Memory threshold exceeded** (>90%)
- **CPU overload** (>95%)
- **Consecutive failure tracking** (3 failures trigger recovery)

## Endpoints

### `/health` - Comprehensive Health Check
Returns detailed server health metrics:
```json
{
  "status": "ok",
  "uptime": 3600,
  "timestamp": 1733299200000,
  "server": {
    "nodeVersion": "v18.17.0",
    "platform": "win32",
    "arch": "x64",
    "pid": 12345
  },
  "metrics": {
    "memory": {
      "total": 16384,
      "used": 8192,
      "free": 8192,
      "usagePercent": 50
    },
    "cpu": {
      "loadAverage1m": "0.50",
      "loadAverage5m": "0.45",
      "loadAverage15m": "0.40",
      "cpuCount": 8,
      "utilization": 6
    }
  },
  "issues": []
}
```

### `/ping` - Lightweight Ping
Quick availability check:
```json
{
  "status": "ok",
  "timestamp": 1733299200000
}
```

### `/api/admin/watchdog` - Watchdog Status
Admin-only endpoint showing watchdog state:
```json
{
  "isRunning": true,
  "consecutiveFailures": {
    "eventLoop": 0,
    "network": 0,
    "memory": 0,
    "cpu": 0
  },
  "lastRecovery": null,
  "recoveryCount": 0,
  "recentLogs": [],
  "config": {
    "checkInterval": 5000,
    "eventLoopThreshold": 250,
    "memoryThreshold": 90,
    "cpuThreshold": 95
  }
}
```

## Configuration

### Watchdog Thresholds (watchdog.js)
```javascript
const WATCHDOG_CONFIG = {
  checkInterval: 5000,              // Check every 5 seconds
  eventLoopThreshold: 250,          // Event loop lag threshold (ms)
  memoryThreshold: 90,              // Memory usage threshold (%)
  cpuThreshold: 95,                 // CPU usage threshold (%)
  networkCheckDomain: 'google.com', // Domain for connectivity check
  maxConsecutiveFailures: 3,        // Failures before recovery
  cooldownPeriod: 30000            // Cooldown after recovery (ms)
};
```

## PM2 Integration

### Install PM2
```bash
npm install --save-dev pm2
# or globally
npm install -g pm2
```

### Start with PM2
```bash
# Start in production mode
npm run pm2:start

# View logs
npm run pm2:logs

# Check status
npm run pm2:status

# Restart
npm run pm2:restart

# Stop
npm run pm2:stop
```

### PM2 Configuration (ecosystem.config.json)
- **Auto-restart**: Yes
- **Max restarts**: 10
- **Restart delay**: Exponential backoff (2-4 seconds)
- **Memory limit**: 500MB (restarts if exceeded)
- **Min uptime**: 10 seconds before considered stable

## Development vs Production

### Development Mode
- Watchdog logs recovery actions but **does not restart**
- Allows debugging without process interruption
- Full error stack traces visible

### Production Mode (`NODE_ENV=production`)
- Watchdog **automatically restarts** on critical failures
- PM2 manages process lifecycle
- Graceful shutdown on SIGTERM/SIGINT

## Error Handling

### Uncaught Exceptions
```javascript
process.on('uncaughtException', (err) => {
  // Logs error
  // Attempts Stripe webhook reconnection if Stripe-related
  // Exits gracefully after 5 seconds (PM2 restarts)
});
```

### Unhandled Promise Rejections
```javascript
process.on('unhandledRejection', (reason) => {
  // Logs rejection
  // Attempts webhook reconnection if Stripe-related
  // Continues running (watchdog monitors)
});
```

### Graceful Shutdown
```javascript
process.on('SIGTERM', () => {
  // Stops watchdog
  // Closes server
  // Exits cleanly
  // 10-second timeout for forced shutdown
});
```

## Monitoring & Logs

### Console Output
```
🐕 Watchdog started - monitoring server health
ℹ️ [Watchdog] watchdog_started: Watchdog monitoring started
⚠️ [Watchdog] event_loop_lag: Event loop lag detected: 350ms
🛑 [Watchdog] recovery_triggered: Recovery initiated: event_loop_blocked
```

### Log Levels
- **info** ℹ️: Normal operations
- **warning** ⚠️: Threshold exceeded
- **error** 🛑: Recovery triggered

### Recent Logs API
Last 10 watchdog events available via `/api/admin/watchdog`:
```json
{
  "recentLogs": [
    {
      "timestamp": "2025-12-04T10:30:00.000Z",
      "level": "warning",
      "type": "event_loop_lag",
      "message": "Event loop lag detected: 350ms",
      "details": { "latency": 350 }
    }
  ]
}
```

## Recovery Actions

When a failure is detected:

1. **Log Event**: Record failure type and details
2. **Check Cooldown**: Skip if recently recovered
3. **Memory Cleanup**: Trigger garbage collection (if available)
4. **Clear Caches**: Remove stale in-memory data
5. **Restart Process**: Exit with code 1 (PM2 restarts)

### Cooldown Period
- **Duration**: 30 seconds default
- **Purpose**: Prevents restart loops
- **Behavior**: Logs skipped recovery attempts

## Testing

### Test Event Loop Blocking
```javascript
// Block event loop for 300ms
const start = Date.now();
while (Date.now() - start < 300) {}
```

### Test Memory Threshold
```javascript
// Allocate large arrays
const bigArray = new Array(1000000).fill('test');
```

### Test Network Failure
```bash
# Disconnect network temporarily
# Watchdog will detect after 3 consecutive failures (15 seconds)
```

## Best Practices

### Production Deployment
1. Use PM2 for process management
2. Set `NODE_ENV=production`
3. Monitor PM2 logs: `pm2 logs careconnect`
4. Set up PM2 startup script: `pm2 startup`
5. Save PM2 process list: `pm2 save`

### Health Check Integration
- **Load balancers**: Point health checks to `/ping`
- **Monitoring tools**: Use `/health` for detailed metrics
- **Alerting**: Monitor `/api/admin/watchdog` for recovery counts

### Memory Management
- Run Node with `--expose-gc` flag for manual GC
- PM2 auto-enables this in production
- Set memory limits in ecosystem.config.json

## Troubleshooting

### Watchdog Not Starting
```bash
# Check logs for errors
npm run pm2:logs

# Verify Node version (>=14.0.0)
node -v

# Check file permissions
ls -la health.js watchdog.js
```

### Frequent Restarts
```bash
# Check recent logs
curl http://localhost:3001/api/admin/watchdog

# Increase thresholds in watchdog.js
# Or optimize code causing failures
```

### Memory Leaks
```bash
# Monitor memory over time
pm2 monit

# Enable heap snapshot in ecosystem.config.json
# Analyze with Chrome DevTools
```

## Architecture

```
┌─────────────────────────────────────────┐
│         Express Server (server.js)       │
│  - Routes & Controllers                  │
│  - Stripe Integration                    │
│  - File Uploads                          │
└─────────────┬───────────────────────────┘
              │
              ├─────────────┐
              │             │
      ┌───────▼──────┐  ┌──▼────────────┐
      │  health.js   │  │  watchdog.js  │
      │              │  │               │
      │ - /health    │  │ - Event Loop  │
      │ - /ping      │  │ - Network     │
      │ - Metrics    │  │ - Resources   │
      └──────────────┘  │ - Recovery    │
                        └───────────────┘
                             │
                    ┌────────▼─────────┐
                    │   PM2 Manager    │
                    │  - Auto Restart  │
                    │  - Monitoring    │
                    │  - Log Rotation  │
                    └──────────────────┘
```

## Future Enhancements

- [ ] Slack/email notifications on recovery
- [ ] Prometheus metrics export
- [ ] Database connection pool monitoring
- [ ] Stripe webhook health verification
- [ ] Redis cache health checks
- [ ] Custom recovery strategies per failure type

## Support

For issues or questions:
- Check logs: `npm run pm2:logs`
- Review watchdog status: `curl http://localhost:3001/api/admin/watchdog`
- Consult PM2 docs: https://pm2.keymetrics.io/docs/usage/quick-start/
