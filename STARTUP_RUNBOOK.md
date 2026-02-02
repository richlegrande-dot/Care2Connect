# Care2Connect Startup Runbook

**Last Updated**: January 11, 2026  
**Purpose**: Fast reference for server startup, troubleshooting, and recovery procedures

---

## Quick Start Commands

### Development Mode
```powershell
# Option 1: PM2 with development config (recommended)
pm2 start ecosystem.dev.config.js
pm2 logs

# Option 2: Direct npm run
cd backend
npm run dev
```

### Production Mode
```powershell
# Build first
cd backend && npm run build
cd ../frontend && npm run build

# Start with PM2
pm2 start ecosystem.prod.config.js
pm2 save
pm2 startup
```

### Health Checks
```powershell
# Basic liveness
curl http://localhost:3001/health/live

# Full status
curl http://localhost:3001/health/status

# Database status
curl http://localhost:3001/health/db
```

---

## Preflight Diagnostics

### Startup Doctor (Non-Interactive)
Run before starting server to detect issues:

```powershell
cd backend
npx ts-node scripts/startup-doctor.ts
```

**Exit Codes**:
- `0`: Ready to start (or warnings only)
- `1`: Blocked by critical issues

**Checks Performed**:
- Node.js processes (potential conflicts)
- PM2 daemon state (zombie processes)
- Port availability (3000, 3001, 3003)
- Environment variables (DATABASE_URL, ASSEMBLYAI_API_KEY, etc.)
- Configuration consistency

---

## Common Failure States & Solutions

### 1. Server Won't Start - Port Occupied

**Symptoms**:
```
❌ PORT 3001 IS OCCUPIED!
Process using port: PID 12345
```

**Solutions**:
```powershell
# Check what's using the port
netstat -ano | findstr :3001

# Kill specific process
taskkill /F /PID 12345

# Or kill all Node processes (CAUTION!)
taskkill /F /IM node.exe

# Then restart
pm2 start ecosystem.dev.config.js
```

---

### 2. PM2 Processes Show "Online" but Server Not Responding

**Symptoms**:
- `pm2 status` shows processes online
- Health endpoints return "connection refused"
- Process memory shows 0b

**Root Cause**: Zombie PM2 processes (stale daemon state)

**Solution**:
```powershell
# Use the PM2 reset script
.\scripts\pm2-reset.ps1

# Or manual reset
pm2 kill
pm2 delete all
pm2 start ecosystem.dev.config.js
```

**Nuclear Option** (if above fails):
```powershell
.\scripts\pm2-reset.ps1 -KillNode
```

---

### 3. Multiple Node.js Processes Running

**Symptoms**:
- `tasklist | findstr node.exe` shows multiple processes
- Random port conflicts
- Server starts on unexpected ports

**Solution**:
```powershell
# Check running processes
tasklist | findstr node.exe

# Run startup doctor to identify conflicts
npx ts-node backend\scripts\startup-doctor.ts

# Clean slate
.\scripts\pm2-reset.ps1 -KillNode -RestartConfig ecosystem.dev.config.js
```

---

### 4. Background Services Not Starting

**Symptoms**:
```
⏸️ Background services disabled (test/stable mode or explicit override)
```

**Cause**: `START_BACKGROUND_SERVICES=false` or `V1_STABLE=true` without explicit enable

**Solution**:
```powershell
# Check current setting
echo $env:START_BACKGROUND_SERVICES

# Enable for current session
$env:START_BACKGROUND_SERVICES = "true"
pm2 restart all

# Or update backend/.env permanently
# START_BACKGROUND_SERVICES=true
```

**Background Services Include**:
- Health check scheduler
- Database watchdog
- Health monitor
- Tunnel keepalive ping

---

### 5. Port Mismatch (Backend vs Frontend)

**Symptoms**:
```
⚠️ PORT CONFIGURATION WARNING:
Backend port: 3001
Frontend API URL: http://localhost:3003
```

**Solution**:
```powershell
# Update frontend/.env
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Restart frontend
pm2 restart careconnect-frontend-dev
```

---

### 6. Database Connection Failure

**Symptoms**:
```
🚨 DATABASE STARTUP GATE FAILED
Server cannot start without valid database connection
```

**Solutions**:

**Check DATABASE_URL**:
```powershell
# In backend/.env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

**Test connection manually**:
```powershell
cd backend
npx prisma db pull
```

**Fallback to local database**:
```powershell
# Start local PostgreSQL with Docker
docker compose -f docker-compose.demo.yml up -d postgres

# Update backend/.env
DB_MODE=local
DATABASE_URL="postgresql://care2:care2@localhost:5432/care2system"
```

---

### 7. Environment Variables Not Loading

**Symptoms**:
- Server starts but features don't work
- "API key not configured" errors

**Solution**:
```powershell
# Verify .env file exists
ls backend\.env

# Check if variables are loaded (run startup doctor)
npx ts-node backend\scripts\startup-doctor.ts

# Source .env manually for testing
Get-Content backend\.env | ForEach-Object {
  if ($_ -match '^([^#].+?)=(.+)$') {
    $name = $matches[1].Trim()
    $value = $matches[2].Trim()
    [Environment]::SetEnvironmentVariable($name, $value, "Process")
  }
}
```

---

## Configuration Files Reference

### PM2 Configs
| File | Purpose | Background Services | Port |
|------|---------|---------------------|------|
| `ecosystem.dev.config.js` | Local development | Disabled | 3001 |
| `ecosystem.prod.config.js` | Production deployment | Enabled | 3001 |
| `ecosystem.config.js` | Legacy (deprecated) | Default | 3001 |

### Environment Variables (Critical)

**Always Required**:
- `DATABASE_URL`: PostgreSQL connection string

**V1 Zero-OpenAI Mode** (AI_PROVIDER=rules):
- `ASSEMBLYAI_API_KEY`: Transcription service
- `V1_STABLE=true`
- `ZERO_OPENAI_MODE=true`
- `AI_PROVIDER=rules`

**Production Mode** (AI_PROVIDER=openai):
- `OPENAI_API_KEY`: GPT analysis
- `STRIPE_SECRET_KEY`: Payment processing
- `STRIPE_PUBLISHABLE_KEY`: Client-side Stripe

### Port Configuration
```bash
# Preferred (explicit)
BACKEND_PORT=3001

# Legacy fallback
PORT=3001

# Strict mode (exit if port occupied)
STRICT_PORT_MODE=true

# Allow port failover (development)
STRICT_PORT_MODE=false
PORT_FAILOVER_RANGE=5
```

---

## Advanced Troubleshooting

### Check Server Logs
```powershell
# All logs
pm2 logs

# Backend only
pm2 logs careconnect-backend-dev

# Last 50 lines
pm2 logs --lines 50

# Follow live
pm2 logs --lines 0
```

### Check Health Endpoints
```powershell
# Liveness (always responds)
Invoke-WebRequest http://localhost:3001/health/live | ConvertFrom-Json

# Full status (service checks)
Invoke-WebRequest http://localhost:3001/health/status | ConvertFrom-Json

# Database health
Invoke-WebRequest http://localhost:3001/health/db | ConvertFrom-Json
```

### Verify Services
```powershell
# PM2 status
pm2 status

# Process details
pm2 describe careconnect-backend-dev

# Monitor resources
pm2 monit
```

### Check Ports
```powershell
# List all listening ports
netstat -ano | findstr LISTENING

# Check specific port
netstat -ano | findstr :3001

# Identify process by PID
tasklist | findstr "PID"
```

---

## Recovery Procedures

### Procedure 1: Soft Reset (Preferred)
```powershell
pm2 restart all
pm2 logs --lines 20
```

### Procedure 2: Clean PM2 Reset
```powershell
.\scripts\pm2-reset.ps1
pm2 start ecosystem.dev.config.js
```

### Procedure 3: Hard Reset (Nuclear Option)
```powershell
.\scripts\pm2-reset.ps1 -KillNode
npx ts-node backend\scripts\startup-doctor.ts
pm2 start ecosystem.dev.config.js
pm2 save
```

### Procedure 4: Database Recovery
```powershell
# Test connection
cd backend
npx prisma db pull

# Reset schema (DESTRUCTIVE!)
npx prisma migrate reset

# Push latest schema
npx prisma db push

# Regenerate client
npx prisma generate
```

---

## Prevention Best Practices

### Before Starting Server
1. **Run startup doctor**: `npx ts-node backend\scripts\startup-doctor.ts`
2. **Check PM2 status**: `pm2 status`
3. **Verify .env files**: Ensure `backend/.env` and `frontend/.env` exist
4. **Check ports**: Ensure 3000 and 3001 are free

### During Development
1. Use **ecosystem.dev.config.js** for consistent environment
2. Keep **one PM2 config active** at a time
3. Monitor logs regularly: `pm2 logs`
4. Run health checks after changes: `curl http://localhost:3001/health/status`

### When Switching Modes
```powershell
# From dev to prod
pm2 delete all
cd backend && npm run build
pm2 start ecosystem.prod.config.js

# From prod to dev
pm2 delete all
pm2 start ecosystem.dev.config.js
```

---

## Emergency Contacts & Resources

### Key Files
- **Startup Doctor**: `backend/scripts/startup-doctor.ts`
- **PM2 Reset**: `scripts/pm2-reset.ps1`
- **Port Config**: `backend/src/utils/portConfig.ts`
- **Background Services**: `backend/src/utils/backgroundServices.ts`

### Health Endpoints
- Liveness: `http://localhost:3001/health/live`
- Status: `http://localhost:3001/health/status`
- Database: `http://localhost:3001/health/db`
- Admin Portal: `http://localhost:3001/admin` (password: admin2024)

### Quick Diagnostics
```powershell
# One-liner health check
curl http://localhost:3001/health/live

# One-liner process check
pm2 jlist | ConvertFrom-Json | Select-Object name, pid, status, pm2_env

# One-liner port check
netstat -ano | findstr ":3000 :3001"
```

---

## Changelog

**2026-01-11**:
- Added startup doctor diagnostics
- Implemented background services gating
- Added port configuration validation
- Separated dev/prod PM2 configs
- Created PM2 reset script
- Fixed OpenAI health status in V1 mode
