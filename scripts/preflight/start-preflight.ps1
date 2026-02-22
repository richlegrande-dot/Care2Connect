#Requires -Version 5.1
<#
.SYNOPSIS
    Canonical preflight gate -- the ONE command to run before any demo,
    open-testing window, or local dev session.

.DESCRIPTION
    Orchestrates all preflight sub-checks in order:
      0. Phase 11 baseline assertion    (assert-phase11-baseline.ps1)
      1. Environment variables          (validate-env.ps1)
      2. PM2 bash-shim detection        (check-pm2-shims.ps1)
      3. Rewrite shadow guard           (check-next-rewrite-shadow.ps1)
      4. Port collision proof           (port-collision-check.ps1)
      5. Database connectivity          (db-connectivity-check.ps1)         -- Demo/OpenTesting
      6. Port identity + proxy          (ports-and-identity.ps1)            -- Demo/OpenTesting
      7. Provider auth round-trip       (provider-auth-check.ps1)           -- Demo/OpenTesting
      8. Chat backend readiness         (chat-backend-check.ps1)            -- Demo/OpenTesting
      9. Caddy host-routing / public    (caddy-public-check.ps1)            -- if -UseCaddy/-UsePublic
     10. Rate-limit bypass safety       (rate-limit-bypass-check.ps1)       -- OpenTesting only
     11. Uptime drill                   (uptime-drill.ps1)                  -- if -IncludeUptimeDrill

    Each run generates a unique RunId and writes full output to
    logs/preflight/preflight_<RunId>.log.  Old logs are auto-pruned
    per -RetentionDays.

    On PASS in Demo/OpenTesting: writes logs/preflight/LAST_GOOD_<Mode>.txt
    as a "manual testing ready" stamp.

    Prints a clean PASS/FAIL banner and returns non-zero on ANY failure.

.PARAMETER Mode
    Demo         -- full checks including auth round-trip, DB, chat backend
    OpenTesting  -- same as Demo + rate-limit bypass check
    LocalDev     -- env + shim + shadow + collision only; skips ports/auth unless forced

.PARAMETER IncludeUptimeDrill
    Run the uptime drill (Caddy restart + verify recovery). Default: off.

.PARAMETER NonDisruptiveUptimeDrill
    If IncludeUptimeDrill is set, use non-disruptive (poll-only) mode.

.PARAMETER UseCaddy
    Run Caddy host-routing checks (localhost:8080 with Host headers).

.PARAMETER UsePublic
    Run public domain probes (care2connects.org via Cloudflare).

.PARAMETER RetentionDays
    Delete preflight logs older than this many days (default: 7).
    Today's logs are never deleted.

.PARAMETER IncludeProviderAuthCheck
    Run provider dashboard auth round-trip check.
    Default: true for Demo/OpenTesting, false for LocalDev.

.PARAMETER SkipPorts
    Force-skip the ports-and-identity check.

.PARAMETER IncludePorts
    Force-include ports checks in LocalDev mode.

.PARAMETER TimeoutSeconds
    Global timeout budget for external-facing checks (default: 30).

.PARAMETER VerboseOutput
    Print full output from each sub-script.

.EXAMPLE
    # Before a demo (standard gate)
    .\scripts\preflight\start-preflight.ps1 -Mode Demo

    # Demo with Caddy host-routing verification
    .\scripts\preflight\start-preflight.ps1 -Mode Demo -UseCaddy

    # OpenTesting with public domain probes
    .\scripts\preflight\start-preflight.ps1 -Mode OpenTesting -UsePublic

    # Non-disruptive uptime check (no restarts)
    .\scripts\preflight\start-preflight.ps1 -Mode OpenTesting -IncludeUptimeDrill -NonDisruptiveUptimeDrill

    # Lightweight local dev
    .\scripts\preflight\start-preflight.ps1 -Mode LocalDev

.OUTPUTS
    Exit 0 -- all checks pass
    Exit 1 -- at least one check failed
#>
param(
    [ValidateSet("Demo", "OpenTesting", "LocalDev")]
    [string]$Mode = "Demo",

    [switch]$IncludeUptimeDrill,

    [switch]$NonDisruptiveUptimeDrill,

    [switch]$UseCaddy,

    [switch]$UsePublic,

    [int]$RetentionDays = 7,

    [Nullable[bool]]$IncludeProviderAuthCheck,

    [switch]$SkipPorts,
    [switch]$IncludePorts,

    [int]$TimeoutSeconds = 30,

    [switch]$VerboseOutput
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# -- Resolve paths ----------------------------------------------------------
$PreflightDir = $PSScriptRoot
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

# -- Run ID + log file -------------------------------------------------------
$RunId = (Get-Date -Format "yyyyMMdd-HHmmss") + "-" + ([System.Guid]::NewGuid().ToString("N").Substring(0, 6))
$LogDir = Join-Path $Root "logs"; $LogDir = Join-Path $LogDir "preflight"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
$LogFile = Join-Path $LogDir "preflight_$RunId.log"

# -- Log retention: prune old logs -------------------------------------------
$today = (Get-Date).Date
$cutoff = $today.AddDays(-$RetentionDays)
$pruned = 0
Get-ChildItem -Path $LogDir -Filter "preflight_*.log" -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.LastWriteTime -lt $cutoff -and $_.LastWriteTime.Date -ne $today) {
        Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
        $pruned++
    }
}

# Tee helper: write to both console and log
function Write-Tee {
    param([string]$Msg, [string]$Color = "White")
    Write-Host $Msg -ForegroundColor $Color
    Add-Content -Path $LogFile -Value $Msg -ErrorAction SilentlyContinue
}

# -- State -------------------------------------------------------------------
$Steps   = [System.Collections.Generic.List[object]]::new()
$Failed  = [System.Collections.Generic.List[string]]::new()
$AllPass = $true

# -- Decide which checks to run ---------------------------------------------
$RunPorts = $false
if ($Mode -eq "Demo" -or $Mode -eq "OpenTesting") {
    $RunPorts = -not $SkipPorts
} elseif ($Mode -eq "LocalDev") {
    $RunPorts = [bool]$IncludePorts
}

$RunProviderAuth = $false
if ($null -ne $IncludeProviderAuthCheck) {
    $RunProviderAuth = $IncludeProviderAuthCheck
} elseif ($Mode -eq "Demo" -or $Mode -eq "OpenTesting") {
    $RunProviderAuth = $true
}

# -- Helper: run one preflight step -----------------------------------------
function Invoke-Step {
    param(
        [string]$Name,
        [string]$ScriptPath,
        [string[]]$ExtraArgs
    )

    if (-not (Test-Path $ScriptPath)) {
        Write-Host "  [FAIL] $Name -- script not found: $ScriptPath" -ForegroundColor Red
        $script:Failed.Add($Name)
        $script:AllPass = $false
        return
    }

    $argList = @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $ScriptPath)
    if ($ExtraArgs -and $ExtraArgs.Count -gt 0) {
        $argList += $ExtraArgs
    }

    if ($VerboseOutput) {
        Write-Host ""
        Write-Host "--- $Name ---" -ForegroundColor Gray
    }

    if ($VerboseOutput) {
        & powershell.exe $argList 2>&1 | ForEach-Object {
            $line = $_.ToString()
            Write-Host $line
            Add-Content -Path $script:LogFile -Value $line -ErrorAction SilentlyContinue
        }
    } else {
        & powershell.exe $argList 2>&1 | ForEach-Object {
            Add-Content -Path $script:LogFile -Value $_.ToString() -ErrorAction SilentlyContinue
        }
    }
    $ec = $LASTEXITCODE
    if ($null -eq $ec) { $ec = 0 }

    $entry = New-Object PSObject -Property @{
        Name     = $Name
        ExitCode = $ec
        Pass     = ($ec -eq 0)
    }
    $script:Steps.Add($entry)

    if ($ec -eq 0) {
        Write-Tee "  [PASS] $Name" -Color Green
    } else {
        Write-Tee "  [FAIL] $Name (exit code $ec)" -Color Red
        $script:Failed.Add($Name)
        $script:AllPass = $false
    }
}

# ============================================================================
# HEADER
# ============================================================================
Write-Tee ""
Write-Tee "============================================================" -Color Cyan
Write-Tee "  CARE2CONNECT PREFLIGHT GATE  (Mode: $Mode)" -Color Cyan
Write-Tee "  RunId: $RunId" -Color Cyan
Write-Tee "============================================================" -Color Cyan
Write-Tee "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -Color Gray
Write-Tee "  Log  : $LogFile" -Color Gray

$flags = @()
if ($IncludeUptimeDrill)        { $flags += "UptimeDrill" }
if ($NonDisruptiveUptimeDrill)  { $flags += "NonDisruptive" }
if ($UseCaddy)                  { $flags += "UseCaddy" }
if ($UsePublic)                 { $flags += "UsePublic" }
if ($RunProviderAuth)           { $flags += "ProviderAuth" }
if ($RunPorts)                  { $flags += "Ports" }
if ($flags.Count -gt 0) {
    Write-Tee "  Flags: $($flags -join ', ')" -Color Gray
}
if ($pruned -gt 0) {
    Write-Tee "  Pruned $pruned old log(s) (retention: ${RetentionDays}d)" -Color Gray
}
Write-Tee ""

# ============================================================================
# STEP 0 -- Phase 11 Baseline Assertion (always runs first)
# ============================================================================
Invoke-Step -Name "Phase 11 Baseline Assertion" `
    -ScriptPath (Join-Path $PreflightDir "assert-phase11-baseline.ps1")

# If baseline assertion fails, remaining checks may be meaningless
if (-not $AllPass) {
    Write-Tee "" -Color Yellow
    Write-Tee "  Phase 11 baseline failed -- merge PR #6 before continuing." -Color Yellow
    Write-Tee "  Skipping remaining checks." -Color Yellow
    Write-Tee ""
}

# Only continue remaining steps if baseline passed
if ($AllPass) {

# ============================================================================
# STEP 1 -- Environment Variables
# ============================================================================
Invoke-Step -Name "Environment Variables" `
    -ScriptPath (Join-Path $PreflightDir "validate-env.ps1")

# ============================================================================
# STEP 2 -- PM2 Bash-Shim Detection
# ============================================================================
Invoke-Step -Name "PM2 Shim Check" `
    -ScriptPath (Join-Path $PreflightDir "check-pm2-shims.ps1")

# ============================================================================
# STEP 3 -- Rewrite Shadow Guard
# ============================================================================
Invoke-Step -Name "Rewrite Shadow Guard" `
    -ScriptPath (Join-Path $PreflightDir "check-next-rewrite-shadow.ps1")

# ============================================================================
# STEP 4 -- Port Collision Proof
# ============================================================================
Invoke-Step -Name "Port Collision Proof" `
    -ScriptPath (Join-Path $PreflightDir "port-collision-check.ps1")

# ============================================================================
# STEP 5 -- Database Connectivity (Demo / OpenTesting only)
# ============================================================================
if ($Mode -eq "Demo" -or $Mode -eq "OpenTesting") {
    Invoke-Step -Name "Database Connectivity" `
        -ScriptPath (Join-Path $PreflightDir "db-connectivity-check.ps1")
} else {
    Write-Tee "  [SKIP] Database Connectivity (LocalDev mode)" -Color Yellow
}

# ============================================================================
# STEP 6 -- Port Identity + Proxy (Demo / OpenTesting only, unless forced)
# ============================================================================
if ($RunPorts) {
    Invoke-Step -Name "Port Identity + Proxy" `
        -ScriptPath (Join-Path $PreflightDir "ports-and-identity.ps1") `
        -ExtraArgs @("-SkipSweep")
} else {
    $reason = if ($Mode -eq "LocalDev") { "LocalDev mode" } else { "-SkipPorts" }
    Write-Tee "  [SKIP] Port Identity + Proxy ($reason)" -Color Yellow
}

# ============================================================================
# STEP 7 -- Provider Auth Round-Trip (Demo / OpenTesting default)
# ============================================================================
if ($RunProviderAuth) {
    Invoke-Step -Name "Provider Auth Round-Trip" `
        -ScriptPath (Join-Path $PreflightDir "provider-auth-check.ps1") `
        -ExtraArgs @("-TimeoutSeconds", "$TimeoutSeconds")
} else {
    Write-Tee "  [SKIP] Provider Auth Round-Trip (disabled for $Mode)" -Color Yellow
}

# ============================================================================
# STEP 8 -- Chat Backend Readiness (Demo / OpenTesting only)
# ============================================================================
if ($Mode -eq "Demo" -or $Mode -eq "OpenTesting") {
    Invoke-Step -Name "Chat Backend Readiness" `
        -ScriptPath (Join-Path $PreflightDir "chat-backend-check.ps1")
} else {
    Write-Tee "  [SKIP] Chat Backend Readiness (LocalDev mode)" -Color Yellow
}

# ============================================================================
# STEP 9 -- Caddy Host-Routing / Public Domain Probes (flag-gated)
# ============================================================================
if ($UseCaddy -or $UsePublic) {
    $checkArgs = @("-TimeoutSeconds", "$TimeoutSeconds")
    if ($UseCaddy)  { $checkArgs += "-UseCaddy" }
    if ($UsePublic) { $checkArgs += "-UsePublic" }
    $checkLabel = if ($UseCaddy -and $UsePublic) { "Caddy + Public Probes" } elseif ($UseCaddy) { "Caddy Host-Routing" } else { "Public Domain Probes" }
    Invoke-Step -Name $checkLabel `
        -ScriptPath (Join-Path $PreflightDir "caddy-public-check.ps1") `
        -ExtraArgs $checkArgs
} else {
    Write-Tee "  [SKIP] Caddy/Public Probes (use -UseCaddy or -UsePublic)" -Color Yellow
}

# ============================================================================
# STEP 10 -- Rate-Limit Bypass Safety (OpenTesting only)
# ============================================================================
if ($Mode -eq "OpenTesting") {
    Invoke-Step -Name "Rate-Limit Bypass Safety" `
        -ScriptPath (Join-Path $PreflightDir "rate-limit-bypass-check.ps1") `
        -ExtraArgs @("-TimeoutSeconds", "$TimeoutSeconds")
} else {
    Write-Tee "  [SKIP] Rate-Limit Bypass Safety (OpenTesting only)" -Color Yellow
}

# ============================================================================
# STEP 11 -- Uptime Drill (optional, flag-gated)
# ============================================================================
if ($IncludeUptimeDrill) {
    $drillArgs = @("-TimeoutSeconds", "$TimeoutSeconds")
    if ($Mode -eq "OpenTesting") {
        $drillArgs += "-IncludeTunnel"
    }
    if ($NonDisruptiveUptimeDrill) {
        $drillArgs += "-NonDisruptive"
    }
    $drillLabel = if ($NonDisruptiveUptimeDrill) { "Uptime Drill (non-disruptive)" } else { "Uptime Drill (restart recovery)" }
    Invoke-Step -Name $drillLabel `
        -ScriptPath (Join-Path $PreflightDir "uptime-drill.ps1") `
        -ExtraArgs $drillArgs
} else {
    Write-Tee "  [SKIP] Uptime Drill (use -IncludeUptimeDrill to enable)" -Color Yellow
}

} # end if ($AllPass) -- baseline gate

# ============================================================================
# SUMMARY
# ============================================================================
Write-Tee ""
Write-Tee "------------------------------------------------------------" -Color Cyan
Write-Tee "  SUMMARY  ($($Steps.Count) check(s) executed)  RunId: $RunId" -Color Cyan
Write-Tee "------------------------------------------------------------" -Color Cyan
Write-Tee ""

foreach ($s in $Steps) {
    if ($s.Pass) {
        Write-Tee "    [PASS] $($s.Name)" -Color Green
    } else {
        Write-Tee "    [FAIL] $($s.Name)" -Color Red
    }
}

Write-Tee ""
Write-Tee "  Log: $LogFile" -Color Gray

if ($AllPass) {
    # -- D6: Write "Manual Testing Ready" stamp ---------------------------------
    if ($Mode -eq "Demo" -or $Mode -eq "OpenTesting") {
        $stampFile = Join-Path $LogDir "LAST_GOOD_$Mode.txt"
        $passCount = ($Steps | Where-Object { $_.Pass }).Count
        $stampContent = @(
            "RunId     : $RunId",
            "Timestamp : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
            "Mode      : $Mode",
            "Checks    : $passCount PASS / $($Steps.Count) total",
            "Log       : $LogFile"
        ) -join "`r`n"
        Set-Content -Path $stampFile -Value $stampContent -ErrorAction SilentlyContinue
        Write-Tee "  Stamp : $stampFile" -Color Gray
    }

    Write-Tee "" -Color Green
    Write-Tee "  PREFLIGHT PASS -- SAFE TO PROCEED" -Color Green
    Write-Tee ""
    if ($Mode -eq "Demo") {
        Write-Tee "  Next: start services if not running, then demo." -Color Gray
    } elseif ($Mode -eq "OpenTesting") {
        Write-Tee "  Next: start services if not running, then open to testers." -Color Gray
    } else {
        Write-Tee "  Next: start services with pm2 start ecosystem.dev.config.js" -Color Gray
    }
    Write-Tee ""
    exit 0
} else {
    Write-Tee "" -Color Red
    Write-Tee "  PREFLIGHT FAIL -- DO NOT PROCEED" -Color Red
    Write-Tee ""
    Write-Tee "  Failed steps:" -Color Red
    foreach ($f in $Failed) {
        Write-Tee "    * $f" -Color Red
    }
    Write-Tee ""
    Write-Tee "  Fix the above failures, then re-run:" -Color Yellow
    Write-Tee "    .\scripts\preflight\start-preflight.ps1 -Mode $Mode" -Color Yellow
    Write-Tee "  See docs/DEPLOYMENT_RUNBOOK_WINDOWS.md for remediation." -Color Yellow
    Write-Tee ""
    exit 1
}
