<#
.SYNOPSIS
    Port sweep + service identity verification.
    Run AFTER starting services to verify correct processes are on correct ports.
.DESCRIPTION
    1. Optionally kills all listeners on ports 3000, 3001, 8080, 8443 (-SweepOnly or default).
    2. Verifies backend identity on port 3001: health/live must return service=="backend".
    3. Verifies frontend reachability on port 3000: / and /onboarding/v2 return 200.
    4. Verifies provider proxy: /papi/sessions?limit=1 returns 401 quickly (<5s).
    5. Prints a port binding summary (PIDs and command lines).

    Context (Feb 2026):
    A rogue Next.js child process was bound to port 3001.
    health/live returned service=="frontend" -- the only signal.
    Proxy calls looped infinitely, causing timeouts and 502s.

.PARAMETER SweepOnly
    Kill all listeners then exit (no service checks).
.PARAMETER SkipSweep
    Skip the kill step (services already clean).
#>
param(
    [switch]$SweepOnly,
    [switch]$SkipSweep
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "SilentlyContinue"

$SweepPorts   = @(3000, 3001, 8080, 8443)
$BackendPort  = 3001
$FrontendPort = 3000
$ProxyTimeout = 5
$Failures     = [System.Collections.Generic.List[string]]::new()

function Get-ProcCmdLine($pid_) {
    try {
        $p = Get-CimInstance Win32_Process -Filter "ProcessId=$pid_" -ErrorAction SilentlyContinue
        if ($p) { return $p.CommandLine }
    } catch {}
    return "(unknown)"
}

function Write-Section($t) { Write-Host ""; Write-Host "-- $t --" -ForegroundColor Cyan }
function Write-OK($m)   { Write-Host "  OK : $m" -ForegroundColor Green }
function Write-FAIL($m) { Write-Host "  FAIL: $m" -ForegroundColor Red; $script:Failures.Add($m) }
function Write-INFO($m) { Write-Host "  .... $m" -ForegroundColor Gray }

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  PREFLIGHT: Port Sweep + Service Identity Verification     " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Run at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

# ============================================================================
# STEP 1 -- PORT SWEEP
# ============================================================================
if (-not $SkipSweep) {
    Write-Section "STEP 1 -- Port Sweep (ports: $($SweepPorts -join ', '))"
    $killed = 0
    foreach ($port in $SweepPorts) {
        $ls = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if (-not $ls) { Write-INFO "Port $port -- clear"; continue }
        foreach ($c in $ls) {
            $cmd = Get-ProcCmdLine $c.OwningProcess
            $short = if ($cmd.Length -gt 100) { $cmd.Substring(0,100) + "..." } else { $cmd }
            Write-Host "  [KILL] Port $port PID $($c.OwningProcess)" -ForegroundColor Yellow
            Write-INFO "       cmd: $short"
            Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
            $killed++
        }
    }
    if ($killed -gt 0) {
        Write-Host "  Killed $killed process(es). Waiting 2s..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    } else {
        Write-OK "All sweep ports were already clear."
    }
    if ($SweepOnly) {
        Write-Host ""; Write-Host "OK -- Port sweep complete (-SweepOnly)." -ForegroundColor Green
        exit 0
    }
} else {
    Write-Section "STEP 1 -- Port Sweep SKIPPED (-SkipSweep)"
}

# ============================================================================
# STEP 2 -- BACKEND IDENTITY CHECK (port 3001)
# ============================================================================
Write-Section "STEP 2 -- Backend Identity (port $BackendPort)"

$backendListeners = @(Get-NetTCPConnection -LocalPort $BackendPort -State Listen -EA SilentlyContinue)
if ($backendListeners.Count -eq 0) {
    Write-FAIL "Port $BackendPort -- no listener. Backend not started."
} else {
    $pids_ = ($backendListeners | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique) -join ", "
    Write-INFO "Listener PID(s): $pids_"
    if ($backendListeners.Count -gt 1) {
        Write-FAIL "Port $BackendPort -- MULTIPLE PIDs listening (possible rogue process)."
        foreach ($c in $backendListeners) {
            Write-INFO "  PID $($c.OwningProcess): $(Get-ProcCmdLine $c.OwningProcess)"
        }
    }
}

try {
    $h = Invoke-RestMethod -Uri "http://localhost:$BackendPort/health/live" -TimeoutSec 5 -ErrorAction Stop
    $svc = if ($h.PSObject.Properties["service"]) { $h.service } else { "(not present in response)" }
    $sts = if ($h.PSObject.Properties["status"]) { $h.status } else { "(unknown)" }
    Write-INFO "GET /health/live => status=$sts service=$svc"
    if ($svc -eq "backend") {
        Write-OK "Backend identity confirmed: service='backend'"
    } elseif ($svc -eq "(not present in response)") {
        Write-FAIL "Backend health response has no 'service' field. Update backend/src/server.ts to return service:'backend' in /health/live. See docs/DEPLOY_PROCESS_HARDENING.md."
    } else {
        Write-FAIL "WRONG SERVICE on port $BackendPort -- health reports service='$svc'. Expected 'backend'. A rogue process is likely bound here. Run -SweepOnly then restart backend."
    }
    if ($sts -eq "alive") { Write-OK "Backend status: alive" } else { Write-FAIL "Backend status='$sts' (expected 'alive')" }
} catch {
    Write-FAIL "Could not reach http://localhost:$BackendPort/health/live -- $_"
}

# ============================================================================
# STEP 3 -- FRONTEND REACHABILITY (port 3000)
# ============================================================================
Write-Section "STEP 3 -- Frontend Reachability (port $FrontendPort)"

$frontendListeners = @(Get-NetTCPConnection -LocalPort $FrontendPort -State Listen -EA SilentlyContinue)
if ($frontendListeners.Count -eq 0) {
    Write-FAIL "Port $FrontendPort -- no listener. Frontend not started."
} else {
    $fpids = ($frontendListeners | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique) -join ", "
    Write-INFO "Listener PID(s): $fpids"
}

foreach ($path_ in @("/", "/onboarding/v2")) {
    $url = "http://localhost:$FrontendPort$path_"
    try {
        $wr = Invoke-WebRequest -Uri $url -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
        if ($wr.StatusCode -eq 200) { Write-OK "GET $url => 200" }
        else { Write-FAIL "GET $url => $($wr.StatusCode) (expected 200)" }
    } catch {
        Write-FAIL "GET $url failed: $_"
    }
}

# ============================================================================
# STEP 4 -- PROVIDER PROXY CHECK
# ============================================================================
Write-Section "STEP 4 -- Provider Proxy (/papi/sessions?limit=1)"

$proxyUrl = "http://localhost:$FrontendPort/papi/sessions?limit=1"
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$statusCode = $null

try {
    try {
        $wr = Invoke-WebRequest -Uri $proxyUrl -TimeoutSec $ProxyTimeout -UseBasicParsing -ErrorAction Stop
        $statusCode = [int]$wr.StatusCode
    } catch [System.Net.WebException] {
        $resp = $_.Exception.Response
        if ($resp) { $statusCode = [int]$resp.StatusCode }
    }
} catch { Write-FAIL "GET $proxyUrl exception: $_" }

$sw.Stop()
$elapsed = [math]::Round($sw.Elapsed.TotalSeconds, 2)

if ($statusCode -eq 401) {
    Write-OK "GET $proxyUrl => 401 (auth required) in ${elapsed}s"
} elseif ($statusCode -eq 200) {
    Write-FAIL "GET $proxyUrl => 200 (proxy has no auth guard!)"
} elseif ($statusCode) {
    Write-FAIL "GET $proxyUrl => $statusCode in ${elapsed}s (expected 401)"
} else {
    Write-FAIL "GET $proxyUrl => no response in ${elapsed}s (possible proxy loop or backend down)"
}

if ($elapsed -gt $ProxyTimeout) {
    Write-FAIL "Proxy call took ${elapsed}s -- exceeded ${ProxyTimeout}s (possible infinite loop)"
}

# ============================================================================
# STEP 5 -- PORT BINDING SUMMARY
# ============================================================================
Write-Section "STEP 5 -- Port Binding Summary"

foreach ($p in @(3000, 3001, 8080)) {
    $ls = @(Get-NetTCPConnection -LocalPort $p -State Listen -EA SilentlyContinue)
    if ($ls.Count -eq 0) { Write-INFO "Port $p -- (no listener)"; continue }
    foreach ($c in $ls) {
        $cmd = Get-ProcCmdLine $c.OwningProcess
        $short = if ($cmd.Length -gt 110) { $cmd.Substring(0,110) + "..." } else { $cmd }
        Write-INFO "Port $p PID $($c.OwningProcess): $short"
    }
}

# ============================================================================
# RESULT
# ============================================================================
Write-Host ""
if ($Failures.Count -eq 0) {
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  PASS -- All preflight checks passed.         " -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    exit 0
} else {
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host "  FAIL -- $($Failures.Count) check(s) failed:     " -ForegroundColor Red
    Write-Host "==================================================" -ForegroundColor Red
    foreach ($f in $Failures) { Write-Host "  * $f" -ForegroundColor Red }
    Write-Host ""
    Write-Host "See docs/DEPLOY_PROCESS_HARDENING.md for fixes." -ForegroundColor Yellow
    exit 1
}
