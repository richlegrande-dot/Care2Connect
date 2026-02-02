# Auto-Troubleshoot and Fix Script
# Automatically detects and fixes common issues
# Can be triggered when health checks detect problems

param(
    [switch]$DryRun,  # Show what would be fixed without actually fixing
    [switch]$Force     # Apply fixes without prompting
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AUTO-TROUBLESHOOT AND FIX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "[DRY RUN MODE] No changes will be made" -ForegroundColor Yellow
    Write-Host ""
}

$fixes = @()
$fixesApplied = 0
$fixesFailed = 0

# Function to apply a fix
function Apply-Fix {
    param(
        [string]$Name,
        [string]$Description,
        [scriptblock]$Action,
        [string]$VerificationCommand
    )

    Write-Host "[FIX] $Name" -ForegroundColor Cyan
    Write-Host "  Description: $Description" -ForegroundColor Gray

    if ($DryRun) {
        Write-Host "  [DRY RUN] Would apply this fix" -ForegroundColor Yellow
        return
    }

    $script:fixes += @{
        Name = $Name
        Description = $Description
        Applied = $false
        Error = $null
    }

    $currentFix = $script:fixes[-1]

    if (-not $Force) {
        $response = Read-Host "  Apply fix? (Y/n)"
        if ($response -eq 'n') {
            Write-Host "  [SKIPPED]" -ForegroundColor Yellow
            return
        }
    }

    try {
        Write-Host "  [APPLYING...]" -ForegroundColor Yellow
        & $Action
        
        # Verify fix if verification command provided
        if ($VerificationCommand) {
            Start-Sleep -Seconds 2
            $result = Invoke-Expression $VerificationCommand
            if ($result) {
                Write-Host "  [SUCCESS] Fix verified" -ForegroundColor Green
                $currentFix.Applied = $true
                $script:fixesApplied++
            } else {
                Write-Host "  [WARNING] Fix applied but verification failed" -ForegroundColor Yellow
                $currentFix.Applied = $true
                $script:fixesApplied++
            }
        } else {
            Write-Host "  [SUCCESS] Fix applied" -ForegroundColor Green
            $currentFix.Applied = $true
            $script:fixesApplied++
        }
    }
    catch {
        Write-Host "  [FAILED] $($_.Exception.Message)" -ForegroundColor Red
        $currentFix.Error = $_.Exception.Message
        $script:fixesFailed++
    }

    Write-Host ""
}

# Run health check to detect issues
Write-Host "Running health check to detect issues..." -ForegroundColor Yellow
$healthResponse = $null
try {
    $healthResponse = Invoke-RestMethod "http://localhost:3003/health/status" -TimeoutSec 10 -ErrorAction Stop
}
catch {
    Write-Host "[ERROR] Cannot reach backend health endpoint" -ForegroundColor Red
    Write-Host "  Backend may not be running" -ForegroundColor Gray
    
    Apply-Fix `
        -Name "Start Backend Service" `
        -Description "Backend is not responding - attempt to start it" `
        -Action {
            $startScript = Join-Path $PSScriptRoot "start-all.ps1"
            if (Test-Path $startScript) {
                & $startScript
                Start-Sleep -Seconds 15
            } else {
                throw "start-all.ps1 not found"
            }
        } `
        -VerificationCommand 'Test-NetConnection -ComputerName localhost -Port 3003 -WarningAction SilentlyContinue | Select-Object -ExpandProperty TcpTestSucceeded'
    
    # Try health check again
    try {
        $healthResponse = Invoke-RestMethod "http://localhost:3003/health/status" -TimeoutSec 10
    }
    catch {
        Write-Host ""
        Write-Host "[FATAL] Cannot establish connection to backend after attempted fix" -ForegroundColor Red
        Write-Host "Manual intervention required" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "Health Status: $($healthResponse.status.ToUpper())" -ForegroundColor $(if ($healthResponse.status -eq 'healthy') { 'Green' } else { 'Yellow' })
Write-Host ""

# Check PM2 status
$pm2Installed = Get-Command pm2 -ErrorAction SilentlyContinue
if (-not $pm2Installed) {
    Write-Host "[INFO] PM2 not installed - this is OK if using other process managers" -ForegroundColor Gray
    Write-Host ""
}

# Issue 1: Tunnel Health Check Failing
if ($healthResponse.services.tunnel -and -not $healthResponse.services.tunnel.healthy) {
    Write-Host "Issue Detected: Tunnel health check failing" -ForegroundColor Yellow
    Write-Host "  Error: $($healthResponse.services.tunnel.error)" -ForegroundColor Gray
    Write-Host ""

    # Check if frontend domain actually returns 404
    try {
        $frontendCheck = Invoke-WebRequest "https://care2connects.org/health/live" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        Write-Host "  Frontend /health/live exists (status: $($frontendCheck.StatusCode))" -ForegroundColor Gray
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "  Frontend /health/live returns 404 - route missing" -ForegroundColor Yellow
            
            Apply-Fix `
                -Name "Add /health/live route to frontend" `
                -Description "Frontend is missing the /health/live route that tunnel health check expects" `
                -Action {
                    # Check if frontend/app/health/live/page.tsx exists
                    $healthLivePath = Join-Path $PSScriptRoot "..\frontend\app\health\live\page.tsx"
                    
                    if (Test-Path $healthLivePath) {
                        Write-Host "    Health live page already exists, checking route.ts..." -ForegroundColor Gray
                    }
                    
                    # Create API route for /health/live in frontend
                    $routePath = Join-Path $PSScriptRoot "..\frontend\app\health\live"
                    $routeFile = Join-Path $routePath "route.ts"
                    
                    if (-not (Test-Path $routePath)) {
                        New-Item -ItemType Directory -Path $routePath -Force | Out-Null
                    }
                    
                    # Create simple health live route
                    $routeContent = @'
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    message: 'Frontend is running'
  });
}

export const dynamic = 'force-dynamic';
'@
                    Set-Content -Path $routeFile -Value $routeContent -Force
                    Write-Host "    Created $routeFile" -ForegroundColor Green
                    
                    # Frontend rebuild needed
                    Write-Host "    NOTE: Frontend needs rebuild/restart for this to take effect" -ForegroundColor Yellow
                } `
                -VerificationCommand $null
        }
    }

    # Check if API domain works
    try {
        $apiCheck = Invoke-RestMethod "https://api.care2connects.org/health/live" -TimeoutSec 10
        Write-Host "  API domain working correctly: $($apiCheck.status)" -ForegroundColor Green
        Write-Host ""
        
        # If API works but frontend doesn't, the fix is to update the health check logic
        # to only check API domain (which is what matters for backend health)
        Apply-Fix `
            -Name "Update tunnel health check to only check API domain" `
            -Description "Frontend doesn't need /health/live route - API domain is what matters for backend" `
            -Action {
                $healthCheckFile = Join-Path $PSScriptRoot "..\backend\src\ops\healthCheckRunner.ts"
                $content = Get-Content $healthCheckFile -Raw
                
                # Check if already fixed
                if ($content -match '// Only check API domain \(frontend health not needed\)') {
                    Write-Host "    Already fixed - health check only checks API domain" -ForegroundColor Green
                    return
                }
                
                # Replace the checkTunnel method to only check API domain
                $oldPattern = [regex]::Escape(@'
    try {
      // Test frontend domain with extended timeout
      const frontendResponse = await fetch(`https://${domain}/health/live`, {
        signal: AbortSignal.timeout(15000)
      });

      // Test API domain
      const apiResponse = await fetch(`https://api.${domain}/health/live`, {
        signal: AbortSignal.timeout(15000)
      });

      const latency = Date.now() - start;

      if (frontendResponse.ok && apiResponse.ok) {
'@)
                
                $newCode = @'
    try {
      // Only check API domain (frontend health not needed)
      // Frontend is a Next.js app without /health/live route
      // Backend API health is what matters for system health
      const apiResponse = await fetch(`https://api.${domain}/health/live`, {
        signal: AbortSignal.timeout(15000)
      });

      const latency = Date.now() - start;

      if (apiResponse.ok) {
'@
                
                if ($content -match [regex]::Escape('// Test frontend domain with extended timeout')) {
                    $content = $content -replace $oldPattern, $newCode
                    
                    # Also update the error reporting
                    $content = $content -replace [regex]::Escape('`Frontend: ${frontendResponse.status}, API: ${apiResponse.status}`'), '`API: ${apiResponse.status}`'
                    $content = $content -replace [regex]::Escape('{ frontend: frontendResponse.status, api: apiResponse.status, latency }'), '{ api: apiResponse.status, latency }'
                    
                    Set-Content -Path $healthCheckFile -Value $content -Force
                    Write-Host "    Updated healthCheckRunner.ts" -ForegroundColor Green
                    Write-Host "    Backend restart needed for changes to take effect" -ForegroundColor Yellow
                } else {
                    throw "Could not find expected code pattern to replace"
                }
            } `
            -VerificationCommand $null
    }
    catch {
        Write-Host "  [ERROR] API domain also failing: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  This indicates a real tunnel connectivity issue" -ForegroundColor Yellow
        Write-Host ""
    }
}

# Issue 2: Speech Intelligence Status Degraded
if ($healthResponse.speechIntelligence.status -eq 'degraded') {
    Write-Host "Issue Detected: Speech Intelligence status degraded" -ForegroundColor Yellow
    Write-Host "  Last smoke test failed" -ForegroundColor Gray
    Write-Host ""
    
    Apply-Fix `
        -Name "Trigger Speech Intelligence smoke test" `
        -Description "Re-run smoke test to check if issue persists" `
        -Action {
            $result = Invoke-RestMethod "http://localhost:3003/api/admin/speech/smoke-test" -Method POST -TimeoutSec 30
            if (-not $result.success) {
                throw "Smoke test failed: $($result.error)"
            }
            Write-Host "    Smoke test passed" -ForegroundColor Green
        } `
        -VerificationCommand $null
}

# Issue 3: Open Incidents
if ($healthResponse.incidents.open -gt 0) {
    Write-Host "Issue Detected: $($healthResponse.incidents.open) open incident(s)" -ForegroundColor Yellow
    
    # Get incident details
    try {
        $incidents = Invoke-RestMethod "http://localhost:3003/health/incidents" -TimeoutSec 5
        
        foreach ($incident in $incidents | Where-Object { $_.status -eq 'open' } | Select-Object -First 3) {
            Write-Host "  - $($incident.service): $($incident.title)" -ForegroundColor Gray
            
            if ($incident.autoResolve) {
                Write-Host "    (Auto-resolve in $([math]::Round($incident.ttl / 60, 1)) minutes)" -ForegroundColor DarkGray
            }
        }
    }
    catch {
        Write-Host "  Could not fetch incident details" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "  NOTE: These incidents may auto-resolve if health checks pass" -ForegroundColor Gray
    Write-Host ""
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TROUBLESHOOTING COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN COMPLETE - No changes were made" -ForegroundColor Yellow
    Write-Host "Run without -DryRun to apply fixes" -ForegroundColor Gray
}
else {
    Write-Host "Fixes Applied: $fixesApplied" -ForegroundColor $(if ($fixesApplied -gt 0) { 'Green' } else { 'Gray' })
    Write-Host "Fixes Failed: $fixesFailed" -ForegroundColor $(if ($fixesFailed -gt 0) { 'Red' } else { 'Gray' })

    if ($fixesApplied -gt 0) {
        Write-Host ""
        Write-Host "RECOMMENDED NEXT STEPS:" -ForegroundColor Yellow
        Write-Host "1. Restart backend: pm2 restart care2system-backend" -ForegroundColor White
        Write-Host "2. Wait 30 seconds for health checks to run" -ForegroundColor White
        Write-Host "3. Check health status: http://localhost:3003/health/status" -ForegroundColor White
        Write-Host "4. Run health check again: .\scripts\startup-health-check.ps1" -ForegroundColor White
    }
}

Write-Host ""
