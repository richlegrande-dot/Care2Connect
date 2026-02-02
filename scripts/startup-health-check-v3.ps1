# Startup Health Check Script - 3-Phase State Machine  
# Detect → Repair → Recheck
# Simpler version without complex scriptblock parameters

param(
  [switch]$AutoFix = $true,
  [int]$MaxFixRounds = 2,
  [switch]$NeverExitNonZero = $true
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

$script:failures = @()
$script:actions = @()

function Recheck-All {
  $script:failures = @()

  Write-Host ""
  Write-Host "===============================" -ForegroundColor Cyan
  Write-Host "🔍 DETECTION PHASE" -ForegroundColor Cyan
  Write-Host "===============================" -ForegroundColor Cyan
  Write-Host ""

  # Check 1: Backend /health/live
  Write-Host "[1/6] Backend /health/live..." -ForegroundColor Yellow
  try {
    $r = Invoke-RestMethod "http://localhost:3003/health/live" -TimeoutSec 3 -ErrorAction Stop
    if ($r.status -ne "alive") { throw "backend not alive" }
    Write-Host "  [OK] Backend alive" -ForegroundColor Green
  } catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    $script:failures += @{
      name = "Backend /health/live"
      detail = $_.Exception.Message
      fix = { pm2 restart backend }
    }
  }

  # Check 2: Backend /health/status (must be 'healthy', NOT 'degraded')
  Write-Host ""
  Write-Host "[2/6] Backend /health/status..." -ForegroundColor Yellow
  try {
    $r = Invoke-RestMethod "http://localhost:3003/health/status" -TimeoutSec 3 -ErrorAction Stop
    if ($r.status -ne "healthy") { 
      throw "status is '$($r.status)', not 'healthy'" 
    }
    Write-Host "  [OK] Backend status: healthy" -ForegroundColor Green
  } catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    $script:failures += @{
      name = "Backend /health/status"
      detail = $_.Exception.Message
      fix = {
        try {
          if ($env:ADMIN_PASSWORD) {
            $headers = @{ "x-admin-password" = $env:ADMIN_PASSWORD }
            Invoke-RestMethod -Method POST "http://localhost:3003/health/recover" -Headers $headers -TimeoutSec 15 | Out-Null
          } else {
            pm2 restart backend
          }
        } catch {
          pm2 restart backend
        }
      }
    }
  }

  # Check 3: Database
  Write-Host ""
  Write-Host "[3/6] Database /health/db..." -ForegroundColor Yellow
  try {
    $db = Invoke-RestMethod "http://localhost:3003/health/db" -TimeoutSec 3 -ErrorAction Stop
    if ($db.ready -ne $true) { throw "db not ready" }
    Write-Host "  [OK] Database ready" -ForegroundColor Green
  } catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    $script:failures += @{
      name = "Database"
      detail = $_.Exception.Message
      fix = { pm2 restart backend }
    }
  }

  # Check 4: Frontend
  Write-Host ""
  Write-Host "[4/6] Frontend reachability..." -ForegroundColor Yellow
  try {
    $r = Invoke-WebRequest "http://localhost:3000" -TimeoutSec 3 -ErrorAction Stop
    if ($r.StatusCode -ne 200) { throw "status code $($r.StatusCode)" }
    Write-Host "  [OK] Frontend responding" -ForegroundColor Green
  } catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    $script:failures += @{
      name = "Frontend"
      detail = $_.Exception.Message
      fix = { pm2 restart frontend }
    }
  }

  # Check 5: Cloudflared
  Write-Host ""
  Write-Host "[5/6] Cloudflared process..." -ForegroundColor Yellow
  try {
    $proc = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
    if (-not $proc) { throw "cloudflared not running" }
    Write-Host "  [OK] Cloudflared running" -ForegroundColor Green
  } catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    $script:failures += @{
      name = "Cloudflared"
      detail = $_.Exception.Message
      fix = { Start-Process cloudflared -ArgumentList "tunnel", "run" -NoNewWindow }
    }
  }

  # Check 6: Public domain
  Write-Host ""
  Write-Host "[6/6] Public domain..." -ForegroundColor Yellow
  try {
    $r = Invoke-RestMethod "https://care2connects.org/health/live" -TimeoutSec 10 -ErrorAction Stop
    if ($r.status -ne "alive") { throw "domain unreachable" }
    Write-Host "  [OK] Domain reachable" -ForegroundColor Green
  } catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    $script:failures += @{
      name = "Public Domain"
      detail = $_.Exception.Message
      fix = {
        Stop-Process -Name cloudflared -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Start-Process cloudflared -ArgumentList "tunnel", "run" -NoNewWindow
      }
    }
  }
}

function Invoke-FixRound($round) {
  if ($script:failures.Count -eq 0) { return }

  Write-Host ""
  Write-Host "===============================" -ForegroundColor Magenta
  Write-Host "🛠️  REPAIR PHASE - ROUND $round" -ForegroundColor Magenta
  Write-Host "===============================" -ForegroundColor Magenta
  Write-Host ""

  foreach ($f in $script:failures) {
    try {
      Write-Host "  [FIXING] $($f.name)..." -ForegroundColor Yellow
      & $f.fix
      $script:actions += @{
        name = $f.name
        success = $true
        ts = (Get-Date).ToString("o")
      }
      Write-Host "  [SUCCESS] $($f.name) repaired" -ForegroundColor Green
    } catch {
      Write-Host "  [FAIL] Fix failed: $($_.Exception.Message)" -ForegroundColor Red
      $script:actions += @{
        name = $f.name
        success = $false
        ts = (Get-Date).ToString("o")
        error = $_.Exception.Message
      }
    }
  }
  
  Write-Host ""
  Write-Host "Waiting 5 seconds for services to stabilize..." -ForegroundColor Gray
  Start-Sleep -Seconds 5
}

# ========================================
# MAIN EXECUTION
# ========================================

Write-Host ""
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "WORKSPACE STARTUP HEALTH CHECK" -ForegroundColor Cyan
Write-Host "3-PHASE STATE MACHINE" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# Phase 1: Detect
Recheck-All

# Phase 2 & 3: Repair → Recheck
if ($AutoFix -and $script:failures.Count -gt 0) {
  for ($i = 1; $i -le $MaxFixRounds -and $script:failures.Count -gt 0; $i++) {
    Invoke-FixRound $i
    
    Write-Host ""
    Write-Host "===============================" -ForegroundColor Cyan
    Write-Host "🔍 RECHECK PHASE - ROUND $i" -ForegroundColor Cyan
    Write-Host "===============================" -ForegroundColor Cyan
    
    Recheck-All
    
    if ($script:failures.Count -eq 0) {
      Write-Host ""
      Write-Host "🎉 All issues resolved!" -ForegroundColor Green
      break
    }
  }
}

# ========================================
# FINAL SUMMARY
# ========================================

Write-Host ""
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "📊 FINAL SUMMARY" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

$issueCount = $script:failures.Count
$successfulFixes = @($script:actions | Where-Object { $_.success -eq $true })
$failedFixes = @($script:actions | Where-Object { $_.success -eq $false })

Write-Host "Total Checks: 6" -ForegroundColor White
Write-Host "Issues Found: $issueCount" -ForegroundColor $(if ($issueCount -eq 0) { "Green" } else { "Yellow" })
Write-Host "Fixes Applied: $($successfulFixes.Count)" -ForegroundColor $(if ($successfulFixes.Count -gt 0) { "Cyan" } else { "Gray" })
Write-Host "Fixes Failed: $($failedFixes.Count)" -ForegroundColor $(if ($failedFixes.Count -gt 0) { "Red" } else { "Gray" })
Write-Host ""

if ($issueCount -eq 0) {
    Write-Host "✅ ALL CHECKS PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "System Status: HEALTHY" -ForegroundColor Green
} else {
    Write-Host "⚠️  ISSUES REMAINING: $issueCount" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Unresolved Issues:" -ForegroundColor Yellow
    foreach ($f in $script:failures) {
        Write-Host "  • $($f.name): $($f.detail)" -ForegroundColor Red
    }
    Write-Host ""
    
    if ($successfulFixes.Count -gt 0) {
        Write-Host "Successful Fixes:" -ForegroundColor Cyan
        foreach ($action in $successfulFixes) {
            Write-Host "  ✓ $($action.name)" -ForegroundColor Green
        }
        Write-Host ""
    }
    
    if ($failedFixes.Count -gt 0) {
        Write-Host "Failed Fixes:" -ForegroundColor Red
        foreach ($action in $failedFixes) {
            Write-Host "  ✗ $($action.name): $($action.error)" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    Write-Host "RECOMMENDED ACTIONS:" -ForegroundColor Yellow
    Write-Host "1. Review error details above" -ForegroundColor White
    Write-Host "2. Check backend/.env for credentials" -ForegroundColor White
    Write-Host "3. View http://localhost:3003/health/status" -ForegroundColor White
    Write-Host "4. Run: .\scripts\start-all.ps1" -ForegroundColor White
    Write-Host ""
}

Write-Host "Quick Links:" -ForegroundColor Gray
Write-Host "  Health Status: http://localhost:3003/health/status" -ForegroundColor Gray
Write-Host "  Public Site: https://care2connects.org" -ForegroundColor Gray
Write-Host ""

# Exit code handling
if ($NeverExitNonZero) {
  Write-Host "Exit Code: 0 (forced by -NeverExitNonZero)" -ForegroundColor Gray
  exit 0
} else {
  if ($issueCount -gt 0) {
    Write-Host "Exit Code: 1 (issues detected)" -ForegroundColor Yellow
    exit 1
  } else {
    Write-Host "Exit Code: 0 (all passed)" -ForegroundColor Green
    exit 0
  }
}
