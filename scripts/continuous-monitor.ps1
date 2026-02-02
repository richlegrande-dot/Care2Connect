# Continuous Service Monitor
# Runs health checks every 5 minutes and alerts on issues

$ErrorActionPreference = "SilentlyContinue"

Write-Host "`n🔄 Starting Continuous Service Monitor..." -ForegroundColor Cyan
Write-Host "   Checks run every 5 minutes" -ForegroundColor Gray
Write-Host "   Press Ctrl+C to stop`n" -ForegroundColor Gray

$checkCount = 0
$lastTunnelStatus = $null
$lastApiStatus = $null

while ($true) {
    $checkCount++
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "   Health Check #$checkCount - $timestamp" -ForegroundColor DarkGray
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray
    
    # Quick service check
    $backend = Get-NetTCPConnection -LocalPort 3003 -State Listen -ErrorAction SilentlyContinue
    $frontend = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    
    # Backend health
    if ($backend) {
        try {
            $health = Invoke-RestMethod "http://localhost:3003/health/status" -TimeoutSec 5 -ErrorAction Stop
            
            $statusSymbol = if ($health.status -eq "healthy") { "✓" } else { "⚠" }
            $statusColor = if ($health.status -eq "healthy") { "Green" } else { "Yellow" }
            
            Write-Host "$statusSymbol Backend: $($health.status.ToUpper()) (uptime: $([math]::Round($health.server.uptime))s)" -ForegroundColor $statusColor
            
            # Check critical services
            $criticalDown = @()
            @('prisma', 'openai', 'stripe') | ForEach-Object {
                if (-not $health.services.$_.healthy) {
                    $criticalDown += $_
                }
            }
            
            if ($criticalDown.Count -gt 0) {
                Write-Host "  ⚠ Critical services down: $($criticalDown -join ', ')" -ForegroundColor Red
            }
            
        } catch {
            Write-Host "✗ Backend: UNRESPONSIVE" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ Backend: OFFLINE (port 3003 not listening)" -ForegroundColor Red
    }
    
    if ($frontend) {
        Write-Host "✓ Frontend: ONLINE (port 3000)" -ForegroundColor Green
    } else {
        Write-Host "✗ Frontend: OFFLINE (port 3000 not listening)" -ForegroundColor Red
    }
    
    # Tunnel check (every 3rd check to avoid spam)
    if ($checkCount % 3 -eq 0) {
        Write-Host "`nChecking external services..." -ForegroundColor Gray
        
        try {
            $tunnelResponse = Invoke-RestMethod "https://care2connects.org/health/live" -TimeoutSec 10 -ErrorAction Stop
            $tunnelStatus = "UP"
            
            if ($lastTunnelStatus -eq "DOWN") {
                Write-Host "✓ Tunnel: RECOVERED - Domain is reachable" -ForegroundColor Green
            } else {
                Write-Host "✓ Tunnel: Active" -ForegroundColor Green
            }
            $lastTunnelStatus = "UP"
            
        } catch {
            $tunnelStatus = "DOWN"
            
            if ($lastTunnelStatus -ne "DOWN") {
                Write-Host "✗ Tunnel: DOWN - Domain not reachable" -ForegroundColor Red
                
                # Check if cloudflared is running
                $cloudflared = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
                if ($cloudflared) {
                    Write-Host "  ℹ cloudflared is running - likely DNS issue" -ForegroundColor Yellow
                } else {
                    Write-Host "  ⚠ cloudflared not running - start tunnel" -ForegroundColor Yellow
                }
            }
            $lastTunnelStatus = "DOWN"
        }
    }
    
    # Wait 5 minutes before next check
    Write-Host "`nNext check in 5 minutes..." -ForegroundColor DarkGray
    Start-Sleep -Seconds 300
}
