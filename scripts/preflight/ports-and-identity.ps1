#Requires -Version 5.1
<#
.SYNOPSIS
    Port sweep + service identity verification for local development.

.DESCRIPTION
    1. Kills all listeners on ports 3000, 3001, 8080, 8443.
    2. Optionally starts backend/frontend (or confirms they are already running).
    3. Validates exactly ONE listener per expected port.
    4. Validates backend on 3001: health/live returns service="backend".
    5. Validates frontend on 3000: /, /onboarding/v2, /provider/login => 200.
    6. Validates /papi/sessions?limit=1 returns 401 within 2 seconds.
    7. Prints final "READY FOR MANUAL TESTING" summary.

.PARAMETER SkipSweep
    Skip the initial port-sweep kill step.
.PARAMETER SweepOnly
    Kill all listeners then exit (no verification).

.OUTPUTS
    Exit 0 -- all checks pass
    Exit 1 -- at least one check failed

#>
param(
    [switch]$SweepOnly,
    [switch]$SkipSweep
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "SilentlyContinue"

$KillPorts     = @(3000, 3001, 8080, 8443)
$BackendPort   = 3001
$FrontendPort  = 3000
$ProxyTimeout  = 5
$Failures      = [System.Collections.Generic.List[string]]::new()
$Summary       = [System.Collections.Generic.List[string]]::new()

function Get-CmdLine($pid_) {
    try {
        $p = Get-CimInstance Win32_Process -Filter "ProcessId=$pid_" -EA SilentlyContinue
        if ($p) { return $p.CommandLine }
    } catch {}
    return "(unknown)"
}

function Fail ($msg) {
    Write-Host "  [FAIL] $msg" -ForegroundColor Red
    $script:Failures.Add($msg)
}
function Pass ($msg) {
    Write-Host "  [OK]   $msg" -ForegroundColor Green
    $script:Summary.Add("OK: $msg")
}
function Info ($msg) { Write-Host "  [INFO] $msg" -ForegroundColor Gray }
function Sect ($msg) { Write-Host "`n-- $msg --" -ForegroundColor Cyan }

# ============================================================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Preflight: Port Sweep + Service Identity Verification     " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

# ---- B0: PORT SWEEP -------------------------------------------------------
if (-not $SkipSweep) {
    Sect "B0 -- Port Sweep ($($KillPorts -join ', '))"
    $killed = 0
    foreach ($port in $KillPorts) {
        $ls = @(Get-NetTCPConnection -LocalPort $port -State Listen -EA SilentlyContinue)
        if ($ls.Count -eq 0) { Info "Port $port -- clear"; continue }
        foreach ($c in $ls) {
            $pid_ = $c.OwningProcess
            $cmd  = Get-CmdLine $pid_
            $short = if ($cmd.Length -gt 110) { $cmd.Substring(0,110) + "..." } else { $cmd }
            Write-Host "  [KILL] Port $port PID $pid_" -ForegroundColor Yellow
            Info "       $short"
            Stop-Process -Id $pid_ -Force -EA SilentlyContinue
            $killed++
        }
    }
    if ($killed -gt 0) {
        Info "Killed $killed process(es). Waiting 2s..."
        Start-Sleep -Seconds 2
    } else { Pass "All target ports already clear." }
    if ($SweepOnly) {
        Write-Host "`n[OK] Port sweep complete (-SweepOnly)." -ForegroundColor Green
        exit 0
    }
} else {
    Sect "B0 -- Port Sweep SKIPPED (-SkipSweep)"
}

# ---- B1: BACKEND IDENTITY (port 3001) ------------------------------------
Sect "B1 -- Backend Identity (port $BackendPort)"

$backendListeners = @(Get-NetTCPConnection -LocalPort $BackendPort -State Listen -EA SilentlyContinue)
if ($backendListeners.Count -eq 0) {
    Fail "Port $BackendPort -- nobody listening. Start backend first."
} elseif ($backendListeners.Count -gt 1) {
    Fail "Port $BackendPort -- MULTIPLE listeners detected (rogue process collision)."
    foreach ($c in $backendListeners) {
        Info "  PID $($c.OwningProcess): $(Get-CmdLine $c.OwningProcess)"
    }
} else {
    $bPid = $backendListeners[0].OwningProcess
    $bCmd = Get-CmdLine $bPid
    Info "PID $bPid : $bCmd"
    if ($bCmd -match "server\.ts|backend" -and $bCmd -notmatch "next") {
        Pass "Process command line looks like backend."
    } else {
        Fail "Command line does not look like backend (may be rogue Next.js): $bCmd"
    }
}

try {
    $h = Invoke-RestMethod -Uri "http://localhost:$BackendPort/health/live" -TimeoutSec 5 -EA Stop
    $svc = if ($h.PSObject -and $h.PSObject.Properties["service"]) { $h.service } else { "(missing)" }
    $sts = if ($h.PSObject -and $h.PSObject.Properties["status"])  { $h.status  } else { "(missing)" }
    Info "GET /health/live => status=$sts service=$svc"
    if ($svc -eq "backend") {
        Pass "Backend identity confirmed: service=backend"
    } elseif ($svc -eq "(missing)") {
        Fail "Backend /health/live has no 'service' field. Add service:'backend' to the response."
    } else {
        Fail "WRONG SERVICE on port $BackendPort: service='$svc' (expected 'backend'). Rogue process?"
    }
    if ($sts -eq "alive") { Pass "Backend status: alive" } else { Fail "Backend status='$sts' (expected 'alive')" }
} catch {
    Fail "Cannot reach http://localhost:$BackendPort/health/live -- $_"
}

# ---- B2: FRONTEND IDENTITY (port 3000) -----------------------------------
Sect "B2 -- Frontend Reachability (port $FrontendPort)"

$frontendListeners = @(Get-NetTCPConnection -LocalPort $FrontendPort -State Listen -EA SilentlyContinue)
if ($frontendListeners.Count -eq 0) {
    Fail "Port $FrontendPort -- nobody listening. Start frontend first."
} elseif ($frontendListeners.Count -gt 1) {
    Fail "Port $FrontendPort -- MULTIPLE listeners (collision)."
} else {
    $fPid = $frontendListeners[0].OwningProcess
    $fCmd = Get-CmdLine $fPid
    Info "PID $fPid : $fCmd"
    if ($fCmd -match "next.*3000|start-server") {
        Pass "Frontend process looks correct."
    } else {
        Fail "Frontend command line does not match expected pattern: $fCmd"
    }
}

foreach ($path_ in @("/", "/onboarding/v2", "/provider/login")) {
    $url = "http://localhost:$FrontendPort$path_"
    try {
        $wr = Invoke-WebRequest -Uri $url -TimeoutSec 15 -UseBasicParsing -EA Stop
        if ([int]$wr.StatusCode -eq 200) { Pass "GET $url => 200" }
        else { Fail "GET $url => $([int]$wr.StatusCode) (expected 200)" }
    } catch {
        Fail "GET $url failed: $_"
    }
}

# ---- B3: PROVIDER PROXY FAST + ALIVE -------------------------------------
Sect "B3 -- Provider Proxy (/papi)"

# GET /papi/sessions?limit=1 -- expect 401 quickly
$papiUrl = "http://localhost:$FrontendPort/papi/sessions?limit=1"
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$scode = $null
try {
    try {
        $wr = Invoke-WebRequest -Uri $papiUrl -TimeoutSec $ProxyTimeout -UseBasicParsing -EA Stop
        $scode = [int]$wr.StatusCode
    } catch [System.Net.WebException] {
        $resp = $_.Exception.Response
        if ($resp) { $scode = [int]$resp.StatusCode }
    }
} catch { Fail "GET $papiUrl exception: $_" }
$sw.Stop()
$elapsed = [math]::Round($sw.Elapsed.TotalSeconds, 2)

if ($scode -eq 401) {
    if ($elapsed -le 2) { Pass "GET $papiUrl => 401 in ${elapsed}s (fast)" }
    else { Fail "GET $papiUrl => 401 but took ${elapsed}s (expected <2s)" }
} elseif ($scode -eq 200) {
    Fail "GET $papiUrl => 200 (should require auth -- proxy unprotected!)"
} elseif ($scode) {
    Fail "GET $papiUrl => $scode in ${elapsed}s (expected 401)"
} else {
    Fail "GET $papiUrl => no status in ${elapsed}s (hung/timeout/loop)"
}

# POST /papi/auth with bad token -- expect 401
$authUrl = "http://localhost:$FrontendPort/papi/auth"
try {
    try {
        $body = '{"token":"invalid-test-token"}'
        $wr2 = Invoke-WebRequest -Uri $authUrl -Method POST -Body $body -ContentType "application/json" -TimeoutSec $ProxyTimeout -UseBasicParsing -EA Stop
        $scode2 = [int]$wr2.StatusCode
    } catch [System.Net.WebException] {
        $resp2 = $_.Exception.Response
        if ($resp2) { $scode2 = [int]$resp2.StatusCode }
    }
    if ($scode2 -eq 401) { Pass "POST $authUrl (bad token) => 401" }
    else { Fail "POST $authUrl (bad token) => $scode2 (expected 401)" }
} catch { Fail "POST $authUrl exception: $_" }

# ---- B4: INFRASTRUCTURE -- Caddy + Cloudflared ----------------------------
Sect "B4 -- Infrastructure (Caddy + Cloudflared)"

# Check Caddy on port 8080
$caddyListeners = @(Get-NetTCPConnection -LocalPort 8080 -State Listen -EA SilentlyContinue)
if ($caddyListeners.Count -eq 0) {
    Fail "Port 8080 -- nobody listening. Start Caddy: pm2 start ecosystem.prod.config.js (or bin\caddy\caddy.exe run --config Caddyfile.production)"
} else {
    Pass "Caddy listening on port 8080"
}

# Check cloudflared process
$cfProcs = @(Get-Process -Name "cloudflared" -EA SilentlyContinue)
if ($cfProcs.Count -eq 0) {
    Fail "cloudflared process not running. Start tunnel: pm2 start ecosystem.prod.config.js (or cloudflared tunnel --edge-ip-version 4 run care2connects-tunnel)"
} else {
    Pass "cloudflared process running (PID $($cfProcs[0].Id))"
}

# ---- B5: PUBLIC ENDPOINTS -- production URL reachability -------------------
Sect "B5 -- Public Endpoint Reachability"

foreach ($pubUrl in @("https://care2connects.org/onboarding/v2", "https://care2connects.org/provider/login")) {
    try {
        $pubResp = Invoke-WebRequest -Uri $pubUrl -TimeoutSec 10 -UseBasicParsing -EA Stop
        if ([int]$pubResp.StatusCode -eq 200) {
            Pass "GET $pubUrl => 200"
        } else {
            Fail "GET $pubUrl => $([int]$pubResp.StatusCode) (expected 200)"
        }
    } catch {
        Fail "GET $pubUrl failed: $($_.Exception.Message). Is cloudflared + Caddy running?"
    }
}

# Quick papi auth check via public URL (should return 401 within 2s)
$pubPapi = "http://localhost:$FrontendPort/papi/sessions?limit=1"
$swPub = [System.Diagnostics.Stopwatch]::StartNew()
$pubPapiCode = $null
try {
    try {
        $wrPub = Invoke-WebRequest -Uri $pubPapi -TimeoutSec $ProxyTimeout -UseBasicParsing -EA Stop
        $pubPapiCode = [int]$wrPub.StatusCode
    } catch [System.Net.WebException] {
        $respPub = $_.Exception.Response
        if ($respPub) { $pubPapiCode = [int]$respPub.StatusCode }
    }
} catch {}
$swPub.Stop()
$elapsedPub = [math]::Round($swPub.Elapsed.TotalSeconds, 2)

if ($pubPapiCode -eq 401 -and $elapsedPub -le 2) {
    Pass "papi/sessions?limit=1 => 401 in ${elapsedPub}s (fast, auth enforced)"
} elseif ($pubPapiCode -eq 401) {
    Fail "papi/sessions?limit=1 => 401 but took ${elapsedPub}s (expected <=2s) -- backend may be slow"
} elseif ($pubPapiCode) {
    Fail "papi/sessions?limit=1 => $pubPapiCode (expected 401)"
} else {
    Fail "papi/sessions?limit=1 => no response in ${elapsedPub}s -- proxy or backend down"
}

# ---- SUMMARY --------------------------------------------------------------
Sect "Port Binding Summary"
foreach ($p in @(3000, 3001, 8080)) {
    $ls = @(Get-NetTCPConnection -LocalPort $p -State Listen -EA SilentlyContinue)
    if ($ls.Count -eq 0) { Info "Port $p -- (no listener)" }
    else {
        foreach ($c in $ls) {
            $cmd = Get-CmdLine $c.OwningProcess
            $short = if ($cmd.Length -gt 110) { $cmd.Substring(0,110) + "..." } else { $cmd }
            Info "Port $p PID $($c.OwningProcess): $short"
        }
    }
}

Write-Host ""
if ($Failures.Count -eq 0) {
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "  READY FOR MANUAL TESTING                   " -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""
    foreach ($s in $Summary) { Write-Host "  $s" -ForegroundColor Green }
    Write-Host ""
    exit 0
} else {
    Write-Host "=============================================" -ForegroundColor Red
    Write-Host "  NOT READY -- $($Failures.Count) check(s) failed" -ForegroundColor Red
    Write-Host "=============================================" -ForegroundColor Red
    Write-Host ""
    foreach ($f in $Failures) { Write-Host "  * $f" -ForegroundColor Red }
    Write-Host ""
    Write-Host "Fix the above failures before manual testing."
    Write-Host "See docs/DEPLOYMENT_RUNBOOK_WINDOWS.md for remediation."
    exit 1
}
