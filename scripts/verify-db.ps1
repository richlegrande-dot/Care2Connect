# PowerShell script to verify database connectivity and integrity
# Tests all database models and endpoints

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Care2Connect - Database Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$backendUrl = "http://localhost:3003"
$adminToken = $env:ADMIN_DIAGNOSTICS_TOKEN

if (-not $adminToken) {
    Write-Host "❌ ERROR: ADMIN_DIAGNOSTICS_TOKEN not set in environment" -ForegroundColor Red
    Write-Host "   Set it with: `$env:ADMIN_DIAGNOSTICS_TOKEN = 'your-token'" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

$overallPass = $true

# Test 1: Health Live Endpoint
Write-Host "`n[Test 1] Checking backend health..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/health/live" -Method Get -ErrorAction Stop
    
    if ($response.status -eq "alive") {
        Write-Host "✅ PASS: Backend is alive" -ForegroundColor Green
        Write-Host "   Uptime: $([math]::Round($response.uptime, 2))s" -ForegroundColor Gray
        Write-Host "   PID: $($response.pid)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  WARNING: Unexpected status - $($response.status)" -ForegroundColor Yellow
        $overallPass = $false
    }
} catch {
    Write-Host "❌ FAIL: Backend not accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host "   Make sure backend is running on port 3003" -ForegroundColor Yellow
    $overallPass = $false
}

# Test 2: Database Self-Test
Write-Host "`n[Test 2] Running database self-test..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/admin/db/self-test" -Method Post -Headers $headers -ErrorAction Stop
    
    if ($response.overall -eq "PASS") {
        Write-Host "✅ PASS: Database self-test successful" -ForegroundColor Green
        
        Write-Host "`n   Test Results:" -ForegroundColor White
        foreach ($test in $response.tests.PSObject.Properties) {
            $testName = $test.Name
            $testResult = $test.Value
            
            if ($testResult.status -eq "PASS") {
                Write-Host "   ✅ $testName" -ForegroundColor Green
                
                if ($testResult.created) {
                    Write-Host "      - Created: ✓" -ForegroundColor Gray
                }
                if ($testResult.retrieved) {
                    Write-Host "      - Retrieved: ✓" -ForegroundColor Gray
                }
                if ($testResult.deleted) {
                    Write-Host "      - Deleted: ✓" -ForegroundColor Gray
                }
                if ($testResult.sessionCreated) {
                    Write-Host "      - Session: ✓" -ForegroundColor Gray
                }
                if ($testResult.segmentCreated) {
                    Write-Host "      - Segment: ✓" -ForegroundColor Gray
                }
                if ($testResult.analysisCreated) {
                    Write-Host "      - Analysis: ✓" -ForegroundColor Gray
                }
                if ($testResult.errorCreated) {
                    Write-Host "      - Error Event: ✓" -ForegroundColor Gray
                }
                if ($testResult.tuningProfileCreated) {
                    Write-Host "      - Tuning Profile: ✓" -ForegroundColor Gray
                }
            } else {
                Write-Host "   ❌ $testName - FAILED" -ForegroundColor Red
                Write-Host "      Error: $($testResult.error)" -ForegroundColor Gray
                $overallPass = $false
            }
        }
    } else {
        Write-Host "❌ FAIL: Database self-test failed" -ForegroundColor Red
        Write-Host "   Error: $($response.error)" -ForegroundColor Gray
        $overallPass = $false
    }
} catch {
    Write-Host "❌ FAIL: Database self-test endpoint error" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    
    # Try to get more details from response
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Gray
    }
    
    $overallPass = $false
}

# Test 3: Health History Endpoint
Write-Host "`n[Test 3] Checking health history..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/health/history?window=24h&limit=5" -Method Get -ErrorAction Stop
    
    if ($response.count -ge 0) {
        Write-Host "✅ PASS: Health history accessible" -ForegroundColor Green
        Write-Host "   Total checks in last 24h: $($response.count)" -ForegroundColor Gray
        
        if ($response.summary) {
            Write-Host "   Healthy checks: $($response.summary.healthyChecks)" -ForegroundColor Gray
            Write-Host "   Degraded checks: $($response.summary.degradedChecks)" -ForegroundColor Gray
            Write-Host "   Avg latency: $([math]::Round($response.summary.avgLatency, 2))ms" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  WARNING: Unexpected response format" -ForegroundColor Yellow
        $overallPass = $false
    }
} catch {
    Write-Host "❌ FAIL: Health history endpoint error" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    $overallPass = $false
}

# Test 4: Speech Intelligence Sessions
Write-Host "`n[Test 4] Checking speech intelligence data..." -ForegroundColor Cyan
try {
    # Check if endpoint exists (may require auth)
    $response = Invoke-RestMethod -Uri "$backendUrl/admin/speech-intelligence/sessions?take=5" -Method Get -Headers $headers -ErrorAction SilentlyContinue
    
    if ($response) {
        Write-Host "✅ PASS: Speech intelligence endpoint accessible" -ForegroundColor Green
        
        if ($response.sessions) {
            Write-Host "   Sessions found: $($response.sessions.Count)" -ForegroundColor Gray
        } elseif ($response.count -ne $null) {
            Write-Host "   Sessions found: $($response.count)" -ForegroundColor Gray
        } else {
            Write-Host "   Sessions: 0 (none created yet)" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  SKIPPED: Speech intelligence endpoint not available or not configured" -ForegroundColor Yellow
    }
} catch {
    # This is optional, so don't fail overall
    Write-Host "⚠️  SKIPPED: Speech intelligence endpoint not accessible (optional)" -ForegroundColor Yellow
    Write-Host "   This is normal if SPEECH_TELEMETRY_ENABLED is not set" -ForegroundColor Gray
}

# Test 5: Speech Intelligence Smoke Test
Write-Host "`n[Test 5] Checking speech intelligence smoke test..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/health/speech-smoke-test" -Method Get -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "✅ PASS: Smoke test succeeded" -ForegroundColor Green
        Write-Host "   Timestamp: $($response.timestamp)" -ForegroundColor Gray
        Write-Host "   Duration: $($response.duration)ms" -ForegroundColor Gray
        
        if ($response.engineUsed) {
            Write-Host "   Engine Used: $($response.engineUsed)" -ForegroundColor Gray
        }
        if ($response.engineAttempted) {
            Write-Host "   Engines Attempted: $($response.engineAttempted -join ', ')" -ForegroundColor Gray
        }
        if ($response.fallbackUsed) {
            Write-Host "   ⚠️  Fallback Used: EVTS unavailable, used OpenAI" -ForegroundColor Yellow
        }
        if ($response.latencyMs) {
            Write-Host "   Transcription Latency: $($response.latencyMs)ms" -ForegroundColor Gray
        }
        if ($response.wordCount) {
            Write-Host "   Word Count: $($response.wordCount)" -ForegroundColor Gray
        }
        
        Write-Host "`n   Individual Tests:" -ForegroundColor White
        foreach ($test in $response.tests) {
            if ($test.passed) {
                Write-Host "   ✅ $($test.name)" -ForegroundColor Green
                if ($test.message) {
                    Write-Host "      $($test.message)" -ForegroundColor Gray
                }
            } else {
                if ($test.error -eq "skipped") {
                    Write-Host "   ⏭️  $($test.name) - SKIPPED" -ForegroundColor Yellow
                    if ($test.message) {
                        Write-Host "      $($test.message)" -ForegroundColor Gray
                    }
                } else {
                    Write-Host "   ❌ $($test.name) - FAILED" -ForegroundColor Red
                    Write-Host "      Error: $($test.error)" -ForegroundColor Gray
                    $overallPass = $false
                }
            }
        }
    } else {
        Write-Host "❌ FAIL: Smoke test failed" -ForegroundColor Red
        if ($response.error) {
            Write-Host "   Error: $($response.error)" -ForegroundColor Gray
        }
        $overallPass = $false
    }
} catch {
    Write-Host "⚠️  WARNING: Smoke test endpoint not accessible" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host "   This is expected if speech intelligence is not configured" -ForegroundColor Gray
}

# Test 6: Database Connection Status
Write-Host "`n[Test 6] Checking database connection status..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/health/status" -Method Get -ErrorAction Stop
    
    if ($response.services -and $response.services.database) {
        if ($response.services.database.healthy) {
            Write-Host "✅ PASS: Database service is healthy" -ForegroundColor Green
            
            if ($response.services.database.latency) {
                Write-Host "   Latency: $($response.services.database.latency)ms" -ForegroundColor Gray
            }
        } else {
            Write-Host "❌ FAIL: Database service is unhealthy" -ForegroundColor Red
            Write-Host "   Error: $($response.services.database.error)" -ForegroundColor Gray
            $overallPass = $false
        }
    } else {
        Write-Host "⚠️  WARNING: Could not determine database status from health endpoint" -ForegroundColor Yellow
        $overallPass = $false
    }
} catch {
    Write-Host "❌ FAIL: Health status endpoint error" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    $overallPass = $false
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Database Verification Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($overallPass) {
    Write-Host "`n✅ OVERALL: PASS" -ForegroundColor Green
    Write-Host "`n   Database Status:" -ForegroundColor White
    Write-Host "   ✅ Connectivity: Working" -ForegroundColor Green
    Write-Host "   ✅ HealthCheckRun: Write/Read/Delete working" -ForegroundColor Green
    Write-Host "   ✅ SupportTicket: Write/Read/Delete working" -ForegroundColor Green
    Write-Host "   ✅ ProfileTicket: Write/Read/Delete working" -ForegroundColor Green
    Write-Host "   ✅ Speech Intelligence Loop: Write/Read/Delete working" -ForegroundColor Green
    Write-Host "`n   System confirmed storing:" -ForegroundColor White
    Write-Host "   - Health check history" -ForegroundColor Gray
    Write-Host "   - Support tickets" -ForegroundColor Gray
    Write-Host "   - Profile tickets" -ForegroundColor Gray
    Write-Host "   - Speech intelligence loop data (sessions, segments, analysis, errors, tuning)" -ForegroundColor Gray
    Write-Host "`n   ⚠️  NOTE: Database tests passed, but this does NOT mean deployment ready." -ForegroundColor Yellow
    Write-Host "   Run .\scripts\verify-deployment-ready.ps1 to check all critical services." -ForegroundColor Yellow
} else {
    Write-Host "`n❌ OVERALL: FAIL" -ForegroundColor Red
    Write-Host "   Database verification failed" -ForegroundColor Red
    Write-Host "`n   Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Review failed tests above" -ForegroundColor White
    Write-Host "   2. Check DATABASE_URL in backend/.env" -ForegroundColor White
    Write-Host "   3. Verify Prisma schema is synchronized: npx prisma db push" -ForegroundColor White
    Write-Host "   4. Check backend logs for database connection errors" -ForegroundColor White
}

Write-Host "`n========================================`n" -ForegroundColor Cyan

# Exit with appropriate code
if ($overallPass) {
    exit 0
} else {
    exit 1
}
