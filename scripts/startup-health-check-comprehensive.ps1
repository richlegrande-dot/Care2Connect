# Comprehensive Startup Health Check Script
# Tests: Database, Ports, Tunneling, Services, and Manual Testing Readiness
# Detect -> Repair -> Recheck -> Report

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
$script:testResults = @{}
$workspaceRoot = Split-Path $PSScriptRoot -Parent

# ========================================
# HELPER FUNCTIONS
# ========================================

function Start-PM2Process {
  param([string]$ProcessName)
  
  try {
    $pm2Output = pm2 list 2>&1 | Out-String
    
    if ($pm2Output -match $ProcessName) {
      pm2 restart $ProcessName 2>&1 | Out-Null
    } else {
      $ecosystemPath = Join-Path $workspaceRoot "ecosystem.config.js"
      if (Test-Path $ecosystemPath) {
        pm2 start $ecosystemPath --only $ProcessName 2>&1 | Out-Null
      } else {
        throw "Ecosystem config not found"
      }
    }
  } catch {
    $ecosystemPath = Join-Path $workspaceRoot "ecosystem.config.js"
    if (Test-Path $ecosystemPath) {
      pm2 start $ecosystemPath 2>&1 | Out-Null
    }
  }
}

function Test-PM2Configuration {
  try {
    $pm2Output = pm2 list 2>&1 | Out-String
    if ($pm2Output -match 'online.*0') {
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

# ========================================
# COMPREHENSIVE TEST FUNCTIONS
# ========================================

function Test-DatabaseConnectivity {
  Write-Host ""
  Write-Host "========================================" -ForegroundColor Cyan
  Write-Host "DATABASE CONNECTIVITY TEST" -ForegroundColor Cyan
  Write-Host "========================================" -ForegroundColor Cyan
  
  $allTestsPassed = $true
  
  try {
    # Test 1: Health endpoint
    Write-Host "[1/3] Testing database health endpoint..." -ForegroundColor Yellow
    $db = Invoke-RestMethod "http://localhost:3001/health/db" -TimeoutSec 5 -ErrorAction Stop
    if ($db.ready -ne $true) { throw "Database health check failed" }
    Write-Host "  ✓ Database health endpoint OK" -ForegroundColor Green
    
    # Test 2: Direct Prisma connection
    Write-Host "[2/3] Testing direct Prisma connection..." -ForegroundColor Yellow
    Push-Location "$workspaceRoot\backend"
    $testOutput = node test-db.js 2>&1 | Out-String
    Pop-Location
    
    if ($testOutput -match "DATABASE CONNECTION: HEALTHY") {
      Write-Host "  ✓ Direct Prisma connection verified" -ForegroundColor Green
    } else {
      Write-Host "  ✗ Prisma connection test failed" -ForegroundColor Red
      $allTestsPassed = $false
    }
    
    # Test 3: Query test
    Write-Host "[3/3] Testing database query execution..." -ForegroundColor Yellow
    $statusResp = Invoke-RestMethod "http://localhost:3001/health/status" -TimeoutSec 5 -ErrorAction Stop
    if ($statusResp.services.db.ok -eq $true) {
      Write-Host "  ✓ Database queries executing successfully" -ForegroundColor Green
    } else {
      Write-Host "  ✗ Database query execution failed" -ForegroundColor Red
      $allTestsPassed = $false
    }
    
  } catch {
    Write-Host "  ✗ Database test failed: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
  }
  
  $script:testResults['Database'] = $allTestsPassed
  return $allTestsPassed
}

function Test-PortConnectivity {
  Write-Host ""
  Write-Host "========================================" -ForegroundColor Cyan
  Write-Host "PORT CONNECTIVITY TEST" -ForegroundColor Cyan
  Write-Host "========================================" -ForegroundColor Cyan
  
  $ports = @(
    @{ Port = 3000; Service = "Frontend (Next.js)" },
    @{ Port = 3001; Service = "Backend (Node.js)" },
    @{ Port = 8080; Service = "Reverse Proxy" }
  )
  
  $allPortsOpen = $true
  $portNum = 1
  foreach ($p in $ports) {
    Write-Host "[$portNum/$($ports.Count)] Testing port $($p.Port) - $($p.Service)..." -ForegroundColor Yellow
    try {
      $conn = Test-NetConnection -ComputerName localhost -Port $p.Port -WarningAction SilentlyContinue -ErrorAction Stop
      if ($conn.TcpTestSucceeded) {
        Write-Host "  ✓ Port $($p.Port) open and accessible" -ForegroundColor Green
      } else {
        Write-Host "  ✗ Port $($p.Port) closed or not responding" -ForegroundColor Red
        $allPortsOpen = $false
      }
    } catch {
      Write-Host "  ✗ Port $($p.Port) test failed: $($_.Exception.Message)" -ForegroundColor Red
      $allPortsOpen = $false
    }
    $portNum++
  }
  
  $script:testResults['Ports'] = $allPortsOpen
  return $allPortsOpen
}

function Test-TunnelConnectivity {
  Write-Host ""
  Write-Host "========================================" -ForegroundColor Cyan
  Write-Host "CLOUDFLARE TUNNEL TEST" -ForegroundColor Cyan
  Write-Host "========================================" -ForegroundColor Cyan
  
  $allTestsPassed = $true
  
  try {
    # Test 1: Cloudflared process
    Write-Host "[1/4] Checking cloudflared process..." -ForegroundColor Yellow
    $proc = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
    if (-not $proc) {
      Write-Host "  ✗ Cloudflared process not running" -ForegroundColor Red
      $allTestsPassed = $false
    } else {
      Write-Host "  ✓ Cloudflared running (PID: $($proc.Id))" -ForegroundColor Green
    }
    
    # Test 2: Reverse proxy
    Write-Host "[2/4] Checking reverse proxy in PM2..." -ForegroundColor Yellow
    $pm2Output = pm2 list 2>&1 | Out-String
    if ($pm2Output -match "reverse-proxy.*online") {
      Write-Host "  ✓ Reverse proxy running in PM2" -ForegroundColor Green
    } else {
      Write-Host "  ✗ Reverse proxy not found in PM2" -ForegroundColor Red
      $allTestsPassed = $false
    }
    
    # Test 3: Public domain - main site
    Write-Host "[3/4] Testing tunnel to care2connects.org..." -ForegroundColor Yellow
    $url = "https://care2connects.org/health/live"
    $r = Invoke-RestMethod $url -TimeoutSec 10 -ErrorAction Stop
    if ($r.status -eq "alive") {
      Write-Host "  ✓ Tunnel to care2connects.org working" -ForegroundColor Green
    } else {
      Write-Host "  ✗ Unexpected response from care2connects.org" -ForegroundColor Red
      $allTestsPassed = $false
    }
    
    # Test 4: Public domain - API subdomain
    Write-Host "[4/4] Testing tunnel to api.care2connects.org..." -ForegroundColor Yellow
    $apiUrl = "https://api.care2connects.org/health/live"
    $apiResp = Invoke-RestMethod $apiUrl -TimeoutSec 10 -ErrorAction Stop
    if ($apiResp.status -eq "alive") {
      Write-Host "  ✓ Tunnel to api.care2connects.org working" -ForegroundColor Green
    } else {
      Write-Host "  ✗ Unexpected response from api.care2connects.org" -ForegroundColor Red
      $allTestsPassed = $false
    }
    
  } catch {
    Write-Host "  ✗ Tunnel test failed: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
  }
  
  $script:testResults['Tunnel'] = $allTestsPassed
  return $allTestsPassed
}

# ========================================
# STANDARD HEALTH CHECKS
# ========================================

function Invoke-StandardHealthChecks {
  Write-Host ""
  Write-Host "========================================" -ForegroundColor Cyan
  Write-Host "STANDARD HEALTH CHECKS" -ForegroundColor Cyan
  Write-Host "========================================" -ForegroundColor Cyan
  Write-Host ""

  $script:failures = @()

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

  # Check 2: Backend /health/status
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
        # Ensure reverse proxy is running
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
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "COMPREHENSIVE STARTUP HEALTH CHECK" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Testing: Database | Ports | Tunneling | Services" -ForegroundColor Gray

# PRE-CHECK: Validate PM2
Test-PM2Configuration

# PHASE 1: Comprehensive System Tests
$dbTestPassed = Test-DatabaseConnectivity
$portTestPassed = Test-PortConnectivity
$tunnelTestPassed = Test-TunnelConnectivity

# Add comprehensive test failures
if (-not $dbTestPassed) {
  $script:failures += @{
    name = "Database Connectivity"
    detail = "Database connection tests failed"
    fix = { Start-PM2Process -ProcessName 'careconnect-backend' }
  }
}

if (-not $portTestPassed) {
  $script:failures += @{
    name = "Port Connectivity"
    detail = "One or more required ports are not accessible"
    fix = { 
      Start-PM2Process -ProcessName 'careconnect-backend'
      Start-PM2Process -ProcessName 'careconnect-frontend'
      $pm2Output = pm2 list 2>&1 | Out-String
      if (-not ($pm2Output -match "reverse-proxy.*online")) {
        pm2 start "$workspaceRoot\reverse-proxy.js" --name reverse-proxy 2>&1 | Out-Null
        pm2 save 2>&1 | Out-Null
      }
    }
  }
}

if (-not $tunnelTestPassed) {
  $script:failures += @{
    name = "Tunnel Connectivity"
    detail = "Cloudflare Tunnel or reverse proxy issues detected"
    fix = {
      $pm2Output = pm2 list 2>&1 | Out-String
      if (-not ($pm2Output -match "reverse-proxy.*online")) {
        pm2 start "$workspaceRoot\reverse-proxy.js" --name reverse-proxy 2>&1 | Out-Null
        pm2 save 2>&1 | Out-Null
      }
      Stop-Process -Name cloudflared -Force -ErrorAction SilentlyContinue
      Start-Sleep -Seconds 2
      Start-Process cloudflared -ArgumentList "tunnel", "run" -NoNewWindow
    }
  }
}

# PHASE 2: Standard Health Checks
Invoke-StandardHealthChecks

# PHASE 3: Auto-fix if needed
if ($AutoFix -and $script:failures.Count -gt 0) {
  for ($i = 1; $i -le $MaxFixRounds -and $script:failures.Count -gt 0; $i++) {
    Invoke-FixRound $i
    
    Write-Host ""
    Write-Host "===============================" -ForegroundColor Cyan
    Write-Host "[CHECK] RECHECK PHASE - ROUND $i" -ForegroundColor Cyan
    Write-Host "===============================" -ForegroundColor Cyan
    
    Invoke-StandardHealthChecks
    
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
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "FINAL SYSTEM STATUS REPORT" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$issueCount = $script:failures.Count
$successfulFixes = @($script:actions | Where-Object { $_.success -eq $true })
$failedFixes = @($script:actions | Where-Object { $_.success -eq $false })

Write-Host "Comprehensive Test Results:" -ForegroundColor White
Write-Host "  Database Connectivity:    $(if ($script:testResults['Database']) { '✓ PASSED' } else { '✗ FAILED' })" -ForegroundColor $(if ($script:testResults['Database']) { 'Green' } else { 'Red' })
Write-Host "  Port Connectivity:        $(if ($script:testResults['Ports']) { '✓ PASSED' } else { '✗ FAILED' })" -ForegroundColor $(if ($script:testResults['Ports']) { 'Green' } else { 'Red' })
Write-Host "  Tunnel Connectivity:      $(if ($script:testResults['Tunnel']) { '✓ PASSED' } else { '✗ FAILED' })" -ForegroundColor $(if ($script:testResults['Tunnel']) { 'Green' } else { 'Red' })
Write-Host ""
Write-Host "Standard Health Checks:" -ForegroundColor White
Write-Host "  Total Checks: 6" -ForegroundColor White
Write-Host "  Issues Found: $issueCount" -ForegroundColor $(if ($issueCount -eq 0) { "Green" } else { "Yellow" })
Write-Host "  Fixes Applied: $($successfulFixes.Count)" -ForegroundColor $(if ($successfulFixes.Count -gt 0) { "Cyan" } else { "Gray" })
Write-Host "  Fixes Failed: $($failedFixes.Count)" -ForegroundColor $(if ($failedFixes.Count -gt 0) { "Red" } else { "Gray" })
Write-Host ""

if ($issueCount -eq 0 -and $script:testResults['Database'] -and $script:testResults['Ports'] -and $script:testResults['Tunnel']) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ ALL SYSTEMS OPERATIONAL" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "System is ready for manual testing and production use." -ForegroundColor Green
} else {
    Write-Host "[WARN] ISSUES DETECTED" -ForegroundColor Yellow
    Write-Host ""
    
    if ($issueCount -gt 0) {
      Write-Host "Unresolved Issues:" -ForegroundColor Yellow
      foreach ($f in $script:failures) {
          Write-Host "  - $($f.name): $($f.detail)" -ForegroundColor Red
      }
      Write-Host ""
    }
    
    if ($successfulFixes.Count -gt 0) {
        Write-Host "Successful Fixes:" -ForegroundColor Cyan
        foreach ($action in $successfulFixes) {
            Write-Host "  + $($action.name)" -ForegroundColor Green
        }
        Write-Host ""
    }
    
    Write-Host "RECOMMENDED ACTIONS:" -ForegroundColor Yellow
    Write-Host "1. Review error details above" -ForegroundColor White
    Write-Host "2. Check backend/.env for credentials" -ForegroundColor White
    Write-Host "3. View http://localhost:3001/health/status" -ForegroundColor White
    Write-Host "4. Run PM2 logs: pm2 logs" -ForegroundColor White
    Write-Host ""
}

Write-Host "Quick Links:" -ForegroundColor Gray
Write-Host "  Local Backend:  http://localhost:3001/health/status" -ForegroundColor Gray
Write-Host "  Local Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "  Public Site:    https://care2connects.org" -ForegroundColor Gray
Write-Host "  Public API:     https://api.care2connects.org" -ForegroundColor Gray
Write-Host ""

# Exit code handling
if ($NeverExitNonZero) {
  Write-Host "Exit Code: 0 (forced by -NeverExitNonZero)" -ForegroundColor Gray
  exit 0
} else {
  $allTestsPassed = $script:testResults['Database'] -and $script:testResults['Ports'] -and $script:testResults['Tunnel'] -and ($issueCount -eq 0)
  if (-not $allTestsPassed) {
    Write-Host "Exit Code: 1 (issues detected)" -ForegroundColor Yellow
    exit 1
  } else {
    Write-Host "Exit Code: 0 (all tests passed)" -ForegroundColor Green
    exit 0
  }
}
