#Requires -Version 5.1
<#
.SYNOPSIS
    Production watchdog -- monitors and auto-restarts Care2Connect services.

.DESCRIPTION
    Loops every 10-15 seconds and verifies:
      1. Backend /health/live returns service:"backend"
      2. Frontend /onboarding/v2 returns 200
      3. Port 8080 is listening (Caddy)
      4. cloudflared process is running

    On failure: restarts the specific PM2 process (not all services).
    Throttle: max 3 restarts per service per 5-minute window.
    Logs: logs/watchdog-stack.log

.PARAMETER IntervalSeconds
    Health check interval (default: 12).
.PARAMETER MaxRestartsPerWindow
    Max restarts per service per 5-minute window (default: 3).
.PARAMETER LogFile
    Path to log file (default: logs/watchdog-stack.log).

.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/ops/watchdog-stack.ps1
    # Stop cleanly with Ctrl+C

.NOTES
    PS 5.1 compatible. No unicode. No multi-arg Join-Path.
#>
param(
    [int]$IntervalSeconds = 12,
    [int]$MaxRestartsPerWindow = 3,
    [string]$LogFile
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "SilentlyContinue"

# -- Resolve paths -------------------------------------------------------
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
# Fallback: if $PSScriptRoot is empty (dot-sourced), use CWD
if (-not $Root -or -not (Test-Path $Root)) { $Root = (Get-Location).Path }

$LogDir = Join-Path $Root "logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

if (-not $LogFile) { $LogFile = Join-Path $LogDir "watchdog-stack.log" }

# -- Throttle state (hashtable: service -> list of restart timestamps) ----
$RestartHistory = @{}
$WindowSeconds = 300  # 5 minutes

# -- Helpers ---------------------------------------------------------------
function Write-Log {
    param([string]$Msg, [string]$Level = "INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] [$Level] $Msg"
    Add-Content -Path $LogFile -Value $line -ErrorAction SilentlyContinue
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN"  { "Yellow" }
        "FIX"   { "Magenta" }
        "OK"    { "Green" }
        default { "Gray" }
    }
    Write-Host $line -ForegroundColor $color
}

function Test-Throttle {
    param([string]$Service)
    $now = Get-Date
    $cutoff = $now.AddSeconds(-$WindowSeconds)

    if (-not $RestartHistory.ContainsKey($Service)) {
        $RestartHistory[$Service] = [System.Collections.Generic.List[datetime]]::new()
    }

    # Prune old entries
    $kept = [System.Collections.Generic.List[datetime]]::new()
    foreach ($t in $RestartHistory[$Service]) {
        if ($t -gt $cutoff) { $kept.Add($t) }
    }
    $RestartHistory[$Service] = $kept

    if ($kept.Count -ge $MaxRestartsPerWindow) {
        return $false  # throttled
    }
    return $true  # allowed
}

function Record-Restart {
    param([string]$Service)
    if (-not $RestartHistory.ContainsKey($Service)) {
        $RestartHistory[$Service] = [System.Collections.Generic.List[datetime]]::new()
    }
    $RestartHistory[$Service].Add((Get-Date))
}

function Restart-Service {
    param([string]$Service, [string]$PM2Name)
    if (-not (Test-Throttle $Service)) {
        Write-Log "$Service restart THROTTLED ($MaxRestartsPerWindow restarts in last 5 min)" "WARN"
        return
    }
    Write-Log "Restarting $Service via pm2 restart $PM2Name" "FIX"
    $output = & pm2 restart $PM2Name 2>&1 | Out-String
    $ec = $LASTEXITCODE
    if ($null -eq $ec) { $ec = 0 }
    Record-Restart $Service
    if ($ec -eq 0) {
        Write-Log "$Service restarted successfully" "FIX"
    } else {
        Write-Log "$Service restart may have failed (exit=$ec): $output" "ERROR"
    }
}

# -- PM2 process name detection -------------------------------------------
# Find the correct PM2 names for caddy and tunnel (prod vs dev suffix)
function Get-PM2Name {
    param([string]$Pattern)
    $list = & pm2 jlist 2>$null | Out-String
    if (-not $list -or $list.Trim() -eq "[]") { return $null }
    try {
        # Simple regex match to find process names
        $matches_ = [regex]::Matches($list, '"name"\s*:\s*"([^"]*)"')
        foreach ($m in $matches_) {
            $name = $m.Groups[1].Value
            if ($name -like "*$Pattern*") { return $name }
        }
    } catch {}
    return $null
}

# =========================================================================
# MAIN LOOP
# =========================================================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CARE2CONNECT WATCHDOG                                     " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Interval: ${IntervalSeconds}s | Throttle: $MaxRestartsPerWindow restarts / 5 min" -ForegroundColor Gray
Write-Host "  Log: $LogFile" -ForegroundColor Gray
Write-Host "  Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

Write-Log "Watchdog started (interval=${IntervalSeconds}s, throttle=$MaxRestartsPerWindow/5min)"

$cycle = 0

while ($true) {
    $cycle++
    $issues = @()

    # ---- Check 1: Backend /health/live with service:"backend" ----
    try {
        $resp = Invoke-RestMethod -Uri "http://localhost:3001/health/live" -TimeoutSec 5 -ErrorAction Stop
        $svc = $null
        if ($resp -and $resp.PSObject -and $resp.PSObject.Properties["service"]) {
            $svc = $resp.service
        }
        if ($svc -ne "backend") {
            $issues += @{ Service = "backend"; Reason = "service='$svc' (expected 'backend')" }
        }
    } catch {
        $issues += @{ Service = "backend"; Reason = "/health/live unreachable: $($_.Exception.Message)" }
    }

    # ---- Check 2: Frontend /onboarding/v2 returns 200 ----
    try {
        $wr = Invoke-WebRequest -Uri "http://localhost:3000/onboarding/v2" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        if ([int]$wr.StatusCode -ne 200) {
            $issues += @{ Service = "frontend"; Reason = "/onboarding/v2 returned $([int]$wr.StatusCode)" }
        }
    } catch {
        $issues += @{ Service = "frontend"; Reason = "/onboarding/v2 unreachable: $($_.Exception.Message)" }
    }

    # ---- Check 3: Port 8080 is listening (Caddy) ----
    $caddyListeners = @(Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue)
    if ($caddyListeners.Count -eq 0) {
        $issues += @{ Service = "caddy"; Reason = "Port 8080 not listening" }
    }

    # ---- Check 4: cloudflared process is running ----
    $cfProc = @(Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue)
    if ($cfProc.Count -eq 0) {
        $issues += @{ Service = "tunnel"; Reason = "cloudflared process not found" }
    }

    # ---- Evaluate results ----
    if ($issues.Count -eq 0) {
        # All healthy -- log every 25 cycles (~5 min at 12s interval)
        if ($cycle % 25 -eq 0) {
            Write-Log "All services healthy (cycle $cycle)" "OK"
        }
    } else {
        # Group issues by service and restart each failed service
        $failedServices = @{}
        foreach ($issue in $issues) {
            $sn = $issue.Service
            if (-not $failedServices.ContainsKey($sn)) {
                $failedServices[$sn] = @()
            }
            $failedServices[$sn] += $issue.Reason
        }

        foreach ($sn in $failedServices.Keys) {
            $reasons = $failedServices[$sn] -join "; "
            Write-Log "$sn UNHEALTHY: $reasons" "WARN"

            # Map service to PM2 process name
            switch ($sn) {
                "backend" {
                    $pm2name = Get-PM2Name "backend"
                    if ($pm2name) {
                        Restart-Service -Service "backend" -PM2Name $pm2name
                    } else {
                        Write-Log "backend: no PM2 process found -- cannot auto-restart" "ERROR"
                    }
                }
                "frontend" {
                    $pm2name = Get-PM2Name "frontend"
                    if ($pm2name) {
                        Restart-Service -Service "frontend" -PM2Name $pm2name
                    } else {
                        Write-Log "frontend: no PM2 process found -- cannot auto-restart" "ERROR"
                    }
                }
                "caddy" {
                    $pm2name = Get-PM2Name "caddy"
                    if ($pm2name) {
                        Restart-Service -Service "caddy" -PM2Name $pm2name
                    } else {
                        Write-Log "caddy: no PM2 process found -- cannot auto-restart" "ERROR"
                    }
                }
                "tunnel" {
                    $pm2name = Get-PM2Name "tunnel"
                    if ($pm2name) {
                        Restart-Service -Service "tunnel" -PM2Name $pm2name
                    } else {
                        Write-Log "tunnel: no PM2 process found -- cannot auto-restart" "ERROR"
                    }
                }
            }
        }

        # Post-restart: wait a bit extra for services to come up
        Start-Sleep -Seconds 5
    }

    Start-Sleep -Seconds $IntervalSeconds
}
