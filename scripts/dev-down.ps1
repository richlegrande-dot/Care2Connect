# PowerShell Development Environment Shutdown Script
# Stops all CareConnect services and optionally Docker

param(
    [switch]$KeepDocker = $false,
    [switch]$SaveState = $true
)

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        CareConnect Development Environment Shutdown           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Step 1: Save PM2 state
if ($SaveState) {
    Write-Host "[1/3] Saving PM2 process state..." -ForegroundColor Yellow
    pm2 save
}

# Step 2: Stop PM2 services
Write-Host "[2/3] Stopping PM2 services..." -ForegroundColor Yellow

pm2 stop all

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️  PM2 stop had issues (this is usually non-fatal)" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ PM2 services stopped" -ForegroundColor Green
}

# Step 3: Stop Docker (optional)
if (-not $KeepDocker) {
    Write-Host "[3/3] Stopping Docker containers..." -ForegroundColor Yellow
    
    $dockerRunning = docker info 2>&1 | Select-String "Server Version"
    
    if ($dockerRunning) {
        docker-compose down
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Docker containers stopped" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Docker compose down had issues" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  Docker not running" -ForegroundColor Yellow
    }
} else {
    Write-Host "[3/3] Keeping Docker containers running (--KeepDocker flag)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              DEVELOPMENT ENVIRONMENT STOPPED                   ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "To restart:" -ForegroundColor Cyan
Write-Host "  .\scripts\dev-up.ps1" -ForegroundColor White
Write-Host ""
