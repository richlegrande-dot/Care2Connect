# CareConnect Quick Test Script
# Validates all V1.5 upgrade changes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " CareConnect V1.5 Verification Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$passed = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$ExpectedStatus = 200,
        [string]$ExpectedContent = $null
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            if ($ExpectedContent -and $response.Content -notmatch $ExpectedContent) {
                Write-Host " ✗ FAILED (content mismatch)" -ForegroundColor Red
                $script:failed++
                return $false
            }
            Write-Host " ✓ PASSED" -ForegroundColor Green
            $script:passed++
            return $true
        } else {
            Write-Host " ✗ FAILED (status: $($response.StatusCode))" -ForegroundColor Red
            $script:failed++
            return $false
        }
    } catch {
        Write-Host " ✗ FAILED ($($_.Exception.Message))" -ForegroundColor Red
        $script:failed++
        return $false
    }
}

function Test-FileExists {
    param(
        [string]$Name,
        [string]$Path
    )
    
    Write-Host "Checking: $Name" -ForegroundColor Yellow -NoNewline
    
    if (Test-Path $Path) {
        Write-Host " ✓ EXISTS" -ForegroundColor Green
        $script:passed++
        return $true
    } else {
        Write-Host " ✗ MISSING" -ForegroundColor Red
        $script:failed++
        return $false
    }
}

function Test-FileContent {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Pattern
    )
    
    Write-Host "Verifying: $Name" -ForegroundColor Yellow -NoNewline
    
    if (-not (Test-Path $Path)) {
        Write-Host " ✗ FILE NOT FOUND" -ForegroundColor Red
        $script:failed++
        return $false
    }
    
    $content = Get-Content $Path -Raw
    if ($content -match $Pattern) {
        Write-Host " ✓ VERIFIED" -ForegroundColor Green
        $script:passed++
        return $true
    } else {
        Write-Host " ✗ PATTERN NOT FOUND" -ForegroundColor Red
        $script:failed++
        return $false
    }
}

# ============================================
# Part 1: File Structure Tests
# ============================================
Write-Host ""
Write-Host "[1/5] File Structure Tests" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

Test-FileExists "Production env config" ".\frontend\.env.production"
Test-FileExists "PM2 ecosystem config" ".\ecosystem.config.js"
Test-FileExists "Always-On guide" ".\docs\ALWAYS_ON_DEPLOYMENT.md"
Test-FileExists "Local auto-start guide" ".\docs\LOCAL_AUTOSTART.md"
Test-FileExists "Upgrade verification" ".\docs\UPGRADE_VERIFICATION.md"

# ============================================
# Part 2: Text Replacement Tests
# ============================================
Write-Host ""
Write-Host "[2/5] Text Replacement Tests" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

Test-FileContent "Homepage community text" ".\frontend\app\page.tsx" "Community Support Portal"
Test-FileContent "Header community text" ".\frontend\components\Header.tsx" "Community-Supported Homeless Initiative"

Write-Host "Verifying: No Government-Supported references" -ForegroundColor Yellow -NoNewline
$govRefs = Select-String -Path ".\frontend\app\page.tsx",".\frontend\components\Header.tsx" -Pattern "Government-Supported" -CaseSensitive
if ($govRefs.Count -eq 0) {
    Write-Host " ✓ CLEAN" -ForegroundColor Green
    $passed++
} else {
    Write-Host " ✗ FOUND $($govRefs.Count) REFERENCES" -ForegroundColor Red
    $failed++
}

# ============================================
# Part 3: API URL Configuration Tests
# ============================================
Write-Host ""
Write-Host "[3/5] API Configuration Tests" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

Test-FileContent "SystemAuthModal API URL handling" ".\frontend\components\SystemAuthModal.tsx" "NEXT_PUBLIC_API_URL"
Test-FileContent "System page API URL handling" ".\frontend\app\system\page.tsx" "getApiUrl"
Test-FileContent "Backend CORS config" ".\backend\src\server.ts" "care2connects.org"

# ============================================
# Part 4: Service Tests (if running)
# ============================================
Write-Host ""
Write-Host "[4/5] Service Availability Tests" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

Test-Endpoint "Backend health endpoint" "http://localhost:3001/health/live" -ExpectedContent "alive"
Test-Endpoint "Frontend homepage" "http://localhost:3000" -ExpectedContent "CareConnect"

# Check for new UI elements
Write-Host "Checking: Homepage UI elements" -ForegroundColor Yellow -NoNewline
try {
    $homepage = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    $hasRedButton = $homepage.Content -match "PRESS TO.*TELL YOUR.*STORY"
    $hasChecklist = $homepage.Content -match "What You Can Do"
    
    if ($hasRedButton -and $hasChecklist) {
        Write-Host " ✓ UI UPDATED" -ForegroundColor Green
        $passed++
    } else {
        Write-Host " ⚠ PARTIAL ($hasRedButton button, $hasChecklist checklist)" -ForegroundColor Yellow
        $failed++
    }
} catch {
    Write-Host " ⚠ FRONTEND NOT RUNNING" -ForegroundColor Yellow
}

# ============================================
# Part 5: Production Readiness Tests
# ============================================
Write-Host ""
Write-Host "[5/5] Production Readiness Tests" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

# Check env files
Write-Host "Checking: Production environment" -ForegroundColor Yellow -NoNewline
if (Test-Path ".\frontend\.env.production") {
    $prodEnv = Get-Content ".\frontend\.env.production" -Raw
    if ($prodEnv -match "api.care2connects.org") {
        Write-Host " ✓ CONFIGURED" -ForegroundColor Green
        $passed++
    } else {
        Write-Host " ✗ MISSING PRODUCTION URLS" -ForegroundColor Red
        $failed++
    }
} else {
    Write-Host " ✗ FILE MISSING" -ForegroundColor Red
    $failed++
}

# Check documentation completeness
$requiredDocs = @(
    ".\docs\ALWAYS_ON_DEPLOYMENT.md",
    ".\docs\LOCAL_AUTOSTART.md",
    ".\docs\UPGRADE_VERIFICATION.md"
)

Write-Host "Checking: Documentation complete" -ForegroundColor Yellow -NoNewline
$missingDocs = $requiredDocs | Where-Object { -not (Test-Path $_) }
if ($missingDocs.Count -eq 0) {
    Write-Host " ✓ ALL PRESENT" -ForegroundColor Green
    $passed++
} else {
    Write-Host " ✗ MISSING $($missingDocs.Count) DOCS" -ForegroundColor Red
    $failed++
}

# ============================================
# Summary
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Test Results" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✓ ALL TESTS PASSED - Ready for deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Review changes in browser: http://localhost:3000" -ForegroundColor Gray
    Write-Host "  2. Test system console: http://localhost:3000/system" -ForegroundColor Gray
    Write-Host "  3. Choose deployment: docs/ALWAYS_ON_DEPLOYMENT.md or LOCAL_AUTOSTART.md" -ForegroundColor Gray
    exit 0
} else {
    Write-Host "⚠ SOME TESTS FAILED - Review errors above" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Cyan
    Write-Host "  - Ensure frontend/backend are running" -ForegroundColor Gray
    Write-Host "  - Check file paths are correct" -ForegroundColor Gray
    Write-Host "  - Verify all git changes were pulled" -ForegroundColor Gray
    exit 1
}
