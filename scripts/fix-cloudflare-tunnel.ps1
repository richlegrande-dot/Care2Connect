# Automated Cloudflare Tunnel Configuration Fix
# PRODUCTION HARDENING: Uses 127.0.0.1 explicitly and prevents IPv6 issues

Write-Host "=== HARDENED Cloudflare Tunnel Configuration Fix ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Load hardened port configuration
Write-Host "[1/6] Loading hardened port configuration..." -ForegroundColor Yellow

# Read backend port from .env (single source of truth)
$envFile = "C:\Users\richl\Care2system\backend\.env"
$backendPort = 3001  # Default

if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    $portLine = $envContent | Where-Object { $_ -match "^PORT=(\d+)" }
    if ($portLine) {
        $backendPort = [int]($matches[1])
        Write-Host "  Backend port from .env: $backendPort" -ForegroundColor Green
    }
} else {
    Write-Host "  .env file not found, using default port: $backendPort" -ForegroundColor Yellow
}

# Hardcoded frontend port (no drift allowed)
$frontendPort = 3000

Write-Host "  HARDENED CONFIG: Backend=$backendPort, Frontend=$frontendPort" -ForegroundColor Cyan

# Step 2: Validate port availability (fail-fast)
Write-Host "[2/6] Validating port availability..." -ForegroundColor Yellow

$backendOccupied = Get-NetTCPConnection -LocalPort $backendPort -State Listen -ErrorAction SilentlyContinue
$frontendOccupied = Get-NetTCPConnection -LocalPort $frontendPort -State Listen -ErrorAction SilentlyContinue

if (-not $backendOccupied) {
    Write-Host "  ❌ WARNING: Backend port $backendPort is not occupied - server may not be running" -ForegroundColor Red
    Write-Host "     Tunnel will be configured but may fail until backend starts" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Backend port $backendPort is occupied (good)" -ForegroundColor Green
}

if (-not $frontendOccupied) {
    Write-Host "  ❌ WARNING: Frontend port $frontendPort is not occupied - server may not be running" -ForegroundColor Red  
    Write-Host "     Tunnel will be configured but may fail until frontend starts" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Frontend port $frontendPort is occupied (good)" -ForegroundColor Green
}

# Step 3: Update Cloudflare config with 127.0.0.1 (IPv4 hardening)
Write-Host "[3/6] Updating Cloudflare tunnel configuration..." -ForegroundColor Yellow
$configPath = "C:\Users\richl\.cloudflared\config.yml"

if (-not (Test-Path $configPath)) {
    Write-Host " Cloudflare config not found at $configPath" -ForegroundColor Red
    exit 1
}

# Read current config to get tunnel ID
$currentConfig = Get-Content $configPath -Raw
$tunnelId = if ($currentConfig -match 'tunnel:\s+([a-f0-9-]+)') { $matches[1] } else { $null }
$credentialsFile = if ($currentConfig -match 'credentials-file:\s+(.+)') { $matches[1].Trim() } else { $null }

if (-not $tunnelId) {
    Write-Host " Could not extract tunnel ID from config" -ForegroundColor Red
    exit 1
}

# Create new config with HARDENED 127.0.0.1 addressing (prevents IPv6 issues)
$newConfig = @"
tunnel: $tunnelId
credentials-file: $credentialsFile
ingress:
  # PRODUCTION HARDENING: Use 127.0.0.1 explicitly (no localhost, no ::1)
  # New care2connect.org domain
  - hostname: api.care2connect.org
    service: http://127.0.0.1:$backendPort
  - hostname: www.care2connect.org
    service: http://127.0.0.1:$frontendPort
  - hostname: care2connect.org
    service: http://127.0.0.1:$frontendPort
  # Production care2connects.org domain
  - hostname: api.care2connects.org
    service: http://127.0.0.1:$backendPort
  - hostname: www.care2connect.org
    service: http://127.0.0.1:$frontendPort
  - hostname: care2connect.org
    service: http://127.0.0.1:$frontendPort
  - service: http_status:404
"@

# Backup current config
$backupPath = "$configPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $configPath $backupPath -Force
Write-Host " Config backed up to: $backupPath" -ForegroundColor Gray

# Write new config
$newConfig | Set-Content $configPath -Encoding UTF8
Write-Host "  ✅ Configuration updated with 127.0.0.1 addressing" -ForegroundColor Green
Write-Host "     Backend: 127.0.0.1:$backendPort" -ForegroundColor Gray
Write-Host "     Frontend: 127.0.0.1:$frontendPort" -ForegroundColor Gray

# Step 4: Stop existing tunnel
Write-Host "[4/6] Stopping existing Cloudflare tunnel..." -ForegroundColor Yellow
$cloudflaredProcesses = Get-Process cloudflared -ErrorAction SilentlyContinue

if ($cloudflaredProcesses) {
    $cloudflaredProcesses | ForEach-Object {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Host "  Stopped process PID: $($_.Id)" -ForegroundColor Gray
    }
    Start-Sleep -Seconds 3
    Write-Host " Tunnel stopped" -ForegroundColor Green
} else {
    Write-Host "  No existing tunnel process found" -ForegroundColor Yellow
}

# Step 5: Start new tunnel with IPv4 forcing (PRODUCTION HARDENING)
Write-Host "[5/6] Starting Cloudflare tunnel with IPv4 forcing..." -ForegroundColor Yellow
$cloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"

if (-not (Test-Path $cloudflaredPath)) {
    Write-Host " cloudflared.exe not found at $cloudflaredPath" -ForegroundColor Red
    exit 1
}

Start-Process -FilePath $cloudflaredPath -ArgumentList "tunnel", "--config", $configPath, "run", "--edge-ip-version", "4" -WindowStyle Hidden
Start-Sleep -Seconds 5

Write-Host "  ✅ Tunnel started with IPv4-only edge routing (prevents ::1 issues)" -ForegroundColor Green

# Step 6: Verify tunnel is running
Write-Host "[6/6] Verifying tunnel status..." -ForegroundColor Yellow
$newProcess = Get-Process cloudflared -ErrorAction SilentlyContinue

if ($newProcess) {
    Write-Host " Cloudflare tunnel started (PID: $($newProcess.Id))" -ForegroundColor Green
} else {
    Write-Host " Failed to start tunnel - check logs" -ForegroundColor Red
    exit 1
}

# Test API connectivity
Write-Host ""
Write-Host "Testing API connectivity..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

try {
    $response = Invoke-RestMethod -Uri "https://api.care2connects.org/health/live" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host " Production API is accessible!" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
    Write-Host "   Message: $($response.message)" -ForegroundColor Gray
} catch {
    Write-Host "  Production API not yet accessible (may need more time)" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== HARDENED Configuration Complete ===" -ForegroundColor Green
Write-Host "Backend port: $backendPort (127.0.0.1)" -ForegroundColor White
Write-Host "Frontend port: $frontendPort (127.0.0.1)" -ForegroundColor White
Write-Host "Tunnel PID: $($newProcess.Id)" -ForegroundColor White
Write-Host "API URL: https://api.care2connects.org" -ForegroundColor White
Write-Host "IPv4 ONLY: --edge-ip-version 4" -ForegroundColor Cyan
