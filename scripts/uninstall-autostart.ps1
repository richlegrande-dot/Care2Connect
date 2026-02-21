# Completely remove CareConnect auto-start
# This removes the Scheduled Task and stops all running services

$ErrorActionPreference = "Continue"

Write-Host "Uninstalling CareConnect auto-start..." -ForegroundColor Yellow
Write-Host ""

$TaskName = "Care2Connects_AutoStart"

# 1. Stop services first
Write-Host "[1/2] Stopping all services..." -ForegroundColor Cyan
& (Join-Path $PSScriptRoot "stop-services.ps1")

# 2. Remove Scheduled Task
Write-Host "[2/2] Removing Scheduled Task..." -ForegroundColor Cyan
try {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "  ✓ Task removed: $TaskName" -ForegroundColor Green
} catch {
    Write-Host "  ℹ Task not found (may already be removed)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Uninstall complete" -ForegroundColor Green
Write-Host ""
Write-Host "Services will NOT start automatically on next login." -ForegroundColor Gray
Write-Host "To re-enable, run: .\scripts\setup-autostart.ps1" -ForegroundColor Gray
