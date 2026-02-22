#Requires -Version 5.1
<#
.SYNOPSIS
    Canonical preflight gate -- the ONE command to run before any demo,
    open-testing window, or local dev session.

.DESCRIPTION
    Orchestrates all preflight sub-checks in order:
      1. Environment variables        (validate-env.ps1)
      2. PM2 bash-shim detection      (check-pm2-shims.ps1)
      3. Rewrite shadow guard         (check-next-rewrite-shadow.ps1)
      4. Port collision proof          (port-collision-check.ps1)
      5. Port identity + proxy         (ports-and-identity.ps1)
      6. Provider auth round-trip      (provider-auth-check.ps1)   -- Demo/OpenTesting
      7. Uptime drill                  (uptime-drill.ps1)          -- if -IncludeUptimeDrill

    Prints a clean PASS/FAIL banner and returns non-zero on ANY failure.

.PARAMETER Mode
    Demo         -- full checks including auth round-trip
    OpenTesting  -- same as Demo (higher risk = same strictness)
    LocalDev     -- env + shim + shadow + collision only; skips ports/auth unless forced

.PARAMETER IncludeUptimeDrill
    Run the uptime drill (Caddy restart + verify recovery). Default: off.

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

    # Before a demo with uptime proof
    .\scripts\preflight\start-preflight.ps1 -Mode Demo -IncludeUptimeDrill

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
        & powershell.exe $argList
    } else {
        & powershell.exe $argList 2>&1 | Out-Null
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
        Write-Host "  [PASS] $Name" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $Name (exit code $ec)" -ForegroundColor Red
        $script:Failed.Add($Name)
        $script:AllPass = $false
    }
}

# ============================================================================
# HEADER
# ============================================================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CARE2CONNECT PREFLIGHT GATE  (Mode: $Mode)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

$flags = @()
if ($IncludeUptimeDrill)  { $flags += "UptimeDrill" }
if ($RunProviderAuth)     { $flags += "ProviderAuth" }
if ($RunPorts)            { $flags += "Ports" }
if ($flags.Count -gt 0) {
    Write-Host "  Flags: $($flags -join ', ')" -ForegroundColor Gray
}
Write-Host ""

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
# STEP 5 -- Port Identity + Proxy (Demo / OpenTesting only, unless forced)
# ============================================================================
if ($RunPorts) {
    Invoke-Step -Name "Port Identity + Proxy" `
        -ScriptPath (Join-Path $PreflightDir "ports-and-identity.ps1") `
        -ExtraArgs @("-SkipSweep")
} else {
    $reason = if ($Mode -eq "LocalDev") { "LocalDev mode" } else { "-SkipPorts" }
    Write-Host "  [SKIP] Port Identity + Proxy ($reason)" -ForegroundColor Yellow
}

# ============================================================================
# STEP 6 -- Provider Auth Round-Trip (Demo / OpenTesting default)
# ============================================================================
if ($RunProviderAuth) {
    Invoke-Step -Name "Provider Auth Round-Trip" `
        -ScriptPath (Join-Path $PreflightDir "provider-auth-check.ps1") `
        -ExtraArgs @("-TimeoutSeconds", "$TimeoutSeconds")
} else {
    Write-Host "  [SKIP] Provider Auth Round-Trip (disabled for $Mode)" -ForegroundColor Yellow
}

# ============================================================================
# STEP 7 -- Uptime Drill (optional, flag-gated)
# ============================================================================
if ($IncludeUptimeDrill) {
    $drillArgs = @("-TimeoutSeconds", "$TimeoutSeconds")
    if ($Mode -eq "OpenTesting") {
        $drillArgs += "-IncludeTunnel"
    }
    Invoke-Step -Name "Uptime Drill (restart recovery)" `
        -ScriptPath (Join-Path $PreflightDir "uptime-drill.ps1") `
        -ExtraArgs $drillArgs
} else {
    Write-Host "  [SKIP] Uptime Drill (use -IncludeUptimeDrill to enable)" -ForegroundColor Yellow
}

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host ""
Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "  SUMMARY  ($($Steps.Count) check(s) executed)" -ForegroundColor Cyan
Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
Write-Host ""

foreach ($s in $Steps) {
    if ($s.Pass) {
        Write-Host "    [PASS] $($s.Name)" -ForegroundColor Green
    } else {
        Write-Host "    [FAIL] $($s.Name)" -ForegroundColor Red
    }
}

Write-Host ""

if ($AllPass) {
    Write-Host "  PREFLIGHT PASS -- SAFE TO PROCEED" -ForegroundColor Green
    Write-Host ""
    if ($Mode -eq "Demo") {
        Write-Host "  Next: start services if not running, then demo." -ForegroundColor Gray
    } elseif ($Mode -eq "OpenTesting") {
        Write-Host "  Next: start services if not running, then open to testers." -ForegroundColor Gray
    } else {
        Write-Host "  Next: start services with pm2 start ecosystem.dev.config.js" -ForegroundColor Gray
    }
    Write-Host ""
    exit 0
} else {
    Write-Host "  PREFLIGHT FAIL -- DO NOT PROCEED" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Failed steps:" -ForegroundColor Red
    foreach ($f in $Failed) {
        Write-Host "    * $f" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "  Fix the above failures, then re-run:" -ForegroundColor Yellow
    Write-Host "    .\scripts\preflight\start-preflight.ps1 -Mode $Mode" -ForegroundColor Yellow
    Write-Host "  See docs/DEPLOYMENT_RUNBOOK_WINDOWS.md for remediation." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
