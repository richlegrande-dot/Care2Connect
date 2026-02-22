#Requires -Version 5.1
<#
.SYNOPSIS
    Caddy host-routing and public domain verification.

.DESCRIPTION
    Two complementary modes:

    -UseCaddy   Verifies Caddy routes requests correctly via localhost:8080
                with Host headers (proves host-based routing works locally).

    -UsePublic  Verifies public domains resolve through Cloudflare + tunnel
                (proves end-to-end routing to production).

    Both modes can run together.

.PARAMETER UseCaddy
    Check host-routing through Caddy (localhost:8080).

.PARAMETER UsePublic
    Check public domain connectivity (care2connects.org).

.PARAMETER TimeoutSeconds
    HTTP request timeout (default: 15).

.OUTPUTS
    Exit 0 -- all probes pass
    Exit 1 -- one or more probes failed
#>
param(
    [switch]$UseCaddy,
    [switch]$UsePublic,
    [int]$TimeoutSeconds = 15
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

# Safe JSON field check -- never prints secret values
function Assert-JsonField {
    param([string]$Label, [object]$Json, [string]$Field, [string]$Expected)
    $actual = $Json.$Field
    if ($null -eq $actual) {
        Fail "$Label -- field '$Field' missing from response"
    } elseif ("$actual" -ne $Expected) {
        Fail "$Label -- '$Field' expected '$Expected', got '$actual'"
    } else {
        Pass "$Label -- $Field=$actual"
    }
}

Write-Host ""
Write-Host "-- Caddy / Public Domain Check --" -ForegroundColor Cyan

# ---------------------------------------------------------------------------
# Helper: make a request and check for success (2xx)
# ---------------------------------------------------------------------------
function Test-Endpoint {
    param(
        [string]$Label,
        [string]$Url,
        [hashtable]$Headers = @{},
        [int]$ExpectStatus = 200,
        [switch]$AllowRedirect
    )
    try {
        $params = @{
            Uri            = $Url
            TimeoutSec     = $TimeoutSeconds
            UseBasicParsing = $true
            ErrorAction    = "Stop"
        }
        if ($Headers.Count -gt 0) { $params.Headers = $Headers }
        # MaximumRedirection 0 if we want to catch redirects
        if (-not $AllowRedirect) {
            $params.MaximumRedirection = 5
        }
        $resp = Invoke-WebRequest @params
        $code = [int]$resp.StatusCode
        if ($code -eq $ExpectStatus -or ($code -ge 200 -and $code -lt 400)) {
            Pass "$Label => $code"
            return $true
        } else {
            Fail "$Label => $code (expected $ExpectStatus)"
            return $false
        }
    } catch {
        $errMsg = $_.Exception.Message
        # Check for specific HTTP status in the error
        if ($errMsg -match '(\d{3})') {
            $statusInErr = $Matches[1]
            Fail "$Label => HTTP $statusInErr -- $errMsg"
        } else {
            Fail "$Label => $errMsg"
        }
        return $false
    }
}

# ===========================================================================
# -UseCaddy: localhost:8080 with Host headers
# ===========================================================================
if ($UseCaddy) {
    Write-Host ""
    Write-Host "  --- Caddy Host-Routing (localhost:8080) ---" -ForegroundColor White

    # Frontend: care2connects.org -> Next.js
    Test-Endpoint -Label "Caddy -> Frontend (/onboarding/v2)" `
        -Url "http://localhost:8080/onboarding/v2" `
        -Headers @{ Host = "care2connects.org" } | Out-Null

    # Provider login page
    Test-Endpoint -Label "Caddy -> Provider Login" `
        -Url "http://localhost:8080/provider/login" `
        -Headers @{ Host = "care2connects.org" } | Out-Null

    # API health through Caddy
    Test-Endpoint -Label "Caddy -> API (/health/live)" `
        -Url "http://localhost:8080/health/live" `
        -Headers @{ Host = "api.care2connects.org" } | Out-Null

    # Papi auth through Caddy (should route to frontend -> proxy -> backend)
    # POST without token should return 401 (proves routing works)
    Write-Host ""
    Write-Host "  Papi auth via Caddy (expect 401 = routing works):" -ForegroundColor Gray
    try {
        $papiResp = Invoke-WebRequest -Uri "http://localhost:8080/papi/auth" `
            -Method POST `
            -Headers @{ Host = "care2connects.org" } `
            -ContentType "application/json" `
            -Body '{"token":""}' `
            -TimeoutSec $TimeoutSeconds `
            -UseBasicParsing `
            -ErrorAction Stop
        # If we get 200 with empty token, that's actually suspicious
        $code = [int]$papiResp.StatusCode
        if ($code -eq 200) {
            Fail "Caddy -> Papi auth => 200 with empty token (expected 401)"
        } else {
            Pass "Caddy -> Papi auth => $code"
        }
    } catch {
        $errMsg = $_.Exception.Message
        if ($errMsg -match '401') {
            Pass "Caddy -> Papi auth => 401 (routing + auth working)"
        } elseif ($errMsg -match '(\d{3})') {
            $sc = $Matches[1]
            if ($sc -eq "400" -or $sc -eq "403") {
                Pass "Caddy -> Papi auth => $sc (route reached backend)"
            } else {
                Fail "Caddy -> Papi auth => HTTP $sc"
            }
        } else {
            Fail "Caddy -> Papi auth => $errMsg"
        }
    }
}

# ===========================================================================
# -UsePublic: public domain probes via Cloudflare
# ===========================================================================
if ($UsePublic) {
    Write-Host ""
    Write-Host "  --- Public Domain Probes (care2connects.org) ---" -ForegroundColor White

    # Frontend
    Test-Endpoint -Label "Public -> Frontend (/onboarding/v2)" `
        -Url "https://care2connects.org/onboarding/v2" | Out-Null

    # Provider login
    Test-Endpoint -Label "Public -> Provider Login" `
        -Url "https://care2connects.org/provider/login" | Out-Null

    # API health
    Test-Endpoint -Label "Public -> API (/health/live)" `
        -Url "https://api.care2connects.org/health/live" | Out-Null

    # --- D3: API hostname health checks ---
    Write-Host ""
    Write-Host "  API Hostname Health (api.care2connects.org):" -ForegroundColor Gray

    # /health/live with JSON field assertion
    try {
        $resp = Invoke-WebRequest -Uri "https://api.care2connects.org/health/live" `
            -TimeoutSec $TimeoutSeconds -UseBasicParsing -ErrorAction Stop
        $code = [int]$resp.StatusCode
        if ($code -ne 200) {
            Fail "Public -> /health/live => $code (expected 200)"
        } else {
            Pass "Public -> /health/live => 200"
            try {
                $json = $resp.Content | ConvertFrom-Json -ErrorAction Stop
                Assert-JsonField -Label "Public -> /health/live" -Json $json -Field "service" -Expected "backend"
            } catch {
                Info "Public -> /health/live JSON: could not parse (non-JSON response)"
            }
        }
    } catch {
        Fail "Public -> /health/live => $($_.Exception.Message)"
    }

    # /api/v2/intake/health
    try {
        $resp2 = Invoke-WebRequest -Uri "https://api.care2connects.org/api/v2/intake/health" `
            -TimeoutSec $TimeoutSeconds -UseBasicParsing -ErrorAction Stop
        $code2 = [int]$resp2.StatusCode
        if ($code2 -ne 200) {
            Fail "Public -> /api/v2/intake/health => $code2 (expected 200)"
        } else {
            Pass "Public -> /api/v2/intake/health => 200"
            try {
                $json2 = $resp2.Content | ConvertFrom-Json -ErrorAction Stop
                Assert-JsonField -Label "Public -> /api/v2/intake/health" -Json $json2 -Field "status"   -Expected "healthy"
                Assert-JsonField -Label "Public -> /api/v2/intake/health" -Json $json2 -Field "database" -Expected "connected"
            } catch {
                Info "Public -> /api/v2/intake/health JSON: could not parse"
            }
        }
    } catch {
        Fail "Public -> /api/v2/intake/health => $($_.Exception.Message)"
    }

    # /api/v2/provider/sessions (no cookie) -> expect 401
    try {
        $resp3 = Invoke-WebRequest -Uri "https://api.care2connects.org/api/v2/provider/sessions" `
            -TimeoutSec $TimeoutSeconds -UseBasicParsing -ErrorAction Stop
        $code3 = [int]$resp3.StatusCode
        if ($code3 -eq 200) {
            Fail "Public -> /api/v2/provider/sessions => 200 without auth (expected 401)"
        } else {
            Pass "Public -> /api/v2/provider/sessions => $code3 (expected 401)"
        }
    } catch {
        $errMsg = $_.Exception.Message
        if ($errMsg -match '401') {
            Pass "Public -> /api/v2/provider/sessions => 401 (auth guard working)"
        } elseif ($errMsg -match '(\d{3})') {
            $sc = $Matches[1]
            if ($sc -eq "403") {
                Pass "Public -> /api/v2/provider/sessions => 403 (auth guard working)"
            } else {
                Fail "Public -> /api/v2/provider/sessions => HTTP $sc"
            }
        } else {
            Fail "Public -> /api/v2/provider/sessions => $errMsg"
        }
    }

    # Papi auth (should return 401 with no token)
    Write-Host ""
    Write-Host "  Papi auth via public (expect 401 = routing works):" -ForegroundColor Gray
    try {
        $pubPapi = Invoke-WebRequest -Uri "https://care2connects.org/papi/auth" `
            -Method POST `
            -ContentType "application/json" `
            -Body '{"token":""}' `
            -TimeoutSec $TimeoutSeconds `
            -UseBasicParsing `
            -ErrorAction Stop
        $code = [int]$pubPapi.StatusCode
        if ($code -eq 200) {
            Fail "Public -> Papi auth => 200 with empty token (expected 401)"
        } else {
            Pass "Public -> Papi auth => $code"
        }
    } catch {
        $errMsg = $_.Exception.Message
        if ($errMsg -match '401') {
            Pass "Public -> Papi auth => 401 (routing + auth working)"
        } elseif ($errMsg -match '(\d{3})') {
            $sc = $Matches[1]
            if ($sc -eq "400" -or $sc -eq "403") {
                Pass "Public -> Papi auth => $sc (route reached backend)"
            } else {
                Fail "Public -> Papi auth => HTTP $sc"
            }
        } else {
            Fail "Public -> Papi auth => $errMsg"
        }
    }
}

# ===========================================================================
# Summary
# ===========================================================================
Write-Host ""
if ($Failures.Count -eq 0) {
    $label = @()
    if ($UseCaddy)  { $label += "Caddy" }
    if ($UsePublic) { $label += "Public" }
    Write-Host "  $($label -join ' + ') checks PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host "  Caddy/Public checks FAILED -- $($Failures.Count) issue(s)" -ForegroundColor Red
    foreach ($f in $Failures) { Write-Host "    * $f" -ForegroundColor Red }
    Write-Host ""
    Write-Host "  Remediation:" -ForegroundColor Yellow
    if ($UseCaddy) {
        Write-Host "    - Verify Caddy is running on port 8080" -ForegroundColor Yellow
        Write-Host "    - Check Caddyfile.production host matchers" -ForegroundColor Yellow
    }
    if ($UsePublic) {
        Write-Host "    - Verify cloudflared tunnel is running" -ForegroundColor Yellow
        Write-Host "    - Check DNS records for care2connects.org" -ForegroundColor Yellow
    }
    exit 1
}
