#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start Cloudflare Tunnel with IPv4-only mode
.DESCRIPTION
    Starts the care2connects-tunnel with --edge-ip-version 4 flag to prevent
    Windows IPv6 binding issues that caused 502/1033 errors during Jan 11 demo.
    
    This is Phase 5 of Operations Hardening (PHASE_5_COMPLETE.md)
.EXAMPLE
    .\start-tunnel-ipv4.ps1
#>

param(
    [switch]$NoWait,
    [int]$WaitSeconds = 10
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== Cloudflare Tunnel (IPv4-Only Mode) ===" -ForegroundColor Cyan

# Check if tunnel already running
$existing = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "WARN: Tunnel already running (PID: $($existing.Id))" -ForegroundColor Yellow
    Write-Host "      Stop with: Stop-Process -Name cloudflared" -ForegroundColor Yellow
    exit 0
}

# Verify cloudflared installed
$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflared) {
    Write-Host "ERROR: cloudflared not found in PATH" -ForegroundColor Red
    Write-Host "       Install from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/" -ForegroundColor Yellow
    exit 1
}

Write-Host "[1] Cloudflared binary: $($cloudflared.Source)" -ForegroundColor Gray
Write-Host "[2] Version: $(cloudflared version 2>&1 | Select-String 'version')" -ForegroundColor Gray

# Verify config exists
$configPath = "$env:USERPROFILE\.cloudflared\config.yml"
if (-not (Test-Path $configPath)) {
    Write-Host "ERROR: Config not found at $configPath" -ForegroundColor Red
    exit 1
}

Write-Host "[3] Config: $configPath" -ForegroundColor Gray

# Start tunnel in background with IPv4-only flag
Write-Host "`nStarting tunnel with --edge-ip-version 4..." -ForegroundColor Cyan
$proc = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-NoProfile",
    "-Command",
    "Write-Host 'Cloudflare Tunnel (IPv4-Only) - care2connects-tunnel' -ForegroundColor Cyan; cloudflared tunnel --edge-ip-version 4 run care2connects-tunnel"
) -PassThru -WindowStyle Normal

if (-not $NoWait) {
    Write-Host "Waiting $WaitSeconds seconds for tunnel registration..." -ForegroundColor Gray
    Start-Sleep -Seconds $WaitSeconds
}

# Verify tunnel running
$running = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($running) {
    Write-Host "`nSUCCESS: Tunnel running" -ForegroundColor Green
    Write-Host "  PID:     $($running.Id)" -ForegroundColor White
    Write-Host "  Runtime: $((Get-Date) - $running.StartTime)" -ForegroundColor White
    Write-Host "  Memory:  $([math]::Round($running.WorkingSet64 / 1MB, 2)) MB" -ForegroundColor White
    
    Write-Host "`nPublic endpoints:" -ForegroundColor Cyan
    Write-Host "  https://api.care2connects.org/health/live" -ForegroundColor White
    Write-Host "  https://care2connects.org" -ForegroundColor White
    Write-Host "  https://www.care2connects.org" -ForegroundColor White
    
    Write-Host "`nTo stop tunnel:" -ForegroundColor Yellow
    Write-Host "  Stop-Process -Name cloudflared" -ForegroundColor Gray
} else {
    Write-Host "`nFAIL: Tunnel not running" -ForegroundColor Red
    Write-Host "Check the tunnel window for errors" -ForegroundColor Yellow
    exit 1
}
