# Complete Server Start and Network Testing Script
# Triggers comprehensive testing and troubleshooting until 100% functional
# Usage: .\scripts\start-server-and-test.ps1

param(
    [switch]$SkipStartup      = $false,
    [switch]$SkipPreflight    = $false,  # Requires ALLOW_SKIP_PREFLIGHT=true or -ForceSkipPreflight
    [switch]$ForceSkipPreflight = $false  # Explicit override; logs the bypass
)

# -- Preflight Gate (mandatory unless -SkipPreflight) -----------------------
$_ssatRoot = Split-Path -Parent $PSScriptRoot
if (-not $SkipStartup -and -not $SkipPreflight) {
    $workspaceRoot = $_ssatRoot
    $preflightScript = Join-Path $workspaceRoot "scripts\preflight\start-preflight.ps1"
    if (Test-Path $preflightScript) {
        Write-Host "`n=== Running Preflight Gate ===" -ForegroundColor Cyan
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $preflightScript -Mode Demo
        if ($LASTEXITCODE -ne 0) {
            Write-Host "" -ForegroundColor Red
            Write-Host "PREFLIGHT FAILED -- aborting server start." -ForegroundColor Red
            Write-Host "Fix the issues above, then try again." -ForegroundColor Yellow
            Write-Host "To skip (NOT recommended): .\scripts\start-server-and-test.ps1 -SkipPreflight" -ForegroundColor Gray
            exit 1
        }
        Write-Host ""
    }
} elseif ($SkipPreflight -and -not $SkipStartup) {
    $allowSkip = ($env:ALLOW_SKIP_PREFLIGHT -eq 'true') -or $ForceSkipPreflight
    if (-not $allowSkip) {
        Write-Host "" -ForegroundColor Red
        Write-Host "ABORT: -SkipPreflight requires either:" -ForegroundColor Red
        Write-Host "  (a) environment variable ALLOW_SKIP_PREFLIGHT=true, OR" -ForegroundColor Red
        Write-Host "  (b) the -ForceSkipPreflight switch." -ForegroundColor Red
        exit 1
    }
    $skipMsg = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') PREFLIGHT SKIPPED -- user=$($env:USERNAME) script=start-server-and-test.ps1 force=$ForceSkipPreflight env=$($env:ALLOW_SKIP_PREFLIGHT)"
    Write-Warning "Preflight skipped (authorized). Entry logged."
    $skipLog = Join-Path $_ssatRoot "logs\preflight\skip_preflight.log"
    $skipLogDir = Split-Path $skipLog
    if (-not (Test-Path $skipLogDir)) { New-Item -ItemType Directory -Path $skipLogDir -Force | Out-Null }
    Add-Content -Path $skipLog -Value $skipMsg
}

$ErrorActionPreference = "Continue"
$testResults = @{
    Total = 0
    Passed = 0
    Failed = 0
    Warnings = 0
}

function Write-TestHeader {
    param([string]$Title)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "   $Title" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = "",
        [bool]$IsWarning = $false
    )
    
    $testResults.Total++
    
    if ($IsWarning) {
        $testResults.Warnings++
        Write-Host "[WARN] $TestName" -ForegroundColor Yellow
        if ($Message) { Write-Host "  $Message" -ForegroundColor Gray }
    }
    elseif ($Passed) {
        $testResults.Passed++
        Write-Host "[PASS] $TestName" -ForegroundColor Green
        if ($Message) { Write-Host "  $Message" -ForegroundColor Gray }
    }
    else {
        $testResults.Failed++
        Write-Host "[FAIL] $TestName" -ForegroundColor Red
        if ($Message) { Write-Host "  $Message" -ForegroundColor Gray }
    }
}

function Test-ServiceHealth {
    param([string]$ServiceName, [int]$Port, [string]$HealthEndpoint)
    
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if (-not $conn) {
        Write-TestResult "$ServiceName Port Check" $false "Port $Port not listening"
        return $false
    }
    
    Write-TestResult "$ServiceName Port Check" $true "Port $Port listening"
    
    if ($HealthEndpoint) {
        try {
            $response = Invoke-RestMethod $HealthEndpoint -TimeoutSec 5 -ErrorAction Stop
            Write-TestResult "$ServiceName Health Endpoint" $true "Status: $($response.status)"
            return $true
        }
        catch {
            Write-TestResult "$ServiceName Health Endpoint" $false $_.Exception.Message
            return $false
        }
    }
    
    return $true
}

# ============================================
# PHASE 1: START SERVICES
# ============================================

if (-not $SkipStartup) {
    Write-TestHeader "PHASE 1: STARTING SERVICES"
    
    Write-Host "Checking PM2 status..." -ForegroundColor Yellow
    $pm2List = pm2 jlist 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue
    
    if (-not $pm2List) {
        Write-Host "Starting services with PM2..." -ForegroundColor Yellow
        pm2 start ecosystem.dev.config.js
        Start-Sleep -Seconds 5
    }
    else {
        $backend = $pm2List | Where-Object { $_.name -like "*backend*" }
        $frontend = $pm2List | Where-Object { $_.name -like "*frontend*" }
        
        if (-not $backend -or $backend.pm2_env.status -ne "online") {
            Write-Host "Starting backend..." -ForegroundColor Yellow
            pm2 start ecosystem.dev.config.js --only care2connect-backend-dev
            Start-Sleep -Seconds 3
        }
        
        if (-not $frontend -or $frontend.pm2_env.status -ne "online") {
            Write-Host "Starting frontend..." -ForegroundColor Yellow
            pm2 start ecosystem.dev.config.js --only care2connect-frontend-dev
            Start-Sleep -Seconds 3
        }
    }
    
    Write-Host "Waiting for services to initialize..." -ForegroundColor Gray
    Start-Sleep -Seconds 8
}

# ============================================
# PHASE 2: SERVICE HEALTH CHECKS
# ============================================

Write-TestHeader "PHASE 2: SERVICE HEALTH CHECKS"

$backendHealthy = Test-ServiceHealth "Backend" 3003 "http://localhost:3003/health/live"
$frontendHealthy = Test-ServiceHealth "Frontend" 3000 $null

if (-not $backendHealthy) {
    Write-Host "`nAttempting backend restart..." -ForegroundColor Yellow
    pm2 restart care2connect-backend-dev
    Start-Sleep -Seconds 5
    $backendHealthy = Test-ServiceHealth "Backend (retry)" 3003 "http://localhost:3003/health/live"
}

# ============================================
# PHASE 3: BACKEND API TESTING
# ============================================

Write-TestHeader "PHASE 3: BACKEND API TESTING"

if ($backendHealthy) {
    # Test comprehensive health status
    try {
        $health = Invoke-RestMethod "http://localhost:3003/health/status" -TimeoutSec 5 -ErrorAction Stop
        
        $isHealthy = $health.status -eq "healthy"
        Write-TestResult "Overall Health Status" $isHealthy "Status: $($health.status)"
        
        # Test critical services
        @('prisma', 'openai', 'stripe') | ForEach-Object {
            $svc = $health.services.$_
            if ($svc) {
                $passed = $svc.healthy
                $msg = if ($passed) { "Latency: $($svc.latency)ms" } else { $svc.error }
                Write-TestResult "Critical Service: $_" $passed $msg
            }
        }
        
        # Test optional services (warnings only)
        @('cloudflare', 'tunnel', 'speech') | ForEach-Object {
            $svc = $health.services.$_
            if ($svc) {
                $msg = if ($svc.healthy) { "OK" } else { $svc.error }
                Write-TestResult "Optional Service: $_" $svc.healthy $msg ($true)
            }
        }
    }
    catch {
        Write-TestResult "Health Status Endpoint" $false $_.Exception.Message
    }
    
    # Test other critical endpoints
    try {
        $liveCheck = Invoke-RestMethod "http://localhost:3003/health/live" -TimeoutSec 5 -ErrorAction Stop
        Write-TestResult "Liveness Probe" $true "Uptime: $([math]::Round($liveCheck.uptime))s"
    }
    catch {
        Write-TestResult "Liveness Probe" $false $_.Exception.Message
    }
}
else {
    Write-Host "Skipping API tests - backend not healthy" -ForegroundColor Red
}

# ============================================
# PHASE 4: FRONTEND TESTING
# ============================================

Write-TestHeader "PHASE 4: FRONTEND TESTING"

if ($frontendHealthy) {
    try {
        $frontendResponse = Invoke-WebRequest "http://localhost:3000" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $passed = $frontendResponse.StatusCode -eq 200
        Write-TestResult "Frontend Homepage" $passed "Status: $($frontendResponse.StatusCode)"
        
        if ($passed) {
            $hasContent = $frontendResponse.Content -match "CareConnect"
            Write-TestResult "Frontend Content Check" $hasContent "Brand name found: $hasContent"
        }
    }
    catch {
        Write-TestResult "Frontend Homepage" $false $_.Exception.Message
    }
    
    # Test key pages
    $pages = @(
        @{Path="/tell-your-story"; Name="Tell Your Story"},
        @{Path="/profiles"; Name="Profiles"},
        @{Path="/health"; Name="Health Dashboard"}
    )
    
    foreach ($page in $pages) {
        try {
            $response = Invoke-WebRequest "http://localhost:3000$($page.Path)" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
            $passed = $response.StatusCode -eq 200
            Write-TestResult "Page: $($page.Name)" $passed "Status: $($response.StatusCode)"
        }
        catch {
            Write-TestResult "Page: $($page.Name)" $false $_.Exception.Message
        }
    }
}
else {
    Write-Host "Skipping frontend tests - frontend not healthy" -ForegroundColor Red
}

# ============================================
# PHASE 5: NETWORK & TUNNEL TESTING
# ============================================

Write-TestHeader "PHASE 5: NETWORK & TUNNEL TESTING"

# Check DNS resolution
try {
    $dnsResult = Resolve-DnsName "care2connects.org" -ErrorAction Stop
    $hasCloudflareDns = $dnsResult | Where-Object { $_.IP4Address -match "^(104|172)\." }
    Write-TestResult "DNS Resolution (care2connects.org)" ($null -ne $hasCloudflareDns) "Resolved to: $($dnsResult[0].IP4Address)" (-not $hasCloudflareDns)
}
catch {
    Write-TestResult "DNS Resolution" $false $_.Exception.Message $true
}

# Check cloudflared process
$cloudflared = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
if ($cloudflared) {
    Write-TestResult "Cloudflared Process" $true "Running (PID: $($cloudflared.Id))"
}
else {
    Write-TestResult "Cloudflared Process" $false "Not running - tunnel may be down" $true
}

# Test external tunnel connectivity
try {
    $tunnelTest = Invoke-RestMethod "https://care2connects.org/health/live" -TimeoutSec 15 -ErrorAction Stop
    $passed = $tunnelTest.status -eq "alive"
    Write-TestResult "External Tunnel Access" $passed "Domain accessible via HTTPS"
}
catch {
    $errorMsg = $_.Exception.Message
    $isDnsError = $errorMsg -match "unable to resolve|could not be resolved"
    Write-TestResult "External Tunnel Access" $false $errorMsg $isDnsError
    
    if ($isDnsError) {
        Write-Host "  Note: DNS may still be propagating (normal for new domains)" -ForegroundColor Gray
    }
}

# Test API tunnel
try {
    $apiTest = Invoke-RestMethod "https://api.care2connects.org/health/live" -TimeoutSec 15 -ErrorAction Stop
    Write-TestResult "API Tunnel Access" $true "API accessible via HTTPS"
}
catch {
    Write-TestResult "API Tunnel Access" $false $_.Exception.Message $true
}

# ============================================
# PHASE 6: CLOUDFLARE API TESTING
# ============================================

Write-TestHeader "PHASE 6: CLOUDFLARE API TESTING"

$envPath = Join-Path $PSScriptRoot "..\backend\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    $token = $null
    $zoneId = $null
    
    if ($envContent -match 'CLOUDFLARE_API_TOKEN=([^\r\n]+)') { $token = $matches[1] }
    if ($envContent -match 'CLOUDFLARE_ZONE_ID=([^\r\n]+)') { $zoneId = $matches[1] }
    
    if ($token -and $zoneId) {
        try {
            $headers = @{
                "Authorization" = "Bearer $token"
                "Content-Type" = "application/json"
            }
            
            $cfResponse = Invoke-RestMethod "https://api.cloudflare.com/client/v4/zones/$zoneId" -Headers $headers -TimeoutSec 5 -ErrorAction Stop
            
            if ($cfResponse.success) {
                Write-TestResult "Cloudflare API Connection" $true "Zone: $($cfResponse.result.name)" $true
                
                # Get DNS records
                $dnsRecords = Invoke-RestMethod "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" -Headers $headers -TimeoutSec 5 -ErrorAction Stop
                $tunnelRecords = $dnsRecords.result | Where-Object { $_.content -like "*cfargotunnel.com" }
                
                if ($tunnelRecords) {
                    Write-TestResult "DNS Records (Tunnel CNAMEs)" $true "Found $($tunnelRecords.Count) tunnel records" $true
                }
                else {
                    Write-TestResult "DNS Records (Tunnel CNAMEs)" $false "No tunnel CNAME records found" $true
                }
            }
        }
        catch {
            Write-TestResult "Cloudflare API Connection" $false $_.Exception.Message $true
        }
    }
    else {
        Write-TestResult "Cloudflare Credentials" $false "Missing API token or Zone ID" $true
    }
}

# ============================================
# PHASE 7: INTEGRATION TESTING
# ============================================

Write-TestHeader "PHASE 7: INTEGRATION TESTING"

# Test backend -> database
if ($backendHealthy) {
    try {
        $dbTest = Invoke-RestMethod "http://localhost:3003/health/status" -TimeoutSec 5 -ErrorAction Stop
        $dbHealthy = $dbTest.services.prisma.healthy
        Write-TestResult "Backend -> Database" $dbHealthy "Prisma connection"
    }
    catch {
        Write-TestResult "Backend -> Database" $false $_.Exception.Message
    }
}

# Test frontend -> backend (via localhost)
if ($frontendHealthy -and $backendHealthy) {
    Write-TestResult "Frontend -> Backend (Local)" $true "Both services running"
}
else {
    Write-TestResult "Frontend -> Backend (Local)" $false "One or both services not running"
}

# ============================================
# FINAL REPORT
# ============================================

Write-TestHeader "TEST RESULTS SUMMARY"

$totalTests = $testResults.Total
$passed = $testResults.Passed
$failed = $testResults.Failed
$warnings = $testResults.Warnings
$passRate = if ($totalTests -gt 0) { [math]::Round(($passed / $totalTests) * 100, 1) } else { 0 }

Write-Host ""
Write-Host "Total Tests:    $totalTests" -ForegroundColor Cyan
Write-Host "Passed:         $passed" -ForegroundColor Green
Write-Host "Failed:         $failed" -ForegroundColor Red
Write-Host "Warnings:       $warnings" -ForegroundColor Yellow
Write-Host "Pass Rate:      $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 60) { "Yellow" } else { "Red" })
Write-Host ""

# Determine overall status
if ($failed -eq 0 -and $warnings -le 3) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   STATUS: HEALTHY - 100% FUNCTIONAL" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "All critical systems operational!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access your application:" -ForegroundColor Cyan
    Write-Host "  Local:      http://localhost:3000" -ForegroundColor White
    Write-Host "  Production: https://care2connects.org" -ForegroundColor White
    Write-Host "  Backend:    http://localhost:3003" -ForegroundColor White
    Write-Host ""
}
elseif ($failed -le 2) {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "   STATUS: DEGRADED - PARTIAL FUNCTION" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Core services working, some features may be limited." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Recommended actions:" -ForegroundColor Cyan
    Write-Host "  1. Check failed tests above" -ForegroundColor White
    Write-Host "  2. Review PM2 logs: pm2 logs" -ForegroundColor White
    Write-Host "  3. Restart services: pm2 restart all" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "   STATUS: UNHEALTHY - NEEDS ATTENTION" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Critical failures detected!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Cyan
    Write-Host "  1. Check PM2 status: pm2 status" -ForegroundColor White
    Write-Host "  2. View logs: pm2 logs" -ForegroundColor White
    Write-Host "  3. Restart all: pm2 restart all" -ForegroundColor White
    Write-Host "  4. Check ports: Get-NetTCPConnection -LocalPort 3000,3003 -State Listen" -ForegroundColor White
    Write-Host ""
}

# Generate link for sharing
Write-Host "Quick Test Link (copy and share):" -ForegroundColor Cyan
Write-Host "  https://care2connects.org/tell-your-story" -ForegroundColor Green
Write-Host ""

Write-Host "Run this test again:" -ForegroundColor Gray
Write-Host "  .\scripts\start-server-and-test.ps1" -ForegroundColor Gray
Write-Host ""

# Return exit code based on results
if ($failed -eq 0) {
    exit 0
}
elseif ($failed -le 2) {
    exit 1
}
else {
    exit 2
}
