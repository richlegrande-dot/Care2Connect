# 🚀 Quick Validation Script

# Care2Connects Post-Deployment Validation
# Run this script to verify your deployment is working correctly

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CARE2CONNECTS VALIDATION SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results = @{
    passed = 0
    failed = 0
    warnings = 0
}

# Test 1: Frontend Homepage
Write-Host "[1/7] Testing Frontend Homepage..." -ForegroundColor Yellow
try {
    $r1 = Invoke-WebRequest "https://care2connects.org" -UseBasicParsing -TimeoutSec 10
    if ($r1.StatusCode -eq 200 -and $r1.Content.Length -gt 5000) {
        Write-Host "  ✓ PASS: Homepage loaded ($($r1.StatusCode), $($r1.Content.Length) bytes)" -ForegroundColor Green
        $results.passed++
    } else {
        Write-Host "  ⚠ WARNING: Homepage responded but content seems small" -ForegroundColor Yellow
        $results.warnings++
    }
} catch {
    Write-Host "  ✗ FAIL: Homepage unreachable - $($_.Exception.Message)" -ForegroundColor Red
    $results.failed++
}

# Test 2: API Health (Live)
Write-Host "`n[2/7] Testing API Health Endpoint..." -ForegroundColor Yellow
try {
    $r2 = Invoke-RestMethod "https://api.care2connects.org/health/live" -TimeoutSec 10
    if ($r2.status -eq "ok") {
        Write-Host "  ✓ PASS: Health endpoint responding (status: $($r2.status))" -ForegroundColor Green
        $results.passed++
    } else {
        Write-Host "  ⚠ WARNING: Unexpected health status: $($r2.status)" -ForegroundColor Yellow
        $results.warnings++
    }
} catch {
    Write-Host "  ✗ FAIL: Health endpoint unreachable" -ForegroundColor Red
    $results.failed++
}

# Test 3: API Full Status
Write-Host "`n[3/7] Testing API Full Status..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod "https://api.care2connects.org/health/status" -TimeoutSec 10
    
    Write-Host "  Environment: $($status.environment)" -ForegroundColor Gray
    Write-Host "  Uptime: $($status.uptime) seconds" -ForegroundColor Gray
    
    $statusPassed = $true
    
    # Check database
    if ($status.databaseStatus -eq "connected") {
        Write-Host "  ✓ Database: Connected" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Database: $($status.databaseStatus)" -ForegroundColor Red
        $statusPassed = $false
    }
    
    # Check Stripe
    if ($status.stripe.configured) {
        Write-Host "  ✓ Stripe: Configured (mode: $($status.stripe.mode))" -ForegroundColor Green
        if ($status.stripe.webhookSecretConfigured) {
            Write-Host "  ✓ Webhook Secret: Set" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ Webhook Secret: Not set" -ForegroundColor Yellow
            $statusPassed = $false
        }
    } else {
        Write-Host "  ⚠ Stripe: Not configured" -ForegroundColor Yellow
        $statusPassed = $false
    }
    
    if ($statusPassed) {
        $results.passed++
    } else {
        $results.warnings++
    }
    
    # Store webhook info for later test
    $global:webhookStatus = $status.webhook
    
} catch {
    Write-Host "  ✗ FAIL: Status endpoint unreachable" -ForegroundColor Red
    $results.failed++
}

# Test 4: Webhook Route Exists
Write-Host "`n[4/7] Testing Webhook Route..." -ForegroundColor Yellow
try {
    $r4 = Invoke-WebRequest "https://api.care2connects.org/api/payments/stripe-webhook" -Method GET -UseBasicParsing -TimeoutSec 10
    Write-Host "  ⚠ Unexpected: Route returned $($r4.StatusCode)" -ForegroundColor Yellow
    $results.warnings++
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 405 -or $statusCode -eq 400) {
        Write-Host "  ✓ PASS: Webhook route exists (returns $statusCode as expected)" -ForegroundColor Green
        $results.passed++
    } elseif ($statusCode -eq 404) {
        Write-Host "  ✗ FAIL: Webhook route not found (404)" -ForegroundColor Red
        $results.failed++
    } else {
        Write-Host "  ⚠ WARNING: Webhook route returned unexpected status: $statusCode" -ForegroundColor Yellow
        $results.warnings++
    }
}

# Test 5: Webhook Status
Write-Host "`n[5/7] Checking Webhook History..." -ForegroundColor Yellow
if ($global:webhookStatus) {
    $wh = $global:webhookStatus
    if ($wh.lastWebhookReceivedAt) {
        Write-Host "  ✓ Webhook received: $($wh.lastWebhookEventType)" -ForegroundColor Green
        Write-Host "    Time: $($wh.lastWebhookReceivedAt)" -ForegroundColor Gray
        Write-Host "    Verified: $($wh.lastWebhookVerified)" -ForegroundColor Gray
        
        if ($wh.lastWebhookVerified -eq $true) {
            Write-Host "  ✓ PASS: Webhook verification working" -ForegroundColor Green
            $results.passed++
        } else {
            Write-Host "  ✗ FAIL: Webhook not verified (check STRIPE_WEBHOOK_SECRET)" -ForegroundColor Red
            $results.failed++
        }
        
        if ($wh.lastWebhookError) {
            Write-Host "  ⚠ Last error: $($wh.lastWebhookError)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ℹ INFO: No webhooks received yet" -ForegroundColor Cyan
        Write-Host "    Action: Send test webhook from Stripe Dashboard" -ForegroundColor Gray
        $results.warnings++
    }
} else {
    Write-Host "  ⚠ WARNING: Could not retrieve webhook status" -ForegroundColor Yellow
    $results.warnings++
}

# Test 6: Local Services
Write-Host "`n[6/7] Checking Local Services..." -ForegroundColor Yellow
$p3000 = netstat -ano | findstr ":3000.*LISTENING"
$p3001 = netstat -ano | findstr ":3001.*LISTENING"

$localPassed = $true
if ($p3000) {
    Write-Host "  ✓ Frontend running on port 3000" -ForegroundColor Green
} else {
    Write-Host "  ✗ Frontend NOT running on port 3000" -ForegroundColor Red
    $localPassed = $false
}

if ($p3001) {
    Write-Host "  ✓ Backend running on port 3001" -ForegroundColor Green
} else {
    Write-Host "  ✗ Backend NOT running on port 3001" -ForegroundColor Red
    $localPassed = $false
}

$cf = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($cf) {
    Write-Host "  ✓ Cloudflare tunnel active (PID: $($cf.Id))" -ForegroundColor Green
} else {
    Write-Host "  ✗ Cloudflare tunnel NOT running" -ForegroundColor Red
    $localPassed = $false
}

if ($localPassed) {
    $results.passed++
} else {
    $results.failed++
}

# Test 7: Environment Configuration
Write-Host "`n[7/7] Checking Environment Configuration..." -ForegroundColor Yellow
$frontendEnvExists = Test-Path "frontend\.env.local"
$backendEnvExists = Test-Path "backend\.env"

if ($frontendEnvExists) {
    $frontendEnv = Get-Content "frontend\.env.local" -Raw
    if ($frontendEnv -match "NEXT_PUBLIC_API_URL") {
        Write-Host "  ✓ Frontend .env.local exists with API URL" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Frontend .env.local missing API URL" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ Frontend .env.local not found" -ForegroundColor Yellow
}

if ($backendEnvExists) {
    $backendEnv = Get-Content "backend\.env" -Raw
    $hasStripeSecret = $backendEnv -match "STRIPE_SECRET_KEY=\w+"
    $hasWebhookSecret = $backendEnv -match "STRIPE_WEBHOOK_SECRET=whsec_"
    
    if ($hasStripeSecret) {
        Write-Host "  ✓ Backend has Stripe secret key" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Backend missing Stripe secret key" -ForegroundColor Yellow
    }
    
    if ($hasWebhookSecret) {
        Write-Host "  ✓ Backend has webhook secret" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Backend missing webhook secret" -ForegroundColor Yellow
    }
}

if ($frontendEnvExists -and $backendEnvExists) {
    $results.passed++
} else {
    $results.warnings++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "  ✓ Passed:   $($results.passed)" -ForegroundColor Green
Write-Host "  ⚠ Warnings: $($results.warnings)" -ForegroundColor Yellow
Write-Host "  ✗ Failed:   $($results.failed)" -ForegroundColor Red

Write-Host "`n----------------------------------------" -ForegroundColor Gray

if ($results.failed -eq 0) {
    if ($results.warnings -eq 0) {
        Write-Host "`n🎉 ALL TESTS PASSED!" -ForegroundColor Green
        Write-Host "Your deployment is fully operational.`n" -ForegroundColor Green
    } else {
        Write-Host "`n✅ DEPLOYMENT WORKING" -ForegroundColor Green
        Write-Host "Some warnings detected. Review above for details.`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⚠️  ISSUES DETECTED" -ForegroundColor Yellow
    Write-Host "Review failed tests above and consult POST_DEPLOY_VALIDATION_RUNBOOK.md`n" -ForegroundColor Yellow
}

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Fix any failed tests" -ForegroundColor White
Write-Host "  2. Send test webhook from Stripe Dashboard" -ForegroundColor White
Write-Host "  3. Run this script again to verify" -ForegroundColor White
Write-Host "  4. See docs/POST_DEPLOY_VALIDATION_RUNBOOK.md for details`n" -ForegroundColor White

Write-Host "Quick Links:" -ForegroundColor Cyan
Write-Host "  Homepage: https://care2connects.org" -ForegroundColor Gray
Write-Host "  API:      https://api.care2connects.org" -ForegroundColor Gray
Write-Host "  Health:   https://api.care2connects.org/health/status`n" -ForegroundColor Gray
