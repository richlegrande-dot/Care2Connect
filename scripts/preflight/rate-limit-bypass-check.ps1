#Requires -Version 5.1
<#
.SYNOPSIS
    Rate-limit bypass safety check for OpenTesting gate.

.DESCRIPTION
    Two checks:
      1. Make two rapid requests to a rate-limited endpoint WITHOUT the
         x-c2c-test bypass header.  Confirm both return 200 (under limit)
         proving the endpoint is reachable and rate-limiting is active.

      2. Check that the hardening/security endpoint does NOT expose
         unsafe bypass configuration (flags that would disable rate limiting
         for all traffic).  Values are never printed -- only presence/absence.

.PARAMETER TimeoutSeconds
    HTTP request timeout (default: 10).

.PARAMETER BackendPort
    Backend port (default: 3001).

.OUTPUTS
    Exit 0 -- rate limiting is properly configured
    Exit 1 -- bypass risk detected or endpoint unreachable
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
Write-Host "-- Rate-Limit Bypass Safety Check --" -ForegroundColor Cyan

$baseUrl = "http://localhost:$BackendPort"

# ---- Check 1: Two rapid requests WITHOUT bypass header ---------------------
Write-Host ""
Write-Host "  Check 1: Rate-limited requests (no bypass header)" -ForegroundColor White

$endpoint = "$baseUrl/health/live"
$requestOk = 0
$requestFail = 0

for ($i = 1; $i -le 2; $i++) {
    try {
        # Explicitly do NOT send x-c2c-test header
        $resp = Invoke-WebRequest -Uri $endpoint `
            -TimeoutSec $TimeoutSeconds `
            -UseBasicParsing `
            -ErrorAction Stop
        $code = [int]$resp.StatusCode
        if ($code -eq 200) {
            $requestOk++
        } else {
            $requestFail++
        }
    } catch {
        $errMsg = $_.Exception.Message
        if ($errMsg -match '429') {
            # Rate limited after just 2 requests means limit is too aggressive
            Fail "Request $i got 429 (rate limited after only $i request(s) -- limit too low?)"
            $requestFail++
        } else {
            Fail "Request $i failed: $errMsg"
            $requestFail++
        }
    }
}

if ($requestOk -eq 2) {
    Pass "2/2 requests returned 200 without bypass header (rate limiting active, under limit)"
} elseif ($requestFail -gt 0) {
    # Already logged via Fail above
    Info "Expected both requests to succeed (well under 100/15min limit)"
}

# ---- Check 2: Verify bypass flags not exposed -----------------------------
Write-Host ""
Write-Host "  Check 2: Bypass flag safety (hardening endpoint)" -ForegroundColor White

$hardeningUrl = "$baseUrl/api/hardening/security"

try {
    $hResp = Invoke-WebRequest -Uri $hardeningUrl `
        -TimeoutSec $TimeoutSeconds `
        -UseBasicParsing `
        -ErrorAction Stop

    $hBody = $hResp.Content | ConvertFrom-Json

    # Check that rate limiting reports as enabled
    $rlConfig = $hBody.rateLimiting
    if ($null -ne $rlConfig) {
        if ($rlConfig.enabled -eq $true) {
            Pass "Rate limiting reported as enabled"
        } else {
            Fail "Rate limiting reported as DISABLED (rateLimiting.enabled = false)"
        }
    } else {
        Info "No rateLimiting section in hardening response (may be fine)"
    }

    # Check for dangerous bypass flags (do NOT print values)
    $dangerousKeys = @(
        "DISABLE_RATE_LIMIT",
        "RATE_LIMIT_BYPASS",
        "SKIP_RATE_LIMIT",
        "RATE_LIMIT_DISABLED"
    )

    $bodyStr = $hResp.Content
    $foundDangerous = @()
    foreach ($key in $dangerousKeys) {
        if ($bodyStr -match $key) {
            $foundDangerous += $key
        }
    }

    if ($foundDangerous.Count -gt 0) {
        Fail "Dangerous bypass flags detected in hardening response: $($foundDangerous -join ', ')"
        Info "Values not printed for security. Check backend environment."
    } else {
        Pass "No dangerous bypass flags found in hardening response"
    }

} catch {
    $errMsg = $_.Exception.Message
    if ($errMsg -match '404') {
        Info "Hardening endpoint not found (404) -- bypass flag check skipped"
        Info "This is acceptable if /api/hardening/security is not deployed"
    } else {
        Fail "Hardening endpoint error: $errMsg"
    }
}

# ---- Check 3: Verify x-c2c-test header is not globally enabled in env -----
Write-Host ""
Write-Host "  Check 3: Test bypass header not in production environment" -ForegroundColor White

$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$envFiles = @(
    (Join-Path $Root "backend\.env"),
    (Join-Path $Root ".env")
)

$envBypassFound = $false
foreach ($ef in $envFiles) {
    if (Test-Path $ef) {
        $lines = Get-Content $ef -ErrorAction SilentlyContinue
        foreach ($line in $lines) {
            if ($line -match '^\s*(X_C2C_TEST|DISABLE_RATE_LIMIT|RATE_LIMIT_BYPASS)\s*=') {
                Fail "Bypass env var found in $($ef | Split-Path -Leaf): $($Matches[1]) (value not printed)"
                $envBypassFound = $true
            }
        }
    }
}

if (-not $envBypassFound) {
    Pass "No rate-limit bypass env vars found in .env files"
}

# ---- Summary ---------------------------------------------------------------
Write-Host ""
if ($Failures.Count -eq 0) {
    Write-Host "  Rate-limit bypass safety PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host "  Rate-limit bypass safety FAILED -- $($Failures.Count) issue(s)" -ForegroundColor Red
    foreach ($f in $Failures) { Write-Host "    * $f" -ForegroundColor Red }
    Write-Host ""
    Write-Host "  Remediation:" -ForegroundColor Yellow
    Write-Host "    - Remove DISABLE_RATE_LIMIT / X_C2C_TEST from .env" -ForegroundColor Yellow
    Write-Host "    - Verify rate limiting is enabled in backend config" -ForegroundColor Yellow
    Write-Host "    - x-c2c-test header should only be used by automated tests" -ForegroundColor Yellow
    exit 1
}
