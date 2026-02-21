# DEPRECATED: This script has been replaced by stop-stack.ps1
# This wrapper exists for backward compatibility only
# 
# CANONICAL SCRIPT: scripts/stop-stack.ps1
# 
# Why the change?
# - Consistent naming with start-stack.ps1
# - Simpler graceful shutdown logic
# - No hardcoded ports (reads from config/ports.json)
# 
# Migration: Replace all references to stop-production-stack.ps1 with stop-stack.ps1

param(
    [switch]$Force
)

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "DEPRECATED SCRIPT" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "This script (stop-production-stack.ps1) is deprecated." -ForegroundColor Yellow
Write-Host "Use scripts/stop-stack.ps1 instead." -ForegroundColor Cyan
Write-Host ""
Write-Host "Forwarding to canonical script..." -ForegroundColor DarkGray
Write-Host ""

$WorkspaceRoot = "C:\Users\richl\Care2system"
& "$WorkspaceRoot\scripts\stop-stack.ps1"
exit $LASTEXITCODE
            if ($proc) {
                Write-Host "  Stopping $service (PID: $pid)..." -ForegroundColor Gray
                Stop-Process -Id $pid -Force
                $stopped++
            } else {
                Write-Host "  $service (PID: $pid) - already stopped" -ForegroundColor Gray
            }
        }
    }
    
    if ($stopped -gt 0) {
        Write-Host "  ✓ Stopped $stopped tracked process(es)" -ForegroundColor Green
    }
    Write-Host ""
}

# Clean up any remaining processes
Write-Host "Cleaning up any remaining processes..." -ForegroundColor Yellow

$processNames = @("node", "caddy", "cloudflared")
$totalKilled = 0

foreach ($procName in $processNames) {
    $procs = Get-Process -Name $procName -ErrorAction SilentlyContinue
    if ($procs) {
        $count = $procs.Count
        Write-Host "  Killing $count $procName process(es)..." -ForegroundColor Gray
        $procs | Stop-Process -Force
        $totalKilled += $count
    }
}

if ($totalKilled -eq 0) {
    Write-Host "  ✓ No additional processes to clean up" -ForegroundColor Green
} else {
    Write-Host "  ✓ Killed $totalKilled additional process(es)" -ForegroundColor Green
}

Write-Host ""

# Verify all processes stopped
Write-Host "Verifying cleanup..." -ForegroundColor Yellow
$remaining = @()
foreach ($procName in $processNames) {
    $procs = Get-Process -Name $procName -ErrorAction SilentlyContinue
    if ($procs) {
        $remaining += $procs
    }
}

if ($remaining.Count -gt 0) {
    Write-Host "  ⚠ Warning: $($remaining.Count) process(es) still running:" -ForegroundColor Yellow
    foreach ($proc in $remaining) {
        Write-Host "    $($proc.Name) (PID: $($proc.Id))" -ForegroundColor Gray
    }
    
    if ($Force) {
        Write-Host ""
        Write-Host "  Force killing remaining processes..." -ForegroundColor Yellow
        foreach ($proc in $remaining) {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
        Write-Host "  ✓ Force killed all remaining processes" -ForegroundColor Green
    }
} else {
    Write-Host "  ✓ All processes stopped" -ForegroundColor Green
}

Write-Host ""

# Verify ports released
Write-Host "Verifying ports released..." -ForegroundColor Yellow
$requiredPorts = @(3000, 3001, 8080)
$portsReleased = $true

foreach ($port in $requiredPorts) {
    $listening = netstat -ano | Select-String ":$port.*LISTENING"
    if ($listening) {
        Write-Host "  ⚠ Port $port still in use" -ForegroundColor Yellow
        $portsReleased = $false
    } else {
        Write-Host "  ✓ Port $port released" -ForegroundColor Green
    }
}

Write-Host ""

if ($portsReleased) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ Production Stack Stopped" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "⚠ Stack Stopped (some ports still in use)" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If ports remain in use, wait 5-10 seconds for OS cleanup" -ForegroundColor Gray
    Write-Host "Or run with -Force flag to force kill all processes" -ForegroundColor Gray
}

Write-Host ""

# Remove PIDs file
if (Test-Path $pidsFile) {
    Remove-Item $pidsFile -Force
}
