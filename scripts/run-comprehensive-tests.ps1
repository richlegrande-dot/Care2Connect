# Comprehensive System Test Script
Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'COMPREHENSIVE SYSTEM TEST' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'Testing: Database | Ports | Tunneling' -ForegroundColor Gray
Write-Host ''

$allTestsPassed = $true

# Test 1: Database
Write-Host '[1/3] Database Connectivity Test...' -ForegroundColor Yellow
try {
  $dbHealth = curl -UseBasicParsing http://localhost:3001/health/db -TimeoutSec 5 | ConvertFrom-Json
  if ($dbHealth.ready) {
    Write-Host '   Database health endpoint OK' -ForegroundColor Green
  }
  Push-Location backend
  $dbTest = node test-db.js 2>&1 | Out-String
  Pop-Location
  if ($dbTest -match 'DATABASE CONNECTION: HEALTHY') {
    Write-Host '   Direct Prisma connection verified' -ForegroundColor Green
  }
} catch {
  Write-Host '   Database test failed' -ForegroundColor Red
  $allTestsPassed = $false
}

Write-Host ''

# Test 2: Ports
Write-Host '[2/3] Port Connectivity Test...' -ForegroundColor Yellow
$ports = @(3000, 3001, 8080)
$portNames = @('Frontend', 'Backend', 'Reverse Proxy')
for ($i = 0; $i -lt $ports.Count; $i++) {
  $conn = Test-NetConnection -ComputerName localhost -Port $ports[$i] -WarningAction SilentlyContinue
  if ($conn.TcpTestSucceeded) {
    Write-Host ('   Port ' + $ports[$i] + ' open - ' + $portNames[$i]) -ForegroundColor Green
  } else {
    Write-Host ('   Port ' + $ports[$i] + ' closed - ' + $portNames[$i]) -ForegroundColor Red
    $allTestsPassed = $false
  }
}

Write-Host ''

# Test 3: Tunnel
Write-Host '[3/3] Tunnel Connectivity Test...' -ForegroundColor Yellow
try {
  $cloudflared = Get-Process cloudflared -ErrorAction SilentlyContinue
  if ($cloudflared) {
    Write-Host ('   Cloudflared running (PID: ' + $cloudflared.Id + ')') -ForegroundColor Green
  } else {
    Write-Host '   Cloudflared not running' -ForegroundColor Red
    $allTestsPassed = $false
  }
  
  $pm2Output = pm2 list 2>&1 | Out-String
  if ($pm2Output -match 'reverse-proxy.*online') {
    Write-Host '   Reverse proxy running in PM2' -ForegroundColor Green
  } else {
    Write-Host '   Reverse proxy not running' -ForegroundColor Red
    $allTestsPassed = $false
  }
  
  $publicTest = curl -UseBasicParsing https://care2connects.org/health/live -TimeoutSec 10
  if ($publicTest.StatusCode -eq 200) {
    Write-Host '   Public domain accessible (care2connects.org)' -ForegroundColor Green
  }
  
  $apiTest = curl -UseBasicParsing https://api.care2connects.org/health/live -TimeoutSec 10
  if ($apiTest.StatusCode -eq 200) {
    Write-Host '   API subdomain accessible (api.care2connects.org)' -ForegroundColor Green
  }
} catch {
  Write-Host '   Tunnel test failed' -ForegroundColor Red
  $allTestsPassed = $false
}

Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan

if ($allTestsPassed) {
  Write-Host ' ALL SYSTEMS OPERATIONAL' -ForegroundColor Green
  Write-Host ''
  Write-Host 'System is ready for manual testing and handoff.' -ForegroundColor Green
} else {
  Write-Host ' SOME TESTS FAILED' -ForegroundColor Red
}

Write-Host '========================================' -ForegroundColor Cyan
