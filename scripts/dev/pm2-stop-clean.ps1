<#
.SYNOPSIS
    Cleanly stops all PM2-managed apps AND kills any orphaned child processes
    on the known development ports (3000, 3001, 8080, 8443).
.DESCRIPTION
    PM2 kills direct children but may leave orphaned Next.js child processes
    (start-server.js) bound to ports. This script:
    1. Deletes all PM2-managed apps (pm2 delete all).
    2. Kills the PM2 daemon (pm2 kill).
    3. Sweeps ports 3000, 3001, 8080, 8443 and kills any remaining listeners.
    4. Prints the final port state.

    Context (Feb 2026):
    After pm2 delete, a rogue Next.js child (start-server.js) remained bound
    to port 3001, causing infinite proxy loops and connection timeouts.
#>
Set-StrictMode -Version Latest
$ErrorActionPreference = "SilentlyContinue"

$SweepPorts = @(3000, 3001, 8080, 8443)

function Get-ProcCmdLine($pid_) {
    try {
        $p = Get-CimInstance Win32_Process -Filter "ProcessId=$pid_" -EA SilentlyContinue
        if ($p) { return $p.CommandLine }
    } catch {}
    return "(unknown)"
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  DEV CLEANUP: pm2-stop-clean                  " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Stopping PM2 processes..." -ForegroundColor Yellow
$out1 = & pm2 delete all 2>&1
Write-Host $out1
Start-Sleep -Seconds 2

$out2 = & pm2 kill 2>&1
Write-Host $out2
Start-Sleep -Seconds 1

Write-Host ""
Write-Host "[2/3] Port sweep: $($SweepPorts -join ', ')..." -ForegroundColor Yellow
$killed = 0

foreach ($port in $SweepPorts) {
    $ls = @(Get-NetTCPConnection -LocalPort $port -State Listen -EA SilentlyContinue)
    if ($ls.Count -eq 0) {
        Write-Host "  Port $port -- clear" -ForegroundColor Gray
        continue
    }
    foreach ($c in $ls) {
        $pid_  = $c.OwningProcess
        $cmd   = Get-ProcCmdLine $pid_
        $short = if ($cmd.Length -gt 120) { $cmd.Substring(0,120) + "..." } else { $cmd }
        Write-Host "  [KILL] Port $port PID $pid_" -ForegroundColor Yellow
        Write-Host "         $short" -ForegroundColor DarkGray
        Stop-Process -Id $pid_ -Force -EA SilentlyContinue
        $killed++
    }
}

if ($killed -gt 0) {
    Write-Host "  Killed $killed orphan process(es). Waiting 2s..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "[3/3] Final port state:" -ForegroundColor Yellow
$anyRemaining = $false

foreach ($port in $SweepPorts) {
    $ls = @(Get-NetTCPConnection -LocalPort $port -State Listen -EA SilentlyContinue)
    if ($ls.Count -gt 0) {
        foreach ($c in $ls) {
            $cmd = Get-ProcCmdLine $c.OwningProcess
            Write-Host "  WARN: Port $port still has listener -- PID $($c.OwningProcess): $cmd" -ForegroundColor Red
            $anyRemaining = $true
        }
    } else {
        Write-Host "  OK: Port $port -- clear" -ForegroundColor Green
    }
}

Write-Host ""
if ($anyRemaining) {
    Write-Host "=================================================" -ForegroundColor Red
    Write-Host "  WARNING -- Some ports still have listeners.   " -ForegroundColor Red
    Write-Host "  These may be system processes or other apps.  " -ForegroundColor Red
    Write-Host "  Inspect the PIDs above before proceeding.     " -ForegroundColor Red
    Write-Host "=================================================" -ForegroundColor Red
    exit 1
} else {
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  PASS -- All ports clear. Safe to restart.    " -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    exit 0
}
