#Requires -Version 5.1
<#
.SYNOPSIS
    Phase 11 baseline assertion -- ensures required Phase 11 files exist.

.DESCRIPTION
    Checks that the Phase 11 deliverables are present in the repo before
    Phase 11.1/11.2 scripts are used. If baseline files are missing, this
    means PR #6 (Phase 11) has not been merged to main yet.

    Checks:
      - scripts/ops/watchdog-stack.ps1 exists
      - ecosystem.prod.config.js has 4 apps (backend, frontend, caddy, tunnel)

.OUTPUTS
    Exit 0 -- Phase 11 baseline present
    Exit 1 -- Phase 11 baseline missing (merge PR #6 first)
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Failures = [System.Collections.Generic.List[string]]::new()

function Fail ($msg) {
    Write-Host "  [FAIL] $msg" -ForegroundColor Red
    $script:Failures.Add($msg)
}
function Pass ($msg) { Write-Host "  [OK]   $msg" -ForegroundColor Green }

Write-Host ""
Write-Host "-- Phase 11 Baseline Assertion --" -ForegroundColor Cyan

# Resolve repo root (2 levels up from scripts/preflight/)
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

# ---- Check 1: watchdog-stack.ps1 exists ----------------------------------
$watchdog = Join-Path $Root "scripts"; $watchdog = Join-Path $watchdog "ops"; $watchdog = Join-Path $watchdog "watchdog-stack.ps1"
if (Test-Path $watchdog) {
    Pass "scripts/ops/watchdog-stack.ps1 exists"
} else {
    Fail "scripts/ops/watchdog-stack.ps1 not found -- Phase 11 not merged"
}

# ---- Check 2: ecosystem.prod.config.js has 4 apps -----------------------
$ecoFile = Join-Path $Root "ecosystem.prod.config.js"
if (Test-Path $ecoFile) {
    # Use node to count apps (reliable JS parsing)
    $nodeExe = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeExe) {
        $countScript = "try { const c = require('$($ecoFile -replace '\\','/')'); console.log(c.apps.length) } catch(e) { console.log(0) }"
        $appCount = & node -e $countScript 2>$null | Out-String
        $appCount = $appCount.Trim()
        if ($appCount -eq "4") {
            Pass "ecosystem.prod.config.js has 4 apps"
        } else {
            Fail "ecosystem.prod.config.js has $appCount apps (expected 4 -- caddy + tunnel missing?)"
        }
    } else {
        # Fallback: grep for app names
        $content = Get-Content $ecoFile -Raw
        $hasCaddy  = $content -match "care2connect-caddy"
        $hasTunnel = $content -match "care2connect-tunnel"
        if ($hasCaddy -and $hasTunnel) {
            Pass "ecosystem.prod.config.js contains caddy + tunnel entries"
        } else {
            $missing = @()
            if (-not $hasCaddy)  { $missing += "caddy" }
            if (-not $hasTunnel) { $missing += "tunnel" }
            Fail "ecosystem.prod.config.js missing: $($missing -join ', ')"
        }
    }
} else {
    Fail "ecosystem.prod.config.js not found"
}

# ---- Check 3: ports-and-identity.ps1 has B4 section (infra checks) ------
$portsScript = Join-Path $Root "scripts"; $portsScript = Join-Path $portsScript "preflight"; $portsScript = Join-Path $portsScript "ports-and-identity.ps1"
if (Test-Path $portsScript) {
    $content = Get-Content $portsScript -Raw
    if ($content -match "B4.*Infra|Caddy.*cloudflared|B4") {
        Pass "ports-and-identity.ps1 has B4 infra section"
    } else {
        Fail "ports-and-identity.ps1 missing B4 infra section -- Phase 11 not applied"
    }
} else {
    Fail "ports-and-identity.ps1 not found"
}

# ---- Summary -------------------------------------------------------------
Write-Host ""
if ($Failures.Count -eq 0) {
    Write-Host "  Phase 11 baseline verified" -ForegroundColor Green
    exit 0
} else {
    Write-Host "  Phase 11 baseline MISSING -- $($Failures.Count) issue(s)" -ForegroundColor Red
    foreach ($f in $Failures) { Write-Host "    * $f" -ForegroundColor Red }
    Write-Host ""
    Write-Host "  Action required:" -ForegroundColor Yellow
    Write-Host "    Merge PR #6 (Phase 11: Uptime + Footgun Removal) to main first." -ForegroundColor Yellow
    Write-Host "    https://github.com/richlegrande-dot/Care2Connect/pull/6" -ForegroundColor Yellow
    exit 1
}
