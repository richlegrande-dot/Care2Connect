# Self-Healing & Troubleshooting System

## Overview

The Care2system now includes intelligent self-healing capabilities that automatically detect and fix common issues without manual intervention.

## Quick Start

### Option 1: Start Everything Fresh
```powershell
.\start-all-services.ps1
```
Starts database, backend, frontend, and tunnel in correct order with health checks.

### Option 2: Enable Continuous Self-Healing
```powershell
.\self-healing.ps1 -Mode FullAuto
```
Monitors all services every 30 seconds and automatically restarts failed components.

### Option 3: Monitor Only (No Auto-Fix)
```powershell
.\self-healing.ps1 -Mode Monitor
```
Reports health status but doesn't make changes.

### Option 4: One-Time Fix
```powershell
.\self-healing.ps1 -Mode Fix
```
Checks health once and fixes issues, then exits.

## Features

### 🔍 Health Monitoring

**Backend (Port 3001)**
- Checks if port is listening
- Verifies HTTP health endpoint responds
- Validates process is alive
- Detects crashes and hangs

**Frontend (Port 3000)**
- Checks if port is listening
- Verifies correct content is served
- Detects wrong service on port
- Validates "Your Story Matters" appears

**Cloudflare Tunnel**
- Checks cloudflared process running
- Verifies tunnel configuration exists
- Tests DNS resolution
- Monitors tunnel connectivity

**PostgreSQL Database**
- Checks Docker container status
- Verifies database is responding
- Detects Docker Desktop issues

### 🔧 Automatic Healing

When issues are detected, the system automatically:

1. **Stops problematic processes** - Cleanly terminates stuck or crashed services
2. **Cleans up resources** - Frees ports and removes orphaned processes
3. **Restarts services** - Launches fresh instances with proper configuration
4. **Verifies fixes** - Confirms services are healthy after restart
5. **Purges cache** - Automatically clears Cloudflare cache when services restart
6. **Logs actions** - Records all healing activities to `self-healing.log`

### 🛡️ Safety Features

**Restart Throttling**
- Maximum 3 restarts per service within 5 minutes
- Prevents restart loops
- Requires manual intervention if threshold exceeded

**Comprehensive Logging**
- All actions logged to file
- Console output with color coding
- Timestamps for debugging
- Job output captured for errors

## Usage Examples

### Full Automation (Recommended for Production)
```powershell
# Start in background with continuous monitoring
Start-Job -ScriptBlock { 
    cd C:\Users\richl\Care2system
    .\self-healing.ps1 -Mode FullAuto 
}
```

### Custom Check Interval
```powershell
# Check every 60 seconds instead of default 30
.\self-healing.ps1 -Mode FullAuto -CheckIntervalSeconds 60
```

### Verbose Mode
```powershell
# Show detailed health checks even when everything is OK
.\self-healing.ps1 -Mode FullAuto -Verbose
```

### View Logs
```powershell
# Real-time log monitoring
Get-Content .\self-healing.log -Wait -Tail 20

# Search for errors
Select-String "ERROR" .\self-healing.log | Select-Object -Last 10
```

## Configuration

Edit `self-healing.ps1` to customize:

```powershell
$Config = @{
    BackendPort = 3001              # Backend service port
    FrontendPort = 3000             # Frontend service port
    TunnelId = "07e7c160..."        # Cloudflare tunnel ID
    MaxRestartAttempts = 3          # Max restarts before pausing
    RestartCooldownMinutes = 5      # Cooldown period for restart throttling
}
```

## Common Scenarios

### Scenario 1: Service Crashed
```
[ERROR] Backend: Port 3001 not listening
[HEAL] Stopping existing backend process
[HEAL] Starting backend service...
[SUCCESS] Backend successfully healed and running
```

### Scenario 2: Wrong Content on Port
```
[ERROR] Frontend serving backend content (wrong service on port)
[HEAL] Stopping existing frontend process
[HEAL] Starting frontend service...
[SUCCESS] Frontend successfully healed and running
[HEAL] Purging Cloudflare cache: Service Frontend was restarted
```

### Scenario 3: Tunnel Disconnected
```
[ERROR] Tunnel: Cloudflared process not running
[HEAL] Creating tunnel configuration...
[HEAL] Starting cloudflared tunnel...
[SUCCESS] Tunnel successfully healed and running
```

### Scenario 4: Too Many Restarts
```
[ERROR] Service Backend restarted 3 times in last 5 minutes - PAUSING auto-restart
[ERROR] Manual intervention required for Backend
```
This prevents restart loops. Check logs to diagnose root cause.

## Integration with Cloudflare Cache

When backend or frontend services are restarted, the system automatically:

1. Purges Cloudflare cache (if API configured)
2. Ensures public URLs serve fresh content
3. Prevents stale cached content from appearing

**Setup Cloudflare API** (optional but recommended):
```powershell
.\setup-cloudflare-env.ps1
```

## Troubleshooting

### Self-Healing Script Won't Start
```powershell
# Check execution policy
Get-ExecutionPolicy
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Verify file exists
Test-Path .\self-healing.ps1
```

### Services Keep Restarting
```powershell
# Check recent logs for root cause
Select-String "ERROR" .\self-healing.log | Select-Object -Last 20

# Run one-time fix to see detailed output
.\self-healing.ps1 -Mode Fix -Verbose
```

### Database Issues
```powershell
# Check Docker status
docker ps -a

# Restart database manually
docker compose -f docker-compose.demo.yml up -d postgres

# View database logs
docker logs care2system-postgres-1 --tail 50
```

### Tunnel Configuration Issues
```powershell
# Verify config file
Get-Content C:\Users\richl\.cloudflared\config.yml

# Recreate config
.\self-healing.ps1 -Mode Fix
```

## Best Practices

1. **Always use start-all-services.ps1** for initial startup
2. **Enable FullAuto mode** for long-running deployments
3. **Monitor logs regularly** to catch patterns
4. **Set up Cloudflare API** for automatic cache purging
5. **Review self-healing.log** after incidents
6. **Adjust check intervals** based on your needs (shorter = faster detection, more CPU)

## Architecture

```
┌─────────────────────────────────────────────────┐
│         Self-Healing Service (FullAuto)         │
│  ┌───────────────────────────────────────────┐  │
│  │  Every 30s: Health Check All Services     │  │
│  └───────────────────────────────────────────┘  │
│                       │                          │
│                       ▼                          │
│  ┌───────────────────────────────────────────┐  │
│  │   Issues Detected?                        │  │
│  │   • Backend not responding                │  │
│  │   • Frontend wrong content                │  │
│  │   • Tunnel disconnected                   │  │
│  │   • Database stopped                      │  │
│  └───────────────────────────────────────────┘  │
│                       │                          │
│                       ▼                          │
│  ┌───────────────────────────────────────────┐  │
│  │  Automatic Healing Actions                │  │
│  │  1. Stop problematic process              │  │
│  │  2. Clean up resources                    │  │
│  │  3. Restart service                       │  │
│  │  4. Verify health                         │  │
│  │  5. Purge cache (if needed)               │  │
│  │  6. Log actions                           │  │
│  └───────────────────────────────────────────┘  │
│                       │                          │
│                       ▼                          │
│  ┌───────────────────────────────────────────┐  │
│  │  Success: Continue monitoring              │  │
│  │  Failure: Log error, retry with throttle   │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Files

- **self-healing.ps1** - Main self-healing service script
- **start-all-services.ps1** - Clean startup script for all services
- **purge-cloudflare-cache.ps1** - Manual cache purging
- **setup-cloudflare-env.ps1** - One-time Cloudflare API setup
- **self-healing.log** - Detailed log of all actions (auto-created)

## Support

If you encounter issues:

1. Check `self-healing.log` for recent errors
2. Run `.\self-healing.ps1 -Mode Fix -Verbose` for detailed diagnosis
3. Verify all paths in configuration match your system
4. Ensure Docker Desktop is running for database
5. Check Cloudflare tunnel credentials exist

## Version History

**v1.0** - Initial release
- Automatic service restart
- Health monitoring for all components
- Cloudflare cache integration
- Restart throttling
- Comprehensive logging
