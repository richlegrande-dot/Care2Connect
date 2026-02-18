# Deploy V1 Production Parser to care2connects.org
# Version: v1.0-production-90.0

Write-Host "`n[DEPLOY] V1 Production Parser (90% validated) to care2connects.org" -ForegroundColor Green
Write-Host ""

# Step 1: Verify project directory
$projectRoot = "C:\Users\richl\Care2system"
if (-not (Test-Path "$projectRoot\backend")) {
    Write-Host "[ERROR] Backend directory not found" -ForegroundColor Red
    exit 1
}

Set-Location $projectRoot
Write-Host "[OK] Project root verified: $projectRoot" -ForegroundColor Green
Write-Host ""

# Step 2: Configure V1 parser
Write-Host "[CONFIG] Verifying V1 production parser configuration..." -ForegroundColor Cyan

$envFile = "$projectRoot\backend\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match 'AI_PROVIDER=rules') {
        Write-Host "[OK] AI_PROVIDER set to 'rules' (V1 parser)" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Setting AI_PROVIDER=rules in .env" -ForegroundColor Yellow
        Add-Content -Path $envFile -Value "`nAI_PROVIDER=rules"
    }
}

Write-Host ""

# Step 3: Build backend
Write-Host "[BUILD] Building backend for production..." -ForegroundColor Cyan
Set-Location "$projectRoot\backend"

npm run build | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Backend build complete" -ForegroundColor Green
Write-Host ""

# Step 4: Create verification script
$verifyScript = @'
# Quick verification of V1 Production Parser

Write-Host "`n[VERIFY] V1 Production Parser Status" -ForegroundColor Cyan
Write-Host ""

# Check local health
Write-Host "[CHECK] Local backend (port 3001)..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health/live" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] Local backend healthy" -ForegroundColor Green
        Write-Host "  Response: $($response.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[ERROR] Local backend not responding" -ForegroundColor Red
    Write-Host "  Make sure backend is running: npm start" -ForegroundColor Yellow
}

Write-Host ""

# Check public health
Write-Host "[CHECK] Public API (care2connects.org)..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "https://api.care2connects.org/health/live" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] Public API healthy" -ForegroundColor Green
        Write-Host "  Response: $($response.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[WARN] Public API not accessible (tunnel may not be running)" -ForegroundColor Yellow
}

Write-Host ""

# Check parser performance
Write-Host "[CHECK] Testing parser performance..." -ForegroundColor White
Set-Location "C:\Users\richl\Care2system\backend"
$testOutput = npm run test:qa:v1 2>&1 | Out-String
if ($testOutput -match "90\.00%") {
    Write-Host "[OK] V1 parser performing at 90 percent target" -ForegroundColor Green
} else {
    Write-Host "[INFO] Check test output for current performance" -ForegroundColor Cyan
}

Write-Host "`n[DONE] Verification complete`n" -ForegroundColor Green
'@

$verifyScript | Out-File -FilePath "$projectRoot\verify-v1-parser.ps1" -Encoding utf8
Write-Host "[OK] Created verification script: verify-v1-parser.ps1" -ForegroundColor Green
Write-Host ""

# Deployment instructions
Write-Host "`n============================================" -ForegroundColor Magenta
Write-Host "  DEPLOYMENT INSTRUCTIONS" -ForegroundColor Magenta
Write-Host "============================================`n" -ForegroundColor Magenta

Write-Host "Step 1 - Start Backend (V1 Parser - Port 3001):" -ForegroundColor White
Write-Host "  cd $projectRoot\backend" -ForegroundColor Gray
Write-Host "  npm start`n" -ForegroundColor Gray

Write-Host "Step 2 - Start Caddy Reverse Proxy (Port 8080):" -ForegroundColor White
Write-Host "  cd $projectRoot" -ForegroundColor Gray
Write-Host "  caddy run --config Caddyfile.production`n" -ForegroundColor Gray

Write-Host "Step 3 - Start Cloudflare Tunnel:" -ForegroundColor White
Write-Host "  cloudflared tunnel --config C:\Users\richl\.cloudflared\config.yml run care2connects-tunnel`n" -ForegroundColor Gray

Write-Host "Step 4 - Verify Deployment:" -ForegroundColor White
Write-Host "  .\verify-v1-parser.ps1`n" -ForegroundColor Gray

Write-Host "Step 5 - Run Stability Test:" -ForegroundColor White
Write-Host "  cd $projectRoot\backend" -ForegroundColor Gray
Write-Host "  npm run eval:v1:stability`n" -ForegroundColor Gray

Write-Host "============================================" -ForegroundColor Magenta
Write-Host "[READY] V1 Production Parser prepared for care2connects.org" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Magenta
