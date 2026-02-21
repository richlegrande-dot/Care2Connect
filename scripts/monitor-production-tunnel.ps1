# Continuous Production Tunnel Monitoring
# PRODUCTION HARDENING: Real-time tunnel health monitoring with alerting

param(
    [int]$IntervalSec = 60,
    [int]$AlertThresholdFailures = 3,
    [string]$LogFile = "C:\Users\richl\Care2system\logs\tunnel-monitor.log",
    [switch]$EnableEmailAlerts,
    [string]$EmailTo,
    [switch]$EnableSlackAlerts,
    [string]$SlackWebhook
)

Write-Host "=== CONTINUOUS PRODUCTION TUNNEL MONITORING ===" -ForegroundColor Cyan
Write-Host "Monitoring interval: ${IntervalSec} seconds" -ForegroundColor Gray
Write-Host "Alert threshold: ${AlertThresholdFailures} consecutive failures" -ForegroundColor Gray
Write-Host "Log file: $LogFile" -ForegroundColor Gray
Write-Host ""

# Ensure log directory exists
$logDir = Split-Path $LogFile -Parent
if (-not (Test-Path $logDir)) {
    New-Item -Path $logDir -ItemType Directory -Force | Out-Null
}

# Initialize monitoring state
$consecutiveFailures = 0
$lastAlertTime = $null
$alertCooldownMinutes = 10  # Don't spam alerts
$monitoringStart = Get-Date

function Write-MonitorLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
    Add-Content -Path $LogFile -Value $logEntry
}

function Send-Alert {
    param([string]$Subject, [string]$Body)
    
    # Check cooldown period
    if ($lastAlertTime -and ((Get-Date) - $lastAlertTime).TotalMinutes -lt $alertCooldownMinutes) {
        Write-MonitorLog "Alert suppressed due to cooldown period" "WARN"
        return
    }
    
    try {
        # Email alert
        if ($EnableEmailAlerts -and $EmailTo) {
            # Note: This requires SMTP configuration or Send-MailMessage setup
            Write-MonitorLog "EMAIL ALERT: $Subject" "ALERT"
            Write-MonitorLog "Body: $Body" "ALERT"
            # Send-MailMessage -To $EmailTo -Subject $Subject -Body $Body -SmtpServer "your-smtp-server"
        }
        
        # Slack alert  
        if ($EnableSlackAlerts -and $SlackWebhook) {
            $slackPayload = @{
                text = $Subject
                attachments = @(@{
                    color = "danger"
                    fields = @(@{
                        title = "Details"
                        value = $Body
                        short = $false
                    })
                })
            } | ConvertTo-Json -Depth 3
            
            Invoke-RestMethod -Uri $SlackWebhook -Method POST -Body $slackPayload -ContentType 'application/json'
            Write-MonitorLog "Slack alert sent successfully" "ALERT"
        }
        
        # Windows notification
        Add-Type -AssemblyName System.Windows.Forms
        $notification = New-Object System.Windows.Forms.NotifyIcon
        $notification.Icon = [System.Drawing.SystemIcons]::Warning
        $notification.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Warning
        $notification.BalloonTipTitle = $Subject
        $notification.BalloonTipText = $Body
        $notification.Visible = $true
        $notification.ShowBalloonTip(5000)
        
        $script:lastAlertTime = Get-Date
        
    } catch {
        Write-MonitorLog "Failed to send alert: $($_.Exception.Message)" "ERROR"
    }
}

function Test-ProductionHealth {
    $results = @{
        timestamp = Get-Date
        api_healthy = $false
        frontend_healthy = $false  
        story_page_healthy = $false
        tunnel_process_running = $false
        overall_healthy = $false
        errors = @()
    }
    
    # Check tunnel process
    $tunnelProcess = Get-Process cloudflared -ErrorAction SilentlyContinue
    if ($tunnelProcess) {
        $results.tunnel_process_running = $true
    } else {
        $results.errors += "No cloudflared process found"
    }
    
    # Test production readiness (single source of truth)
    try {
        $apiResponse = Invoke-RestMethod -Uri "https://api.care2connect.org/ops/health/production" -Method GET -TimeoutSec 10 -ErrorAction Stop
        if ($apiResponse.status -in @("ready", "ready-degraded")) {
            $results.api_healthy = $true
            if ($apiResponse.status -eq "ready-degraded") {
                $results.errors += "Production ready but degraded: $($apiResponse.message)"
            }
        } else {
            $results.errors += "Production not ready: $($apiResponse.message)"
        }
    } catch {
        $results.errors += "Production readiness check failed: $($_.Exception.Message)"
    }
    
    # Test frontend
    try {
        $frontendResponse = Invoke-WebRequest -Uri "https://care2connect.org" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        if ($frontendResponse.StatusCode -eq 200) {
            $results.frontend_healthy = $true
        } else {
            $results.errors += "Frontend returned status: $($frontendResponse.StatusCode)"
        }
    } catch {
        $results.errors += "Frontend failed: $($_.Exception.Message)"
    }
    
    # Test Tell Your Story page (critical for demos)
    try {
        $storyResponse = Invoke-WebRequest -Uri "https://care2connect.org/tell-your-story" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        if ($storyResponse.StatusCode -eq 200) {
            $results.story_page_healthy = $true
        } else {
            $results.errors += "Tell Your Story page returned status: $($storyResponse.StatusCode)"
        }
    } catch {
        $results.errors += "Tell Your Story page failed: $($_.Exception.Message)"
    }
    
    # Overall health assessment
    $results.overall_healthy = $results.api_healthy -and $results.frontend_healthy -and $results.story_page_healthy
    
    return $results
}

Write-MonitorLog "Starting continuous production tunnel monitoring" "INFO"
Write-MonitorLog "Monitoring: API, Frontend, Tell Your Story page, Tunnel process" "INFO"

try {
    while ($true) {
        $health = Test-ProductionHealth
        
        if ($health.overall_healthy) {
            # System is healthy
            $consecutiveFailures = 0
            
            $status = @()
            if ($health.api_healthy) { $status += "API:✅" }
            if ($health.frontend_healthy) { $status += "Web:✅" }
            if ($health.story_page_healthy) { $status += "Story:✅" }
            if ($health.tunnel_process_running) { $status += "Tunnel:✅" }
            
            Write-MonitorLog "Production healthy - $($status -join ' | ')" "INFO"
            
        } else {
            # System has issues
            $consecutiveFailures++
            
            $status = @()
            if ($health.api_healthy) { $status += "API:✅" } else { $status += "API:❌" }
            if ($health.frontend_healthy) { $status += "Web:✅" } else { $status += "Web:❌" }
            if ($health.story_page_healthy) { $status += "Story:✅" } else { $status += "Story:❌" }
            if ($health.tunnel_process_running) { $status += "Tunnel:✅" } else { $status += "Tunnel:❌" }
            
            Write-MonitorLog "Production issues detected ($consecutiveFailures/$AlertThresholdFailures) - $($status -join ' | ')" "WARN"
            
            # Log specific errors
            foreach ($error in $health.errors) {
                Write-MonitorLog "Error: $error" "ERROR"
            }
            
            # Send alert if threshold reached
            if ($consecutiveFailures -ge $AlertThresholdFailures) {
                $uptime = [math]::Round(((Get-Date) - $monitoringStart).TotalHours, 1)
                
                $subject = "🚨 PRODUCTION TUNNEL DOWN - care2connect.org INACCESSIBLE"
                $body = @"
Production tunnel monitoring has detected $consecutiveFailures consecutive failures.

FAILED COMPONENTS:
$(if (-not $health.api_healthy) { "❌ Production Readiness: https://api.care2connect.org/ops/health/production" })
$(if (-not $health.frontend_healthy) { "❌ Frontend: https://care2connect.org" })
$(if (-not $health.story_page_healthy) { "❌ Tell Your Story: https://care2connects.org/tell-your-story" })
$(if (-not $health.tunnel_process_running) { "❌ Tunnel Process: cloudflared not running" })

ERRORS:
$(($health.errors | ForEach-Object { "• $_" }) -join "`n")

TROUBLESHOOTING:
1. Check if local servers are running: http://localhost:3000
2. Restart tunnel: .\scripts\tunnel-start.ps1 -StrictMode  
3. Verify tunnel config: Get-Process cloudflared
4. Run full verification: .\scripts\prod-verify.ps1

Monitor uptime: ${uptime}h
Timestamp: $($health.timestamp)
"@
                
                Send-Alert -Subject $subject -Body $body
                Write-MonitorLog "CRITICAL ALERT SENT: Production tunnel down" "ALERT"
            }
        }
        
        Start-Sleep -Seconds $IntervalSec
    }
    
} catch {
    Write-MonitorLog "Monitoring loop crashed: $($_.Exception.Message)" "ERROR"
    
    # Send crash alert
    if ($EnableEmailAlerts -or $EnableSlackAlerts) {
        Send-Alert -Subject "🚨 Tunnel Monitor Crashed" -Body "Production tunnel monitoring has crashed: $($_.Exception.Message)"
    }
    
    throw
} finally {
    Write-MonitorLog "Production tunnel monitoring stopped" "INFO"
}