#Requires -Version 5.1
<#
.SYNOPSIS
    Provider dashboard auth round-trip check.

.DESCRIPTION
    Verifies the full provider authentication flow works end-to-end:
      1. POST /papi/auth with the provider token -> expect 200 + Set-Cookie
      2. GET /papi/sessions?limit=1 using that cookie -> expect 200 + sessions[]

    Detects proxy, cookie relay, and backend auth issues before manual testing.

    Token is resolved in order of preference (never printed to output):
      1. PROVIDER_DASHBOARD_TOKEN from backend/.env
      2. NEXT_PUBLIC_PROVIDER_DASHBOARD_TOKEN from frontend/.env.local
      3. Either variable from process environment

.PARAMETER TimeoutSeconds
    HTTP request timeout (default: 10).

.PARAMETER FrontendPort
    Frontend port (default: 3000).

.OUTPUTS
    Exit 0 -- auth round-trip succeeded
    Exit 1 -- auth round-trip failed
#>
param(
    [int]$TimeoutSeconds = 10,
    [int]$FrontendPort = 3000
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
Write-Host "-- Provider Auth Round-Trip --" -ForegroundColor Cyan

# ---- Step 0: Read token (prefer PROVIDER_DASHBOARD_TOKEN, fallback NEXT_PUBLIC) ----
$token = $null
$tokenSource = $null
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

# 1. Try PROVIDER_DASHBOARD_TOKEN from backend/.env
$backendEnv = Join-Path $Root "backend\.env"
if (Test-Path $backendEnv) {
    $lines = Get-Content $backendEnv -ErrorAction SilentlyContinue
    foreach ($line in $lines) {
        if ($line -match '^\s*PROVIDER_DASHBOARD_TOKEN\s*=\s*(.+)$') {
            $token = $Matches[1].Trim()
            $tokenSource = "backend/.env (PROVIDER_DASHBOARD_TOKEN)"
            break
        }
    }
}

# 2. Fallback: NEXT_PUBLIC_PROVIDER_DASHBOARD_TOKEN from frontend/.env.local
if (-not $token) {
    $envFile = Join-Path $Root "frontend\.env.local"
    if (Test-Path $envFile) {
        $lines = Get-Content $envFile -ErrorAction SilentlyContinue
        foreach ($line in $lines) {
            if ($line -match '^\s*NEXT_PUBLIC_PROVIDER_DASHBOARD_TOKEN\s*=\s*(.+)$') {
                $token = $Matches[1].Trim()
                $tokenSource = "frontend/.env.local (NEXT_PUBLIC_PROVIDER_DASHBOARD_TOKEN)"
                break
            }
        }
    }
}

# 3. Fallback: process environment
if (-not $token) {
    $token = $env:PROVIDER_DASHBOARD_TOKEN
    if ($token) { $tokenSource = "env:PROVIDER_DASHBOARD_TOKEN" }
}
if (-not $token) {
    $token = $env:NEXT_PUBLIC_PROVIDER_DASHBOARD_TOKEN
    if ($token) { $tokenSource = "env:NEXT_PUBLIC_PROVIDER_DASHBOARD_TOKEN" }
}

if (-not $token) {
    Fail "Cannot find provider token in backend/.env, frontend/.env.local, or environment."
    Write-Host ""
    exit 1
}

Info "Token found via $tokenSource (not printed for security)"

# ---- Step 1: POST /papi/auth with token -----------------------------------
Write-Host ""
Write-Host "  Step 1: POST /papi/auth" -ForegroundColor White

$authUrl = "http://localhost:$FrontendPort/papi/auth"
$authBody = "{`"token`":`"$token`"}"
$authCookie = $null

try {
    $authResp = Invoke-WebRequest -Uri $authUrl `
        -Method POST `
        -Body $authBody `
        -ContentType "application/json" `
        -TimeoutSec $TimeoutSeconds `
        -UseBasicParsing `
        -ErrorAction Stop

    $authCode = [int]$authResp.StatusCode

    if ($authCode -eq 200) {
        Pass "POST /papi/auth => 200"
    } else {
        Fail "POST /papi/auth => $authCode (expected 200)"
    }

    # Extract Set-Cookie header
    $setCookieRaw = $null
    if ($authResp.Headers -and $authResp.Headers.ContainsKey("Set-Cookie")) {
        $setCookieRaw = $authResp.Headers["Set-Cookie"]
    }

    if ($setCookieRaw) {
        Pass "Set-Cookie header present"

        # Parse the c2c_provider_auth cookie value
        # Set-Cookie may be a string or array
        $cookieStr = if ($setCookieRaw -is [array]) { $setCookieRaw -join "; " } else { [string]$setCookieRaw }

        if ($cookieStr -match 'c2c_provider_auth=([^;]+)') {
            $authCookie = $Matches[1]
            Info "Cookie c2c_provider_auth captured (value hidden)"
        } else {
            Fail "Set-Cookie present but no c2c_provider_auth cookie found"
            Info "  Raw: $($cookieStr.Substring(0, [Math]::Min(80, $cookieStr.Length)))..."
        }
    } else {
        Fail "No Set-Cookie header in auth response -- cookie relay broken"
    }
} catch {
    Fail "POST /papi/auth exception: $($_.Exception.Message)"
}

# ---- Step 2: GET /papi/sessions?limit=1 using cookie ----------------------
if ($authCookie) {
    Write-Host ""
    Write-Host "  Step 2: GET /papi/sessions?limit=1 (with cookie)" -ForegroundColor White

    $sessUrl = "http://localhost:$FrontendPort/papi/sessions?limit=1"
    try {
        # PS 5.1: Cookie header cannot be set via -Headers; use CookieContainer + WebSession
        $cookieJar = New-Object System.Net.CookieContainer
        $cookieJar.Add([System.Uri]("http://localhost:$FrontendPort/"), `
            (New-Object System.Net.Cookie("c2c_provider_auth", $authCookie, "/", "localhost")))
        $ws = New-Object Microsoft.PowerShell.Commands.WebRequestSession
        $ws.Cookies = $cookieJar

        $sessResp = Invoke-WebRequest -Uri $sessUrl `
            -Method GET `
            -WebSession $ws `
            -TimeoutSec $TimeoutSeconds `
            -UseBasicParsing `
            -ErrorAction Stop

        $sessCode = [int]$sessResp.StatusCode
        if ($sessCode -eq 200) {
            Pass "GET /papi/sessions?limit=1 => 200"
        } else {
            Fail "GET /papi/sessions?limit=1 => $sessCode (expected 200)"
        }

        # Verify response has sessions array
        try {
            $body = $sessResp.Content | ConvertFrom-Json
            if ($null -ne $body.sessions) {
                Pass "Response contains sessions[] (count: $($body.sessions.Count))"
            } elseif ($null -ne $body) {
                # Maybe the response IS the array, or wrapped differently
                $isArray = $body -is [array]
                if ($isArray) {
                    Pass "Response is sessions array (count: $($body.Count))"
                } else {
                    Fail "Response 200 but no 'sessions' key found in body"
                    Info "  Keys: $($body.PSObject.Properties.Name -join ', ')"
                }
            }
        } catch {
            Fail "Could not parse sessions response as JSON: $($_.Exception.Message)"
        }
    } catch {
        $errMsg = $_.Exception.Message
        # Check if it's a 401 (cookie not relayed properly)
        if ($errMsg -match "401") {
            Fail "GET /papi/sessions => 401 -- cookie not relayed through proxy"
        } else {
            Fail "GET /papi/sessions exception: $errMsg"
        }
    }
} else {
    Write-Host ""
    Write-Host "  Step 2: SKIPPED (no auth cookie obtained)" -ForegroundColor Yellow
}

# ---- Summary --------------------------------------------------------------
Write-Host ""
if ($Failures.Count -eq 0) {
    Write-Host "  Provider auth round-trip PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host "  Provider auth round-trip FAILED -- $($Failures.Count) issue(s)" -ForegroundColor Red
    foreach ($f in $Failures) { Write-Host "    * $f" -ForegroundColor Red }
    Write-Host ""
    Write-Host "  Remediation:" -ForegroundColor Yellow
    Write-Host "    - Verify backend is running: http://localhost:3001/health/live" -ForegroundColor Yellow
    Write-Host "    - Verify PROVIDER_DASHBOARD_TOKEN is set in backend .env" -ForegroundColor Yellow
    Write-Host "    - Verify papi proxy relays cookies (check /papi/[...path]/route.ts)" -ForegroundColor Yellow
    exit 1
}
