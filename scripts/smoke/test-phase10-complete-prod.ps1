<#
.SYNOPSIS
    Phase 10 Complete Smoke Test Suite — Production Evidence Pack
.DESCRIPTION
    Runs all Phase 10 verification in sequence:
      1) Preflight checks (environment + DB + config)
      2) Chat pipeline smoke test
      3) Provider dashboard smoke test
    Produces a unified Markdown summary with PASS/FAIL for each assertion.
.PARAMETER ApiBase
    Production API base URL (default: https://api.care2connects.org)
.PARAMETER Token
    Provider dashboard token. Falls back to PROVIDER_DASHBOARD_TOKEN env var.
.PARAMETER ThrottleMs
    Milliseconds between requests (default: 600)
.PARAMETER SkipPreflight
    Skip preflight checks.
.EXAMPLE
    .\test-phase10-complete-prod.ps1
    .\test-phase10-complete-prod.ps1 -ApiBase "http://localhost:3001"
#>

param(
    [string]$ApiBase = "https://api.care2connects.org",
    [string]$Token = $env:PROVIDER_DASHBOARD_TOKEN,
    [int]$ThrottleMs = 600,
    [switch]$SkipPreflight
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outDir = Join-Path $PSScriptRoot "..\..\out\phase10\$timestamp"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$suiteResults = @{
    timestamp = (Get-Date -Format "o")
    apiBase = $ApiBase
    sections = @()
}

function Add-Section {
    param([string]$Name, [string]$Status, [string]$Detail = "", [array]$SubResults = @())
    $suiteResults.sections += @{
        name = $Name
        status = $Status
        detail = $Detail
        subResults = $SubResults
        time = (Get-Date -Format "o")
    }
    $color = switch ($Status) { "PASS" { "Green" } "FAIL" { "Red" } "WARN" { "Yellow" } default { "White" } }
    Write-Host "`n  [$Status] $Name $(if ($Detail) { "- $Detail" })" -ForegroundColor $color
}

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "  Phase 10 Complete Smoke Test Suite" -ForegroundColor Cyan
Write-Host "  Target:    $ApiBase" -ForegroundColor Cyan
Write-Host "  Time:      $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "  Evidence:  $outDir" -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

# ══════════════════════════════════════════════════════════════
# SECTION 1: PREFLIGHT CHECKS
# ══════════════════════════════════════════════════════════════

if (-not $SkipPreflight) {
    Write-Host "=== PREFLIGHT CHECKS ===" -ForegroundColor Magenta

    $preflightResults = @()
    $preflightPass = $true

    # Check 1: API is reachable
    try {
        Start-Sleep -Milliseconds $ThrottleMs
        $healthResp = Invoke-WebRequest -Uri "$ApiBase/api/v2/intake/health" -Method GET `
            -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        if ($healthResp.StatusCode -eq 200) {
            $preflightResults += @{ check = "API reachable"; status = "PASS"; detail = "GET /api/v2/intake/health -> 200" }
            Write-Host "  [PASS] API reachable at $ApiBase" -ForegroundColor Green
        } else {
            $preflightResults += @{ check = "API reachable"; status = "WARN"; detail = "status=$($healthResp.StatusCode)" }
            Write-Host "  [WARN] API returned $($healthResp.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        # Try the global health endpoint
        try {
            Start-Sleep -Milliseconds $ThrottleMs
            $globalResp = Invoke-WebRequest -Uri "$ApiBase/health/live" `
                -Method GET -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
            $preflightResults += @{ check = "API reachable"; status = "PASS"; detail = "GET /health/live -> $($globalResp.StatusCode)" }
            Write-Host "  [PASS] API reachable (via /health/live)" -ForegroundColor Green
        } catch {
            $preflightResults += @{ check = "API reachable"; status = "FAIL"; detail = $_.Exception.Message }
            Write-Host "  [FAIL] API not reachable: $($_.Exception.Message)" -ForegroundColor Red
            $preflightPass = $false
        }
    }

    # Check 2: V2 Intake enabled (health endpoint returns featureFlag)
    try {
        # Reuse health response if we already have it, otherwise re-fetch
        $healthData = $null
        if ($healthResp -and $healthResp.Content) {
            $healthData = $healthResp.Content | ConvertFrom-Json
        } else {
            Start-Sleep -Milliseconds $ThrottleMs
            $h2 = Invoke-WebRequest -Uri "$ApiBase/api/v2/intake/health" `
                -Method GET -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
            $healthData = $h2.Content | ConvertFrom-Json
        }
        if ($healthData.status -eq 'healthy') {
            $preflightResults += @{ check = "ENABLE_V2_INTAKE"; status = "PASS"; detail = "Intake health: $($healthData.status), db: $($healthData.database)" }
            Write-Host "  [PASS] V2 Intake enabled (status=$($healthData.status))" -ForegroundColor Green
        } else {
            $preflightResults += @{ check = "ENABLE_V2_INTAKE"; status = "WARN"; detail = "Intake health: $($healthData.status)" }
            Write-Host "  [WARN] V2 Intake degraded: $($healthData.status)" -ForegroundColor Yellow
        }
    } catch {
        $preflightResults += @{ check = "ENABLE_V2_INTAKE"; status = "FAIL"; detail = "Intake health endpoint failed: $($_.Exception.Message)" }
        $preflightPass = $false
        Write-Host "  [FAIL] V2 Intake not enabled" -ForegroundColor Red
    }

    # Check 3: Provider token available
    if ($Token) {
        $preflightResults += @{ check = "PROVIDER_DASHBOARD_TOKEN"; status = "PASS"; detail = "Set (value not printed)" }
        Write-Host "  [PASS] PROVIDER_DASHBOARD_TOKEN is set" -ForegroundColor Green
    } else {
        $preflightResults += @{ check = "PROVIDER_DASHBOARD_TOKEN"; status = "FAIL"; detail = "Not set" }
        $preflightPass = $false
        Write-Host "  [FAIL] PROVIDER_DASHBOARD_TOKEN not set" -ForegroundColor Red
    }

    # Check 4: Chat tables exist (verify by trying to create a thread on non-existent session)
    try {
        Start-Sleep -Milliseconds $ThrottleMs
        $chatCheckResp = Invoke-WebRequest -Uri "$ApiBase/api/v2/intake/session/nonexistent/chat/thread" `
            -Method POST -Body "{}" -ContentType "application/json" `
            -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        # Unexpected success
        $preflightResults += @{ check = "Chat endpoint active"; status = "WARN"; detail = "Unexpected 200 on nonexistent session" }
    } catch {
        $statusCode = 0
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        if ($statusCode -eq 404 -or $statusCode -eq 400) {
            # 404 Session not found = chat endpoint is active, tables exist
            $preflightResults += @{ check = "Chat endpoint active"; status = "PASS"; detail = "Returns $statusCode for invalid session (endpoint wired)" }
            Write-Host "  [PASS] Chat endpoint active (returns $statusCode for invalid session)" -ForegroundColor Green
        } elseif ($statusCode -eq 500) {
            $preflightResults += @{ check = "Chat endpoint active"; status = "WARN"; detail = "Returns 500 (tables may not exist)" }
            Write-Host "  [WARN] Chat endpoint returns 500 (migration may be pending)" -ForegroundColor Yellow
        } else {
            $preflightResults += @{ check = "Chat endpoint active"; status = "WARN"; detail = "status=$statusCode" }
            Write-Host "  [WARN] Chat endpoint check: status=$statusCode" -ForegroundColor Yellow
        }
    }

    # Check 5: Provider auth endpoint exists
    try {
        Start-Sleep -Milliseconds $ThrottleMs
        $authCheckResp = Invoke-WebRequest -Uri "$ApiBase/api/v2/provider/auth" `
            -Method POST -Body '{"token":"invalid_check"}' -ContentType "application/json" `
            -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        $preflightResults += @{ check = "Provider auth endpoint"; status = "WARN"; detail = "Unexpected 200 with invalid token" }
    } catch {
        $statusCode = 0
        if ($_.Exception.Response) { $statusCode = [int]$_.Exception.Response.StatusCode }
        if ($statusCode -eq 401 -or $statusCode -eq 400) {
            $preflightResults += @{ check = "Provider auth endpoint"; status = "PASS"; detail = "Returns $statusCode for invalid token" }
            Write-Host "  [PASS] Provider auth endpoint active" -ForegroundColor Green
        } else {
            $preflightResults += @{ check = "Provider auth endpoint"; status = "WARN"; detail = "status=$statusCode" }
        }
    }

    Add-Section "Preflight Checks" $(if ($preflightPass) { "PASS" } else { "FAIL" }) "" $preflightResults

    # Save preflight evidence
    $preflightResults | ConvertTo-Json -Depth 5 | Out-File (Join-Path $outDir "preflight-results.json") -Encoding utf8

    if (-not $preflightPass) {
        Write-Host "`nPreflight FAILED. Fix issues before continuing." -ForegroundColor Red
        # Don't abort — continue to collect what we can
    }
}

# ══════════════════════════════════════════════════════════════
# SECTION 2: CHAT PIPELINE SMOKE TEST
# ══════════════════════════════════════════════════════════════

Write-Host "`n=== CHAT PIPELINE SMOKE TEST ===" -ForegroundColor Magenta

$chatScript = Join-Path $PSScriptRoot "test-chat-pipeline-prod.ps1"
$chatExitCode = 0

if (Test-Path $chatScript) {
    try {
        & $chatScript -ApiBase $ApiBase -ThrottleMs $ThrottleMs
        $chatExitCode = $LASTEXITCODE
    } catch {
        $chatExitCode = 1
        Write-Host "  Chat smoke test threw: $($_.Exception.Message)" -ForegroundColor Red
    }

    if ($chatExitCode -eq 0) {
        Add-Section "Chat Pipeline" "PASS" "All chat assertions passed"
    } else {
        Add-Section "Chat Pipeline" "FAIL" "Exit code: $chatExitCode"
    }
} else {
    Add-Section "Chat Pipeline" "FAIL" "Script not found: $chatScript"
}

# ══════════════════════════════════════════════════════════════
# SECTION 3: PROVIDER DASHBOARD SMOKE TEST
# ══════════════════════════════════════════════════════════════

Write-Host "`n=== PROVIDER DASHBOARD SMOKE TEST ===" -ForegroundColor Magenta

$providerScript = Join-Path $PSScriptRoot "test-provider-dashboard-prod.ps1"
$providerExitCode = 0

if (Test-Path $providerScript) {
    try {
        & $providerScript -ApiBase $ApiBase -Token $Token -ThrottleMs $ThrottleMs
        $providerExitCode = $LASTEXITCODE
    } catch {
        $providerExitCode = 1
        Write-Host "  Provider smoke test threw: $($_.Exception.Message)" -ForegroundColor Red
    }

    if ($providerExitCode -eq 0) {
        Add-Section "Provider Dashboard" "PASS" "All provider assertions passed"
    } else {
        Add-Section "Provider Dashboard" "FAIL" "Exit code: $providerExitCode"
    }
} else {
    Add-Section "Provider Dashboard" "FAIL" "Script not found: $providerScript"
}

# ══════════════════════════════════════════════════════════════
# GENERATE MARKDOWN SUMMARY
# ══════════════════════════════════════════════════════════════

$totalPass = @($suiteResults.sections | Where-Object { $_.status -eq "PASS" }).Count
$totalFail = @($suiteResults.sections | Where-Object { $_.status -eq "FAIL" }).Count
$totalWarn = @($suiteResults.sections | Where-Object { $_.status -eq "WARN" }).Count
$verdict = if ($totalFail -eq 0) { "PASS" } else { "FAIL" }

$md = @"
# Phase 10 Production Smoke Test - Summary

**Date:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Target:** $ApiBase
**Verdict:** **$verdict**

## Results

| Section | Status | Detail |
|---------|--------|--------|
"@

foreach ($s in $suiteResults.sections) {
    $icon = switch ($s.status) { "PASS" { "PASS" } "FAIL" { "FAIL" } "WARN" { "WARN" } }
    $md += "`n| $($s.name) | $icon | $($s.detail) |"
}

$md += @"

## Preflight Sub-Results

| Check | Status | Detail |
|-------|--------|--------|
"@

$preflightSection = $suiteResults.sections | Where-Object { $_.name -eq "Preflight Checks" }
if ($preflightSection -and $preflightSection.subResults) {
    foreach ($r in $preflightSection.subResults) {
        $md += "`n| $($r.check) | $($r.status) | $($r.detail) |"
    }
}

$md += @"


## Evidence Directory

``````
$outDir
``````

## Smoke Test Scripts

- ``scripts/smoke/test-chat-pipeline-prod.ps1``
- ``scripts/smoke/test-provider-dashboard-prod.ps1``
- ``scripts/smoke/test-phase10-complete-prod.ps1``

---
Generated by Phase 10 Complete Smoke Test Suite
"@

$md | Out-File (Join-Path $outDir "SUMMARY.md") -Encoding utf8
$suiteResults | ConvertTo-Json -Depth 10 | Out-File (Join-Path $outDir "suite-results.json") -Encoding utf8

# ══════════════════════════════════════════════════════════════
# FINAL OUTPUT
# ══════════════════════════════════════════════════════════════

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "  Phase 10 Production Smoke Test - COMPLETE" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Verdict:  $verdict" -ForegroundColor $(if ($verdict -eq "PASS") { "Green" } else { "Red" })
Write-Host "  Sections: $totalPass passed, $totalFail failed, $totalWarn warnings"
Write-Host "  Evidence: $outDir"
Write-Host "  Summary:  $(Join-Path $outDir 'SUMMARY.md')"
Write-Host ""

if ($totalFail -gt 0) {
    Write-Host "PHASE 10 SMOKE TEST SUITE: FAILED" -ForegroundColor Red
    exit 1
} else {
    Write-Host "PHASE 10 SMOKE TEST SUITE: PASSED" -ForegroundColor Green
    exit 0
}
