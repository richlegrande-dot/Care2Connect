#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Stop Care2Connects stack gracefully
.DESCRIPTION
    Stops all stack components in correct order:
    1. Cloudflare tunnel
    2. Frontend (Next.js)
    3. Backend (Express)
    4. Caddy reverse proxy
.EXAMPLE
    .\scripts\stop-stack.ps1
#>

$ErrorActionPreference = "Stop"
$workspaceRoot = Split-Path -Parent $PSScriptRoot

Write-Host "`n=== Stopping Care2Connects Stack ===" -ForegroundColor Cyan

# Stop in reverse order of startup
Write-Host "`n[1] Stopping Cloudflare tunnel..." -ForegroundColor Yellow
$tunnel = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($tunnel) {
    Stop-Process -Name cloudflared -Force
    Write-Host "   ✅ Tunnel stopped (PID: $($tunnel.Id))" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Tunnel not running" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

Write-Host "`n[2] Stopping Frontend (Next.js)..." -ForegroundColor Yellow
$frontendPid = $null
$netstat = netstat -ano | Select-String ":3000 " | Select-Object -First 1
if ($netstat -match '\s+(\d+)\s*$') {
    $frontendPid = $matches[1]
    Stop-Process -Id $frontendPid -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Frontend stopped (PID: $frontendPid)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Frontend not running" -ForegroundColor Gray
}

Start-Sleep -Seconds 1

Write-Host "`n[3] Stopping Backend (Express)..." -ForegroundColor Yellow
$backendPid = $null
$netstat = netstat -ano | Select-String ":3001 " | Select-Object -First 1
if ($netstat -match '\s+(\d+)\s*$') {
    $backendPid = $matches[1]
    Stop-Process -Id $backendPid -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Backend stopped (PID: $backendPid)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Backend not running" -ForegroundColor Gray
}

Start-Sleep -Seconds 1

Write-Host "`n[4] Stopping Caddy reverse proxy..." -ForegroundColor Yellow
$caddy = Get-Process caddy -ErrorAction SilentlyContinue
if ($caddy) {
    Stop-Process -Name caddy -Force
    Write-Host "   ✅ Caddy stopped (PID: $($caddy.Id))" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Caddy not running" -ForegroundColor Gray
}

Write-Host "`n✅ Stack stopped successfully" -ForegroundColor Green
Write-Host "   To restart: .\scripts\start-stack.ps1" -ForegroundColor Gray

exit 0
