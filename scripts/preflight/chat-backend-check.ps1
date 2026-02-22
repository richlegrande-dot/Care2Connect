#Requires -Version 5.1
<#
.SYNOPSIS
    Chat backend readiness probe -- verifies the V2 intake API is serving.

.DESCRIPTION
    Calls GET /api/v2/intake/health on the backend and checks for:
      - status: "healthy"
      - featureFlag: true (V2 enabled)
      - database: "connected"

    Only prints safe fields. Never prints secrets or internal URLs.

.PARAMETER TimeoutSeconds
    HTTP request timeout (default: 10).

.PARAMETER BackendPort
    Backend port (default: 3001).

.OUTPUTS
    Exit 0 -- V2 intake API healthy
    Exit 1 -- V2 intake API unhealthy or unreachable
#>
param(
    [int]$TimeoutSeconds = 10,
    [int]$BackendPort = 3001
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Failures = [System.Collections.Generic.List[string]]::new()

function Fail ($msg) {
    Write-Host "  [FAIL] $msg" -ForegroundColor Red
    $script:Failures.Add($msg)
}
function Pass ($msg) { Write-Host "  [OK]   $msg" -ForegroundColor Green }
function Info ($msg) { Write-Host "  [INFO] $msg" -ForegroundColor Gray }

Write-Host ""
Write-Host "-- Chat Backend Readiness (V2 Intake) --" -ForegroundColor Cyan

$healthUrl = "http://localhost:$BackendPort/api/v2/intake/health"

try {
    $resp = Invoke-WebRequest -Uri $healthUrl `
        -Method GET `
        -TimeoutSec $TimeoutSeconds `
        -UseBasicParsing `
        -ErrorAction Stop

    $code = [int]$resp.StatusCode

    if ($code -eq 200) {
        Pass "GET /api/v2/intake/health => 200"
    } else {
        Fail "GET /api/v2/intake/health => $code (expected 200)"
    }

    # Parse response
    try {
        $body = $resp.Content | ConvertFrom-Json

        # Check status field
        $status = $null
        if ($body.PSObject.Properties["status"]) { $status = $body.status }
        if ($status -eq "healthy") {
            Pass "Status: healthy"
        } else {
            Fail "Status: '$status' (expected 'healthy')"
        }

        # Check featureFlag
        $ff = $null
        if ($body.PSObject.Properties["featureFlag"]) { $ff = $body.featureFlag }
        if ($ff -eq $true) {
            Pass "Feature flag: enabled (V2 active)"
        } else {
            Fail "Feature flag: $ff (expected true -- V2 may be disabled)"
        }

        # Check database
        $db = $null
        if ($body.PSObject.Properties["database"]) { $db = $body.database }
        if ($db -eq "connected") {
            Pass "Database: connected"
        } elseif ($db) {
            Fail "Database: '$db' (expected 'connected')"
        }

        # Print policy pack version if present (safe metadata)
        if ($body.PSObject.Properties["policyPackVersion"]) {
            Info "Policy pack: $($body.policyPackVersion)"
        }
    } catch {
        Fail "Could not parse /api/v2/intake/health response as JSON: $($_.Exception.Message)"
    }
} catch {
    $errMsg = $_.Exception.Message

    if ($errMsg -match "404") {
        Fail "GET /api/v2/intake/health => 404 -- V2 routes may not be enabled"
        Info "Check that V2_FEATURE_FLAG=true in backend .env"
    } elseif ($errMsg -match "Unable to connect") {
        Fail "Backend not reachable at localhost:$BackendPort"
    } else {
        Fail "GET /api/v2/intake/health exception: $errMsg"
    }
}

# ---- Summary -------------------------------------------------------------
Write-Host ""
if ($Failures.Count -eq 0) {
    Write-Host "  Chat backend readiness PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host "  Chat backend readiness FAILED -- $($Failures.Count) issue(s)" -ForegroundColor Red
    foreach ($f in $Failures) { Write-Host "    * $f" -ForegroundColor Red }
    Write-Host ""
    Write-Host "  Remediation:" -ForegroundColor Yellow
    Write-Host "    - Verify V2_FEATURE_FLAG=true in backend/.env" -ForegroundColor Yellow
    Write-Host "    - Verify backend is running: http://localhost:3001/health/live" -ForegroundColor Yellow
    Write-Host "    - Check intake route registration in backend logs" -ForegroundColor Yellow
    exit 1
}
