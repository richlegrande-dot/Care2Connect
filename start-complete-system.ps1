# Complete System Startup Script
# Starts all services in correct order with verification

Write-Host ""
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "   CARE2SYSTEM - COMPLETE SYSTEM STARTUP" -ForegroundColor White
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""

# Step 0: Clean up
Write-Host "[0/5] Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process node,cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 3
Write-Host "  OK Cleanup complete" -ForegroundColor Green

# Step 1: Backend
Write-Host "`n[1/5] Starting Backend (port 3001)..." -ForegroundColor Yellow
$backendWindow = Start-Process powershell -PassThru -WindowStyle Minimized -ArgumentList "-NoExit", "-Command", @"
`$Host.UI.RawUI.WindowTitle = 'Backend - Port 3001'
cd C:\Users\richl\Care2system
Write-Host '=== BACKEND SERVER ===' -ForegroundColor Green
npm run dev:backend
"@

Start-Sleep 12
$backendTest = try { (Invoke-WebRequest -Uri "http://localhost:3001/health/live" -UseBasicParsing -TimeoutSec 3).StatusCode -eq 200 } catch { $false }
if ($backendTest) {
    Write-Host "  OK Backend ready on port 3001" -ForegroundColor Green
} else {
    Write-Host "  X Backend failed to start" -ForegroundColor Red
    Write-Host "    Check backend window for errors" -ForegroundColor Yellow
}

# Step 2: Frontend
Write-Host "`n[2/5] Starting Frontend (port 3000)..." -ForegroundColor Yellow
$frontendWindow = Start-Process powershell -PassThru -WindowStyle Minimized -ArgumentList "-NoExit", "-Command", @"
`$Host.UI.RawUI.WindowTitle = 'Frontend - Port 3000'
cd C:\Users\richl\Care2system
Write-Host '=== FRONTEND SERVER ===' -ForegroundColor Green
npm run dev:frontend
"@

Start-Sleep 12
$frontendTest = try { 
    $r = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3
    $r.Content -match "Your Story" -or $r.StatusCode -eq 200
} catch { $false }
if ($frontendTest) {
    Write-Host "  OK Frontend ready on port 3000" -ForegroundColor Green
} else {
    Write-Host "  X Frontend failed to start" -ForegroundColor Red
    Write-Host "    Check frontend window for errors" -ForegroundColor Yellow
}

# Step 3: Reverse Proxy
Write-Host "`n[3/5] Starting Reverse Proxy (port 8080)..." -ForegroundColor Yellow
$proxyWindow = Start-Process powershell -PassThru -WindowStyle Minimized -ArgumentList "-NoExit", "-Command", @"
`$Host.UI.RawUI.WindowTitle = 'Reverse Proxy - Port 8080'
cd C:\Users\richl\Care2system
node reverse-proxy.js
"@

Start-Sleep 6
$proxyTest = try {
    $r = Invoke-WebRequest -Uri "http://localhost:8080" -Headers @{"Host"="care2connects.org"} -UseBasicParsing -TimeoutSec 3
    $r.Content -match "Your Story" -or $r.StatusCode -eq 200
} catch { $false }
if ($proxyTest) {
    Write-Host "  OK Reverse Proxy ready on port 8080" -ForegroundColor Green
} else {
    Write-Host "  X Reverse Proxy failed" -ForegroundColor Red
    Write-Host "    Check proxy window for errors" -ForegroundColor Yellow
}

# Step 4: Tunnel Configuration
Write-Host "`n[4/5] Verifying Tunnel Configuration..." -ForegroundColor Yellow
$configPath = "C:\Users\richl\.cloudflared\config.yml"
$correctConfig = @"
tunnel: 07e7c160-451b-4d41-875c-a58f79700ae8
credentials-file: C:\Users\richl\.cloudflared\07e7c160-451b-4d41-875c-a58f79700ae8.json

ingress:
  - hostname: api.care2connects.org
    service: http://localhost:8080
  - hostname: care2connects.org
    service: http://localhost:8080
  - service: http_status:404
"@
$correctConfig | Out-File -FilePath $configPath -Encoding UTF8 -Force
Write-Host "  OK Tunnel config verified" -ForegroundColor Green

# Verify credentials
$credsPath = "C:\Users\richl\.cloudflared\07e7c160-451b-4d41-875c-a58f79700ae8.json"
if (Test-Path $credsPath) {
    Write-Host "  OK Credentials file found" -ForegroundColor Green
} else {
    Write-Host "  X Credentials file MISSING!" -ForegroundColor Red
    Write-Host "    Run: cloudflared tunnel login" -ForegroundColor Yellow
}

# Step 5: Start Tunnel
Write-Host "`n[5/5] Starting Cloudflare Tunnel..." -ForegroundColor Yellow
$tunnelWindow = Start-Process powershell -PassThru -ArgumentList "-NoExit", "-Command", @"
`$Host.UI.RawUI.WindowTitle = 'Cloudflare Tunnel'
Write-Host '=============================================================' -ForegroundColor Cyan
Write-Host '   CLOUDFLARE TUNNEL' -ForegroundColor White
Write-Host '=============================================================' -ForegroundColor Cyan
Write-Host 'Tunnel ID: 07e7c160-451b-4d41-875c-a58f79700ae8' -ForegroundColor Gray
Write-Host ''
Write-Host 'Routing (via reverse proxy on 8080):' -ForegroundColor Yellow
Write-Host '  care2connects.org     -> Frontend (3000)' -ForegroundColor Green
Write-Host '  api.care2connects.org -> Backend  (3001)' -ForegroundColor Green
Write-Host ''
Write-Host 'Starting tunnel...' -ForegroundColor Yellow
Write-Host '=============================================================' -ForegroundColor Cyan
Write-Host ''
& 'C:\Program Files (x86)\cloudflared\cloudflared.exe' tunnel run 07e7c160-451b-4d41-875c-a58f79700ae8
"@

Start-Sleep 5
$tunnelProc = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($tunnelProc) {
    Write-Host "  OK Tunnel process started (PID: $($tunnelProc.Id))" -ForegroundColor Green
} else {
    Write-Host "  X Tunnel failed to start" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "   STARTUP SUMMARY" -ForegroundColor White
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend (3001):       $(if($backendTest){'OK RUNNING'}else{'X FAILED'})" -ForegroundColor $(if($backendTest){"Green"}else{"Red"})
Write-Host "Frontend (3000):      $(if($frontendTest){'OK RUNNING'}else{'X FAILED'})" -ForegroundColor $(if($frontendTest){"Green"}else{"Red"})
Write-Host "Reverse Proxy (8080): $(if($proxyTest){'OK RUNNING'}else{'X FAILED'})" -ForegroundColor $(if($proxyTest){"Green"}else{"Red"})
Write-Host "Cloudflare Tunnel:    $(if($tunnelProc){'OK RUNNING'}else{'X FAILED'})" -ForegroundColor $(if($tunnelProc){"Green"}else{"Red"})
Write-Host ""

if ($backendTest -and $frontendTest -and $proxyTest -and $tunnelProc) {
    Write-Host "ALL SYSTEMS OPERATIONAL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. Wait 30-60 seconds for tunnel to connect to Cloudflare" -ForegroundColor White
    Write-Host "2. Check tunnel window for 'Registered tunnel connection' message" -ForegroundColor White
    Write-Host "3. Visit: https://care2connects.org" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "If you see Error 1033:" -ForegroundColor Yellow
    Write-Host "  - Wait a bit longer for tunnel to establish connection" -ForegroundColor White
    Write-Host "  - Check tunnel window for authentication errors" -ForegroundColor White
    Write-Host "  - May need to run: cloudflared tunnel login" -ForegroundColor White
} else {
    Write-Host "SOME SYSTEMS FAILED TO START" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the minimized windows for error messages" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""
