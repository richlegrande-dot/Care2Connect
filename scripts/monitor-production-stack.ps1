# Production Stack Monitor - Detects and reports common failure modes
# Monitors: proxy down, MIME type mismatches, tunnel health

param(
    [int]$IntervalSeconds = 30,
    [switch]$AutoRestart,
    [switch]$Continuous
)

$ErrorActionPreference = "Stop"

$WorkspaceRoot = "C:\Users\richl\Care2system"

function Test-ServiceHealth {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Production Stack Health Check" -ForegroundColor Cyan
    Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $allHealthy = $true
    $failures = @()
    
    # Check 1: Port Listeners
    Write-Host "[1/5] Port Listeners" -ForegroundColor Yellow
    $requiredPorts = @(
        @{ Port = 8080; Name = "Caddy Reverse Proxy"; Critical = $true },
        @{ Port = 3000; Name = "Frontend (Next.js)"; Critical = $true },
        @{ Port = 3001; Name = "Backend (Express)"; Critical = $true }
    )
    
    foreach ($service in $requiredPorts) {
        $listening = netstat -ano | Select-String ":$($service.Port).*LISTENING"
        if ($listening) {
            Write-Host "  ✓ $($service.Name) listening on port $($service.Port)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $($service.Name) NOT listening on port $($service.Port)" -ForegroundColor Red
            $failures += @{
                Type = "PortDown"
                Service = $service.Name
                Port = $service.Port
                Critical = $service.Critical
            }
            $allHealthy = $false
        }
    }
    
    Write-Host ""
    
    # Check 2: Cloudflare Tunnel Process
    Write-Host "[2/5] Cloudflare Tunnel Process" -ForegroundColor Yellow
    $tunnelProc = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
    if ($tunnelProc) {
        $runtime = (Get-Date) - $tunnelProc.StartTime
        Write-Host "  ✓ Tunnel running (PID: $($tunnelProc.Id), Uptime: $($runtime.ToString('hh\:mm\:ss')))" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Tunnel process not found" -ForegroundColor Red
        $failures += @{
            Type = "TunnelDown"
            Service = "Cloudflare Tunnel"
            Critical = $true
        }
        $allHealthy = $false
    }
    
    Write-Host ""
    
    # Check 3: Local Routing (through Caddy)
    Write-Host "[3/5] Local Routing Tests" -ForegroundColor Yellow
    
    # Test frontend routing
    try {
        $frontendTest = Invoke-WebRequest -Uri "http://127.0.0.1:8080" -Headers @{ Host = "care2connects.org" } -TimeoutSec 5 -UseBasicParsing
        Write-Host "  ✓ Caddy → Frontend: $($frontendTest.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Caddy → Frontend: Failed ($($_.Exception.Message))" -ForegroundColor Red
        $failures += @{
            Type = "RoutingFailure"
            Service = "Caddy → Frontend"
            Error = $_.Exception.Message
            Critical = $true
        }
        $allHealthy = $false
    }
    
    # Test backend routing
    try {
        $backendTest = Invoke-WebRequest -Uri "http://127.0.0.1:8080/health/live" -Headers @{ Host = "api.care2connects.org" } -TimeoutSec 5 -UseBasicParsing
        Write-Host "  ✓ Caddy → Backend: $($backendTest.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Caddy → Backend: Failed ($($_.Exception.Message))" -ForegroundColor Red
        $failures += @{
            Type = "RoutingFailure"
            Service = "Caddy → Backend"
            Error = $_.Exception.Message
            Critical = $true
        }
        $allHealthy = $false
    }
    
    Write-Host ""
    
    # Check 4: Public Endpoint Tests
    Write-Host "[4/5] Public Endpoint Tests" -ForegroundColor Yellow
    
    # Test homepage
    try {
        $homeTest = Invoke-WebRequest -Uri "https://care2connects.org" -TimeoutSec 10 -UseBasicParsing
        $contentType = $homeTest.Headers["Content-Type"]
        if ($contentType -like "text/html*") {
            Write-Host "  ✓ Frontend homepage: $($homeTest.StatusCode) (MIME: $contentType)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ Frontend homepage: Wrong MIME type ($contentType)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ✗ Frontend homepage: Failed ($($_.Exception.Message))" -ForegroundColor Red
        $failures += @{
            Type = "PublicEndpointDown"
            Service = "Frontend Homepage"
            URL = "https://care2connects.org"
            Error = $_.Exception.Message
            Critical = $true
        }
        $allHealthy = $false
    }
    
    # Test static asset (CRITICAL for detecting reverse-proxy failure)
    try {
        $staticTest = Invoke-WebRequest -Uri "https://care2connects.org/_next/static/chunks/webpack.js" -TimeoutSec 10 -UseBasicParsing
        $contentType = $staticTest.Headers["Content-Type"]
        
        if ($contentType -like "application/javascript*" -or $contentType -like "text/javascript*") {
            Write-Host "  ✓ Static asset: $($staticTest.StatusCode) (MIME: $contentType)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ CRITICAL: Static asset has WRONG MIME TYPE!" -ForegroundColor Red
            Write-Host "    Expected: application/javascript" -ForegroundColor Red
            Write-Host "    Got: $contentType" -ForegroundColor Red
            Write-Host "    This indicates reverse proxy failure!" -ForegroundColor Red
            $failures += @{
                Type = "MIMETypeMismatch"
                Service = "Static Assets"
                URL = "https://care2connects.org/_next/static/chunks/webpack.js"
                Expected = "application/javascript"
                Got = $contentType
                Critical = $true
            }
            $allHealthy = $false
        }
    } catch {
        Write-Host "  ✗ Static asset: Failed ($($_.Exception.Message))" -ForegroundColor Red
        $failures += @{
            Type = "PublicEndpointDown"
            Service = "Static Assets"
            URL = "https://care2connects.org/_next/static/chunks/webpack.js"
            Error = $_.Exception.Message
            Critical = $true
        }
        $allHealthy = $false
    }
    
    # Test API health
    try {
        $apiTest = Invoke-WebRequest -Uri "https://api.care2connects.org/health/live" -TimeoutSec 10 -UseBasicParsing
        $contentType = $apiTest.Headers["Content-Type"]
        if ($contentType -like "application/json*") {
            Write-Host "  ✓ API health: $($apiTest.StatusCode) (MIME: $contentType)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ API health: Wrong MIME type ($contentType)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ✗ API health: Failed ($($_.Exception.Message))" -ForegroundColor Red
        $failures += @{
            Type = "PublicEndpointDown"
            Service = "API Health"
            URL = "https://api.care2connects.org/health/live"
            Error = $_.Exception.Message
            Critical = $true
        }
        $allHealthy = $false
    }
    
    Write-Host ""
    
    # Check 5: Domain Guard
    Write-Host "[5/5] Domain Configuration" -ForegroundColor Yellow
    try {
        & "$WorkspaceRoot\scripts\domain-guard.ps1" -ErrorAction Stop | Out-Null
        Write-Host "  ✓ No domain typos found" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠ Domain guard warnings detected" -ForegroundColor Yellow
        $failures += @{
            Type = "DomainWarning"
            Service = "Domain Configuration"
            Critical = $false
        }
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    
    if ($allHealthy) {
        Write-Host "✓ All Systems Healthy" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        return @{
            Healthy = $true
            Failures = @()
        }
    } else {
        Write-Host "✗ $($failures.Count) Issue(s) Detected" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        
        # Print recovery recommendations
        Write-Host "Recovery Recommendations:" -ForegroundColor Yellow
        
        $hasPortDown = $failures | Where-Object { $_.Type -eq "PortDown" }
        $hasMIMEIssue = $failures | Where-Object { $_.Type -eq "MIMETypeMismatch" }
        $hasTunnelDown = $failures | Where-Object { $_.Type -eq "TunnelDown" }
        
        if ($hasPortDown -or $hasMIMEIssue) {
            Write-Host "  → Restart production stack:" -ForegroundColor White
            Write-Host "    .\scripts\stop-production-stack.ps1 -Force" -ForegroundColor Gray
            Write-Host "    .\scripts\start-production-stack.ps1" -ForegroundColor Gray
        } elseif ($hasTunnelDown) {
            Write-Host "  → Restart tunnel only:" -ForegroundColor White
            Write-Host "    .\scripts\tunnel-start.ps1" -ForegroundColor Gray
        } else {
            Write-Host "  → Check logs for specific errors" -ForegroundColor White
            Write-Host "    Caddy: $WorkspaceRoot\logs\caddy-access.log" -ForegroundColor Gray
        }
        
        Write-Host ""
        
        return @{
            Healthy = $false
            Failures = $failures
        }
    }
}

# Main execution
if ($Continuous) {
    Write-Host "Starting continuous monitoring (Ctrl+C to stop)..." -ForegroundColor Cyan
    Write-Host "Check interval: $IntervalSeconds seconds" -ForegroundColor Gray
    Write-Host ""
    
    $iteration = 0
    while ($true) {
        $iteration++
        Write-Host "=== Iteration $iteration ===" -ForegroundColor Cyan
        Write-Host ""
        
        $result = Test-ServiceHealth
        
        if (-not $result.Healthy -and $AutoRestart) {
            Write-Host ""
            Write-Host "Auto-restart enabled - attempting recovery..." -ForegroundColor Yellow
            try {
                & "$WorkspaceRoot\scripts\stop-production-stack.ps1" -Force
                Start-Sleep -Seconds 5
                & "$WorkspaceRoot\scripts\start-production-stack.ps1"
                Write-Host "✓ Recovery attempted successfully" -ForegroundColor Green
            } catch {
                Write-Host "✗ Auto-restart failed: $_" -ForegroundColor Red
            }
        }
        
        Write-Host ""
        Write-Host "Next check in $IntervalSeconds seconds..." -ForegroundColor Gray
        Write-Host ""
        Start-Sleep -Seconds $IntervalSeconds
    }
} else {
    # Single check
    $result = Test-ServiceHealth
    
    if ($result.Healthy) {
        exit 0
    } else {
        exit 1
    }
}
