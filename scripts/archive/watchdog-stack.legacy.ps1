#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Watchdog for Care2Connects stack auto-recovery
.DESCRIPTION
    Monitors stack health and attempts automatic recovery:
    - Checks ports, processes, and public endpoints every 30 seconds
    - Attempts targeted component restarts first
    - Falls back to full stack restart after 2 consecutive failures
    - Logs all recovery attempts to logs/watchdog-stack.log
.EXAMPLE
    .\scripts\watchdog-stack.ps1
#>

param(
    [int]$CheckIntervalSeconds = 30,
    [int]$MaxConsecutiveFailures = 2
)

$ErrorActionPreference = "Stop"
$workspaceRoot = Split-Path -Parent $PSScriptRoot

# Load canonical ports
$portsFile = "$workspaceRoot\config\ports.json"
$ports = Get-Content $portsFile | ConvertFrom-Json
$FRONTEND_PORT = $ports.frontend
$BACKEND_PORT = $ports.backend
$PROXY_PORT = $ports.proxy

# Setup logging
$logDir = "$workspaceRoot\logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}
$logFile = "$logDir\watchdog-stack.log"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logLine = "[$timestamp] [$Level] $Message"
    Add-Content -Path $logFile -Value $logLine
    
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "RECOVERY" { "Magenta" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    Write-Host $logLine -ForegroundColor $color
}

function Test-Port {
    param([int]$Port)
    $result = netstat -ano | Select-String ":$Port " | Select-Object -First 1
    return $null -ne $result
}

function Test-Process {
    param([string]$Name)
    $proc = Get-Process $Name -ErrorAction SilentlyContinue
    return $null -ne $proc
}

function Test-PublicEndpoint {
    param([string]$Url, [string]$ExpectedContentType)
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -ne 200) {
            return $false
        }
        if ($ExpectedContentType -and $response.Headers['Content-Type'] -notmatch $ExpectedContentType) {
            return $false
        }
        return $true
    } catch {
        return $false
    }
}

function Restart-Component {
    param([string]$Component)
    
    Write-Log "Attempting to restart $Component..." "RECOVERY"
    
    switch ($Component) {
        "Caddy" {
            Stop-Process -Name caddy -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            Start-Process powershell -ArgumentList @(
                "-NoExit",
                "-NoProfile",
                "-Command",
                "Write-Host 'Caddy Reverse Proxy (Auto-restarted)' -ForegroundColor Cyan; cd '$workspaceRoot'; .\bin\caddy\caddy.exe run --config Caddyfile.production"
            ) -WindowStyle Normal
            Start-Sleep -Seconds 5
        }
        "Backend" {
            $backendPid = $null
            $netstat = netstat -ano | Select-String ":$BACKEND_PORT " | Select-Object -First 1
            if ($netstat -match '\s+(\d+)\s*$') {
                $backendPid = $matches[1]
                Stop-Process -Id $backendPid -Force -ErrorAction SilentlyContinue
            }
            Start-Sleep -Seconds 2
            Start-Process powershell -ArgumentList @(
                "-NoExit",
                "-NoProfile",
                "-Command",
                "Write-Host 'Backend API (Auto-restarted)' -ForegroundColor Green; cd '$workspaceRoot\backend'; npm start"
            ) -WindowStyle Normal
            Start-Sleep -Seconds 10
        }
        "Frontend" {
            $frontendPid = $null
            $netstat = netstat -ano | Select-String ":$FRONTEND_PORT " | Select-Object -First 1
            if ($netstat -match '\s+(\d+)\s*$') {
                $frontendPid = $matches[1]
                Stop-Process -Id $frontendPid -Force -ErrorAction SilentlyContinue
            }
            Start-Sleep -Seconds 2
            Start-Process powershell -ArgumentList @(
                "-NoExit",
                "-NoProfile",
                "-Command",
                "Write-Host 'Frontend (Auto-restarted)' -ForegroundColor Blue; cd '$workspaceRoot\frontend'; npm run dev"
            ) -WindowStyle Normal
            Start-Sleep -Seconds 20
        }
        "Tunnel" {
            Stop-Process -Name cloudflared -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            Start-Process powershell -ArgumentList @(
                "-NoExit",
                "-NoProfile",
                "-Command",
                "Write-Host 'Cloudflare Tunnel (Auto-restarted, IPv4-Only)' -ForegroundColor Cyan; cloudflared tunnel --edge-ip-version 4 run care2connects-tunnel"
            ) -WindowStyle Normal
            Start-Sleep -Seconds 10
        }
    }
    
    Write-Log "$Component restart attempted" "RECOVERY"
}

function Restart-FullStack {
    Write-Log "Performing FULL STACK RESTART..." "RECOVERY"
    
    # Stop everything
    Stop-Process -Name cloudflared -Force -ErrorAction SilentlyContinue
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Stop-Process -Name caddy -Force -ErrorAction SilentlyContinue
    
    Start-Sleep -Seconds 5
    
    # Restart via start-stack.ps1
    Write-Log "Executing start-stack.ps1..." "RECOVERY"
    & "$PSScriptRoot\start-stack.ps1" -SkipValidation
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Full stack restart SUCCEEDED" "SUCCESS"
        return $true
    } else {
        Write-Log "Full stack restart FAILED" "ERROR"
        return $false
    }
}

function Perform-HealthCheck {
    $issues = @()
    
    # Check ports
    if (-not (Test-Port $PROXY_PORT)) {
        $issues += "Caddy (port $PROXY_PORT down)"
    }
    if (-not (Test-Port $BACKEND_PORT)) {
        $issues += "Backend (port $BACKEND_PORT down)"
    }
    if (-not (Test-Port $FRONTEND_PORT)) {
        $issues += "Frontend (port $FRONTEND_PORT down)"
    }
    
    # Check processes
    if (-not (Test-Process "caddy")) {
        $issues += "Caddy process missing"
    }
    if (-not (Test-Process "cloudflared")) {
        $issues += "Tunnel process missing"
    }
    
    # Check public endpoints (less frequent, more lenient)
    $publicApiOk = Test-PublicEndpoint "https://api.care2connects.org/health/live" "application/json"
    if (-not $publicApiOk) {
        $issues += "Public API not responding"
    }
    
    $publicFrontendOk = Test-PublicEndpoint "https://care2connects.org" "text/html"
    if (-not $publicFrontendOk) {
        $issues += "Public frontend not responding"
    }
    
    return $issues
}

# Main watchdog loop
Write-Log "Watchdog started (check interval: ${CheckIntervalSeconds}s, max failures: $MaxConsecutiveFailures)" "INFO"
Write-Log "Monitoring: Ports $PROXY_PORT/$BACKEND_PORT/$FRONTEND_PORT, Processes, Public endpoints" "INFO"

$consecutiveFailures = 0
$cycleCount = 0

# Log rotation (keep last 7 days)
$logFiles = Get-ChildItem $logDir -Filter "watchdog-stack*.log" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) }
foreach ($oldLog in $logFiles) {
    Remove-Item $oldLog.FullName -Force
    Write-Log "Rotated old log: $($oldLog.Name)" "INFO"
}

while ($true) {
    $cycleCount++
    $issues = Perform-HealthCheck
    
    if ($issues.Count -eq 0) {
        # All healthy
        if ($consecutiveFailures -gt 0) {
            Write-Log "Health check PASSED (recovered after $consecutiveFailures failure(s))" "SUCCESS"
        }
        $consecutiveFailures = 0
        
        # Silent success (only log every 10 cycles to reduce noise)
        if ($cycleCount % 10 -eq 0) {
            Write-Log "Health check PASSED (cycle $cycleCount)" "INFO"
        }
    } else {
        # Issues detected
        $consecutiveFailures++
        Write-Log "Health check FAILED (attempt $consecutiveFailures/$MaxConsecutiveFailures): $($issues -join ', ')" "WARN"
        
        if ($consecutiveFailures -ge $MaxConsecutiveFailures) {
            # Too many failures, full restart
            Write-Log "Max consecutive failures reached, performing FULL STACK RESTART" "ERROR"
            $restartSuccess = Restart-FullStack
            
            if ($restartSuccess) {
                $consecutiveFailures = 0
            } else {
                Write-Log "Full stack restart FAILED - manual intervention required" "ERROR"
                # Don't reset counter, will keep trying
            }
        } else {
            # Try targeted restarts
            foreach ($issue in $issues) {
                if ($issue -like "*Caddy*") {
                    Restart-Component "Caddy"
                } elseif ($issue -like "*Backend*") {
                    Restart-Component "Backend"
                } elseif ($issue -like "*Frontend*") {
                    Restart-Component "Frontend"
                } elseif ($issue -like "*Tunnel*") {
                    Restart-Component "Tunnel"
                }
            }
        }
    }
    
    Start-Sleep -Seconds $CheckIntervalSeconds
}
