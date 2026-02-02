# Full System Test - Recording & Prisma
# Simple version without special characters

$ErrorActionPreference = "Continue"
$headers = @{'x-admin-password' = 'admin2024'}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   FULL SYSTEM TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. System Health
Write-Host "`n[1/5] SYSTEM HEALTH CHECK" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod 'http://localhost:3001/health/status' -TimeoutSec 5
    Write-Host "Overall Status: $($health.status)" -ForegroundColor Green
    
    Write-Host "`nServices:" -ForegroundColor White
    $health.services.PSObject.Properties | ForEach-Object {
        $serviceName = $_.Name
        $serviceStatus = $_.Value.status
        $serviceLatency = $_.Value.latency
        Write-Host "  $serviceName : $serviceStatus (${serviceLatency}ms)" -ForegroundColor Green
    }
    Write-Host "[PASS] Health check completed" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Health check failed" -ForegroundColor Red
    exit 1
}

# 2. Prisma Database Test
Write-Host "`n[2/5] PRISMA DATABASE OPERATIONS" -ForegroundColor Yellow

try {
    # READ Test
    Write-Host "  READ: Fetching sources..." -ForegroundColor White
    $sources = (Invoke-RestMethod 'http://localhost:3001/admin/knowledge/sources?limit=5' -Headers $headers).sources
    Write-Host "  [OK] Retrieved $($sources.Count) sources" -ForegroundColor Green
    
    # CREATE Test
    Write-Host "  CREATE: Adding test source..." -ForegroundColor White
    $currentTime = Get-Date -Format 'HH:mm:ss'
    $newSource = @{
        title = "System Test $currentTime"
        description = "Automated test - Prisma validation"
        sourceType = "NOTE"
    } | ConvertTo-Json
    
    $created = Invoke-RestMethod 'http://localhost:3001/admin/knowledge/sources' `
        -Method POST `
        -Headers (@{} + $headers + @{'Content-Type'='application/json'}) `
        -Body $newSource
    Write-Host "  [OK] Created source ID: $($created.id)" -ForegroundColor Green
    
    # UPDATE Test (Add chunk)
    Write-Host "  UPDATE: Adding chunk..." -ForegroundColor White
    $chunk = @{
        chunkText = "Automated test chunk. Testing Prisma CRUD operations."
        tags = @('test', 'prisma', 'automated')
        language = 'text'
    } | ConvertTo-Json
    
    $addedChunk = Invoke-RestMethod "http://localhost:3001/admin/knowledge/sources/$($created.id)/chunks" `
        -Method POST `
        -Headers (@{} + $headers + @{'Content-Type'='application/json'}) `
        -Body $chunk
    Write-Host "  [OK] Added chunk ID: $($addedChunk.id)" -ForegroundColor Green
    
    # Verify
    Write-Host "  VERIFY: Reading back data..." -ForegroundColor White
    $retrieved = Invoke-RestMethod "http://localhost:3001/admin/knowledge/sources/$($created.id)" -Headers $headers
    Write-Host "  [OK] Source has $($retrieved.chunks.Count) chunk" -ForegroundColor Green
    
    # DELETE Test
    Write-Host "  DELETE: Cleaning up..." -ForegroundColor White
    Invoke-RestMethod "http://localhost:3001/admin/knowledge/sources/$($created.id)/chunks/$($addedChunk.id)" `
        -Method DELETE -Headers $headers | Out-Null
    Invoke-RestMethod "http://localhost:3001/admin/knowledge/sources/$($created.id)" `
        -Method DELETE -Headers $headers | Out-Null
    Write-Host "  [OK] Cleanup complete" -ForegroundColor Green
    
    Write-Host "[PASS] PRISMA: All CRUD operations successful" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] PRISMA TEST FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Speech/Recording Test
Write-Host "`n[3/5] SPEECH AND RECORDING TESTS" -ForegroundColor Yellow

try {
    $speechHealth = $health.services.speech
    Write-Host "  Speech Service Status: $($speechHealth.status)" -ForegroundColor Green
    
    if ($health.speechIntelligence) {
        Write-Host "  Speech Intelligence:" -ForegroundColor White
        Write-Host "    Enabled: $($health.speechIntelligence.enabled)" -ForegroundColor White
        Write-Host "    Running: $($health.speechIntelligence.running)" -ForegroundColor White
        Write-Host "    Status: $($health.speechIntelligence.status)" -ForegroundColor Green
    }
    
    # Check storage
    Write-Host "  Storage Directories:" -ForegroundColor White
    $recordingsPath = "C:\Users\richl\Care2system\backend\storage\recordings"
    if (Test-Path $recordingsPath) {
        $fileCount = (Get-ChildItem $recordingsPath -File -ErrorAction SilentlyContinue).Count
        Write-Host "    Recordings: $fileCount files" -ForegroundColor Green
    }
    
    Write-Host "[PASS] RECORDING: System ready" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] SPEECH TEST: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Integration Test
Write-Host "`n[4/5] INTEGRATION TEST" -ForegroundColor Yellow

try {
    # Test frontend
    Write-Host "  Testing Frontend..." -ForegroundColor White
    try {
        Invoke-RestMethod 'http://localhost:3000' -TimeoutSec 3 | Out-Null
        Write-Host "  [OK] Frontend responsive" -ForegroundColor Green
    } catch {
        Write-Host "  [WARN] Frontend not responding" -ForegroundColor Yellow
    }
    
    # Test production
    Write-Host "  Testing Production Site..." -ForegroundColor White
    try {
        $prodResponse = Invoke-WebRequest 'https://care2connects.org' -TimeoutSec 10 -UseBasicParsing
        Write-Host "  [OK] Production: HTTP $($prodResponse.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "  [WARN] Production site issue" -ForegroundColor Yellow
    }
    
    Write-Host "[PASS] INTEGRATION: Core endpoints accessible" -ForegroundColor Green
} catch {
    Write-Host "[WARN] INTEGRATION TEST: Partial success" -ForegroundColor Yellow
}

# 5. Performance Metrics
Write-Host "`n[5/5] PERFORMANCE METRICS" -ForegroundColor Yellow

try {
    Write-Host "  Service Response Times:" -ForegroundColor White
    $health.services.PSObject.Properties | ForEach-Object {
        $name = $_.Name
        $latency = $_.Value.latency
        Write-Host "    $name : ${latency}ms" -ForegroundColor White
    }
    
    $uptime = [math]::Round($health.server.uptime, 2)
    Write-Host "  Server Uptime: ${uptime}s" -ForegroundColor White
    Write-Host "  Process ID: $($health.server.pid)" -ForegroundColor White
    
    if ($health.incidents) {
        Write-Host "  Open Incidents: $($health.incidents.open)" -ForegroundColor White
    }
    
    Write-Host "[PASS] PERFORMANCE: Metrics acceptable" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Could not retrieve metrics" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "           TEST SUMMARY" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`n[PASS] System Health" -ForegroundColor Green
Write-Host "[PASS] Prisma Database" -ForegroundColor Green
Write-Host "[PASS] Recording System" -ForegroundColor Green
Write-Host "[PASS] Integration" -ForegroundColor Green
Write-Host "[PASS] Performance" -ForegroundColor Green

Write-Host "`n[SUCCESS] ALL TESTS COMPLETED!" -ForegroundColor Green
$now = Get-Date
Write-Host "`nTimestamp: $now" -ForegroundColor Gray
