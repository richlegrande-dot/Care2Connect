#Requires -Version 5.1
<#
.SYNOPSIS
    Uptime drill -- verifies restart recovery or readiness for critical services.

.DESCRIPTION
    Two modes:

    DISRUPTIVE (default):
      Proves the stack can survive a Caddy restart (and optionally a tunnel restart)
      by checking baseline health, bouncing the service via PM2, then polling
      until it recovers or the timeout expires.

    NON-DISRUPTIVE (-NonDisruptive):
      Verifies all services are healthy WITHOUT restarting anything.
      Checks PM2 status, localhost endpoints, and optionally public URLs.
      Suitable for open-testing preflight where downtime is unacceptable.

    Steps (disruptive):
      1. Baseline: verify backend /health/live, frontend reachable, Caddy (8080),
         cloudflared running.
      2. Restart care2connect-caddy via PM2.
      3. Poll port 8080 every 2s until it comes back (max TimeoutSeconds).
      4. (If -IncludeTunnel) Restart care2connect-tunnel, poll public endpoint.

    Steps (non-disruptive):
      1. PM2 app status for caddy + tunnel = "online"
      2. Backend /health/live, frontend /, Caddy port 8080
      3. (If -IncludeTunnel) Public URLs return 200

.PARAMETER TimeoutSeconds
    Max seconds to wait for a service to recover (default: 30).

.PARAMETER IncludeTunnel
    Also check (or bounce) the cloudflared tunnel.

.PARAMETER NonDisruptive
    Poll-only mode -- do NOT restart any services. Safe for open testing.

.PARAMETER PublicUrl
    Primary public URL to probe (default: https://care2connects.org/onboarding/v2).

.PARAMETER PublicProviderUrl
    Provider login URL to probe (default: https://care2connects.org/provider/login).

.OUTPUTS
    Exit 0 -- drill passed
    Exit 1 -- drill failed (service did not recover or not healthy)
#>
param(
    [int]$TimeoutSeconds = 30,
    [switch]$IncludeTunnel,
    [switch]$NonDisruptive,
    [string]$PublicUrl = "https://care2connects.org/onboarding/v2",
    [string]$PublicProviderUrl = "https://care2connects.org/provider/login"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Failures = [System.Collections.Generic.List[string]]::new()

function Fail ($msg) {
    Write-Host "  [FAIL] $msg" -ForegroundColor Red
    $script:Failures.Add($msg)
}
function Pass ($msg) { Write-Host "  [OK]   $msg" -ForegroundColor Green }
function Info ($msg) { Write-Host "  [INFO] $msg" -ForegroundColor Gray }

Write-Host ""
$modeLabel = if ($NonDisruptive) { "Non-Disruptive (poll only)" } else { "Disruptive (restart + recover)" }
Write-Host "-- Uptime Drill ($modeLabel) --" -ForegroundColor Cyan

# ---- PM2 name resolution ------------------------------------------------
function Get-PM2Name {
    param([string]$Pattern)
    $raw = & pm2 jlist 2>$null | Out-String
    if (-not $raw -or $raw.Trim() -eq "[]") { return $null }
    try {
        $matches_ = [regex]::Matches($raw, '"name"\s*:\s*"([^"]*)"')
        foreach ($m in $matches_) {
            $name = $m.Groups[1].Value
            if ($name -like "*$Pattern*") { return $name }
        }
    } catch {}
    return $null
}

# -- PM2 status helper (for non-disruptive mode) ---------------------------
function Get-PM2Status {
    param([string]$Pattern)
    $raw = & pm2 jlist 2>$null | Out-String
    if (-not $raw -or $raw.Trim() -eq "[]") { return $null }
    try {
        # Parse JSON-ish: find name + status pairs
        $procs = $raw | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($procs) {
            foreach ($p in $procs) {
                if ($p.name -like "*$Pattern*") {
                    $st = $null
                    if ($p.pm2_env -and $p.pm2_env.status) { $st = $p.pm2_env.status }
                    return @{ Name = $p.name; Status = $st }
                }
            }
        }
    } catch {}
    return $null
}

# ========================================================================
# NON-DISRUPTIVE MODE
# ========================================================================
if ($NonDisruptive) {
    Write-Host ""
    Write-Host "  Step 1: PM2 app status" -ForegroundColor White

    # Check caddy PM2 status
    $caddyInfo = Get-PM2Status "caddy"
    if ($caddyInfo) {
        if ($caddyInfo.Status -eq "online") {
            Pass "PM2 '$($caddyInfo.Name)' status: online"
        } else {
            Fail "PM2 '$($caddyInfo.Name)' status: $($caddyInfo.Status) (expected online)"
        }
    } else {
        Fail "No PM2 process matching 'caddy' found"
    }

    # Check tunnel PM2 status
    $tunnelInfo = Get-PM2Status "tunnel"
    if ($tunnelInfo) {
        if ($tunnelInfo.Status -eq "online") {
            Pass "PM2 '$($tunnelInfo.Name)' status: online"
        } else {
            Fail "PM2 '$($tunnelInfo.Name)' status: $($tunnelInfo.Status) (expected online)"
        }
    } else {
        Fail "No PM2 process matching 'tunnel' found"
    }

    Write-Host ""
    Write-Host "  Step 2: Localhost health" -ForegroundColor White

    # Backend /health/live
    try {
        $resp = Invoke-RestMethod -Uri "http://localhost:3001/health/live" -TimeoutSec 5 -ErrorAction Stop
        $svc = $null
        if ($resp -and $resp.PSObject -and $resp.PSObject.Properties["service"]) { $svc = $resp.service }
        if ($svc -eq "backend") {
            Pass "Backend /health/live -> service=backend"
        } else {
            Fail "Backend /health/live service='$svc' (expected 'backend')"
        }
    } catch {
        Fail "Backend /health/live unreachable: $($_.Exception.Message)"
    }

    # Frontend
    try {
        $wr = Invoke-WebRequest -Uri "http://localhost:3000/" -TimeoutSec 8 -UseBasicParsing -ErrorAction Stop
        if ([int]$wr.StatusCode -eq 200) {
            Pass "Frontend localhost:3000 -> 200"
        } else {
            Fail "Frontend returned $([int]$wr.StatusCode)"
        }
    } catch {
        Fail "Frontend unreachable: $($_.Exception.Message)"
    }

    # Caddy port 8080
    $caddyListeners = @(Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue)
    if ($caddyListeners.Count -gt 0) {
        Pass "Caddy port 8080 listening"
    } else {
        Fail "Caddy port 8080 not listening"
    }

    # Step 3: Public URLs (if IncludeTunnel)
    if ($IncludeTunnel) {
        Write-Host ""
        Write-Host "  Step 3: Public URL health" -ForegroundColor White

        foreach ($url in @($PublicUrl, $PublicProviderUrl)) {
            try {
                $pubResp = Invoke-WebRequest -Uri $url -TimeoutSec $TimeoutSeconds -UseBasicParsing -ErrorAction Stop
                if ([int]$pubResp.StatusCode -eq 200) {
                    Pass "$url -> 200"
                } else {
                    Fail "$url -> $([int]$pubResp.StatusCode)"
                }
            } catch {
                Fail "$url unreachable: $($_.Exception.Message)"
            }
        }
    }

    # Summary
    Write-Host ""
    if ($Failures.Count -eq 0) {
        Write-Host "  Uptime drill (non-disruptive) PASSED" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "  Uptime drill (non-disruptive) FAILED -- $($Failures.Count) issue(s)" -ForegroundColor Red
        foreach ($f in $Failures) { Write-Host "    * $f" -ForegroundColor Red }
        exit 1
    }
}

# ========================================================================
# DISRUPTIVE MODE (original behavior)
# ========================================================================

# ---- Step 1: Baseline health checks -------------------------------------
Write-Host ""
Write-Host "  Step 1: Baseline health" -ForegroundColor White

$baselineFail = $false

# Backend /health/live
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:3001/health/live" -TimeoutSec 5 -ErrorAction Stop
    $svc = $null
    if ($resp -and $resp.PSObject -and $resp.PSObject.Properties["service"]) { $svc = $resp.service }
    if ($svc -eq "backend") {
        Pass "Backend /health/live -> service=backend"
    } else {
        Fail "Backend /health/live service='$svc' (expected 'backend')"
        $baselineFail = $true
    }
} catch {
    Fail "Backend /health/live unreachable: $($_.Exception.Message)"
    $baselineFail = $true
}

# Frontend reachable
try {
    $wr = Invoke-WebRequest -Uri "http://localhost:3000/" -TimeoutSec 8 -UseBasicParsing -ErrorAction Stop
    if ([int]$wr.StatusCode -eq 200) {
        Pass "Frontend localhost:3000 -> 200"
    } else {
        Fail "Frontend returned $([int]$wr.StatusCode)"
        $baselineFail = $true
    }
} catch {
    Fail "Frontend unreachable: $($_.Exception.Message)"
    $baselineFail = $true
}

# Caddy port 8080
$caddyListeners = @(Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue)
if ($caddyListeners.Count -gt 0) {
    Pass "Caddy port 8080 listening"
} else {
    Fail "Caddy port 8080 not listening"
    $baselineFail = $true
}

# cloudflared running
$cfProc = @(Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue)
if ($cfProc.Count -gt 0) {
    Pass "cloudflared process running"
} else {
    Fail "cloudflared not running"
    $baselineFail = $true
}

if ($baselineFail) {
    Write-Host ""
    Write-Host "  Baseline checks failed -- cannot run uptime drill safely" -ForegroundColor Red
    Write-Host "  Fix the baseline issues first, then re-run." -ForegroundColor Yellow
    exit 1
}

# ---- Step 2: Caddy restart + recovery -----------------------------------
Write-Host ""
Write-Host "  Step 2: Caddy restart + recovery" -ForegroundColor White

$caddyPM2 = Get-PM2Name "caddy"
if (-not $caddyPM2) {
    Fail "Cannot find PM2 process matching 'caddy' -- cannot drill"
    Write-Host ""
    exit 1
}

Info "Restarting PM2 process '$caddyPM2'..."
$sw = [System.Diagnostics.Stopwatch]::StartNew()

$restartOut = & pm2 restart $caddyPM2 2>&1 | Out-String
$restartEC = $LASTEXITCODE
if ($null -eq $restartEC) { $restartEC = 0 }

if ($restartEC -ne 0) {
    Fail "pm2 restart $caddyPM2 exited with code $restartEC"
    Info "Output: $($restartOut.Trim())"
} else {
    Info "pm2 restart issued (exit 0)"
}

# Poll port 8080 until it comes back
$recovered = $false
$pollInterval = 2
$elapsed = 0

while ($elapsed -lt $TimeoutSeconds) {
    Start-Sleep -Seconds $pollInterval
    $elapsed = [int]$sw.Elapsed.TotalSeconds

    $listeners = @(Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue)
    if ($listeners.Count -gt 0) {
        $recovered = $true
        break
    }
    Info "  Waiting... ${elapsed}s / ${TimeoutSeconds}s"
}

$sw.Stop()
$totalSec = [math]::Round($sw.Elapsed.TotalSeconds, 1)

if ($recovered) {
    Pass "Caddy recovered on port 8080 in ${totalSec}s"
} else {
    Fail "Caddy did NOT recover on port 8080 within ${TimeoutSeconds}s"
}

# ---- Step 3 (optional): Tunnel restart + recovery -----------------------
if ($IncludeTunnel) {
    Write-Host ""
    Write-Host "  Step 3: Tunnel restart + recovery" -ForegroundColor White

    $tunnelPM2 = Get-PM2Name "tunnel"
    if (-not $tunnelPM2) {
        Fail "Cannot find PM2 process matching 'tunnel' -- cannot drill tunnel"
    } else {
        Info "Restarting PM2 process '$tunnelPM2'..."
        $sw2 = [System.Diagnostics.Stopwatch]::StartNew()

        $tRestartOut = & pm2 restart $tunnelPM2 2>&1 | Out-String
        $tRestartEC = $LASTEXITCODE
        if ($null -eq $tRestartEC) { $tRestartEC = 0 }

        if ($tRestartEC -ne 0) {
            Fail "pm2 restart $tunnelPM2 exited with code $tRestartEC"
        } else {
            Info "pm2 restart issued (exit 0)"
        }

        # Poll public URL
        $tRecovered = $false
        $tElapsed = 0

        # Give tunnel a moment to reconnect
        Start-Sleep -Seconds 3

        while ($tElapsed -lt $TimeoutSeconds) {
            try {
                $pubResp = Invoke-WebRequest -Uri $PublicUrl -TimeoutSec 8 -UseBasicParsing -ErrorAction Stop
                if ([int]$pubResp.StatusCode -eq 200) {
                    $tRecovered = $true
                    break
                }
            } catch {
                # Expected during recovery
            }
            Start-Sleep -Seconds $pollInterval
            $tElapsed = [int]$sw2.Elapsed.TotalSeconds
            Info "  Waiting... ${tElapsed}s / ${TimeoutSeconds}s"
        }

        $sw2.Stop()
        $tTotalSec = [math]::Round($sw2.Elapsed.TotalSeconds, 1)

        if ($tRecovered) {
            Pass "Tunnel recovered ($PublicUrl -> 200) in ${tTotalSec}s"

            # Also verify provider login URL
            try {
                $provResp = Invoke-WebRequest -Uri $PublicProviderUrl -TimeoutSec 8 -UseBasicParsing -ErrorAction Stop
                if ([int]$provResp.StatusCode -eq 200) {
                    Pass "Provider URL ($PublicProviderUrl -> 200)"
                } else {
                    Fail "Provider URL -> $([int]$provResp.StatusCode)"
                }
            } catch {
                Fail "Provider URL unreachable: $($_.Exception.Message)"
            }
        } else {
            Fail "Tunnel did NOT recover within ${TimeoutSeconds}s (probed $PublicUrl)"
        }
    }
}

# ---- Summary ------------------------------------------------------------
Write-Host ""
if ($Failures.Count -eq 0) {
    Write-Host "  Uptime drill PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host "  Uptime drill FAILED -- $($Failures.Count) issue(s)" -ForegroundColor Red
    foreach ($f in $Failures) { Write-Host "    * $f" -ForegroundColor Red }
    exit 1
}
