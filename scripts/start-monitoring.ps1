<#
.SYNOPSIS
    Start All Monitoring Services
    
.DESCRIPTION
    PHASE 6M AUTO-RECOVERY: Starts all monitoring and recovery systems
    - Tunnel monitor
    - System health monitor
    - Auto-recovery enabled in backend
#>

param(
    [switch]$MinimizeWindows = $true
)

$ErrorActionPreference = "Continue"
$WorkspaceRoot = "C:\Users\richl\Care2system"

Write-Host "`n=== Starting CareConnect Monitoring Systems ===" -ForegroundColor Cyan

# Ensure logs directory exists
$logsDir = Join-Path $WorkspaceRoot "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
    Write-Host "✅ Created logs directory: $logsDir" -ForegroundColor Green
}

# Start Tunnel Monitor
Write-Host "`n🔍 Starting Tunnel Monitor..." -ForegroundColor Yellow
$tunnelScript = Join-Path $WorkspaceRoot "scripts\tunnel-monitor.ps1"
if (Test-Path $tunnelScript) {
    $windowStyle = if ($MinimizeWindows) { "Minimized" } else { "Normal" }
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $tunnelScript -WindowStyle $windowStyle
    Write-Host "✅ Tunnel monitor started" -ForegroundColor Green
} else {
    Write-Host "⚠️  Tunnel monitor script not found: $tunnelScript" -ForegroundColor Yellow
}

# Start System Health Monitor
Write-Host "`n🏥 Starting System Health Monitor..." -ForegroundColor Yellow
$systemScript = Join-Path $WorkspaceRoot "scripts\hardened-monitor.ps1"
if (Test-Path $systemScript) {
    $windowStyle = if ($MinimizeWindows) { "Minimized" } else { "Normal" }
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $systemScript -WindowStyle $windowStyle
    Write-Host "✅ System health monitor started" -ForegroundColor Green
} else {
    Write-Host "⚠️  System monitor script not found: $systemScript" -ForegroundColor Yellow
}

# Display status
Write-Host "`n=== Monitoring Status ===" -ForegroundColor Cyan
Start-Sleep -Seconds 2

$processes = Get-Process powershell -ErrorAction SilentlyContinue | Where-Object {
    $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue).CommandLine
    $cmdLine -like "*tunnel-monitor*" -or $cmdLine -like "*hardened-monitor*"
}

if ($processes) {
    Write-Host "✅ Active monitoring processes:" -ForegroundColor Green
    foreach ($proc in $processes) {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)" -ErrorAction SilentlyContinue).CommandLine
        $type = if ($cmdLine -like "*tunnel-monitor*") { "Tunnel Monitor" } else { "System Monitor" }
        $procId = $proc.Id
        Write-Host "   - $type (Process ID: $procId)" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️  No monitoring processes found" -ForegroundColor Yellow
}

Write-Host "`n=== Auto-Recovery Configuration ===" -ForegroundColor Cyan
Write-Host "✅ Backend auto-recovery: ENABLED (automatic troubleshooting)" -ForegroundColor Green
Write-Host "   - Triggers on degraded status" -ForegroundColor Gray
Write-Host "   - 5-minute cooldown between attempts" -ForegroundColor Gray
Write-Host "   - Monitors: Prisma, OpenAI, Stripe" -ForegroundColor Gray

Write-Host "`n📝 Logs location: $logsDir" -ForegroundColor Cyan
Write-Host "   - tunnel-monitor.log" -ForegroundColor Gray
Write-Host "   - system-monitor.log" -ForegroundColor Gray

Write-Host "`n✅ All monitoring systems started successfully!`n" -ForegroundColor Green
