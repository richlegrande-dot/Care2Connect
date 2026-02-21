# ============================================================================
# CARE2SYSTEM - START ALL SERVICES
# ============================================================================
# Starts all services in correct order with health checks
# Usage: .\start-all-services.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         CARE2SYSTEM - STARTING ALL SERVICES                   ║" -ForegroundColor White
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

$Config = @{
    BackendPath = "C:\Users\richl\Care2system\backend"
    FrontendPath = "C:\Users\richl\Care2system\frontend"
    BackendPort = 3001
    FrontendPort = 3000
    TunnelId = "07e7c160-451b-4d41-875c-a58f79700ae8"
}

# ============================================================================
# STEP 1: CLEAN UP EXISTING PROCESSES
# ============================================================================

Write-Host "[1/6] Cleaning up existing processes..." -ForegroundColor Cyan

Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 2

Write-Host "   ✓ Cleanup complete" -ForegroundColor Green

# ============================================================================
# STEP 2: START DATABASE
# ============================================================================

Write-Host "`n[2/6] Starting PostgreSQL database..." -ForegroundColor Cyan

Set-Location "C:\Users\richl\Care2system"
$dbResult = docker compose -f docker-compose.demo.yml up -d postgres 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Database starting..." -ForegroundColor Green
    Start-Sleep 3
} else {
    Write-Host "   ⚠️  Database may already be running or Docker not available" -ForegroundColor Yellow
}

# ============================================================================
# STEP 3: START BACKEND
# ============================================================================

Write-Host "`n[3/6] Starting backend service (Port $($Config.BackendPort))..." -ForegroundColor Cyan

$backendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm run dev 2>&1
} -ArgumentList $Config.BackendPath

Write-Host "   Job ID: $($backendJob.Id)" -ForegroundColor Gray
Write-Host "   Waiting 10 seconds for startup..." -ForegroundColor Yellow
Start-Sleep 10

# Verify backend
$listening = netstat -ano | findstr ":$($Config.BackendPort).*LISTENING"
if ($listening) {
    try {
        $health = Invoke-RestMethod "http://localhost:$($Config.BackendPort)/health/live" -TimeoutSec 5
        Write-Host "   ✓ Backend running: Port $($health.port), Status: $($health.status)" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Backend port listening but health check failed" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ Backend failed to start" -ForegroundColor Red
    Write-Host "   Recent output:" -ForegroundColor Yellow
    Receive-Job $backendJob -Keep | Select-Object -Last 10
    exit 1
}

# ============================================================================
# STEP 4: START FRONTEND
# ============================================================================

Write-Host "`n[4/6] Starting frontend service (Port $($Config.FrontendPort))..." -ForegroundColor Cyan

$frontendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm run dev 2>&1
} -ArgumentList $Config.FrontendPath

Write-Host "   Job ID: $($frontendJob.Id)" -ForegroundColor Gray
Write-Host "   Waiting 12 seconds for startup..." -ForegroundColor Yellow
Start-Sleep 12

# Verify frontend
$listening = netstat -ano | findstr ":$($Config.FrontendPort).*LISTENING"
if ($listening) {
    try {
        $response = Invoke-WebRequest "http://localhost:$($Config.FrontendPort)" -UseBasicParsing -TimeoutSec 5
        if ($response.Content -match "Your Story Matters") {
            Write-Host "   ✓ Frontend running: Port $($Config.FrontendPort), Content: Correct" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Frontend running but unexpected content" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ⚠️  Frontend port listening but HTTP check failed" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ Frontend failed to start" -ForegroundColor Red
    Write-Host "   Recent output:" -ForegroundColor Yellow
    Receive-Job $frontendJob -Keep | Select-Object -Last 10
    exit 1
}

# ============================================================================
# STEP 5: CREATE/VERIFY TUNNEL CONFIG
# ============================================================================

Write-Host "`n[5/6] Configuring Cloudflare tunnel..." -ForegroundColor Cyan

$configPath = "C:\Users\richl\.cloudflared\config.yml"
$configContent = @"
tunnel: $($Config.TunnelId)
credentials-file: C:\Users\richl\.cloudflared\$($Config.TunnelId).json

ingress:
  - hostname: api.care2connects.org
    service: http://localhost:$($Config.BackendPort)
  - hostname: care2connects.org
    service: http://localhost:$($Config.FrontendPort)
  - service: http_status:404
"@

$configContent | Out-File -FilePath $configPath -Encoding UTF8 -Force
Write-Host "   ✓ Tunnel config created" -ForegroundColor Green
Write-Host "     • care2connects.org → localhost:$($Config.FrontendPort) (Frontend)" -ForegroundColor White
Write-Host "     • api.care2connects.org → localhost:$($Config.BackendPort) (Backend)" -ForegroundColor White

# ============================================================================
# STEP 6: START TUNNEL
# ============================================================================

Write-Host "`n[6/6] Starting Cloudflare tunnel..." -ForegroundColor Cyan

$tunnelJob = Start-Job -ScriptBlock {
    param($tunnelId)
    cloudflared tunnel run $tunnelId 2>&1
} -ArgumentList $Config.TunnelId

Write-Host "   Job ID: $($tunnelJob.Id)" -ForegroundColor Gray
Write-Host "   Waiting 5 seconds for connection..." -ForegroundColor Yellow
Start-Sleep 5

$tunnelProcess = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($tunnelProcess) {
    Write-Host "   ✓ Tunnel running: PID $($tunnelProcess.Id)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Tunnel process not detected" -ForegroundColor Yellow
}

# ============================================================================
# SUMMARY & NEXT STEPS
# ============================================================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                 ALL SERVICES STARTED ✓                        ║" -ForegroundColor White
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📍 LOCAL URLS:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:$($Config.BackendPort)" -ForegroundColor White
Write-Host "   Frontend: http://localhost:$($Config.FrontendPort)" -ForegroundColor White
Write-Host ""

Write-Host "🌐 PUBLIC URLS:" -ForegroundColor Cyan
Write-Host "   Homepage: https://care2connects.org" -ForegroundColor White
Write-Host "   API:      https://api.care2connects.org" -ForegroundColor White
Write-Host ""

Write-Host "💡 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "   1. Test local URLs to verify services" -ForegroundColor White
Write-Host "   2. Purge Cloudflare cache if public URL shows old content" -ForegroundColor White
Write-Host "   3. Run: .\purge-cloudflare-cache.ps1 (if API configured)" -ForegroundColor White
Write-Host "   4. Start self-healing: .\self-healing.ps1 -Mode FullAuto" -ForegroundColor White
Write-Host ""

Write-Host "🔍 VIEW JOB OUTPUT:" -ForegroundColor Yellow
Write-Host "   Backend:  Receive-Job $($backendJob.Id)" -ForegroundColor Gray
Write-Host "   Frontend: Receive-Job $($frontendJob.Id)" -ForegroundColor Gray
Write-Host "   Tunnel:   Receive-Job $($tunnelJob.Id)" -ForegroundColor Gray
Write-Host ""

# Return job IDs for reference
return @{
    BackendJob = $backendJob.Id
    FrontendJob = $frontendJob.Id
    TunnelJob = $tunnelJob.Id
}
