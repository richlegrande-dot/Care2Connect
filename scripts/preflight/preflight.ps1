#Requires -Version 5.1
<#
.SYNOPSIS
    Unified preflight check -- run BEFORE any demo or testing session.

.DESCRIPTION
    Orchestrates all preflight scripts in the correct order, prints a
    clean PASS/FAIL summary, and exits non-zero on any failure.

.PARAMETER Mode
    Demo         -- full checks including port identity + papi speed
    OpenTesting  -- same as Demo (higher risk = same strictness)
    LocalDev     -- env + shim + shadow only; skips ports unless -IncludePorts

.PARAMETER SkipPorts
    Force-skip the ports-and-identity check even in Demo/OpenTesting.
.PARAMETER IncludePorts
    Force-include ports-and-identity in LocalDev mode.
.PARAMETER SkipRewriteShadow
    Emergency bypass for the rewrite shadow check.
.PARAMETER VerboseOutput
    Print full output from each sub-script (default: summary only).

.OUTPUTS
    Exit 0 -- all checks pass
    Exit 1 -- at least one check failed
#>
param(
    [ValidateSet("Demo", "OpenTesting", "LocalDev")]
    [string]$Mode = "Demo",

    [switch]$SkipPorts,
    [switch]$IncludePorts,
    [switch]$SkipRewriteShadow,
    [switch]$VerboseOutput
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# -- Resolve paths ----------------------------------------------------------
$PreflightDir = $PSScriptRoot
$ScriptsDir   = Split-Path $PreflightDir -Parent

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

$RunShadow = -not $SkipRewriteShadow

# -- Helper: run one preflight step -----------------------------------------
function Invoke-Step {
    param(
        [string]$Name,
        [string]$ScriptPath,
        [string[]]$ExtraArgs
    )

    $label = $Name
    $argList = @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $ScriptPath)
    if ($ExtraArgs -and $ExtraArgs.Count -gt 0) {
        $argList += $ExtraArgs
    }

    if ($VerboseOutput) {
        Write-Host ""
        Write-Host "--- $label ---" -ForegroundColor Gray
    }

    # Run the script in a child powershell to capture exit code cleanly
    if ($VerboseOutput) {
        & powershell.exe $argList
    } else {
        & powershell.exe $argList 2>&1 | Out-Null
    }
    $ec = $LASTEXITCODE
    if ($null -eq $ec) { $ec = 0 }

    $entry = New-Object PSObject -Property @{
        Name     = $label
        ExitCode = $ec
        Pass     = ($ec -eq 0)
    }
    $script:Steps.Add($entry)

    if ($ec -eq 0) {
        Write-Host "  [PASS] $label" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $label (exit code $ec)" -ForegroundColor Red
        $script:Failed.Add($label)
        $script:AllPass = $false
    }
}

# ============================================================================
# HEADER
# ============================================================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CARE2CONNECT PREFLIGHT CHECK  (Mode: $Mode)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# ============================================================================
# STEP 1 -- Environment Variables
# ============================================================================
$envScript = Join-Path $PreflightDir "validate-env.ps1"
Invoke-Step -Name "Environment Variables (validate-env)" -ScriptPath $envScript

# ============================================================================
# STEP 2 -- PM2 Bash-Shim Detection
# ============================================================================
$shimScript = Join-Path $PreflightDir "check-pm2-shims.ps1"
Invoke-Step -Name "PM2 Shim Check (check-pm2-shims)" -ScriptPath $shimScript

# ============================================================================
# STEP 3 -- Rewrite Shadow Guard
# ============================================================================
if ($RunShadow) {
    $shadowScript = Join-Path $PreflightDir "check-next-rewrite-shadow.ps1"
    Invoke-Step -Name "Rewrite Shadow Guard (check-next-rewrite-shadow)" -ScriptPath $shadowScript
} else {
    Write-Host "  [SKIP] Rewrite Shadow Guard (-SkipRewriteShadow)" -ForegroundColor Yellow
}

# ============================================================================
# STEP 4 -- Port Identity + Proxy (Demo / OpenTesting only, unless forced)
# ============================================================================
if ($RunPorts) {
    $portsScript = Join-Path $PreflightDir "ports-and-identity.ps1"
    Invoke-Step -Name "Port Identity + Proxy (ports-and-identity)" -ScriptPath $portsScript
} else {
    $reason = if ($Mode -eq "LocalDev") { "LocalDev mode (use -IncludePorts to enable)" } else { "-SkipPorts" }
    Write-Host "  [SKIP] Port Identity + Proxy ($reason)" -ForegroundColor Yellow
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
    Write-Host "  Fix the above failures, then re-run this preflight." -ForegroundColor Yellow
    Write-Host "  See docs/DEPLOYMENT_RUNBOOK_WINDOWS.md for remediation." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
