# Automated Production Deployment Verification
# Tests all critical endpoints and features

Write-Host "=== Production Deployment Verification ===" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# Test 1: Frontend accessibility
Write-Host "[Test 1/6] Frontend accessibility..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://care2connects.org" -Method GET -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend accessible (200 OK)" -ForegroundColor Green
    }
} catch {
    $errors += "Frontend not accessible: $($_.Exception.Message)"
    Write-Host "❌ Frontend not accessible" -ForegroundColor Red
}

# Test 2: API health endpoint
Write-Host "[Test 2/6] API health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://api.care2connects.org/health/live" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($response.status -eq "alive") {
        Write-Host "✅ API health endpoint working" -ForegroundColor Green
        Write-Host "   Status: $($response.status)" -ForegroundColor Gray
        Write-Host "   Uptime: $([math]::Round($response.uptime, 2))s" -ForegroundColor Gray
    }
} catch {
    $errors += "API health endpoint failed: $($_.Exception.Message)"
    Write-Host "❌ API health endpoint not accessible" -ForegroundColor Red
}

# Test 3: Knowledge Vault API (with admin password)
Write-Host "[Test 3/6] Knowledge Vault API..." -ForegroundColor Yellow
$adminPassword = if ($env:ADMIN_PASSWORD) { $env:ADMIN_PASSWORD } else { "admin2024" }
$headers = @{ 'x-admin-password' = $adminPassword }

try {
    $response = Invoke-RestMethod -Uri "https://api.care2connects.org/admin/knowledge/sources?page=1&limit=1" -Method GET -Headers $headers -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Knowledge Vault API working" -ForegroundColor Green
    Write-Host "   Total sources: $($response.total)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        $warnings += "Knowledge Vault requires authentication (expected)"
        Write-Host "⚠️  Authentication required (password may be incorrect)" -ForegroundColor Yellow
    } else {
        $errors += "Knowledge Vault API failed: $($_.Exception.Message)"
        Write-Host "❌ Knowledge Vault API not accessible" -ForegroundColor Red
    }
}

# Test 4: Pipeline Incidents API
Write-Host "[Test 4/6] Pipeline Incidents API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://api.care2connects.org/admin/knowledge/incidents?page=1&limit=1" -Method GET -Headers $headers -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Pipeline Incidents API working" -ForegroundColor Green
    Write-Host "   Total incidents: $($response.total)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        $warnings += "Pipeline Incidents requires authentication (expected)"
        Write-Host "⚠️  Authentication required" -ForegroundColor Yellow
    } else {
        $warnings += "Pipeline Incidents API returned error (non-critical)"
        Write-Host "⚠️  Pipeline Incidents API unavailable" -ForegroundColor Yellow
    }
}

# Test 5: Local backend connectivity
Write-Host "[Test 5/6] Local backend connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/health/live" -Method GET -TimeoutSec 5 -ErrorAction Stop
    if ($response.status -eq "alive") {
        Write-Host "✅ Local backend accessible (port 3001)" -ForegroundColor Green
    }
} catch {
    $errors += "Local backend not accessible on port 3001"
    Write-Host "❌ Local backend not accessible" -ForegroundColor Red
}

# Test 6: Cloudflare tunnel status
Write-Host "[Test 6/6] Cloudflare tunnel status..." -ForegroundColor Yellow
$tunnelProcess = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($tunnelProcess) {
    Write-Host "✅ Cloudflare tunnel running (PID: $($tunnelProcess.Id))" -ForegroundColor Green
    $uptime = (Get-Date) - $tunnelProcess.StartTime
    Write-Host "   Uptime: $([math]::Round($uptime.TotalMinutes, 1)) minutes" -ForegroundColor Gray
} else {
    $errors += "Cloudflare tunnel not running"
    Write-Host "❌ Cloudflare tunnel not running" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "=== Verification Summary ===" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✅ ALL TESTS PASSED - Production deployment is healthy" -ForegroundColor Green
    exit 0
} elseif ($errors.Count -eq 0) {
    Write-Host "⚠️  $($warnings.Count) WARNING(S) - Deployment functional with minor issues" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
    exit 0
} else {
    Write-Host "❌ $($errors.Count) ERROR(S) - Deployment has issues" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "⚠️  $($warnings.Count) WARNING(S):" -ForegroundColor Yellow
        $warnings | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
    }
    
    exit 1
}
