# Startup Health Check Script - 3-Phase State Machine  
# Detect -> Repair -> Recheck
# Ensures errors trigger automatic recovery before script termination

param(
  [switch]$AutoFix = $true,
  [int]$MaxFixRounds = 2,
  [switch]$NeverExitNonZero = $true
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'  # CRITICAL: do not die on first error
$ProgressPreference = 'SilentlyContinue'

$script:failures = @()
$script:actions = @()
$workspaceRoot = Split-Path $PSScriptRoot -Parent

function Start-PM2Process {
  param([string]$ProcessName)
  
  # Check if process exists in PM2 using simple status check
  try {
    $pm2Output = pm2 list 2>&1 | Out-String
    
    if ($pm2Output -match $ProcessName) {
      # Process exists, restart it
      pm2 restart $ProcessName 2>&1 | Out-Null
    } else {
      # Process doesn't exist, start from ecosystem config
      $ecosystemPath = Join-Path $workspaceRoot "ecosystem.config.js"
      if (Test-Path $ecosystemPath) {
        pm2 start $ecosystemPath --only $ProcessName 2>&1 | Out-Null
      } else {
        throw "Ecosystem config not found"
      }
    }
  } catch {
    # If all else fails, try starting the entire ecosystem
    $ecosystemPath = Join-Path $workspaceRoot "ecosystem.config.js"
    if (Test-Path $ecosystemPath) {
      pm2 start $ecosystemPath 2>&1 | Out-Null
    }
  }
}

function Test-PM2Configuration {
  # Quick PM2 validation before health checks
  try {
    # Use simple pm2 list instead of jlist to avoid JSON parsing issues
    $pm2Output = pm2 list 2>&1 | Out-String
    if ($pm2Output -match 'online.*0') {
      # No processes or all stopped
      Write-Host "[WARNING] PM2 has no or stopped processes. Running validator..." -ForegroundColor Yellow
      & "$workspaceRoot\scripts\validate-pm2-config.ps1" -AutoFix | Out-Null
      Start-Sleep -Seconds 3
    } elseif ($pm2Output -match 'errored|stopped') {
      Write-Host "[WARNING] PM2 has errored/stopped processes. Validating configuration..." -ForegroundColor Yellow
      & "$workspaceRoot\scripts\validate-pm2-config.ps1" -AutoFix | Out-Null
      Start-Sleep -Seconds 3
    }
  } catch {
    Write-Host "[WARNING] PM2 check failed: $($_.Exception.Message)" -ForegroundColor Yellow
  }
}

function Test-DatabaseConnectivity {
  Write-Host "[DATABASE] Testing database connectivity..." -ForegroundColor Yellow
  try {
    # Test 1: Health endpoint
    $db = Invoke-RestMethod "http://localhost:3001/health/db" -TimeoutSec 5 -ErrorAction Stop
    if ($db.ready -ne $true) { throw "Database health check failed" }
    Write-Host "  ✓ Database health endpoint OK" -ForegroundColor Green
    
    # Test 2: Direct Prisma connection test
    Push-Location "$workspaceRoot\backend"
    $testOutput = node test-db.js 2>&1 | Out-String
    Pop-Location
    
    if ($testOutput -match "DATABASE CONNECTION: HEALTHY") {
      Write-Host "  ✓ Direct Prisma connection verified" -ForegroundColor Green
      return $true
    } else {
      throw "Prisma connection test failed"
    }
  } catch {
    Write-Host "  ✗ Database test failed: $($_.Exception.Message)" -ForegroundColor Red
    return $false
  }
}

function Test-PortConnectivity {
  Write-Host "[PORTS] Testing port connectivity..." -ForegroundColor Yellow
  $ports = @(
    @{ Port = 3000; Service = "Frontend (Next.js)" },
    @{ Port = 3001; Service = "Backend (Node.js)" },
    @{ Port = 8080; Service = "Reverse Proxy" }
  )
  
  $allPortsOpen = $true
  foreach ($p in $ports) {
    try {
      $conn = Test-NetConnection -ComputerName localhost -Port $p.Port -WarningAction SilentlyContinue
      if ($conn.TcpTestSucceeded) {
        Write-Host "  ✓ Port $($p.Port) open - $($p.Service)" -ForegroundColor Green
      } else {
        Write-Host "  ✗ Port $($p.Port) closed - $($p.Service)" -ForegroundColor Red
        $allPortsOpen = $false
      }
    } catch {
      Write-Host "  ✗ Port $($p.Port) test failed - $($p.Service)" -ForegroundColor Red
      $allPortsOpen = $false
    }
  }
  return $allPortsOpen
}

function Test-TunnelConnectivity {
  Write-Host "[TUNNEL] Testing Cloudflare Tunnel..." -ForegroundColor Yellow
  try {
    # Check if cloudflared process is running
    $proc = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
    if (-not $proc) {
      Write-Host "  ✗ Cloudflared process not running" -ForegroundColor Red
      return $false
    }
    Write-Host "  ✓ Cloudflared process running (PID: $($proc.Id))" -ForegroundColor Green
    
    # Test public domain accessibility
    $domains = @("care2connects.org", "api.care2connects.org")
    $allDomainsOk = $true
    
    foreach ($domain in $domains) {
      try {
        $url = "https://$domain/health/live"
        $r = Invoke-RestMethod $url -TimeoutSec 10 -ErrorAction Stop
        if ($r.status -eq "alive") {
          Write-Host "  ✓ Tunnel to $domain working" -ForegroundColor Green
        } else {
          Write-Host "  ✗ Tunnel to $domain returned unexpected status" -ForegroundColor Red
          $allDomainsOk = $false
        }
      } catch {
        Write-Host "  ✗ Tunnel to $domain failed: $($_.Exception.Message)" -ForegroundColor Red
        $allDomainsOk = $false
      }
    }
    
    # Check reverse proxy
    try {
      $pm2Output = pm2 list 2>&1 | Out-String
      if ($pm2Output -match "reverse-proxy.*online") {
        Write-Host "  ✓ Reverse proxy running in PM2" -ForegroundColor Green
      } else {
        Write-Host "  ✗ Reverse proxy not found in PM2" -ForegroundColor Red
        $allDomainsOk = $false
      }
    } catch {
      Write-Host "  ✗ Could not verify reverse proxy status" -ForegroundColor Red
      $allDomainsOk = $false
    }
    
    return $allDomainsOk
  } catch {
    Write-Host "  ✗ Tunnel test failed: $($_.Exception.Message)" -ForegroundColor Red
    return $false
  }
}

function Recheck-All {
  $script:failures = @()

  Write-Host ""
  Write-Host "===============================" -ForegroundColor Cyan
  Write-Host "[CHECK] DETECTION PHASE" -ForegroundColor Cyan
  Write-Host "===============================" -ForegroundColor Cyan
  Write-Host ""

  # PRE-CHECK: Validate PM2 configuration
  Test-PM2Configuration
  
  Write-Host ""
  Write-Host "===============================" -ForegroundColor Cyan
  Write-Host "[COMPREHENSIVE SYSTEM TESTS]" -ForegroundColor Cyan
  Write-Host "===============================" -ForegroundColor Cyan
  Write-Host ""
  
  # Comprehensive Test 1: Database Connectivity
  $dbTestPassed = Test-DatabaseConnectivity
  if (-not $dbTestPassed) {
    $script:failures += @{
      name = "Database Connectivity"
      detail = "Database connection tests failed"
      fix = { Start-PM2Process -ProcessName 'careconnect-backend' }
    }
  }
  
  Write-Host ""
  
  # Comprehensive Test 2: Port Connectivity
  $portTestPassed = Test-PortConnectivity
  if (-not $portTestPassed) {
    $script:failures += @{
      name = "Port Connectivity"
      detail = "One or more required ports are not accessible"
      fix = { 
        Start-PM2Process -ProcessName 'careconnect-backend'
        Start-PM2Process -ProcessName 'careconnect-frontend'
        Start-PM2Process -ProcessName 'reverse-proxy'
      }
    }
  }
  
  Write-Host ""
  
  # Comprehensive Test 3: Tunnel Connectivity
  $tunnelTestPassed = Test-TunnelConnectivity
  if (-not $tunnelTestPassed) {
    $script:failures += @{
      name = "Tunnel Connectivity"
      detail = "Cloudflare Tunnel or reverse proxy issues detected"
      fix = {
        # Start reverse proxy if not running
        $pm2Output = pm2 list 2>&1 | Out-String
        if (-not ($pm2Output -match "reverse-proxy.*online")) {
          pm2 start "$workspaceRoot\reverse-proxy.js" --name reverse-proxy 2>&1 | Out-Null
          pm2 save 2>&1 | Out-Null
        }
        # Restart cloudflared
        Stop-Process -Name cloudflared -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Start-Process cloudflared -ArgumentList "tunnel", "run" -NoNewWindow
      }
    }
  }
  
  Write-Host ""
  Write-Host "===============================" -ForegroundColor Cyan
  Write-Host "[STANDARD HEALTH CHECKS]" -ForegroundColor Cyan
  Write-Host "===============================" -ForegroundColor Cyan
  Write-Host ""

  # Check 1: Backend /health/live
  Write-Host "[1/6] Backend /health/live..." -ForegroundColor Yellow
  try {
    $r = Invoke-RestMethod "http://localhost:3001/health/live" -TimeoutSec 3 -ErrorAction Stop
    if ($r.status -ne "alive") { throw "backend not alive" }
    Write-Host "  [OK] Backend alive" -ForegroundColor Green
  } catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    $script:failures += @{
      name = "Backend /health/live"
      detail = $_.Exception.Message
      fix = { Start-PM2Process -ProcessName 'careconnect-backend' }
    }
  }

  # Check 2: Backend /health/status (accept 'ready' or 'healthy')
  Write-Host ""
  Write-Host "[2/6] Backend /health/status..." -ForegroundColor Yellow
  try {
    $r = Invoke-RestMethod "http://localhost:3001/health/status" -TimeoutSec 3 -ErrorAction Stop
    if ($r.status -ne "ready" -and $r.status -ne "healthy") { 
      throw "status is '$($r.status)', expected 'ready' or 'healthy'" 
    }
    Write-Host "  [OK] Backend status: $($r.status)" -ForegroundColor Green
  } catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    $script:failures += @{
      name = "Backend /health/status"
      detail = $_.Exception.Message
      fix = {
        try {
          if ($env:ADMIN_PASSWORD) {
            $headers = @{ "x-admin-password" = $env:ADMIN_PASSWORD }
            Invoke-RestMethod -Method POST "http://localhost:3001/health/recover" -Headers $headers -TimeoutSec 15 | Out-Null
          } else {
            Start-PM2Process -ProcessName 'careconnect-backend'
          }
        } catch {
          Start-PM2Process -ProcessName 'careconnect-backend'
        }
      }
    }
  }

  # Check 3: Database
  Write-Host ""
  Write-Host "[3/6] Database /health/db..." -ForegroundColor Yellow
  try {
    $db = Invoke-RestMethod "http://localhost:3001/health/db" -TimeoutSec 3 -ErrorAction Stop
    if ($db.ready -ne $true) { throw "db not ready" }
    Write-Host "  [OK] Database ready" -ForegroundColor Green
  } catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    $script:failures += @{
      name = "Database"
      detail = $_.Exception.Message
      fix = { Start-PM2Process -ProcessName 'careconnect-backend' }
    }
  }

  # Check 4: Frontend
  Write-Host ""
  Write-Host "[4/6] Frontend reachability..." -ForegroundColor Yellow
  try {
    $r = Invoke-WebRequest "http://localhost:3000" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    if ($r.StatusCode -ne 200) { throw "status code $($r.StatusCode)" }
    Write-Host "  [OK] Frontend responding" -ForegroundColor Green
  } catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    $script:failures += @{
      name = "Frontend"
      detail = $_.Exception.Message
      fix = { Start-PM2Process -ProcessName 'careconnect-frontend' }
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
  Write-Host "[FIX] REPAIR PHASE - ROUND $round" -ForegroundColor Magenta
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

# Phase 2 & 3: Repair -> Recheck
if ($AutoFix -and $script:failures.Count -gt 0) {
  for ($i = 1; $i -le $MaxFixRounds -and $script:failures.Count -gt 0; $i++) {
    Invoke-FixRound $i
    
    Write-Host ""
    Write-Host "===============================" -ForegroundColor Cyan
    Write-Host "[CHECK] RECHECK PHASE - ROUND $i" -ForegroundColor Cyan
    Write-Host "===============================" -ForegroundColor Cyan
    
    Recheck-All
    
    if ($script:failures.Count -eq 0) {
      Write-Host ""
      Write-Host "[SUCCESS] All issues resolved!" -ForegroundColor Green
      break
    }
  }
}

# ========================================
# FINAL SUMMARY
# ========================================

Write-Host ""
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "[SUMMARY] FINAL RESULTS" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

$issueCount = $script:failures.Count
$successfulFixes = @($script:actions | Where-Object { $_.success -eq $true })
$failedFixes = @($script:actions | Where-Object { $_.success -eq $false })

Write-Host "Comprehensive System Checks:" -ForegroundColor Cyan
Write-Host "  - Database Connectivity" -ForegroundColor White
Write-Host "  - Port Connectivity (3000, 3001, 8080)" -ForegroundColor White
Write-Host "  - Tunnel & Reverse Proxy" -ForegroundColor White
Write-Host "  - Backend Health (live, status)" -ForegroundColor White
Write-Host "  - Frontend Accessibility" -ForegroundColor White
Write-Host "  - Public Domain Reachability" -ForegroundColor White
Write-Host ""
Write-Host "Total Checks: 9" -ForegroundColor White
Write-Host "Issues Found: $issueCount" -ForegroundColor $(if ($issueCount -eq 0) { "Green" } else { "Yellow" })
Write-Host "Fixes Applied: $($successfulFixes.Count)" -ForegroundColor $(if ($successfulFixes.Count -gt 0) { "Cyan" } else { "Gray" })
Write-Host "Fixes Failed: $($failedFixes.Count)" -ForegroundColor $(if ($failedFixes.Count -gt 0) { "Red" } else { "Gray" })
Write-Host ""

if ($issueCount -eq 0) {
    Write-Host "[PASS] ALL CHECKS PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "System Status: HEALTHY" -ForegroundColor Green
} else {
    Write-Host "[WARN] ISSUES REMAINING: $issueCount" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Unresolved Issues:" -ForegroundColor Yellow
    foreach ($f in $script:failures) {
        Write-Host "  - $($f.name): $($f.detail)" -ForegroundColor Red
    }
    Write-Host ""
    
    if ($successfulFixes.Count -gt 0) {
        Write-Host "Successful Fixes:" -ForegroundColor Cyan
        foreach ($action in $successfulFixes) {
            Write-Host "  + $($action.name)" -ForegroundColor Green
        }
        Write-Host ""
    }
    
    if ($failedFixes.Count -gt 0) {
        Write-Host "Failed Fixes:" -ForegroundColor Red
        foreach ($action in $failedFixes) {
            Write-Host "  x $($action.name): $($action.error)" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    Write-Host "RECOMMENDED ACTIONS:" -ForegroundColor Yellow
    Write-Host "1. Review error details above" -ForegroundColor White
    Write-Host "2. Check backend/.env for credentials" -ForegroundColor White
    Write-Host "3. View http://localhost:3001/health/status" -ForegroundColor White
    Write-Host "4. Run: .\scripts\start-all.ps1" -ForegroundColor White
    Write-Host ""
}

Write-Host "Quick Links:" -ForegroundColor Gray
Write-Host "  Health Status: http://localhost:3001/health/status" -ForegroundColor Gray
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
