# Startup Health Check Script - 3-Phase State Machine
# Detect → Repair → Recheck
# Based on flawless design pattern for deterministic health checking

param(
  [switch]$AutoFix = $true,
  [int]$MaxFixRounds = 2,
  [switch]$NeverExitNonZero = $true
)

Set-StrictMode -Version Latest
$global:ErrorActionPreference = 'Continue'   # Critical: do not die on first error
$ProgressPreference = 'SilentlyContinue'
$script:failures = @()
$script:actions = @()

function Add-Failure($name, $detail, $fixBlock) {
  $script:failures += [pscustomobject]@{ name=$name; detail=$detail; fix=$fixBlock }
}

function Run-Check($name, [scriptblock]$check, [scriptblock]$fix) {
  try {
    & $check
    Write-Host "  [OK] $name" -ForegroundColor Green
  } catch {
    Write-Host "  [FAIL] $name -> $($_.Exception.Message)" -ForegroundColor Red
    Add-Failure $name $_.Exception.Message $fix
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
    if (-not $f.fix) { 
      Write-Host "  [SKIP] $($f.name) (no auto-fix available)" -ForegroundColor Gray
      continue 
    }
    try {
      Write-Host "  [FIXING] $($f.name)..." -ForegroundColor Yellow
      & $f.fix
      $script:actions += [pscustomobject]@{ 
        name=$f.name
        success=$true
        ts=(Get-Date).ToString("o")
      }
      Write-Host "  [SUCCESS] $($f.name) repaired" -ForegroundColor Green
    } catch {
      Write-Host "  [FAIL] Fix failed: $($_.Exception.Message)" -ForegroundColor Red
      $script:actions += [pscustomobject]@{ 
        name=$f.name
        success=$false
        ts=(Get-Date).ToString("o")
        error=$_.Exception.Message
      }
    }
  }
  
  Write-Host ""
  Write-Host "Waiting 5 seconds for services to stabilize..." -ForegroundColor Gray
  Start-Sleep -Seconds 5
}

function Recheck-All {
  $script:failures = @()

  Write-Host ""
  Write-Host "===============================" -ForegroundColor Cyan
  Write-Host "🔍 DETECTION PHASE" -ForegroundColor Cyan
  Write-Host "===============================" -ForegroundColor Cyan
  Write-Host ""

  # Check 1: Backend /health/live
  Write-Host "[1/6] Backend /health/live..." -ForegroundColor Yellow
  Run-Check "Backend /health/live" {
    $r = Invoke-RestMethod "http://localhost:3003/health/live" -TimeoutSec 3 -ErrorAction Stop
    if ($r.status -ne "alive") { throw "backend not alive (status: $($r.status))" }
  } {
    # Fix: restart backend via PM2
    Write-Host "    Restarting backend via PM2..." -ForegroundColor Gray
    pm2 restart backend
  }

  # Check 2: Backend /health/status
  Write-Host ""
  Write-Host "[2/6] Backend /health/status..." -ForegroundColor Yellow
  Run-Check "Backend /health/status (must be 'healthy')" {
    $r = Invoke-RestMethod "http://localhost:3003/health/status" -TimeoutSec 3 -ErrorAction Stop
    if ($r.status -ne "healthy") { 
      throw "status is '$($r.status)', not 'healthy'" 
    }
  } {
    # Fix: call recovery endpoint once
    Write-Host "    Attempting auto-recovery..." -ForegroundColor Gray
    try {
      $adminPassword = $env:ADMIN_PASSWORD
      if ($adminPassword) {
        $headers = @{ "x-admin-password" = $adminPassword }
        Invoke-RestMethod -Method POST "http://localhost:3003/health/recover" -Headers $headers -TimeoutSec 15 -ErrorAction Stop | Out-Null
      } else {
        Write-Host "    ADMIN_PASSWORD not set, restarting backend..." -ForegroundColor Gray
        pm2 restart backend
      }
    } catch {
      Write-Host "    Recovery failed, restarting backend..." -ForegroundColor Gray
      pm2 restart backend
    }
  }

  # Check 3: Database /health/db
  Write-Host ""
  Write-Host "[3/6] Database /health/db..." -ForegroundColor Yellow
  Run-Check "Database Ready" {
    $db = Invoke-RestMethod "http://localhost:3003/health/db" -TimeoutSec 3 -ErrorAction Stop
    if ($db.ready -ne $true) { throw "db not ready: $($db.message)" }
  } {
    # Fix: restart backend to reconnect
    Write-Host "    Restarting backend to reconnect database..." -ForegroundColor Gray
    pm2 restart backend
  }

  # Check 4: Frontend reachable
  Write-Host ""
  Write-Host "[4/6] Frontend reachability..." -ForegroundColor Yellow
  Run-Check "Frontend HTTP 200" {
    $r = Invoke-WebRequest "http://localhost:3000" -TimeoutSec 3 -ErrorAction Stop
    if ($r.StatusCode -ne 200) { throw "frontend returned status $($r.StatusCode)" }
  } {
    # Fix: restart frontend
    Write-Host "    Restarting frontend via PM2..." -ForegroundColor Gray
    pm2 restart frontend
  }

  # Check 5: Cloudflared process
  Write-Host ""
  Write-Host "[5/6] Cloudflared tunnel process..." -ForegroundColor Yellow
  Run-Check "Cloudflared Process Running" {
    $proc = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
    if (-not $proc) { throw "cloudflared process not found" }
  } {
    # Fix: start cloudflared
    Write-Host "    Starting cloudflared tunnel..." -ForegroundColor Gray
    Start-Process cloudflared -ArgumentList "tunnel", "run" -NoNewWindow
  }

  # Check 6: Public domain reachability
  Write-Host ""
  Write-Host "[6/6] Public domain via tunnel..." -ForegroundColor Yellow
  Run-Check "Tunnel Domain Reachable" {
    $r = Invoke-RestMethod "https://care2connects.org/health/live" -TimeoutSec 10 -ErrorAction Stop
    if ($r.status -ne "alive") { throw "domain unreachable or status not 'alive'" }
  } {
    # Fix: restart cloudflared
    Write-Host "    Restarting cloudflared tunnel..." -ForegroundColor Gray
    Stop-Process -Name cloudflared -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Start-Process cloudflared -ArgumentList "tunnel", "run" -NoNewWindow
  }
}

# ========================================
# MAIN EXECUTION
# ========================================

Write-Host ""
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "WORKSPACE STARTUP HEALTH CHECK" -ForegroundColor Cyan
Write-Host "3-PHASE STATE MACHINE" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# Phase 1: Initial detection
Recheck-All

# Phase 2 & 3: Repair → Recheck (loop)
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
$fixCount = ($script:actions | Where-Object { $_.success -eq $true }).Count
$failedFixCount = ($script:actions | Where-Object { $_.success -eq $false }).Count

Write-Host "Total Checks: 6" -ForegroundColor White
Write-Host "Issues Found: $issueCount" -ForegroundColor $(if ($issueCount -eq 0) { "Green" } else { "Yellow" })
Write-Host "Fixes Applied: $fixCount" -ForegroundColor $(if ($fixCount -gt 0) { "Cyan" } else { "Gray" })
Write-Host "Fixes Failed: $failedFixCount" -ForegroundColor $(if ($failedFixCount -gt 0) { "Red" } else { "Gray" })
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
    
    if ($fixCount -gt 0) {
        Write-Host "Successful Fixes:" -ForegroundColor Cyan
        $script:actions | Where-Object { $_.success -eq $true } | ForEach-Object {
            Write-Host "  ✓ $($_.name)" -ForegroundColor Green
        }
        Write-Host ""
    }
    
    if ($failedFixCount -gt 0) {
        Write-Host "Failed Fixes (manual intervention needed):" -ForegroundColor Red
        $script:actions | Where-Object { $_.success -eq $false } | ForEach-Object {
            Write-Host "  ✗ $($_.name): $($_.error)" -ForegroundColor Red
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
