<#
.SYNOPSIS
    Start manual testing — validates that all production services are reachable
    and prints a PASS/FAIL table.

.DESCRIPTION
    Checks backend health, frontend accessibility, and Cloudflare tunnel
    for the production domains (care2connects.org / api.care2connects.org).
    PS 5.1 compatible (no Invoke-RestMethod -SkipHttpError).

.EXAMPLE
    .\start-manual-testing.ps1
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'

Write-Host "`n=== CareConnect Manual Testing Readiness ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"

# ---------------------------------------------------------------------------
# Helper: test a URL and return hashtable with result
# ---------------------------------------------------------------------------
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$TimeoutSec = 15
    )
    try {
        $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $TimeoutSec -ErrorAction Stop
        $status = $resp.StatusCode
        $ok = ($status -ge 200 -and $status -lt 400)
        return @{ Name = $Name; Url = $Url; Status = $status; Pass = $ok; Error = $null }
    } catch {
        $msg = $_.Exception.Message
        # Try to extract status code from error
        if ($_.Exception.Response) {
            try {
                $status = [int]$_.Exception.Response.StatusCode
            } catch { $status = 0 }
        } else {
            $status = 0
        }
        return @{ Name = $Name; Url = $Url; Status = $status; Pass = $false; Error = $msg }
    }
}

# ---------------------------------------------------------------------------
# Endpoints to validate
# ---------------------------------------------------------------------------
$endpoints = @(
    @{ Name = 'Backend Health';        Url = 'https://api.care2connects.org/health/live' },
    @{ Name = 'Backend API Health';    Url = 'https://api.care2connects.org/api/health' },
    @{ Name = 'Frontend Home';         Url = 'https://care2connects.org' },
    @{ Name = 'Frontend Onboarding';   Url = 'https://care2connects.org/onboarding/v2' },
    @{ Name = 'Local Backend';         Url = 'http://localhost:3001/health/live' },
    @{ Name = 'Local Frontend';        Url = 'http://localhost:3000' }
)

$results = @()
foreach ($ep in $endpoints) {
    Write-Host "  Testing $($ep.Name) ... " -NoNewline
    $r = Test-Endpoint -Name $ep.Name -Url $ep.Url
    if ($r.Pass) {
        Write-Host "PASS ($($r.Status))" -ForegroundColor Green
    } else {
        Write-Host "FAIL ($($r.Status)) $($r.Error)" -ForegroundColor Red
    }
    $results += $r
}

# ---------------------------------------------------------------------------
# Summary table
# ---------------------------------------------------------------------------
Write-Host "`n--- Summary ---" -ForegroundColor Cyan
$passCount = ($results | Where-Object { $_.Pass }).Count
$failCount = ($results | Where-Object { -not $_.Pass }).Count

Write-Host ("{0,-25} {1,-45} {2,-8} {3}" -f 'CHECK', 'URL', 'STATUS', 'RESULT')
Write-Host ("{0,-25} {1,-45} {2,-8} {3}" -f '-----', '---', '------', '------')
foreach ($r in $results) {
    $verdict = if ($r.Pass) { 'PASS' } else { 'FAIL' }
    $color = if ($r.Pass) { 'Green' } else { 'Red' }
    Write-Host ("{0,-25} {1,-45} {2,-8} " -f $r.Name, $r.Url, $r.Status) -NoNewline
    Write-Host $verdict -ForegroundColor $color
}

Write-Host "`nTotal: $passCount PASS, $failCount FAIL" -ForegroundColor $(if ($failCount -eq 0) { 'Green' } else { 'Yellow' })

if ($failCount -eq 0) {
    Write-Host "`nAll endpoints reachable — ready for manual testing!`n" -ForegroundColor Green
} else {
    Write-Host "`nSome endpoints unreachable — check services before testing.`n" -ForegroundColor Yellow
    Write-Host "Quick fixes:"
    Write-Host "  Backend:  cd backend; npm run dev"
    Write-Host "  Frontend: cd frontend; npm run dev"
    Write-Host "  Tunnel:   cloudflared tunnel run care2connect"
}
