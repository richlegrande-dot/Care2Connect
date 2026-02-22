#Requires -Version 5.1
<#
.SYNOPSIS
    Database connectivity proof -- verifies the backend can reach PostgreSQL.

.DESCRIPTION
    Calls backend GET /health/db and checks for a "ready" signal.
    Never prints DATABASE_URL or other secrets.

.PARAMETER TimeoutSeconds
    HTTP request timeout (default: 10).

.PARAMETER BackendPort
    Backend port (default: 3001).

.OUTPUTS
    Exit 0 -- database reachable
    Exit 1 -- database unreachable or backend down
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
Write-Host "-- Database Connectivity Proof --" -ForegroundColor Cyan

$dbUrl = "http://localhost:$BackendPort/health/db"

try {
    $resp = Invoke-WebRequest -Uri $dbUrl `
        -Method GET `
        -TimeoutSec $TimeoutSeconds `
        -UseBasicParsing `
        -ErrorAction Stop

    $code = [int]$resp.StatusCode

    if ($code -eq 200) {
        Pass "GET /health/db => 200"
    } else {
        Fail "GET /health/db => $code (expected 200)"
    }

    # Parse response body
    try {
        $body = $resp.Content | ConvertFrom-Json

        # Check "ready" field
        if ($body.ready -eq $true) {
            Pass "Database ready: true"
        } else {
            Fail "Database ready: false -- DB not accessible"
        }

        # Print safe message field only
        if ($body.message) {
            Info "Message: $($body.message)"
        }

        # Print databaseUrl status (configured/missing -- NOT the actual URL)
        if ($body.databaseUrl) {
            if ($body.databaseUrl -eq "configured") {
                Pass "DATABASE_URL is configured"
            } elseif ($body.databaseUrl -eq "missing") {
                Fail "DATABASE_URL is not set in backend environment"
            }
        }
    } catch {
        Fail "Could not parse /health/db response as JSON: $($_.Exception.Message)"
    }
} catch {
    $errMsg = $_.Exception.Message

    # Check if it's a 503 (DB down but backend running)
    if ($errMsg -match "503") {
        Fail "GET /health/db => 503 -- database not accessible"
        Info "Backend is running but cannot reach PostgreSQL"
    } elseif ($errMsg -match "Unable to connect") {
        Fail "Backend not reachable at localhost:$BackendPort"
    } else {
        Fail "GET /health/db exception: $errMsg"
    }
}

# ---- Summary -------------------------------------------------------------
Write-Host ""
if ($Failures.Count -eq 0) {
    Write-Host "  Database connectivity PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host "  Database connectivity FAILED -- $($Failures.Count) issue(s)" -ForegroundColor Red
    foreach ($f in $Failures) { Write-Host "    * $f" -ForegroundColor Red }
    Write-Host ""
    Write-Host "  Remediation:" -ForegroundColor Yellow
    Write-Host "    1. Verify PostgreSQL is running (docker compose up -d, or check local service)" -ForegroundColor Yellow
    Write-Host "    2. Verify DATABASE_URL in backend/.env is correct" -ForegroundColor Yellow
    Write-Host "    3. Try: npx prisma db push (from backend/)" -ForegroundColor Yellow
    Write-Host "    4. Restart backend: pm2 restart careconnect-backend-prod" -ForegroundColor Yellow
    exit 1
}
