# PowerShell script to verify deployment readiness
# CRITICAL: Server is NOT deployment ready if Cloudflare or Tunnel services fail

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Care2Connect - Deployment Readiness" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$backendUrl = "http://localhost:3003"
$overallPass = $true
$criticalServicesFailed = $false

# Check backend health status
Write-Host "[Step 1] Checking backend health status..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$backendUrl/health/status" -Method Get -ErrorAction Stop
    
    Write-Host "`n========== HEALTH STATUS ==========" -ForegroundColor Cyan
    Write-Host "Overall Status: $($health.status.ToUpper())" -ForegroundColor $(if($health.status -eq 'healthy'){'Green'}elseif($health.status -eq 'degraded'){'Yellow'}else{'Red'})
    
    Write-Host "`nService Details:" -ForegroundColor White
    $healthyCount = 0
    $totalCount = 0
    $cloudflareOk = $false
    $tunnelOk = $false
    $databaseOk = $false
    
    $health.services.PSObject.Properties | ForEach-Object {
        $totalCount++
        $serviceName = $_.Name
        $serviceData = $_.Value
        
        # Track critical services (note: database service is named 'prisma' in health checks)
        if ($serviceName -eq 'cloudflare' -and $serviceData.healthy) { $cloudflareOk = $true }
        if ($serviceName -eq 'tunnel' -and $serviceData.healthy) { $tunnelOk = $true }
        if (($serviceName -eq 'database' -or $serviceName -eq 'prisma') -and $serviceData.healthy) { $databaseOk = $true }
        
        if ($serviceData.healthy) {
            $healthyCount++
            Write-Host "  ✅ $serviceName`: HEALTHY" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $serviceName`: FAILED" -ForegroundColor Red
            if ($serviceData.error) {
                Write-Host "     $($serviceData.error)" -ForegroundColor Gray
            }
            
            # Check if it's a critical deployment service (database is named 'prisma' in health checks)
            if ($serviceName -eq 'cloudflare' -or $serviceName -eq 'tunnel' -or $serviceName -eq 'database' -or $serviceName -eq 'prisma') {
                $criticalServicesFailed = $true
                $overallPass = $false
            }
        }
    }
    
    Write-Host "`nSummary: $healthyCount/$totalCount services healthy" -ForegroundColor Cyan
    
    # Deployment readiness assessment
    Write-Host "`n========== DEPLOYMENT READINESS ==========" -ForegroundColor Cyan
    
    if (-not $databaseOk) {
        Write-Host "❌ CRITICAL: Database is DOWN" -ForegroundColor Red
        Write-Host "   Action: Fix database connection before deployment" -ForegroundColor Yellow
        $overallPass = $false
    } else {
        Write-Host "✅ Database: Ready" -ForegroundColor Green
    }
    
    if (-not $cloudflareOk) {
        Write-Host "❌ CRITICAL: Cloudflare API is DOWN" -ForegroundColor Red
        Write-Host "   Action: Fix Cloudflare configuration before deployment" -ForegroundColor Yellow
        Write-Host "   Impact: DNS and CDN services will not work" -ForegroundColor Gray
        $overallPass = $false
    } else {
        Write-Host "✅ Cloudflare: Ready" -ForegroundColor Green
    }
    
    if (-not $tunnelOk) {
        Write-Host "❌ CRITICAL: Tunnel is DOWN" -ForegroundColor Red
        Write-Host "   Action: Fix tunnel configuration before deployment" -ForegroundColor Yellow
        Write-Host "   Impact: Public access to application will NOT work" -ForegroundColor Gray
        $overallPass = $false
    } else {
        Write-Host "✅ Tunnel: Ready" -ForegroundColor Green
    }
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    
    if ($overallPass -and $databaseOk -and $cloudflareOk -and $tunnelOk) {
        Write-Host "`n🚀 DEPLOYMENT READY" -ForegroundColor Green
        Write-Host "   All critical services are operational" -ForegroundColor White
        Write-Host "   - Database: Connected" -ForegroundColor Gray
        Write-Host "   - Cloudflare: Configured" -ForegroundColor Gray
        Write-Host "   - Tunnel: Active" -ForegroundColor Gray
        Write-Host "`n   You can proceed with deployment.`n" -ForegroundColor Green
    } elseif ($criticalServicesFailed) {
        Write-Host "`n❌ NOT DEPLOYMENT READY" -ForegroundColor Red
        Write-Host "`n   CRITICAL services are DOWN:" -ForegroundColor Red
        if (-not $databaseOk) { Write-Host "   - Database" -ForegroundColor Red }
        if (-not $cloudflareOk) { Write-Host "   - Cloudflare API" -ForegroundColor Red }
        if (-not $tunnelOk) { Write-Host "   - Tunnel" -ForegroundColor Red }
        Write-Host "`n   DO NOT DEPLOY until these are fixed.`n" -ForegroundColor Red
    } else {
        Write-Host "`n⚠️  DEPLOYMENT CAUTION" -ForegroundColor Yellow
        Write-Host "   Some optional services are down" -ForegroundColor Yellow
        Write-Host "   Review failed services above before deploying`n" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ FAIL: Cannot reach backend health endpoint" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host "   Make sure backend is running on port 3003" -ForegroundColor Yellow
    $overallPass = $false
}

Write-Host "========================================`n" -ForegroundColor Cyan

# Exit with appropriate code
if ($overallPass) {
    exit 0
} else {
    exit 1
}
