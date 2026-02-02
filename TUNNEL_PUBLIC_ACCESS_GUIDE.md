# Cloudflare Tunnel Setup & Public Access Guide
## Date: January 10, 2026

---

## 🎯 OVERVIEW

This guide provides two options for public access to Care2system:

1. **Option A:** Cloudflare Tunnel (Recommended for production)
2. **Option B:** ngrok (Quick alternative for testing/demos)

---

## OPTION A: CLOUDFLARE TUNNEL SETUP

### Prerequisites

- Cloudflare account with domain configured
- `cloudflared` CLI installed
- Domain DNS managed by Cloudflare

### Step 1: Install cloudflared

```powershell
# Download cloudflared for Windows
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"

# Move to a permanent location
Move-Item cloudflared.exe "C:\Program Files\cloudflared\cloudflared.exe"

# Add to PATH
$env:Path += ";C:\Program Files\cloudflared"

# Verify installation
cloudflared --version
```

### Step 2: Authenticate with Cloudflare

```powershell
# Login to Cloudflare
cloudflared tunnel login

# This opens a browser to authorize
# Select your domain (e.g., care2connects.org)
```

**Result:** Creates `~/.cloudflared/cert.pem`

### Step 3: Create a Tunnel

```powershell
# Create a named tunnel
cloudflared tunnel create care2system

# Note the Tunnel ID from output (e.g., 12345678-1234-1234-1234-123456789abc)
```

**Result:** Creates tunnel credentials in `~/.cloudflared/<tunnel-id>.json`

### Step 4: Configure DNS

```powershell
# Route subdomain to tunnel
cloudflared tunnel route dns care2system app.care2connects.org

# Or use Cloudflare dashboard:
# 1. Go to DNS settings
# 2. Add CNAME record:
#    Name: app
#    Target: <tunnel-id>.cfargotunnel.com
#    Proxy status: Proxied
```

### Step 5: Create Configuration File

Create `C:\Users\<your-user>\.cloudflared\config.yml`:

```yaml
tunnel: <your-tunnel-id>
credentials-file: C:\Users\<your-user>\.cloudflared\<tunnel-id>.json

ingress:
  # Route public domain to local backend
  - hostname: app.care2connects.org
    service: http://localhost:3001
  
  # Catch-all rule (required)
  - service: http_status:404
```

### Step 6: Test the Tunnel

```powershell
# Start backend locally
cd backend
npm start

# In another terminal, start tunnel
cloudflared tunnel run care2system

# Test public access
curl https://app.care2connects.org/health/live
```

### Step 7: Run as Windows Service (Production)

```powershell
# Install as service
cloudflared service install

# Start service
Start-Service cloudflared

# Verify service is running
Get-Service cloudflared
```

### Environment Variables

Add to `backend/.env`:

```bash
CLOUDFLARE_TUNNEL_ID=<your-tunnel-id>
CLOUDFLARE_API_TOKEN=<your-api-token>
CLOUDFLARE_ZONE_ID=<your-zone-id>
CLOUDFLARE_DOMAIN=care2connects.org
```

---

## OPTION B: NGROK SETUP (Quick Alternative)

ngrok provides quick temporary public URLs for testing and demos.

### Step 1: Install ngrok

```powershell
# Download and install from ngrok.com
# Or use Chocolatey
choco install ngrok

# Verify installation
ngrok version
```

### Step 2: Configure ngrok

```powershell
# Sign up at ngrok.com and get auth token
ngrok config add-authtoken <your-auth-token>
```

### Step 3: Start Tunnel

```powershell
# Start backend first
cd backend
npm start

# In another terminal, create tunnel to port 3001
ngrok http 3001

# ngrok will display a public URL like:
# https://abc123.ngrok-free.app -> http://localhost:3001
```

### Step 4: Update Frontend Configuration

Update `frontend/.env.local`:

```bash
# Use the ngrok URL
NEXT_PUBLIC_API_URL=https://abc123.ngrok-free.app
```

### Step 5: Test Public Access

```powershell
# Test the public URL
curl https://abc123.ngrok-free.app/health/live

# Test from any device
# Open browser: https://abc123.ngrok-free.app/health/live
```

### Step 6: Custom Domain (Paid Feature)

```powershell
# With ngrok Pro/Enterprise
ngrok http 3001 --domain=app.care2connects.org
```

---

## 🔍 TROUBLESHOOTING

### Cloudflare Tunnel Issues

#### Issue 1: Tunnel Not Starting

**Check credentials file exists:**
```powershell
Test-Path "$env:USERPROFILE\.cloudflared\<tunnel-id>.json"
```

**Solution:** Re-run authentication
```powershell
cloudflared tunnel login
cloudflared tunnel create care2system
```

#### Issue 2: DNS Not Resolving

**Check DNS propagation:**
```powershell
nslookup app.care2connects.org
```

**Solution:** Wait 5-10 minutes for DNS propagation, or flush DNS:
```powershell
ipconfig /flushdns
```

#### Issue 3: Connection Timeout

**Check tunnel is running:**
```powershell
cloudflared tunnel info care2system
```

**Check backend is running:**
```powershell
curl http://localhost:3001/health/live
```

**Solution:** Ensure both backend and tunnel are running

#### Issue 4: 502 Bad Gateway

**Cause:** Backend not running or wrong port

**Solution:**
```powershell
# Verify backend port
curl http://localhost:3001/health/live

# Check config.yml has correct port
Get-Content "$env:USERPROFILE\.cloudflared\config.yml"
```

### ngrok Issues

#### Issue 1: "Failed to listen on localhost:3001"

**Cause:** Backend not running

**Solution:**
```powershell
# Start backend first
cd backend
npm start

# Then start ngrok
ngrok http 3001
```

#### Issue 2: "ERR_NGROK_108"

**Cause:** Authentication token not configured

**Solution:**
```powershell
ngrok config add-authtoken <your-token>
```

#### Issue 3: URL Changes Every Restart

**Cause:** Free tier doesn't have static URLs

**Solutions:**
- Option 1: Pay for ngrok Pro (static domains)
- Option 2: Use Cloudflare Tunnel instead
- Option 3: Update frontend .env.local after each restart

---

## 🎯 COMPARISON

| Feature | Cloudflare Tunnel | ngrok |
|---------|-------------------|-------|
| **Free Tier** | ✅ Yes | ✅ Yes (limited) |
| **Custom Domain** | ✅ Yes | ❌ Paid only |
| **Static URL** | ✅ Yes | ❌ Free tier changes |
| **Setup Complexity** | Medium | Easy |
| **Production Ready** | ✅ Yes | ⚠️ Testing only |
| **Performance** | Excellent | Good |
| **Security** | Enterprise-grade | Good |
| **Uptime** | 99.9%+ | Good |

### Recommendation

- **For V1 Production:** Use Cloudflare Tunnel
- **For Quick Demos:** Use ngrok
- **For Development:** Local network only

---

## 🚀 QUICK START SCRIPTS

### Cloudflare Tunnel Script

Create `scripts/start-tunnel.ps1`:

```powershell
# Start Cloudflare Tunnel
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Cloudflare Tunnel..." -ForegroundColor Cyan

# Check if backend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health/live" -TimeoutSec 2
    Write-Host "✅ Backend is running on port 3001" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running!" -ForegroundColor Red
    Write-Host "   Start backend first: cd backend && npm start" -ForegroundColor Yellow
    exit 1
}

# Start tunnel
Write-Host "🔗 Starting tunnel..." -ForegroundColor Cyan
cloudflared tunnel run care2system
```

### ngrok Script

Create `scripts/start-ngrok.ps1`:

```powershell
# Start ngrok Tunnel
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting ngrok..." -ForegroundColor Cyan

# Check if backend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health/live" -TimeoutSec 2
    Write-Host "✅ Backend is running on port 3001" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running!" -ForegroundColor Red
    Write-Host "   Start backend first: cd backend && npm start" -ForegroundColor Yellow
    exit 1
}

# Start ngrok
Write-Host "🔗 Starting ngrok tunnel..." -ForegroundColor Cyan
Write-Host ""
ngrok http 3001
```

---

## 📋 HEALTH CHECK INTEGRATION

### Backend Health Endpoint

The backend health endpoint at `/health/status` includes tunnel information:

```json
{
  "ok": true,
  "status": "healthy",
  "tunnel": {
    "configured": true,
    "tunnelId": "12345678-1234-1234-1234-123456789abc",
    "domain": "app.care2connects.org",
    "type": "cloudflare"
  }
}
```

### Monitor Tunnel Status

```powershell
# Check tunnel status
cloudflared tunnel info care2system

# Check tunnel logs
cloudflared tunnel logs care2system

# Check service status (if running as service)
Get-Service cloudflared
```

---

## 🔒 SECURITY CONSIDERATIONS

### Cloudflare Tunnel

- ✅ Zero Trust security
- ✅ No open inbound ports
- ✅ DDoS protection included
- ✅ Web Application Firewall (WAF) available
- ✅ Rate limiting built-in

### ngrok

- ✅ End-to-end TLS encryption
- ⚠️ Basic authentication only on paid tiers
- ⚠️ No built-in DDoS protection
- ⚠️ Anyone with URL can access (use authentication!)

### Best Practices

1. **Always use HTTPS** (both options provide this)
2. **Implement authentication** at application level
3. **Rate limit** API endpoints
4. **Monitor access logs**
5. **Use environment variables** for tunnel configs
6. **Never commit** tunnel credentials to git

---

## 📝 CONFIGURATION FILES

### .cloudflared/config.yml

```yaml
tunnel: 12345678-1234-1234-1234-123456789abc
credentials-file: C:\Users\YourUser\.cloudflared\12345678-1234-1234-1234-123456789abc.json

# Optional: origin server certificate validation
originServerName: localhost

# Optional: HTTP/2 upgrade
http2-origin: true

# Ingress rules
ingress:
  # Main application
  - hostname: app.care2connects.org
    service: http://localhost:3001
    originRequest:
      noTLSVerify: true
  
  # API subdomain (optional)
  - hostname: api.care2connects.org
    service: http://localhost:3001
  
  # Catch-all (required)
  - service: http_status:404

# Optional: tunnel-level settings
logfile: C:\logs\cloudflared.log
loglevel: info
```

### backend/.env

```bash
# Cloudflare Tunnel Configuration
CLOUDFLARE_TUNNEL_ID=12345678-1234-1234-1234-123456789abc
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_ZONE_ID=your_zone_id_here
CLOUDFLARE_DOMAIN=care2connects.org

# Public URL for frontend
PUBLIC_URL=https://app.care2connects.org
```

### frontend/.env.local

```bash
# Backend API URL (use tunnel URL)
NEXT_PUBLIC_API_URL=https://app.care2connects.org

# Or for ngrok
# NEXT_PUBLIC_API_URL=https://abc123.ngrok-free.app
```

---

## 🎓 QUICK REFERENCE

### Cloudflare Tunnel Commands

```powershell
# Create tunnel
cloudflared tunnel create <name>

# List tunnels
cloudflared tunnel list

# Run tunnel
cloudflared tunnel run <name>

# Delete tunnel
cloudflared tunnel delete <name>

# Install as service
cloudflared service install

# Uninstall service
cloudflared service uninstall
```

### ngrok Commands

```powershell
# Start HTTP tunnel
ngrok http 3001

# Start with custom domain (paid)
ngrok http 3001 --domain=app.example.com

# Start with auth
ngrok http 3001 --basic-auth="user:pass"

# View web interface
# Open http://localhost:4040
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Backend running on port 3001
- [ ] Tunnel service started
- [ ] DNS configured correctly
- [ ] Public URL accessible
- [ ] Health endpoint responding
- [ ] HTTPS working
- [ ] Frontend configured with public URL
- [ ] Authentication working
- [ ] Logs configured

---

**Last Updated:** January 10, 2026  
**Status:** ✅ Complete  
**Recommended Option:** Cloudflare Tunnel for production, ngrok for testing
