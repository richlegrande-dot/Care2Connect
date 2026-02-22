#Requires -Version 5.1
<#
.SYNOPSIS
    Stop all Care2Connect processes and sweep target ports clean.

.DESCRIPTION
    1. pm2 delete all (if pm2 is available)
    2. Kill any remaining listeners on ports 3000, 3001, 8080, 8443
    3. Optionally kill Caddy and cloudflared processes
    4. Verify all ports are free

.PARAMETER IncludeTunnel
    Also kill cloudflared and Caddy processes.

.OUTPUTS
    Exit 0 -- all ports clear
    Exit 1 -- some ports still occupied (should not happen)
#>
param(
    [switch]$IncludeTunnel
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "SilentlyContinue"

$Ports = @(3000, 3001, 8080, 8443)

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Stop + Clean: Kill All Services                           " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# ---- Step 1: PM2 delete all -----------------------------------------------
Write-Host "-- Step 1: PM2 cleanup --" -ForegroundColor Cyan
$pm2 = Get-Command pm2 -ErrorAction SilentlyContinue
if ($pm2) {
    Write-Host "  Stopping all PM2 processes..." -ForegroundColor Gray
    & pm2 delete all 2>$null | Out-Null
    & pm2 kill 2>$null | Out-Null
    Write-Host "  [OK] PM2 processes deleted." -ForegroundColor Green
} else {
    Write-Host "  [SKIP] pm2 not found in PATH." -ForegroundColor Yellow
}

# ---- Step 2: Kill tunnel/proxy processes (optional) -----------------------
if ($IncludeTunnel) {
    Write-Host ""
    Write-Host "-- Step 2: Tunnel/Proxy cleanup (-IncludeTunnel) --" -ForegroundColor Cyan
    foreach ($procName in @("cloudflared", "caddy")) {
        $procs = @(Get-Process -Name $procName -ErrorAction SilentlyContinue)
        if ($procs.Count -gt 0) {
            $procs | Stop-Process -Force -ErrorAction SilentlyContinue
            Write-Host "  [OK] Killed $($procs.Count) $procName process(es)." -ForegroundColor Green
        } else {
            Write-Host "  [OK] No $procName processes running." -ForegroundColor Gray
        }
    }
}

# ---- Step 3: Port sweep ---------------------------------------------------
Write-Host ""
Write-Host "-- Step 3: Port sweep ($($Ports -join ', ')) --" -ForegroundColor Cyan
$killed = 0
foreach ($port in $Ports) {
    $listeners = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
    if ($listeners.Count -eq 0) {
        Write-Host "  [OK] Port $port -- already clear." -ForegroundColor Green
        continue
    }
    foreach ($conn in $listeners) {
        $pid_ = $conn.OwningProcess
        try {
            $proc = Get-Process -Id $pid_ -ErrorAction Stop
            Write-Host "  [KILL] Port $port PID $pid_ ($($proc.ProcessName))" -ForegroundColor Yellow
            Stop-Process -Id $pid_ -Force -ErrorAction SilentlyContinue
            $killed++
        } catch {
            Write-Host "  [WARN] Port $port PID $pid_ -- process already gone." -ForegroundColor Gray
        }
    }
}

if ($killed -gt 0) {
    Write-Host ""
    Write-Host "  Killed $killed process(es). Waiting 2s for cleanup..." -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

# ---- Step 4: Verify all ports clear ---------------------------------------
Write-Host ""
Write-Host "-- Step 4: Verification --" -ForegroundColor Cyan
$remaining = 0
foreach ($port in $Ports) {
    $ls = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
    if ($ls.Count -gt 0) {
        $remaining++
        Write-Host "  [FAIL] Port $port still occupied by PID $($ls[0].OwningProcess)" -ForegroundColor Red
    } else {
        Write-Host "  [OK] Port $port -- clear." -ForegroundColor Green
    }
}

Write-Host ""
if ($remaining -eq 0) {
    Write-Host "  All target ports are clear. Ready for fresh start." -ForegroundColor Green
    Write-Host ""
    exit 0
} else {
    Write-Host "  [FAIL] $remaining port(s) still occupied. Try running as Administrator." -ForegroundColor Red
    Write-Host ""
    exit 1
}
