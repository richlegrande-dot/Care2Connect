# Tunnel Status and Health Monitoring Script
# PRODUCTION HARDENING: Real-time tunnel health monitoring

param(
    [switch]$Continuous,
    [int]$IntervalSec = 30,
    [switch]$Detailed
)

Write-Host "=== CLOUDFLARE TUNNEL STATUS ===" -ForegroundColor Cyan
Write-Host ""

function Get-TunnelProcessInfo {
    $processes = Get-Process cloudflared -ErrorAction SilentlyContinue
    if ($processes) {
        return $processes | Select-Object Id, StartTime, @{Name='Uptime'; Expression={(Get-Date) - $_.StartTime}}, WorkingSet64
    }
    return $null
}

function Test-TunnelHealth {
    $results = @{}
    
    # Test production API
    try {
        $apiResponse = Invoke-RestMethod -Uri "https://api.care2connects.org/health/live" -Method GET -TimeoutSec 10 -ErrorAction Stop
        $results["api"] = @{
            status = "healthy"
            response = $apiResponse
            latency = (Measure-Command { 
                Invoke-RestMethod -Uri "https://api.care2connects.org/health/live" -Method GET -TimeoutSec 10 -ErrorAction Stop 
            }).TotalMilliseconds
        }
    } catch {
        $results["api"] = @{
            status = "failed"
            error = $_.Exception.Message
        }
    }
    
    # Test production frontend
    try {
        $frontendResponse = Invoke-WebRequest -Uri "https://care2connects.org" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $results["frontend"] = @{
            status = "healthy"
            statusCode = $frontendResponse.StatusCode
            latency = (Measure-Command { 
                Invoke-WebRequest -Uri "https://care2connects.org" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop 
            }).TotalMilliseconds
        }
    } catch {
        $results["frontend"] = @{
            status = "failed"
            error = $_.Exception.Message
        }
    }
    
    # Test tell your story page
    try {
        $storyResponse = Invoke-WebRequest -Uri "https://care2connects.org/tell-your-story" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $results["story"] = @{
            status = "healthy"
            statusCode = $storyResponse.StatusCode
            latency = (Measure-Command { 
                Invoke-WebRequest -Uri "https://care2connects.org/tell-your-story" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop 
            }).TotalMilliseconds
        }
    } catch {
        $results["story"] = @{
            status = "failed"
            error = $_.Exception.Message
        }
    }
    
    return $results
}

function Show-TunnelStatus {
    param($Timestamp = (Get-Date))
    
    Write-Host "[$($Timestamp.ToString('yyyy-MM-dd HH:mm:ss'))] TUNNEL STATUS CHECK" -ForegroundColor White
    
    # Process information
    $processes = Get-TunnelProcessInfo
    if ($processes) {
        Write-Host "🔧 PROCESS INFORMATION:" -ForegroundColor Yellow
        $processes | ForEach-Object {
            $uptimeStr = "{0:dd}d {0:hh}h {0:mm}m {0:ss}s" -f $_.Uptime
            $memoryMB = [math]::Round($_.WorkingSet64 / 1MB, 1)
            Write-Host "   PID: $($_.Id) | Uptime: $uptimeStr | Memory: ${memoryMB}MB" -ForegroundColor Gray
            Write-Host "   Started: $($_.StartTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ PROCESS: No cloudflared processes found" -ForegroundColor Red
        return
    }
    
    Write-Host ""
    
    # Health check results
    Write-Host "🏥 HEALTH CHECK RESULTS:" -ForegroundColor Yellow
    $health = Test-TunnelHealth
    
    # API endpoint
    if ($health["api"].status -eq "healthy") {
        $latencyMs = [math]::Round($health["api"].latency, 0)
        Write-Host "   ✅ API: HEALTHY (${latencyMs}ms) - https://api.care2connects.org" -ForegroundColor Green
        if ($Detailed -and $health["api"].response) {
            Write-Host "      Response: $($health["api"].response.status) - $($health["api"].response.message)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ❌ API: FAILED - https://api.care2connects.org" -ForegroundColor Red
        Write-Host "      Error: $($health["api"].error)" -ForegroundColor Red
    }
    
    # Frontend endpoint
    if ($health["frontend"].status -eq "healthy") {
        $latencyMs = [math]::Round($health["frontend"].latency, 0)
        Write-Host "   ✅ Frontend: HEALTHY (${latencyMs}ms) - https://care2connects.org" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Frontend: FAILED - https://care2connects.org" -ForegroundColor Red
        Write-Host "      Error: $($health["frontend"].error)" -ForegroundColor Red
    }
    
    # Story page endpoint  
    if ($health["story"].status -eq "healthy") {
        $latencyMs = [math]::Round($health["story"].latency, 0)
        Write-Host "   ✅ Tell Your Story: HEALTHY (${latencyMs}ms) - https://care2connects.org/tell-your-story" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Tell Your Story: FAILED - https://care2connects.org/tell-your-story" -ForegroundColor Red
        Write-Host "      Error: $($health["story"].error)" -ForegroundColor Red
    }
    
    # Overall status
    $allHealthy = ($health["api"].status -eq "healthy") -and 
                  ($health["frontend"].status -eq "healthy") -and 
                  ($health["story"].status -eq "healthy")
    
    Write-Host ""
    if ($allHealthy) {
        Write-Host "🚀 OVERALL STATUS: READY FOR DEMO" -ForegroundColor Green -BackgroundColor Black
    } else {
        Write-Host "⚠️  OVERALL STATUS: ISSUES DETECTED" -ForegroundColor Yellow -BackgroundColor Black
    }
    
    Write-Host ("-" * 80) -ForegroundColor Gray
}

# Single status check
if (-not $Continuous) {
    Show-TunnelStatus
    exit 0
}

# Continuous monitoring
Write-Host "🔄 Starting continuous monitoring (interval: ${IntervalSec}s)" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

try {
    while ($true) {
        Show-TunnelStatus
        Start-Sleep -Seconds $IntervalSec
    }
} catch {
    Write-Host ""
    Write-Host "Monitoring stopped." -ForegroundColor Yellow
}