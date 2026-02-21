# Port Standardization Guide
## Date: January 10, 2026

---

## 🎯 OVERVIEW

Backend MUST bind to **port 3001** reliably. No silent port switching during V1 manual testing.

---

## 🔧 CONFIGURATION

### Environment Variables

```bash
# Required
PORT=3001

# Optional - Strict mode (recommended for development)
STRICT_PORT_MODE=true

# Optional - Allow port failover (production only)
PORT_FAILOVER_RANGE=20
```

### Strict Port Mode

**When enabled (`STRICT_PORT_MODE=true`):**
- ✅ Server MUST bind to exact port specified in `PORT`
- ❌ NO automatic port switching if port is occupied
- 🛑 Server exits with error if port unavailable
- 📋 Clear error message with troubleshooting steps

**When disabled (production):**
- ⚠️ Server tries ports 3001-3021 (PORT + FAILOVER_RANGE)
- ✅ Binds to first available port
- ⚠️ Logs warning if not using requested port

### Default Behavior

- **Development:** Strict mode ON by default
- **Production:** Failover enabled by default

---

## 🚀 USAGE

### Before Starting Server

**Check if port 3001 is available:**

```powershell
# Run port check script
.\scripts\check-port.ps1

# Or check specific port
.\scripts\check-port.ps1 -Port 3002
```

**Expected output if available:**
```
🔍 Checking if port 3001 is available...
✅ Port 3001 is available!

Ready to start backend on port 3001
```

**Expected output if occupied:**
```
🔍 Checking if port 3001 is available...

❌ PORT CONFLICT DETECTED!

Port 3001 is already in use.

📊 Process Information:
   Process Name: node
   Process ID (PID): 12345
   Started: 1/10/2026 10:30:15 AM
   State: Listen

🔧 Solutions:
   Option 1: Stop the conflicting process
      Stop-Process -Id 12345 -Force

   Option 2: Use a different port
      Set PORT=3002 in .env

   Option 3: Kill all Node processes
      Get-Process node | Stop-Process -Force
```

### Starting Server

**Method 1: With Pre-Check (Recommended)**

```powershell
# Check port first
.\scripts\check-port.ps1

# Then start server
cd backend
npm start
```

**Method 2: Direct Start (Strict Mode)**

```powershell
cd backend

# Set strict mode
$env:STRICT_PORT_MODE="true"

# Start server
npm start
```

If port 3001 is occupied, server will exit with:
```
❌ PORT 3001 IS OCCUPIED!
   Run: .\scripts\check-port.ps1 3001
   to identify the conflicting process.
```

### Verifying Port

**Check health endpoint:**

```powershell
curl http://localhost:3001/health/live
```

**Response:**
```json
{
  "status": "alive",
  "port": {
    "configured": "3001",
    "actual": "3001",
    "mismatch": false
  },
  "pid": 12345,
  "uptime": 45.2
}
```

**If port mismatch (failover occurred):**
```json
{
  "status": "alive",
  "port": {
    "configured": "3001",
    "actual": "3002",
    "mismatch": true
  },
  "warning": "Server is running on a different port than configured",
  "pid": 12345,
  "uptime": 45.2
}
```

---

## 🔍 TROUBLESHOOTING

### Problem: Port 3001 is Occupied

**Solution 1: Identify and stop the process**

```powershell
# Check what's using port 3001
.\scripts\check-port.ps1

# Stop the specific process
Stop-Process -Id <PID> -Force

# Or kill all node processes
Get-Process node | Stop-Process -Force
```

**Solution 2: Use a different port**

```bash
# Update .env
PORT=3002

# Update frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### Problem: Server Starts on Wrong Port

**Cause:** Strict mode is disabled

**Solution:**

```bash
# Enable strict mode in .env
STRICT_PORT_MODE=true

# Or set in PowerShell
$env:STRICT_PORT_MODE="true"

# Restart server
npm start
```

### Problem: Frontend Can't Connect to Backend

**Check 1: Verify backend port**

```powershell
curl http://localhost:3001/health/live
```

**Check 2: Verify frontend API URL**

```bash
# frontend/.env.local should have:
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Check 3: Check for port mismatch**

```powershell
# Get actual port from health endpoint
curl http://localhost:3001/health/live | Select-Object -ExpandProperty port
```

---

## 📋 BEST PRACTICES

### For Development

1. **Always use port 3001** for backend
2. **Enable strict mode** to catch port conflicts early
3. **Run port check** before starting server
4. **Never commit** different port numbers to .env.example

### For Production

1. **Use port failover** for resilience
2. **Monitor health endpoint** for port mismatches
3. **Set up alerts** if actual port != configured port
4. **Document** any non-standard port usage

### For Testing

1. **Use consistent ports** across all test environments
2. **Backend:** 3001
3. **Frontend:** 3000
4. **Test DB:** 5433 (if using Docker)

---

## 🚨 COMMON MISTAKES

### ❌ DON'T: Silently switch ports without logging

```typescript
// Bad
server.listen(port++);
```

### ✅ DO: Log warnings and prefer strict mode

```typescript
// Good
if (strictMode && portOccupied) {
  console.error(`Port ${port} is occupied!`);
  process.exit(1);
}
```

### ❌ DON'T: Hardcode ports in frontend

```typescript
// Bad
const API_URL = 'http://localhost:3001';
```

### ✅ DO: Use environment variables

```typescript
// Good
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

---

## 📊 MONITORING

### Health Check Integration

The `/health/live` endpoint now reports port information:

```typescript
{
  port: {
    configured: "3001",  // From PORT env var
    actual: "3001",      // Actual bound port
    mismatch: false      // True if different
  },
  warning: undefined     // Set if mismatch detected
}
```

### Alerting

Set up monitoring to alert when:
- `port.mismatch === true`
- Server is running on unexpected port
- Multiple instances on different ports

---

## 🔗 RELATED FILES

- `backend/src/server.ts` - Port binding logic with strict mode
- `backend/src/routes/health.ts` - Health endpoint with port reporting
- `scripts/check-port.ps1` - Port availability checker
- `backend/.env.example` - Example configuration

---

## 📝 CHANGELOG

**January 10, 2026:**
- ✅ Added `STRICT_PORT_MODE` environment variable
- ✅ Created `scripts/check-port.ps1` tool
- ✅ Updated health endpoint to report port mismatch
- ✅ Enhanced error messages for port conflicts
- ✅ Documented best practices and troubleshooting

---

## 🎓 QUICK REFERENCE

```powershell
# Check port availability
.\scripts\check-port.ps1

# Start with strict mode
$env:STRICT_PORT_MODE="true"; npm start

# Check health
curl http://localhost:3001/health/live

# Kill conflicting process
Stop-Process -Id <PID> -Force

# Use different port
PORT=3002 npm start
```

---

**Status:** ✅ Implemented  
**Last Updated:** January 10, 2026
