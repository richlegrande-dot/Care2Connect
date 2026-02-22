#Requires -Version 5.1
<#
.SYNOPSIS
    Port collision proof -- verifies exactly one listener per critical port.

.DESCRIPTION
    Checks ports 3000 (frontend), 3001 (backend), and 8080 (Caddy).
    Fails if ANY port has more than one listener (collision) or zero listeners.
    Prints PID + command line for each listener found.

.PARAMETER RequireCaddy
    Also require port 8080 to have exactly one listener. Default: true.

.OUTPUTS
    Exit 0 -- exactly one listener per port
    Exit 1 -- collision or missing listener detected
#>
param(
    [bool]$RequireCaddy = $true
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "SilentlyContinue"

$Failures = [System.Collections.Generic.List[string]]::new()

function Get-CmdLine($procId) {
    try {
        $p = Get-CimInstance Win32_Process -Filter "ProcessId=$procId" -EA SilentlyContinue
        if ($p) { return $p.CommandLine }
    } catch {}
    return "(unknown)"
}

function Fail ($msg) {
    Write-Host "  [FAIL] $msg" -ForegroundColor Red
    $script:Failures.Add($msg)
}
function Pass ($msg) { Write-Host "  [OK]   $msg" -ForegroundColor Green }
function Info ($msg) { Write-Host "  [INFO] $msg" -ForegroundColor Gray }

Write-Host ""
Write-Host "-- Port Collision Proof --" -ForegroundColor Cyan

$portsToCheck = @(
    @{ Port = 3000; Name = "Frontend (Next.js)" },
    @{ Port = 3001; Name = "Backend (Express)" }
)
if ($RequireCaddy) {
    $portsToCheck += @{ Port = 8080; Name = "Caddy (reverse proxy)" }
}

foreach ($entry in $portsToCheck) {
    $port = $entry.Port
    $name = $entry.Name

    $listeners = @(Get-NetTCPConnection -LocalPort $port -State Listen -EA SilentlyContinue)

    # Deduplicate by owning process ID (a single process can bind IPv4 + IPv6)
    $uniquePids = @{}
    foreach ($l in $listeners) {
        $procId = $l.OwningProcess
        if (-not $uniquePids.ContainsKey($procId)) {
            $uniquePids[$procId] = $l
        }
    }

    $count = $uniquePids.Count

    if ($count -eq 0) {
        Fail "Port $port ($name) -- no listener. Service not running."
    } elseif ($count -eq 1) {
        $procId = @($uniquePids.Keys)[0]
        $cmd = Get-CmdLine $procId
        $short = if ($cmd.Length -gt 100) { $cmd.Substring(0,100) + "..." } else { $cmd }
        Pass "Port $port ($name) -- exactly 1 listener (PID $procId)"
        Info "  $short"
    } else {
        Fail "Port $port ($name) -- COLLISION: $count listeners detected!"
        foreach ($procId in $uniquePids.Keys) {
            $cmd = Get-CmdLine $procId
            $short = if ($cmd.Length -gt 100) { $cmd.Substring(0,100) + "..." } else { $cmd }
            Write-Host "    PID ${procId}: $short" -ForegroundColor Red
        }
    }
}

Write-Host ""
if ($Failures.Count -eq 0) {
    Write-Host "  Port collision proof PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host "  Port collision proof FAILED -- $($Failures.Count) issue(s)" -ForegroundColor Red
    foreach ($f in $Failures) { Write-Host "    * $f" -ForegroundColor Red }
    Write-Host ""
    Write-Host "  Remediation:" -ForegroundColor Yellow
    Write-Host "    1. Run: .\scripts\dev\stop-clean.ps1" -ForegroundColor Yellow
    Write-Host "    2. Re-start services with pm2 start ecosystem.prod.config.js" -ForegroundColor Yellow
    exit 1
}
