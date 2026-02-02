# PowerShell Restart Script for CareConnect Services
# Safely restarts all PM2 services and performs health checks

param(
    [switch]$WithHealthCheck = $true,
    [switch]$SaveState = $true
)

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           CareConnect Service Restart Script                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Step 1: Save PM2 state before restart
if ($SaveState) {
    Write-Host "[1/4] Saving PM2 process state..." -ForegroundColor Yellow
    pm2 save
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  PM2 save failed (this is non-fatal)" -ForegroundColor Yellow
    }
}

# Step 2: Restart all services
Write-Host "[2/4] Restarting all PM2 services..." -ForegroundColor Yellow
pm2 restart all --update-env

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ PM2 restart failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Services restarted successfully`n" -ForegroundColor Green

# Step 3: Wait for services to stabilize
Write-Host "[3/4] Waiting for services to stabilize (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 4: Health checks
if ($WithHealthCheck) {
    Write-Host "[4/4] Running health checks...`n" -ForegroundColor Yellow
    
    # Check backend
    try {
        $backend = Invoke-RestMethod -Uri "http://localhost:3001/health/live" -Method Get -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Backend health: $($backend.status)" -ForegroundColor Green
        Write-Host "   Mode: $($backend.mode)" -ForegroundColor Gray
        Write-Host "   Database: $($backend.checks.database.status)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Check frontend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend responding (HTTP $($response.StatusCode))" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Frontend check failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Display PM2 status
Write-Host "PM2 Process Status:" -ForegroundColor Cyan
pm2 list

Write-Host "`n✅ Restart complete!" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:3001/health/live" -ForegroundColor Gray
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host ""
