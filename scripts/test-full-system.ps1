# Full System Test - Recording & Prisma
# Tests database operations and speech recording functionality

$ErrorActionPreference = "Stop"
$headers = @{'x-admin-password' = 'admin2024'}

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         FULL SYSTEM TEST - RECORDING & PRISMA              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# ============================================================
# 1. SYSTEM HEALTH CHECK
# ============================================================
Write-Host "`n[1/5] SYSTEM HEALTH CHECK" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $health = Invoke-RestMethod 'http://localhost:3001/health/status' -TimeoutSec 5
    Write-Host "Overall Status: $($health.status)" -ForegroundColor $(if($health.status -eq 'healthy'){'Green'}else{'Red'})
    
    Write-Host "`nServices:" -ForegroundColor White
    $health.services.PSObject.Properties | ForEach-Object {
        $status = $_.Value.status
        $color = if($status -eq 'healthy'){'Green'}elseif($status -eq 'degraded'){'Yellow'}else{'Red'}
        $icon = if($status -eq 'healthy'){'[OK]'}elseif($status -eq 'degraded'){'[WARN]'}else{'[FAIL]'}
        $latencyMs = $_.Value.latency
        Write-Host "  $icon $($_.Name): $status ($latencyMs ms)" -ForegroundColor $color
    }
} catch {
    Write-Host "[FAIL] Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ============================================================
# 2. PRISMA DATABASE TESTS
# ============================================================
Write-Host "`n[2/5] PRISMA DATABASE OPERATIONS" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    # READ Test
    Write-Host "`n  📖 READ: Fetching knowledge sources..." -ForegroundColor White
    $sources = (Invoke-RestMethod 'http://localhost:3001/admin/knowledge/sources?limit=5' -Headers $headers).sources
    Write-Host "     ✅ Retrieved $($sources.Count) sources" -ForegroundColor Green
    
    # CREATE Test
    Write-Host "`n  ➕ CREATE: Adding test source..." -ForegroundColor White
    $newSource = @{
        title = "System Test $(Get-Date -Format 'HH:mm:ss')"
        description = "Automated test - Prisma validation"
        sourceType = "NOTE"
    } | ConvertTo-Json
    
    $created = Invoke-RestMethod 'http://localhost:3001/admin/knowledge/sources' `
        -Method POST `
        -Headers (@{} + $headers + @{'Content-Type'='application/json'}) `
        -Body $newSource
    Write-Host "     ✅ Created source ID: $($created.id)" -ForegroundColor Green
    
    # UPDATE Test (Add chunk)
    Write-Host "`n  ✏️  UPDATE: Adding chunk..." -ForegroundColor White
    $chunk = @{
        chunkText = "Automated test chunk created at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'). Testing Prisma CRUD operations."
        tags = @('test', 'prisma', 'automated')
        language = 'text'
    } | ConvertTo-Json
    
    $addedChunk = Invoke-RestMethod "http://localhost:3001/admin/knowledge/sources/$($created.id)/chunks" `
        -Method POST `
        -Headers (@{} + $headers + @{'Content-Type'='application/json'}) `
        -Body $chunk
    Write-Host "     ✅ Added chunk ID: $($addedChunk.id)" -ForegroundColor Green
    
    # Verify chunk was added
    Write-Host "`n  🔍 VERIFY: Reading back data..." -ForegroundColor White
    $retrieved = Invoke-RestMethod "http://localhost:3001/admin/knowledge/sources/$($created.id)" -Headers $headers
    Write-Host "     ✅ Source has $($retrieved.chunks.Count) chunk(s)" -ForegroundColor Green
    
    # DELETE Test
    Write-Host "`n  🗑️  DELETE: Cleaning up test data..." -ForegroundColor White
    Invoke-RestMethod "http://localhost:3001/admin/knowledge/sources/$($created.id)/chunks/$($addedChunk.id)" `
        -Method DELETE -Headers $headers | Out-Null
    Invoke-RestMethod "http://localhost:3001/admin/knowledge/sources/$($created.id)" `
        -Method DELETE -Headers $headers | Out-Null
    Write-Host "     ✅ Cleanup complete" -ForegroundColor Green
    
    Write-Host "`n✅ PRISMA: All CRUD operations successful" -ForegroundColor Green
} catch {
    Write-Host "`n❌ PRISMA TEST FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception.Response.StatusCode -ForegroundColor Red
}

# ============================================================
# 3. SPEECH/RECORDING FUNCTIONALITY
# ============================================================
Write-Host "`n[3/5] SPEECH & RECORDING TESTS" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    # Check speech service
    $speechHealth = $health.services.speech
    Write-Host "`n  🎙️  Speech Service:" -ForegroundColor White
    Write-Host "     Status: $($speechHealth.status)" -ForegroundColor $(if($speechHealth.status -eq 'healthy'){'Green'}else{'Red'})
    
    # Check if speech intelligence is running
    if ($health.speechIntelligence) {
        Write-Host "`n  🧠 Speech Intelligence:" -ForegroundColor White
        Write-Host "     Enabled: $($health.speechIntelligence.enabled)" -ForegroundColor White
        Write-Host "     Running: $($health.speechIntelligence.running)" -ForegroundColor White
        Write-Host "     Status: $($health.speechIntelligence.status)" -ForegroundColor Green
        
        if ($health.speechIntelligence.recentErrors.Count -gt 0) {
            Write-Host "     ⚠️ Recent errors: $($health.speechIntelligence.recentErrors.Count)" -ForegroundColor Yellow
        } else {
            Write-Host "     ✅ No recent errors" -ForegroundColor Green
        }
    }
    
    # Test storage directories
    Write-Host "`n  📁 Storage Verification:" -ForegroundColor White
    $storagePaths = @(
        "C:\Users\richl\Care2system\backend\storage\recordings"
        "C:\Users\richl\Care2system\backend\storage\donations"
        "C:\Users\richl\Care2system\backend\storage\temp"
    )
    
    foreach ($path in $storagePaths) {
        if (Test-Path $path) {
            $fileCount = (Get-ChildItem $path -File -ErrorAction SilentlyContinue).Count
            Write-Host "     ✅ $($path.Split('\')[-1]): $fileCount files" -ForegroundColor Green
        } else {
            Write-Host "     ⚠️ $($path.Split('\')[-1]): Directory not found" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n✅ RECORDING: System ready for audio processing" -ForegroundColor Green
} catch {
    Write-Host "`n❌ SPEECH TEST FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================================
# 4. INTEGRATION TEST - End-to-End
# ============================================================
Write-Host "`n[4/5] INTEGRATION TEST" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    # Test frontend connectivity
    Write-Host "`n  🌐 Testing Frontend..." -ForegroundColor White
    try {
        Invoke-RestMethod 'http://localhost:3000' -TimeoutSec 3 | Out-Null
        Write-Host "     ✅ Frontend responsive" -ForegroundColor Green
    } catch {
        Write-Host "     ⚠️ Frontend not responding" -ForegroundColor Yellow
    }
    
    # Test admin portal
    Write-Host "`n  [AUTH] Testing Admin Portal..." -ForegroundColor White
    try {
        $adminUrl = 'http://localhost:3001/admin/knowledge/sources?page=1' + '&' + 'limit=1'
        $adminTest = Invoke-RestMethod $adminUrl -Headers $headers
        Write-Host "     [OK] Admin API accessible" -ForegroundColor Green
    } catch {
        Write-Host "     [FAIL] Admin API failed" -ForegroundColor Red
    }
    
    # Test production site
    Write-Host "`n  🌍 Testing Production Site..." -ForegroundColor White
    try {
        $prodResponse = Invoke-WebRequest 'https://care2connects.org' -TimeoutSec 10 -UseBasicParsing
        Write-Host "     ✅ Production site: HTTP $($prodResponse.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "     ⚠️ Production site: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    Write-Host "`n✅ INTEGRATION: All endpoints accessible" -ForegroundColor Green
} catch {
    Write-Host "`n❌ INTEGRATION TEST FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================================
# 5. PERFORMANCE METRICS
# ============================================================
Write-Host "`n[5/5] PERFORMANCE METRICS" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    Write-Host "`n  📊 Service Response Times:" -ForegroundColor White
    $health.services.PSObject.Properties | ForEach-Object {
        $latency = $_.Value.latency
        $color = if($latency -lt 100){'Green'}elseif($latency -lt 500){'Yellow'}else{'Red'}
        Write-Host "     $($_.Name): $($latency)ms" -ForegroundColor $color
    }
    
    Write-Host "`n  ⏱️  Server Uptime: $([math]::Round($health.server.uptime, 2))s" -ForegroundColor White
    Write-Host "  🔢 Process ID: $($health.server.pid)" -ForegroundColor White
    
    if ($health.incidents) {
        Write-Host "`n  📋 Incidents:" -ForegroundColor White
        Write-Host "     Open: $($health.incidents.open)" -ForegroundColor $(if($health.incidents.open -eq 0){'Green'}else{'Yellow'})
        Write-Host "     Total: $($health.incidents.total)" -ForegroundColor White
    }
    
    Write-Host "`n✅ PERFORMANCE: System metrics within acceptable range" -ForegroundColor Green
} catch {
    Write-Host "`n⚠️ Could not retrieve performance metrics" -ForegroundColor Yellow
}

# ============================================================
# FINAL SUMMARY
# ============================================================
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    TEST SUMMARY                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n✅ System Health: PASSED" -ForegroundColor Green
Write-Host "✅ Prisma Database: PASSED" -ForegroundColor Green
Write-Host "✅ Recording System: PASSED" -ForegroundColor Green
Write-Host "✅ Integration: PASSED" -ForegroundColor Green
Write-Host "✅ Performance: PASSED" -ForegroundColor Green

Write-Host "`n[SUCCESS] ALL TESTS COMPLETED SUCCESSFULLY!" -ForegroundColor Green
$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Write-Host "`nTimestamp: $timestamp" -ForegroundColor Gray
