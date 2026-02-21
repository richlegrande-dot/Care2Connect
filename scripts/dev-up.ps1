# PowerShell Development Environment Startup Script
# Starts all services needed for CareConnect development

param(
    [switch]$SkipDocker = $false,
    [switch]$SkipHealthCheck = $false
)

$ErrorActionPreference = "Continue"

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         CareConnect Development Environment Startup           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Step 1: Check if Docker is needed (DB_MODE=local)
if (-not $SkipDocker) {
    $dbMode = (Get-Content .\.env -ErrorAction SilentlyContinue | Select-String "^DB_MODE=").ToString().Split('=')[1]
    
    if ($dbMode -eq "local") {
        Write-Host "[1/4] Starting Docker PostgreSQL..." -ForegroundColor Yellow
        
        # Check if Docker is running
        $dockerRunning = docker info 2>&1 | Select-String "Server Version"
        
        if ($dockerRunning) {
            Write-Host "   Docker is running" -ForegroundColor Green
            
            # Start PostgreSQL container
            docker-compose up -d postgres
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ PostgreSQL container started" -ForegroundColor Green
                Write-Host "   Waiting 5 seconds for database to initialize..." -ForegroundColor Yellow
                Start-Sleep -Seconds 5
            } else {
                Write-Host "   ⚠️  Docker compose failed - continuing anyway" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ⚠️  Docker not running - skipping PostgreSQL" -ForegroundColor Yellow
            Write-Host "   Note: Using remote database or services will fail" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[1/4] Skipping Docker (DB_MODE=$dbMode)" -ForegroundColor Yellow
    }
} else {
    Write-Host "[1/4] Skipping Docker (--SkipDocker flag)" -ForegroundColor Yellow
}

# Step 2: Start PM2 services
Write-Host "[2/4] Starting PM2 services..." -ForegroundColor Yellow

pm2 start ecosystem.config.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ PM2 start failed!" -ForegroundColor Red
    Write-Host "   Try: pm2 delete all; pm2 start ecosystem.config.js" -ForegroundColor Yellow
    exit 1
}

Write-Host "   ✅ PM2 services started" -ForegroundColor Green

# Step 3: Wait for services to initialize
Write-Host "[3/4] Waiting for services to initialize (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 4: Health checks
if (-not $SkipHealthCheck) {
    Write-Host "[4/4] Running health checks...`n" -ForegroundColor Yellow
    
    # Check backend
    try {
        $backend = Invoke-RestMethod -Uri "http://localhost:3001/health/live" -Method Get -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   ✅ Backend: $($backend.status)" -ForegroundColor Green
        Write-Host "      Port: $($backend.port)" -ForegroundColor Gray
        Write-Host "      PID: $($backend.pid)" -ForegroundColor Gray
        Write-Host "      Uptime: $([math]::Round($backend.uptime, 2))s" -ForegroundColor Gray
    } catch {
        Write-Host "   ❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "      Check logs: pm2 logs careconnect-backend" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # Check frontend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        Write-Host "   ✅ Frontend: HTTP $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Frontend check failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "      Check logs: pm2 logs careconnect-frontend" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # Check database (if local)
    $dbMode = (Get-Content .\.env -ErrorAction SilentlyContinue | Select-String "^DB_MODE=").ToString().Split('=')[1]
    if ($dbMode -eq "local" -and -not $SkipDocker) {
        $dbRunning = docker ps | Select-String "postgres"
        if ($dbRunning) {
            Write-Host "   ✅ Database: PostgreSQL container running" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Database: PostgreSQL container not found" -ForegroundColor Red
        }
    }
} else {
    Write-Host "[4/4] Skipping health checks (--SkipHealthCheck flag)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                 DEVELOPMENT ENVIRONMENT READY                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Health:   http://localhost:3001/health/status" -ForegroundColor White
Write-Host "  Admin:    http://localhost:3000/admin" -ForegroundColor White
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  pm2 list                           # View service status" -ForegroundColor White
Write-Host "  pm2 logs                           # View all logs" -ForegroundColor White
Write-Host "  pm2 logs careconnect-backend       # View backend logs" -ForegroundColor White
Write-Host "  .\scripts\restart-all.ps1          # Restart all services" -ForegroundColor White
Write-Host "  .\scripts\dev-down.ps1             # Stop all services" -ForegroundColor White
Write-Host ""
