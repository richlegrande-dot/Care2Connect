<#
.SYNOPSIS
    Cloudflare Tunnel Monitor and Auto-Restart
    
.DESCRIPTION
    PHASE 6M HARDENING: Tunnel Health Monitoring
    - Monitors Cloudflare tunnel process
    - Auto-restarts on failure
    - Logs tunnel health
    - Alerts on repeated failures
#>

param(
    [int]$CheckInterval = 30,  # seconds between checks
    [int]$MaxRestarts = 5,     # max restarts per hour
    [string]$LogFile = "C:\Users\richl\Care2system\logs\tunnel-monitor.log",
    [string]$MetricsFile = "C:\Users\richl\Care2system\logs\tunnel-metrics.json",
    [int]$AlertThreshold = 3,  # Alert after this many consecutive failures
    [switch]$EnableSSLValidation = $true
)

# Tunnel metrics tracking
$global:TunnelMetrics = @{
    TotalChecks = 0
    SuccessfulChecks = 0
    FailedChecks = 0
    ConsecutiveFailures = 0
    RestartAttempts = 0
    SuccessfulRestarts = 0
    FailedRestarts = 0
    LastSuccessfulCheck = $null
    LastFailureTime = $null
    UptimeStart = Get-Date
    SuspiciousActivity = 0
}

# Ensure log directory exists
$logDir = Split-Path $LogFile -Parent
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage -ForegroundColor $(
        switch ($Level) {
            "ERROR" { "Red" }
            "WARN"  { "Yellow" }
            "SUCCESS" { "Green" }
            "SECURITY" { "Magenta" }
            default { "White" }
        }
    )
    Add-Content -Path $LogFile -Value $logMessage
    
    # Save metrics after each log
    Save-Metrics
}

function Save-Metrics {
    try {
        $global:TunnelMetrics.LastUpdated = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $global:TunnelMetrics | ConvertTo-Json -Depth 3 | Set-Content -Path $MetricsFile -Force
    } catch {
        # Silent failure to avoid cascading errors
    }
}

function Send-Alert {
    param([string]$AlertMessage, [string]$Severity = "WARNING")
    Write-Log "🚨 ALERT [$Severity]: $AlertMessage" "SECURITY"
    
    # Future: Send to monitoring service, Slack, email, etc.
    # For now, just log with high visibility
}

function Test-TunnelProcess {
    try {
        $process = Get-Process cloudflared -ErrorAction SilentlyContinue
        if ($process) {
            # Validate process integrity
            $executablePath = $process.Path
            $expectedPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
            
            if ($executablePath -ne $expectedPath) {
                $global:TunnelMetrics.SuspiciousActivity++
                Send-Alert "Tunnel process running from unexpected location: $executablePath" "CRITICAL"
                return $false
            }
            
            # Check CPU usage (if abnormally high, might indicate compromise)
            $cpuUsage = (Get-Counter "\Process(cloudflared)\% Processor Time" -ErrorAction SilentlyContinue).CounterSamples.CookedValue
            if ($cpuUsage -gt 80) {
                Write-Log "⚠️ High CPU usage detected: $([math]::Round($cpuUsage, 2))%" "WARN"
            }
            
            Write-Log "✅ Tunnel process running (PID: $($process.Id), CPU: $([math]::Round($cpuUsage, 2))%)"
            return $true
        }
        Write-Log "⚠️ Tunnel process not found" "WARN"
        return $false
    } catch {
        Write-Log "❌ Error checking tunnel process: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Test-TunnelConnectivity {
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        
        $requestParams = @{
            Uri = "https://care2connects.org/health"
            TimeoutSec = 10
            UseBasicParsing = $true
            Method = "GET"
        }
        
        # SSL validation if enabled
        if (-not $EnableSSLValidation) {
            $requestParams.SkipCertificateCheck = $true
        }
        
        $response = Invoke-WebRequest @requestParams
        $stopwatch.Stop()
        $responseTime = $stopwatch.ElapsedMilliseconds
        
        if ($response.StatusCode -eq 200) {
            Write-Log "✅ Tunnel connectivity OK (Status: $($response.StatusCode), Time: $($responseTime)ms)"
            
            # Warn on slow responses
            if ($responseTime -gt 5000) {
                Write-Log "⚠️ Slow response time detected: $($responseTime)ms" "WARN"
            }
            
            # Validate response content
            if ($response.Content) {
                try {
                    $json = $response.Content | ConvertFrom-Json
                    if ($json.status -ne "OK" -and $json.status -ne "alive") {
                        Write-Log "⚠️ Health endpoint returned non-OK status" "WARN"
                    }
                } catch {
                    # Not JSON or couldn't parse, that's okay
                }
            }
            
            return $true
        }
        
        Write-Log "⚠️ Tunnel connectivity issue (Status: $($response.StatusCode))" "WARN"
        return $false
    } catch {
        Write-Log "❌ Tunnel connectivity failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Start-Tunnel {
    try {
        Write-Log "🔄 Starting Cloudflare tunnel..." "INFO"
        
        # Find cloudflared executable
        $cloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
        
        if (-not (Test-Path $cloudflaredPath)) {
            Write-Log "❌ cloudflared.exe not found at $cloudflaredPath" "ERROR"
            return $false
        }

        # Start tunnel in background
        Start-Process -FilePath $cloudflaredPath -ArgumentList "tunnel", "run", "care2connects" -WindowStyle Hidden
        
        # Wait for startup
        Start-Sleep -Seconds 5
        
        # Verify it started
        if (Test-TunnelProcess) {
            Write-Log "✅ Tunnel started successfully" "SUCCESS"
            return $true
        } else {
            Write-Log "❌ Tunnel failed to start" "ERROR"
            return $false
        }
    } catch {
        Write-Log "❌ Error starting tunnel: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Restart-Tunnel {
    Write-Log "🔄 Restarting tunnel..." "WARN"
    
    # Stop existing process
    try {
        $process = Get-Process cloudflared -ErrorAction SilentlyContinue
        if ($process) {
            Stop-Process -Id $process.Id -Force
            Write-Log "Stopped existing tunnel process (PID: $($process.Id))"
            Start-Sleep -Seconds 2
        }
    } catch {
        Write-Log "Error stopping tunnel: $($_.Exception.Message)" "ERROR"
    }
    
    # Start new instance
    return Start-Tunnel
}

# Main monitoring loop
Write-Log "========================================" "INFO"
Write-Log "🛡️ Hardened Tunnel Monitor Started" "SUCCESS"
Write-Log "Check Interval: $CheckInterval seconds" "INFO"
Write-Log "Max Restarts: $MaxRestarts per hour" "INFO"
Write-Log "Alert Threshold: $AlertThreshold failures" "INFO"
Write-Log "SSL Validation: $EnableSSLValidation" "INFO"
Write-Log "========================================" "INFO"

$restartCount = 0
$restartWindowStart = Get-Date

while ($true) {
    # Reset restart counter every hour
    if ((Get-Date) -gt $restartWindowStart.AddHours(1)) {
        Write-Log "Resetting restart counter (was: $restartCount)"
        $restartCount = 0
        $restartWindowStart = Get-Date
        
        # Log hourly summary
        $uptime = (Get-Date) - $global:TunnelMetrics.UptimeStart
        $uptimeFormatted = "{0:hh}:{0:mm}:{0:ss}" -f $uptime
        $successRate = if ($global:TunnelMetrics.TotalChecks -gt 0) {
            [math]::Round(($global:TunnelMetrics.SuccessfulChecks / $global:TunnelMetrics.TotalChecks) * 100, 2)
        } else { 0 }
        Write-Log "📊 Hourly Summary - Uptime: $uptimeFormatted, Success Rate: $successRate%, Restarts: $($global:TunnelMetrics.RestartAttempts)"
    }

    # Increment check counter
    $global:TunnelMetrics.TotalChecks++

    # Check tunnel health
    $processOk = Test-TunnelProcess
    $connectivityOk = Test-TunnelConnectivity

    if ($processOk -and $connectivityOk) {
        $global:TunnelMetrics.SuccessfulChecks++
        $global:TunnelMetrics.ConsecutiveFailures = 0
        $global:TunnelMetrics.LastSuccessfulCheck = Get-Date
    } else {
        $global:TunnelMetrics.FailedChecks++
        $global:TunnelMetrics.ConsecutiveFailures++
        $global:TunnelMetrics.LastFailureTime = Get-Date
        
        Write-Log "🚨 Tunnel health check FAILED (Consecutive: $($global:TunnelMetrics.ConsecutiveFailures))" "ERROR"
        
        # Send alert on threshold
        if ($global:TunnelMetrics.ConsecutiveFailures -eq $AlertThreshold) {
            Send-Alert "Tunnel has failed $AlertThreshold consecutive health checks" "HIGH"
        }
        
        # Check restart limit
        if ($restartCount -ge $MaxRestarts) {
            Send-Alert "Max restarts reached ($MaxRestarts). Manual intervention required." "CRITICAL"
            Write-Log "⛔ Max restarts reached. Waiting 5 minutes before next check..."
            Start-Sleep -Seconds 300
            continue
        }

        # Attempt restart
        $restartCount++
        $global:TunnelMetrics.RestartAttempts++
        Write-Log "Attempting restart $restartCount/$MaxRestarts" "WARN"
        
        if (Restart-Tunnel) {
            $global:TunnelMetrics.SuccessfulRestarts++
            Write-Log "✅ Tunnel restarted successfully" "SUCCESS"
        } else {
            $global:TunnelMetrics.FailedRestarts++
            Write-Log "❌ Tunnel restart failed" "ERROR"
            Send-Alert "Tunnel restart attempt $restartCount failed" "HIGH"
        }
    }

    # Wait before next check
    Start-Sleep -Seconds $CheckInterval
}
