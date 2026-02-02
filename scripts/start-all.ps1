# PowerShell script to start all Care2Connect services
# Kills old processes on ports 3000/3003 and starts fresh

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Care2Connect - Start All Services" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Function to kill process on specific port
function Stop-ProcessOnPort {
    param (
        [int]$Port,
        [string]$ServiceName
    )
    
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Stopping $ServiceName (PID: $($process.Id)) on port $Port..." -ForegroundColor Yellow
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
            Write-Host "$ServiceName stopped" -ForegroundColor Green
        }
    } else {
        Write-Host "$ServiceName not running on port $Port" -ForegroundColor Gray
    }
}

# Step 1: Stop old processes
Write-Host "`n[Step 1] Stopping old processes..." -ForegroundColor Cyan
Stop-ProcessOnPort -Port 3000 -ServiceName "Frontend"
Stop-ProcessOnPort -Port 3003 -ServiceName "Backend"

# Step 2: Check if Cloudflare tunnel is running
Write-Host "`n[Step 2] Checking Cloudflare tunnel..." -ForegroundColor Cyan
$cloudflared = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
if ($cloudflared) {
    Write-Host "Cloudflare tunnel running (PID: $($cloudflared.Id))" -ForegroundColor Green
} else {
    Write-Host "Cloudflare tunnel NOT running" -ForegroundColor Yellow
    Write-Host "Starting Cloudflare tunnel..." -ForegroundColor Cyan
    
    # Start cloudflared in background
    $tunnelId = "07e7c160-451b-4d41-875c-a58f79700ae8"
    Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "run", $tunnelId -WindowStyle Hidden
    Start-Sleep -Seconds 3
    
    $cloudflared = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
    if ($cloudflared) {
        Write-Host "Cloudflare tunnel started (PID: $($cloudflared.Id))" -ForegroundColor Green
    } else {
        Write-Host "Failed to start Cloudflare tunnel" -ForegroundColor Red
    }
}

# Step 3: Start backend
Write-Host "`n[Step 3] Starting backend server..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot ".." "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 5

# Verify backend started
$backendRunning = Get-NetTCPConnection -LocalPort 3003 -State Listen -ErrorAction SilentlyContinue
if ($backendRunning) {
    Write-Host "Backend started successfully on port 3003" -ForegroundColor Green
} else {
    Write-Host "Backend may not have started - check the window" -ForegroundColor Yellow
}

# Step 4: Start frontend
Write-Host "`n[Step 4] Starting frontend server..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot ".." "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 5

# Verify frontend started
$frontendRunning = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($frontendRunning) {
    Write-Host "Frontend started successfully on port 3000" -ForegroundColor Green
} else {
    Write-Host "Frontend may not have started - check the window" -ForegroundColor Yellow
}

# Step 5: Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Service Status Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$services = @(
    @{Name="Backend"; Port=3003},
    @{Name="Frontend"; Port=3000}
)

foreach ($service in $services) {
    $running = Get-NetTCPConnection -LocalPort $service.Port -State Listen -ErrorAction SilentlyContinue
    if ($running) {
        $process = Get-Process -Id $running.OwningProcess -ErrorAction SilentlyContinue
        Write-Host "✅ $($service.Name): Running (PID: $($process.Id), Port: $($service.Port))" -ForegroundColor Green
    } else {
        Write-Host "❌ $($service.Name): Not running (Port: $($service.Port))" -ForegroundColor Red
    }
}

$cloudflared = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
if ($cloudflared) {
    Write-Host "✅ Cloudflare Tunnel: Running (PID: $($cloudflared.Id))" -ForegroundColor Green
} else {
    Write-Host "⚠️  Cloudflare Tunnel: Not running" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Local URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3003" -ForegroundColor White
Write-Host "  Health:   http://localhost:3003/health/status" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan
