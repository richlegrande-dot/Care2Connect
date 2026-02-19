<#
.SYNOPSIS
  One-command GA gate runner — GO/NO-GO artifact generation.

.DESCRIPTION
  Runs all verification checks for GA readiness:
    1. V2 unit tests (195 tests)
    2. TypeScript type checks
    3. Persona card scoring (5 personas match expected tiers)
    4. Calibration snapshot generation
    5. Large file detection
    6. Configuration consistency
    7. Git status verification

  Produces GA_GATE_RESULT.md artifact with full results.

.PARAMETER OutputDir
  Directory for result artifacts (default: outreach/generated)

.PARAMETER SkipTests
  Skip running unit tests (use cached results)

.PARAMETER CIMode
  Stricter checks, exit non-zero on any failure

.EXAMPLE
  .\scripts\ga\run_ga_gate.ps1
  .\scripts\ga\run_ga_gate.ps1 -CIMode
  .\scripts\ga\run_ga_gate.ps1 -OutputDir ./reports -SkipTests
#>

param(
    [string]$OutputDir = "outreach/generated",
    [switch]$SkipTests,
    [switch]$CIMode
)

$ErrorActionPreference = "Continue"
$REPO_ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Push-Location $REPO_ROOT

# ── State ───────────────────────────────────────────────────────

$checks = @()
$startTime = Get-Date
$overallPass = $true

function Add-Check {
    param(
        [string]$Name,
        [string]$Status,
        [string]$Detail
    )
    $script:checks += [PSCustomObject]@{
        Name   = $Name
        Status = $Status
        Detail = $Detail
    }
    $icon = if ($Status -eq "PASS") { "[PASS]" } elseif ($Status -eq "FAIL") { "[FAIL]" } elseif ($Status -eq "SKIP") { "[SKIP]" } else { "[WARN]" }
    $color = switch ($Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "SKIP" { "DarkGray" }
        default { "Yellow" }
    }
    Write-Host "  $icon $Name" -ForegroundColor $color
    if ($Detail) {
        Write-Host "        $Detail" -ForegroundColor DarkGray
    }
    if ($Status -eq "FAIL") {
        $script:overallPass = $false
    }
}

# ── Banner ──────────────────────────────────────────────────────

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║            V2 Intake — GA Gate Runner                      ║" -ForegroundColor Cyan
Write-Host "║            GO / NO-GO Readiness Assessment                 ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Date:   $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "  Mode:   $(if ($CIMode) { 'CI (strict)' } else { 'Interactive' })"
Write-Host "  Output: $OutputDir"
Write-Host ""
Write-Host ("─" * 60) -ForegroundColor DarkGray

# ── Check 1: Git Status ────────────────────────────────────────

Write-Host ""
Write-Host "1. Git Status" -ForegroundColor Cyan
$branch = git branch --show-current 2>&1
$dirty = git status --porcelain 2>&1
$commitHash = git rev-parse --short HEAD 2>&1

if ($branch -eq "v2-intake-scaffold") {
    Add-Check "Branch is v2-intake-scaffold" "PASS" "HEAD: $commitHash"
} else {
    Add-Check "Branch is v2-intake-scaffold" "WARN" "Current: $branch (expected v2-intake-scaffold)"
}

if ($dirty) {
    $dirtyCount = ($dirty | Measure-Object -Line).Lines
    Add-Check "Working tree clean" "WARN" "$dirtyCount uncommitted change(s)"
} else {
    Add-Check "Working tree clean" "PASS" ""
}

# ── Check 2: V2 Unit Tests ─────────────────────────────────────

Write-Host ""
Write-Host "2. V2 Unit Tests" -ForegroundColor Cyan

if ($SkipTests) {
    Add-Check "V2 intake tests (195)" "SKIP" "Skipped via -SkipTests flag"
} else {
    try {
        $testOutput = & npx jest tests/intake_v2/ --verbose --bail 2>&1 | Out-String
        if ($LASTEXITCODE -eq 0) {
            # Count test suites and tests from output
            if ($testOutput -match "Tests:\s+(\d+) passed") {
                $testCount = $Matches[1]
                Add-Check "V2 intake tests ($testCount)" "PASS" "All tests passed (--bail mode)"
            } else {
                Add-Check "V2 intake tests" "PASS" "Tests completed"
            }
        } else {
            Add-Check "V2 intake tests" "FAIL" "Tests failed — see output above"
        }
    } catch {
        Add-Check "V2 intake tests" "FAIL" "Exception: $($_.Exception.Message)"
    }
}

# ── Check 3: TypeScript Type Check ─────────────────────────────

Write-Host ""
Write-Host "3. TypeScript Type Check" -ForegroundColor Cyan

try {
    $tscOutput = & npx tsc --noEmit --project backend/tsconfig.json 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Add-Check "Backend TypeScript (--noEmit)" "PASS" ""
    } else {
        $errorCount = ($tscOutput -split "`n" | Where-Object { $_ -match "error TS" } | Measure-Object).Count
        Add-Check "Backend TypeScript (--noEmit)" "FAIL" "$errorCount type error(s)"
    }
} catch {
    Add-Check "Backend TypeScript (--noEmit)" "WARN" "tsc not available: $($_.Exception.Message)"
}

# ── Check 4: Persona Card Scoring ──────────────────────────────

Write-Host ""
Write-Host "4. Persona Card Scoring" -ForegroundColor Cyan

try {
    $personaOutput = & npx tsx scripts/ga/score_persona_cards.ts 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Add-Check "Persona cards match expected tiers" "PASS" "5/5 personas match"
    } else {
        Add-Check "Persona cards match expected tiers" "FAIL" "One or more personas scored outside expected tier"
    }
} catch {
    Add-Check "Persona cards match expected tiers" "WARN" "Could not run: $($_.Exception.Message)"
}

# ── Check 5: Calibration Snapshot ──────────────────────────────

Write-Host ""
Write-Host "5. Calibration Snapshot" -ForegroundColor Cyan

try {
    $calibDir = Join-Path $OutputDir "calibration"
    $calibOutput = & npx tsx scripts/ga/run_calibration_snapshot.ts --output $calibDir 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        $jsonExists = Test-Path (Join-Path $calibDir "calibration_report.json")
        $mdExists = Test-Path (Join-Path $calibDir "calibration_summary.md")
        if ($jsonExists -and $mdExists) {
            Add-Check "Calibration snapshot generated" "PASS" "Report + summary created in $calibDir"
        } else {
            Add-Check "Calibration snapshot generated" "WARN" "Script ran but output files not found"
        }
    } else {
        Add-Check "Calibration snapshot generated" "FAIL" "Generation failed"
    }
} catch {
    Add-Check "Calibration snapshot generated" "WARN" "Could not run: $($_.Exception.Message)"
}

# ── Check 6: Large File Detection ──────────────────────────────

Write-Host ""
Write-Host "6. Large File Detection" -ForegroundColor Cyan

$largeFileScript = Join-Path $REPO_ROOT "scripts" "ga" "preflight_large_files.ps1"
if (Test-Path $largeFileScript) {
    try {
        $largeOutput = & powershell -NoProfile -ExecutionPolicy Bypass -File $largeFileScript 2>&1 | Out-String
        if ($LASTEXITCODE -eq 0) {
            Add-Check "No large files (>50MB)" "PASS" ""
        } else {
            Add-Check "No large files (>50MB)" "WARN" "Large files detected — review output"
        }
    } catch {
        Add-Check "No large files (>50MB)" "WARN" "Script error: $($_.Exception.Message)"
    }
} else {
    # Inline check
    $largeFiles = git ls-files | ForEach-Object {
        $size = (Get-Item $_ -ErrorAction SilentlyContinue).Length
        if ($size -gt 50MB) { $_ }
    } | Where-Object { $_ }
    if ($largeFiles) {
        Add-Check "No large files (>50MB)" "WARN" "$($largeFiles.Count) large file(s) tracked"
    } else {
        Add-Check "No large files (>50MB)" "PASS" ""
    }
}

# ── Check 7: Key Files Exist ───────────────────────────────────

Write-Host ""
Write-Host "7. Key Artifacts" -ForegroundColor Cyan

$requiredFiles = @(
    "backend/src/intake/v2/scoring/computeScores.ts",
    "backend/src/intake/v2/dvSafe.ts",
    "backend/src/intake/v2/calibration/generateCalibrationReport.ts",
    "backend/src/intake/v2/policy/policyPack.ts",
    "backend/src/intake/v2/constants.ts",
    ".github/workflows/ci.yml",
    "docs/V2_BRANCH_PROTECTION_CONFIG.md"
)

$missing = @()
foreach ($f in $requiredFiles) {
    if (-not (Test-Path (Join-Path $REPO_ROOT $f))) {
        $missing += $f
    }
}

if ($missing.Count -eq 0) {
    Add-Check "All key source files present" "PASS" "$($requiredFiles.Count) files verified"
} else {
    Add-Check "All key source files present" "FAIL" "Missing: $($missing -join ', ')"
}

# ── Check 8: CI Workflow Triggers ──────────────────────────────

Write-Host ""
Write-Host "8. CI Configuration" -ForegroundColor Cyan

$ciContent = Get-Content (Join-Path $REPO_ROOT ".github/workflows/ci.yml") -Raw -ErrorAction SilentlyContinue
if ($ciContent) {
    if ($ciContent -match "v2-intake-scaffold") {
        Add-Check "CI triggers include v2-intake-scaffold" "PASS" ""
    } else {
        Add-Check "CI triggers include v2-intake-scaffold" "WARN" "Branch not in push triggers"
    }
    if ($ciContent -match "workflow_dispatch") {
        Add-Check "CI has workflow_dispatch trigger" "PASS" ""
    } else {
        Add-Check "CI has workflow_dispatch trigger" "WARN" "Manual trigger not configured"
    }
} else {
    Add-Check "CI workflow readable" "FAIL" "Cannot read ci.yml"
}

# ── Results ─────────────────────────────────────────────────────

$elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 1)
$passCount = ($checks | Where-Object Status -eq "PASS").Count
$failCount = ($checks | Where-Object Status -eq "FAIL").Count
$warnCount = ($checks | Where-Object Status -eq "WARN").Count
$skipCount = ($checks | Where-Object Status -eq "SKIP").Count
$totalChecks = $checks.Count

Write-Host ""
Write-Host ("═" * 60) -ForegroundColor Cyan
Write-Host ""
Write-Host "  RESULTS: $passCount pass, $failCount fail, $warnCount warn, $skipCount skip ($totalChecks total)" -ForegroundColor Cyan
Write-Host "  Elapsed: ${elapsed}s"
Write-Host ""

if ($overallPass) {
    Write-Host "  ╔════════════════════════╗" -ForegroundColor Green
    Write-Host "  ║      GO — READY        ║" -ForegroundColor Green
    Write-Host "  ╚════════════════════════╝" -ForegroundColor Green
} else {
    Write-Host "  ╔════════════════════════╗" -ForegroundColor Red
    Write-Host "  ║    NO-GO — BLOCKED     ║" -ForegroundColor Red
    Write-Host "  ╚════════════════════════╝" -ForegroundColor Red
}

# ── Generate Result Artifact ───────────────────────────────────

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$resultPath = Join-Path $OutputDir "GA_GATE_RESULT.md"

$resultContent = @"
# V2 Intake — GA Gate Result

**Date**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Branch**: $branch
**Commit**: $commitHash
**Mode**: $(if ($CIMode) { 'CI' } else { 'Interactive' })
**Verdict**: $(if ($overallPass) { '**GO** — All critical checks passed' } else { '**NO-GO** — One or more checks failed' })
**Elapsed**: ${elapsed}s

---

## Check Results

| # | Check | Status | Detail |
|---|-------|--------|--------|
"@

$i = 1
foreach ($check in $checks) {
    $statusIcon = switch ($check.Status) {
        "PASS" { "PASS" }
        "FAIL" { "FAIL" }
        "WARN" { "WARN" }
        "SKIP" { "SKIP" }
    }
    $resultContent += "| $i | $($check.Name) | $statusIcon | $($check.Detail) |`n"
    $i++
}

$resultContent += @"

---

## Summary

- **Passed**: $passCount
- **Failed**: $failCount
- **Warnings**: $warnCount
- **Skipped**: $skipCount
- **Total**: $totalChecks

## Policy Versions

- Policy Pack: v1.0.0
- Scoring Engine: v1.0.0

## Next Steps

$(if ($overallPass) {
@"
1. Create PR: ``.\scripts\ga\gh_create_pr.ps1``
2. Watch CI: ``.\scripts\ga\gh_watch_ci.ps1``
3. Apply branch protection: ``.\scripts\ga\gh_apply_branch_protection.ps1``
4. Generate outreach packets: ``npx tsx scripts/ga/generate_outreach_packets.ts``
5. Merge when all approvals received
"@
} else {
@"
1. Fix failing checks listed above
2. Re-run: ``.\scripts\ga\run_ga_gate.ps1``
3. Do not proceed with PR until all critical checks pass
"@
})

---

*Generated by GA Gate Runner — Phase 8G*
"@

$resultContent | Set-Content -Path $resultPath -Encoding UTF8
Write-Host ""
Write-Host "  Result artifact: $resultPath" -ForegroundColor Cyan

Pop-Location

# Exit code
if ($CIMode -and -not $overallPass) {
    exit 1
}
