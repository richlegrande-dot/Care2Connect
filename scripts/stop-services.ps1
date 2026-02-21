# Stop all CareConnect services
# Run this to cleanly shut down everything

$ErrorActionPreference = "Continue"

Write-Host "Stopping CareConnect services..." -ForegroundColor Yellow
Write-Host ""

# 1. Stop the Task Scheduler task (which stops the supervisor)
Write-Host "[1/4] Stopping Task Scheduler task..." -ForegroundColor Cyan
try {
    Stop-ScheduledTask -TaskName "Care2Connects_AutoStart" -ErrorAction SilentlyContinue
    Write-Host "  ✓ Task stopped" -ForegroundColor Green
} catch {
    Write-Host "  ℹ Task not running or not found" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# 2. Kill any remaining PowerShell supervisor processes
Write-Host "[2/4] Stopping supervisor processes..." -ForegroundColor Cyan
$supervisorProcs = Get-Process powershell -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*run-services.ps1*"
}
if ($supervisorProcs) {
    $supervisorProcs | Stop-Process -Force
    Write-Host "  ✓ Stopped $($supervisorProcs.Count) supervisor process(es)" -ForegroundColor Green
} else {
    Write-Host "  ℹ No supervisor processes found" -ForegroundColor Gray
}

# 3. Kill Node.js processes (frontend/backend)
Write-Host "[3/4] Stopping Node.js processes..." -ForegroundColor Cyan
$nodeProcs = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcs) {
    $nodeProcs | Stop-Process -Force
    Write-Host "  ✓ Stopped $($nodeProcs.Count) Node.js process(es)" -ForegroundColor Green
} else {
    Write-Host "  ℹ No Node.js processes found" -ForegroundColor Gray
}

# 4. Kill cloudflared processes
Write-Host "[4/4] Stopping Cloudflare tunnel..." -ForegroundColor Cyan
$tunnelProcs = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($tunnelProcs) {
    $tunnelProcs | Stop-Process -Force
    Write-Host "  ✓ Stopped $($tunnelProcs.Count) tunnel process(es)" -ForegroundColor Green
} else {
    Write-Host "  ℹ No tunnel processes found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ All services stopped" -ForegroundColor Green
Write-Host ""
Write-Host "To restart:" -ForegroundColor Cyan
Write-Host "  Start-ScheduledTask -TaskName 'Care2Connects_AutoStart'" -ForegroundColor Gray
Write-Host "  # OR" -ForegroundColor Gray
Write-Host "  .\scripts\run-services.ps1 -ShowWindows" -ForegroundColor Gray
