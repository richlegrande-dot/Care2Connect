# Domain Guard Script - Simplified Version
# Prevents deployment of incorrect domain references

$ErrorActionPreference = "Stop"
$failures = 0
$warnings = 0

Write-Host "`n=== CARECONNECT DOMAIN GUARD ===" -ForegroundColor Cyan

# Check 1: Incorrect domain in backend source
Write-Host "`n[1/6] Checking backend source..." -ForegroundColor Yellow
$backend = Get-ChildItem -Path backend\src -Recurse -Include *.ts,*.js -File -ErrorAction SilentlyContinue |
    Select-String -Pattern "care2connect\.org" -CaseSensitive:$false
if ($backend) {
    Write-Host "  ❌ Found incorrect domain in backend source ($($backend.Count) matches)" -ForegroundColor Red
    $failures++
} else {
    Write-Host "  ✅ Backend source clean" -ForegroundColor Green
}

# Check 2: Incorrect domain in frontend source
Write-Host "`n[2/6] Checking frontend source..." -ForegroundColor Yellow
$frontend = Get-ChildItem -Path frontend\app -Recurse -Include *.tsx,*.ts,*.jsx,*.js -File -ErrorAction SilentlyContinue |
    Select-String -Pattern "care2connect\.org" -CaseSensitive:$false
if ($frontend) {
    Write-Host "  ❌ Found incorrect domain in frontend source ($($frontend.Count) matches)" -ForegroundColor Red
    $failures++
} else {
    Write-Host "  ✅ Frontend source clean" -ForegroundColor Green
}

# Check 3: Environment files
Write-Host "`n[3/6] Checking environment files..." -ForegroundColor Yellow
$envIssues = 0

if (Test-Path "backend\.env") {
    $backendEnv = Select-String -Path "backend\.env" -Pattern "care2connect\.org"
    if ($backendEnv) {
        Write-Host "  ❌ backend/.env has incorrect domain" -ForegroundColor Red
        $failures++
        $envIssues++
    }
}

if (Test-Path "frontend\.env.local") {
    $frontendEnvLocal = Select-String -Path "frontend\.env.local" -Pattern "care2connect\.org"
    if ($frontendEnvLocal) {
        Write-Host "  ❌ frontend/.env.local has incorrect domain" -ForegroundColor Red
        $failures++
        $envIssues++
    }
}

if (Test-Path "frontend\.env.production") {
    $frontendEnvProd = Select-String -Path "frontend\.env.production" -Pattern "care2connect\.org"
    if ($frontendEnvProd) {
        Write-Host "  ❌ frontend/.env.production has incorrect domain" -ForegroundColor Red
        $failures++
        $envIssues++
    }
}

if ($envIssues -eq 0) {
    Write-Host "  ✅ Environment files clean" -ForegroundColor Green
}

# Check 4: Tunnel configuration
Write-Host "`n[4/6] Checking tunnel configuration..." -ForegroundColor Yellow
$tunnelPath = "C:\Users\richl\.cloudflared\config.yml"
if (Test-Path $tunnelPath) {
    $tunnelWrong = Select-String -Path $tunnelPath -Pattern "care2connect\.org"
    $tunnelCorrect = Select-String -Path $tunnelPath -Pattern "care2connects\.org"
    
    if ($tunnelWrong) {
        Write-Host "  ❌ Tunnel config has incorrect domain" -ForegroundColor Red
        $failures++
    } elseif (-not $tunnelCorrect) {
        Write-Host "  ❌ Tunnel config missing correct domain" -ForegroundColor Red
        $failures++
    } else {
        Write-Host "  ✅ Tunnel configuration correct" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  Tunnel config not found (may not be configured yet)" -ForegroundColor Yellow
    $warnings++
}

# Check 5: Frontend production env has no localhost
Write-Host "`n[5/6] Checking production config for localhost..." -ForegroundColor Yellow
if (Test-Path "frontend\.env.production") {
    $prodLocalhost = Select-String -Path "frontend\.env.production" -Pattern "localhost"
    if ($prodLocalhost) {
        Write-Host "  ❌ Production env has localhost URLs" -ForegroundColor Red
        $failures++
    } else {
        Write-Host "  ✅ Production env clean" -ForegroundColor Green
    }
} else {
    Write-Host "  ❌ Production env file not found" -ForegroundColor Red
    $failures++
}

# Check 6: Documentation
Write-Host "`n[6/6] Checking documentation..." -ForegroundColor Yellow
$docs = Get-ChildItem -Path "." -Filter "*.md" -Depth 1 -File -ErrorAction SilentlyContinue |
    Select-String -Pattern "care2connect\.org" -CaseSensitive:$false -Exclude "AGENT_HANDOFF*","*PROOF*"
if ($docs) {
    Write-Host "  ⚠️  Found incorrect domain in $($docs.Count) doc files" -ForegroundColor Yellow
    $warnings++
} else {
    Write-Host "  ✅ Documentation clean" -ForegroundColor Green
}

# Results
Write-Host "`n=== RESULTS ===" -ForegroundColor Cyan
Write-Host "Failures: $failures" -ForegroundColor $(if ($failures -gt 0) { "Red" } else { "Green" })
Write-Host "Warnings: $warnings" -ForegroundColor $(if ($warnings -gt 0) { "Yellow" } else { "Green" })

if ($failures -gt 0) {
    Write-Host "`n🚨 DOMAIN GUARD: FAILED - Deployment blocked" -ForegroundColor Red
    exit 1
} else {
    Write-Host "`n✅ DOMAIN GUARD: PASSED" -ForegroundColor Green
    if ($warnings -gt 0) {
        Write-Host "   (with $warnings warnings - review recommended)" -ForegroundColor Yellow
    }
    exit 0
}
