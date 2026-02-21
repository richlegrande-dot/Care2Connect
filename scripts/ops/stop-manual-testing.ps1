<#
.SYNOPSIS
    Stop manual testing — gracefully shuts down local dev services.

.DESCRIPTION
    Stops Node.js backend/frontend dev servers and optionally the
    Cloudflare tunnel. PS 5.1 compatible.

.EXAMPLE
    .\stop-manual-testing.ps1
    .\stop-manual-testing.ps1 -IncludeTunnel
#>
[CmdletBinding()]
param(
    [switch]$IncludeTunnel
)

$ErrorActionPreference = 'Continue'

Write-Host "`n=== Stopping CareConnect Manual Testing Services ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"

# ---------------------------------------------------------------------------
# Stop Node processes on known ports
# ---------------------------------------------------------------------------
function Stop-PortProcess {
    param([int]$Port, [string]$Label)
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        $pids = $conn | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pid in $pids) {
            $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "  Stopping $Label (PID $pid, $($proc.ProcessName)) on port $Port ... " -NoNewline
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "DONE" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "  $Label on port $Port — not running" -ForegroundColor DarkGray
    }
}

Stop-PortProcess -Port 3001 -Label 'Backend'
Stop-PortProcess -Port 3000 -Label 'Frontend'

# ---------------------------------------------------------------------------
# Optionally stop Cloudflare tunnel
# ---------------------------------------------------------------------------
if ($IncludeTunnel) {
    $cfProcs = Get-Process -Name 'cloudflared' -ErrorAction SilentlyContinue
    if ($cfProcs) {
        Write-Host "  Stopping Cloudflare tunnel ... " -NoNewline
        $cfProcs | Stop-Process -Force -ErrorAction SilentlyContinue
        Write-Host "DONE" -ForegroundColor Green
    } else {
        Write-Host "  Cloudflare tunnel — not running" -ForegroundColor DarkGray
    }
} else {
    Write-Host "  Cloudflare tunnel — skipped (use -IncludeTunnel to stop)" -ForegroundColor DarkGray
}

Write-Host "`nManual testing services stopped.`n" -ForegroundColor Cyan
