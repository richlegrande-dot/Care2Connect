# PowerShell script to stop all Care2Connect services
# Safely terminates backend, frontend, and optionally Cloudflare tunnel

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Care2Connect - Stop All Services" -ForegroundColor Cyan
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
            
            # Verify stopped
            $stillRunning = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
            if ($stillRunning) {
                Write-Host "Failed to stop $ServiceName" -ForegroundColor Red
            } else {
                Write-Host "$ServiceName stopped successfully" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "$ServiceName not running on port $Port" -ForegroundColor Gray
    }
}

# Stop backend
Write-Host "`n[1] Stopping backend..." -ForegroundColor Cyan
Stop-ProcessOnPort -Port 3003 -ServiceName "Backend"

# Stop frontend
Write-Host "`n[2] Stopping frontend..." -ForegroundColor Cyan
Stop-ProcessOnPort -Port 3000 -ServiceName "Frontend"

# Ask about Cloudflare tunnel
Write-Host "`n[3] Checking Cloudflare tunnel..." -ForegroundColor Cyan
$cloudflared = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
if ($cloudflared) {
    Write-Host "Cloudflare tunnel is running (PID: $($cloudflared.Id))" -ForegroundColor Yellow
    $response = Read-Host "Do you want to stop Cloudflare tunnel? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Stop-Process -Name cloudflared -Force -ErrorAction SilentlyContinue
        Write-Host "Cloudflare tunnel stopped" -ForegroundColor Green
    } else {
        Write-Host "Cloudflare tunnel left running" -ForegroundColor Gray
    }
} else {
    Write-Host "Cloudflare tunnel not running" -ForegroundColor Gray
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Final Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$backend = Get-NetTCPConnection -LocalPort 3003 -State Listen -ErrorAction SilentlyContinue
$frontend = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
$tunnel = Get-Process -Name cloudflared -ErrorAction SilentlyContinue

if ($backend) {
    Write-Host "❌ Backend: Still running" -ForegroundColor Red
} else {
    Write-Host "✅ Backend: Stopped" -ForegroundColor Green
}

if ($frontend) {
    Write-Host "❌ Frontend: Still running" -ForegroundColor Red
} else {
    Write-Host "✅ Frontend: Stopped" -ForegroundColor Green
}

if ($tunnel) {
    Write-Host "⚠️  Cloudflare Tunnel: Still running (PID: $($tunnel.Id))" -ForegroundColor Yellow
} else {
    Write-Host "✅ Cloudflare Tunnel: Stopped" -ForegroundColor Green
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
