<#
.SYNOPSIS
    Phase 10 Provider Dashboard Smoke Test — Production Evidence
.DESCRIPTION
    End-to-end provider dashboard verification: access control, cookie auth,
    session listing, session detail, privacy headers, and logout flow.

    All evidence is collected and written to out/phase10/<timestamp>/.
.PARAMETER ApiBase
    Production API base URL (default: https://api.care2connects.org)
.PARAMETER Token
    Provider dashboard token. Falls back to PROVIDER_DASHBOARD_TOKEN env var.
.PARAMETER ThrottleMs
    Milliseconds between requests (default: 600)
.EXAMPLE
    .\test-provider-dashboard-prod.ps1
    .\test-provider-dashboard-prod.ps1 -ApiBase "http://localhost:3001"
#>

param(
    [string]$ApiBase = "https://api.care2connects.org",
    [string]$Token = $env:PROVIDER_DASHBOARD_TOKEN,
    [int]$ThrottleMs = 600
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# ── Output setup ────────────────────────────────────────────────

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outDir = Join-Path $PSScriptRoot "..\..\out\phase10\$timestamp"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$evidence = @{
    testSuite = "Phase10-ProviderDashboard"
    timestamp = (Get-Date -Format "o")
    apiBase = $ApiBase
    assertions = @()
    headerChecks = @()
}

# ── Helpers ─────────────────────────────────────────────────────

function Add-Assertion {
    param([string]$Id, [string]$Name, [string]$Status, [string]$Detail = "", $ResponseSnippet = $null)
    $a = @{
        id = $Id
        name = $Name
        status = $Status
        detail = $Detail
        time = (Get-Date -Format "o")
    }
    if ($ResponseSnippet) { $a.responseSnippet = $ResponseSnippet }
    $evidence.assertions += $a
    $color = switch ($Status) { "PASS" { "Green" } "FAIL" { "Red" } "WARN" { "Yellow" } default { "White" } }
    Write-Host "  [$Status] $Name $(if ($Detail) { "- $Detail" })" -ForegroundColor $color
}

function Check-PrivacyHeaders {
    param([object]$Headers, [string]$Endpoint)
    $checks = @()

    # Helper: case-insensitive header lookup
    function Get-HeaderValue($hdrs, [string]$name) {
        # Try exact match first
        if ($hdrs.ContainsKey($name)) { return $hdrs[$name] }
        # Try case-insensitive match
        $lowerName = $name.ToLower()
        foreach ($key in $hdrs.Keys) {
            if ($key.ToLower() -eq $lowerName) { return $hdrs[$key] }
        }
        return $null
    }

    # Cache-Control
    $cc = Get-HeaderValue $Headers "Cache-Control"
    if ($cc -and $cc -match "no-store") {
        $checks += @{ header = "Cache-Control"; value = $cc; pass = $true }
    } else {
        $checks += @{ header = "Cache-Control"; value = $cc; pass = $false }
        Add-Assertion "HDR-CC-$Endpoint" "Cache-Control: no-store on $Endpoint" "FAIL" "Got: $cc"
    }

    # X-Robots-Tag
    $xr = Get-HeaderValue $Headers "X-Robots-Tag"
    if ($xr -and $xr -match "noindex") {
        $checks += @{ header = "X-Robots-Tag"; value = $xr; pass = $true }
    } else {
        $checks += @{ header = "X-Robots-Tag"; value = $xr; pass = $false }
        Add-Assertion "HDR-XR-$Endpoint" "X-Robots-Tag: noindex on $Endpoint" "FAIL" "Got: $xr"
    }

    # Referrer-Policy
    $rp = Get-HeaderValue $Headers "Referrer-Policy"
    if ($rp -and $rp -match "no-referrer") {
        $checks += @{ header = "Referrer-Policy"; value = $rp; pass = $true }
    } else {
        $checks += @{ header = "Referrer-Policy"; value = $rp; pass = $false }
        Add-Assertion "HDR-RP-$Endpoint" "Referrer-Policy: no-referrer on $Endpoint" "FAIL" "Got: $rp"
    }

    $allPass = @($checks | Where-Object { -not $_.pass }).Count -eq 0
    if ($allPass) {
        Add-Assertion "HDR-$Endpoint" "Privacy headers on $Endpoint" "PASS"
    }

    $evidence.headerChecks += @{ endpoint = $Endpoint; checks = $checks }
    return $allPass
}

function Invoke-ApiThrottled {
    param(
        [string]$Uri,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [Microsoft.PowerShell.Commands.WebRequestSession]$WebSession = $null,
        [switch]$AllowError,
        [int]$MaxRetries = 3
    )
    Start-Sleep -Milliseconds $ThrottleMs

    $params = @{
        Uri = $Uri
        Method = $Method
        Headers = $Headers
        UseBasicParsing = $true
        TimeoutSec = 60
    }
    if ($Body) {
        $params.Body = $Body
        $params.ContentType = "application/json"
    }
    if ($WebSession) {
        $params.WebSession = $WebSession
    }

    for ($retry = 0; $retry -lt $MaxRetries; $retry++) {
        try {
            return Invoke-WebRequest @params -ErrorAction Stop
        } catch {
            $statusCode = 0
            try {
                $base = $_.Exception.GetBaseException()
                if ($base -and $base.PSObject.Properties['Response'] -and $base.Response) {
                    $statusCode = [int]$base.Response.StatusCode
                }
            } catch {}
            if ($statusCode -eq 429) {
                $backoff = [Math]::Min(5 * [Math]::Pow(2, $retry), 120)
                Write-Host "    429 rate-limited, backing off ${backoff}s..." -ForegroundColor Yellow
                Start-Sleep -Seconds $backoff
                continue
            }
            if ($AllowError) {
                return @{
                    StatusCode = $statusCode
                    Content = ""
                    Headers = @{}
                    Exception = $_.Exception
                }
            }
            throw
        }
    }
    throw "Max retries exceeded"
}

function Redact-TokensInJson {
    param([string]$Json)
    $Json = $Json -replace '"token"\s*:\s*"[^"]*"', '"token":"[REDACTED]"'
    $Json = $Json -replace 'provider_token=[^;"]*', 'provider_token=[REDACTED]'
    $Json = $Json -replace '"c2c_provider_auth=[^"]*"', '"c2c_provider_auth=[REDACTED]"'
    $Json = $Json -replace '"cookie"\s*:\s*"[^"]*"', '"cookie":"[REDACTED]"'
    return $Json
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Phase 10 Provider Dashboard Smoke Test" -ForegroundColor Cyan
Write-Host "  Target: $ApiBase" -ForegroundColor Cyan
Write-Host "  Time:   $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if (-not $Token) {
    Write-Error "No provider token. Set PROVIDER_DASHBOARD_TOKEN env var or pass -Token."
    exit 1
}

# ══════════════════════════════════════════════════════════════
# TEST 1: Access control — unauthenticated requests must be 401
# ══════════════════════════════════════════════════════════════

Write-Host "[1/7] Testing unauthenticated access control..." -ForegroundColor Yellow

try {
    $resp = Invoke-WebRequest -Uri "$ApiBase/api/v2/provider/sessions" -Method GET `
        -Headers @{ "Content-Type" = "application/json" } `
        -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
    $code = [int]$resp.StatusCode

    if ($code -eq 401) {
        Add-Assertion "P1" "Unauthenticated GET /sessions -> 401" "PASS"
    } elseif ($code -eq 200) {
        Add-Assertion "P1" "SECURITY FAILURE: /sessions returns 200 without auth" "FAIL" "STOP CONDITION"
        $evidence | ConvertTo-Json -Depth 10 | Out-File (Join-Path $outDir "provider-smoke.json") -Encoding utf8
        Write-Error "STOP: Provider endpoints accessible without authentication!"
        exit 1
    } else {
        Add-Assertion "P1" "Unauthenticated access" "WARN" "Expected 401, got $code"
    }
} catch {
    # PS5.1: HTTP 4xx/5xx thrown as WebException
    $statusCode = 0
    try {
        $exResp = $_.Exception.GetBaseException()
        if ($exResp -and $exResp.PSObject.Properties['Response'] -and $exResp.Response) {
            $statusCode = [int]$exResp.Response.StatusCode
        }
    } catch {}
    if ($statusCode -eq 0) {
        try {
            # Try the inner exception pattern
            $inner = $_.Exception.InnerException
            if ($inner -and $inner.PSObject.Properties['Response'] -and $inner.Response) {
                $statusCode = [int]$inner.Response.StatusCode
            }
        } catch {}
    }
    if ($statusCode -eq 401) {
        Add-Assertion "P1" "Unauthenticated GET /sessions -> 401" "PASS"
    } elseif ($statusCode -gt 0) {
        Add-Assertion "P1" "Unauthenticated access" "WARN" "Expected 401, got $statusCode"
    } else {
        Add-Assertion "P1" "Unauthenticated access check" "WARN" "Error: $($_.Exception.Message)"
    }
}

# ══════════════════════════════════════════════════════════════
# TEST 2: Provider authentication (cookie-based)
# ══════════════════════════════════════════════════════════════

Write-Host "[2/7] Testing provider authentication..." -ForegroundColor Yellow

$providerSession = $null

try {
    $loginBody = @{ token = $Token } | ConvertTo-Json
    $loginResp = Invoke-WebRequest -Uri "$ApiBase/api/v2/provider/auth" `
        -Method POST -Body $loginBody -ContentType "application/json" `
        -UseBasicParsing -TimeoutSec 30 -SessionVariable provSession

    if ($loginResp.StatusCode -eq 200) {
        $loginData = $loginResp.Content | ConvertFrom-Json
        if ($loginData.success -eq $true) {
            Add-Assertion "P2" "Provider login -> 200, success:true" "PASS"
        } else {
            Add-Assertion "P2" "Provider login response" "FAIL" "success != true"
        }
        $providerSession = $provSession
    } else {
        Add-Assertion "P2" "Provider login" "FAIL" "status=$($loginResp.StatusCode)"
    }

    # Verify Set-Cookie header
    $setCookie = $null
    if ($loginResp.Headers.ContainsKey("Set-Cookie")) {
        $setCookie = $loginResp.Headers["Set-Cookie"]
    }
    if ($setCookie -and $setCookie -match "c2c_provider_auth") {
        Add-Assertion "P2a" "Set-Cookie contains c2c_provider_auth" "PASS"

        # Check httpOnly
        if ($setCookie -match "(?i)httponly") {
            Add-Assertion "P2b" "Cookie is httpOnly" "PASS"
        } else {
            Add-Assertion "P2b" "Cookie httpOnly flag" "WARN" "httpOnly not detected in Set-Cookie"
        }
    } else {
        Add-Assertion "P2a" "Set-Cookie header" "WARN" "c2c_provider_auth cookie not found in response headers"
    }

    # Save evidence (redacted)
    $loginEvidence = @{
        statusCode = $loginResp.StatusCode
        hasCookie = ($setCookie -ne $null)
        cookieFlags = if ($setCookie) { ($setCookie -replace 'c2c_provider_auth=[^;]*', 'c2c_provider_auth=[REDACTED]') } else { $null }
    }
    $loginEvidence | ConvertTo-Json -Depth 5 | Out-File (Join-Path $outDir "provider-login-evidence.json") -Encoding utf8

} catch {
    Add-Assertion "P2" "Provider login" "FAIL" $_.Exception.Message
}

# ══════════════════════════════════════════════════════════════
# TEST 3: List sessions (authenticated)
# ══════════════════════════════════════════════════════════════

Write-Host "[3/7] Testing session listing..." -ForegroundColor Yellow

$testSessionId = $null

if ($providerSession) {
    try {
        $resp = Invoke-ApiThrottled -Uri "$ApiBase/api/v2/provider/sessions?status=COMPLETED&limit=10" `
            -Method GET -WebSession $providerSession
        $listData = $resp.Content | ConvertFrom-Json

        if ($resp.StatusCode -eq 200 -and $listData.sessions) {
            $count = $listData.sessions.Count
            Add-Assertion "P3" "GET /sessions -> 200, sessions returned" "PASS" "count=$count"

            if ($count -gt 0) {
                $testSessionId = $listData.sessions[0].sessionId
                if (-not $testSessionId) {
                    $testSessionId = $listData.sessions[0].id
                }
                Add-Assertion "P3a" "Session data available for detail test" "PASS" "sessionId=$testSessionId"
            }

            # Check that response doesn't include raw modules
            $listJson = $resp.Content
            if ($listJson -notmatch '"modules"\s*:\s*\{') {
                Add-Assertion "P3b" "Session list excludes raw modules" "PASS"
            } else {
                Add-Assertion "P3b" "Raw modules in list" "FAIL" "modules payload found in response"
            }

            # Save evidence
            $resp.Content | Out-File (Join-Path $outDir "provider-sessions-list.json") -Encoding utf8
        } else {
            Add-Assertion "P3" "Session listing" "FAIL" "status=$($resp.StatusCode)"
        }

        # Check privacy headers
        Check-PrivacyHeaders -Headers $resp.Headers -Endpoint "sessions-list"

    } catch {
        Add-Assertion "P3" "Session listing" "FAIL" $_.Exception.Message
    }
} else {
    Add-Assertion "P3" "Session listing" "WARN" "Skipped - no auth session"
}

# ══════════════════════════════════════════════════════════════
# TEST 4: Session detail (authenticated)
# ══════════════════════════════════════════════════════════════

Write-Host "[4/7] Testing session detail..." -ForegroundColor Yellow

if ($providerSession -and $testSessionId) {
    try {
        $resp = Invoke-ApiThrottled -Uri "$ApiBase/api/v2/provider/session/$testSessionId" `
            -Method GET -WebSession $providerSession
        $detailData = $resp.Content | ConvertFrom-Json

        if ($resp.StatusCode -eq 200) {
            Add-Assertion "P4" "GET /session/:id -> 200" "PASS"

            # Check required fields: profile, topFactors, auditEvents/auditCount
            $detailJson = $resp.Content
            $hasProfile = $detailJson -match '"profile"'
            $hasTopFactors = $detailJson -match '"topFactors"'
            $hasAudit = ($detailJson -match '"auditEvents"') -or ($detailJson -match '"auditCount"')

            if ($hasProfile) {
                Add-Assertion "P4a" "Detail includes profile" "PASS"
            } else {
                Add-Assertion "P4a" "Profile in detail" "FAIL"
            }
            if ($hasTopFactors) {
                Add-Assertion "P4b" "Detail includes topFactors" "PASS"
            } else {
                Add-Assertion "P4b" "topFactors in detail" "WARN"
            }
            if ($hasAudit) {
                Add-Assertion "P4c" "Detail includes audit data" "PASS"
            } else {
                Add-Assertion "P4c" "Audit in detail" "WARN"
            }

            # Check that response does NOT include raw modules or PII
            if ($detailJson -notmatch '"modules"\s*:\s*\{') {
                Add-Assertion "P4d" "Detail excludes raw modules" "PASS"
            } else {
                Add-Assertion "P4d" "Raw modules in detail" "FAIL"
            }

            # Save evidence
            $resp.Content | Out-File (Join-Path $outDir "provider-session-detail.json") -Encoding utf8
        } else {
            Add-Assertion "P4" "Session detail" "FAIL" "status=$($resp.StatusCode)"
        }

        # Check privacy headers
        Check-PrivacyHeaders -Headers $resp.Headers -Endpoint "session-detail"

    } catch {
        Add-Assertion "P4" "Session detail" "FAIL" $_.Exception.Message
    }
} else {
    Add-Assertion "P4" "Session detail" "WARN" "Skipped - no auth or no session"
}

# ══════════════════════════════════════════════════════════════
# TEST 5: Privacy headers on all provider responses
# ══════════════════════════════════════════════════════════════

Write-Host "[5/7] Verifying privacy headers..." -ForegroundColor Yellow

$headerResults = $evidence.headerChecks
$allHeadersPass = @($headerResults | ForEach-Object { $_.checks } | Where-Object { -not $_.pass }).Count -eq 0

if ($allHeadersPass -and @($headerResults).Count -gt 0) {
    Add-Assertion "P5" "All privacy headers verified (Cache-Control, X-Robots-Tag, Referrer-Policy)" "PASS"
} elseif (@($headerResults).Count -eq 0) {
    Add-Assertion "P5" "Privacy headers" "WARN" "No header checks performed (earlier failures)"
} else {
    Add-Assertion "P5" "Some privacy headers missing" "FAIL" "See individual header checks above"
}

# ══════════════════════════════════════════════════════════════
# TEST 6: Provider logout
# ══════════════════════════════════════════════════════════════

Write-Host "[6/7] Testing provider logout..." -ForegroundColor Yellow

if ($providerSession) {
    try {
        $resp = Invoke-ApiThrottled -Uri "$ApiBase/api/v2/provider/logout" `
            -Method POST -Body "{}" -WebSession $providerSession `
            -Headers @{ "Content-Type" = "application/json" }

        if ($resp.StatusCode -eq 200) {
            $logoutData = $resp.Content | ConvertFrom-Json
            if ($logoutData.success -eq $true) {
                Add-Assertion "P6" "Logout -> 200, success:true" "PASS"
            } else {
                Add-Assertion "P6" "Logout response" "WARN" "success != true but 200"
            }
        } else {
            Add-Assertion "P6" "Logout" "FAIL" "status=$($resp.StatusCode)"
        }

        # Verify cookie cleared
        $setCookie = $null
        if ($resp.Headers.ContainsKey("Set-Cookie")) {
            $setCookie = $resp.Headers["Set-Cookie"]
        }
        if ($setCookie -and ($setCookie -match "Max-Age=0" -or $setCookie -match "expires=.*1970")) {
            Add-Assertion "P6a" "Cookie cleared on logout" "PASS"
        } else {
            Add-Assertion "P6a" "Cookie cleared" "WARN" "Could not verify cookie expiry"
        }
    } catch {
        Add-Assertion "P6" "Logout" "FAIL" $_.Exception.Message
    }
} else {
    Add-Assertion "P6" "Logout" "WARN" "Skipped - no auth session"
}

# ══════════════════════════════════════════════════════════════
# TEST 7: Post-logout access should be 401
# ══════════════════════════════════════════════════════════════

Write-Host "[7/7] Testing post-logout access control..." -ForegroundColor Yellow

if ($providerSession) {
    try {
        $resp = Invoke-ApiThrottled -Uri "$ApiBase/api/v2/provider/sessions" `
            -Method GET -WebSession $providerSession -AllowError

        $code = $resp.StatusCode
        if ($code -eq 401) {
            Add-Assertion "P7" "Post-logout GET /sessions -> 401" "PASS"
        } elseif ($code -eq 200) {
            Add-Assertion "P7" "SECURITY: Post-logout still returns 200" "FAIL" "Session not properly invalidated"
        } else {
            Add-Assertion "P7" "Post-logout access" "WARN" "Expected 401, got $code"
        }
    } catch {
        $statusCode = 0
        try {
            $exResp = $_.Exception.GetBaseException()
            if ($exResp -and $exResp.PSObject.Properties['Response'] -and $exResp.Response) {
                $statusCode = [int]$exResp.Response.StatusCode
            }
        } catch {}
        if ($statusCode -eq 401) {
            Add-Assertion "P7" "Post-logout GET /sessions -> 401" "PASS"
        } else {
            Add-Assertion "P7" "Post-logout check" "WARN" "Error: $($_.Exception.Message)"
        }
    }
} else {
    Add-Assertion "P7" "Post-logout check" "WARN" "Skipped - no auth session"
}

# ══════════════════════════════════════════════════════════════
# SUMMARY
# ══════════════════════════════════════════════════════════════

$passed = @($evidence.assertions | Where-Object { $_.status -eq "PASS" }).Count
$failed = @($evidence.assertions | Where-Object { $_.status -eq "FAIL" }).Count
$warned = @($evidence.assertions | Where-Object { $_.status -eq "WARN" }).Count

$evidence.summary = @{
    passed = $passed
    failed = $failed
    warnings = $warned
    total = @($evidence.assertions).Count
    verdict = if ($failed -eq 0) { "PASS" } else { "FAIL" }
}

# Write evidence
$evidenceJson = Redact-TokensInJson ($evidence | ConvertTo-Json -Depth 10)
$evidenceJson | Out-File (Join-Path $outDir "provider-smoke.json") -Encoding utf8

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Provider Dashboard Smoke Test Results" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Passed:   $passed" -ForegroundColor Green
Write-Host "  Failed:   $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "  Warnings: $warned" -ForegroundColor $(if ($warned -gt 0) { "Yellow" } else { "Green" })
Write-Host "  Evidence: $outDir"
Write-Host ""

if ($failed -gt 0) {
    Write-Host "PROVIDER SMOKE TEST FAILED" -ForegroundColor Red
    exit 1
} else {
    Write-Host "PROVIDER SMOKE TEST PASSED" -ForegroundColor Green
    exit 0
}
