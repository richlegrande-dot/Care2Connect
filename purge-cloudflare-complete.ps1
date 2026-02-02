# Cloudflare Cache Purge Script
# Requires API Token from: https://dash.cloudflare.com/profile/api-tokens

param(
    [string]$ApiToken = $env:CF_API_TOKEN
)

$ZoneId = "0b6345d646f1d114dc38d07ae970e841"

if (-not $ApiToken) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "  CLOUDFLARE API TOKEN REQUIRED" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    Write-Host "To get your API Token:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor White
    Write-Host "2. Click: 'Create Token'" -ForegroundColor White
    Write-Host "3. Use template: 'Edit zone DNS' or 'Custom token'" -ForegroundColor White
    Write-Host "4. Permissions needed:" -ForegroundColor White
    Write-Host "   - Zone > Cache Purge > Purge" -ForegroundColor Cyan
    Write-Host "   - Zone > Zone Settings > Edit" -ForegroundColor Cyan
    Write-Host "5. Zone Resources: Include > Specific zone > care2connects.org" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run:" -ForegroundColor Yellow
    Write-Host '  .\purge-cloudflare-complete.ps1 -ApiToken "your-token-here"' -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or set environment variable:" -ForegroundColor Yellow
    Write-Host '  $env:CF_API_TOKEN = "your-token-here"' -ForegroundColor Cyan
    Write-Host '  .\purge-cloudflare-complete.ps1' -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  CLOUDFLARE CACHE MANAGEMENT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $ApiToken"
    "Content-Type" = "application/json"
}

# Test API credentials
Write-Host "[1] Testing API credentials..." -ForegroundColor Yellow
try {
    $zoneInfo = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId" -Headers $headers -Method Get
    Write-Host "  ✓ Connected to zone: $($zoneInfo.result.name)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ API authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Check your API token permissions" -ForegroundColor Yellow
    exit 1
}

# Purge all cache
Write-Host "`n[2] Purging ALL cache..." -ForegroundColor Yellow
try {
    $purgeBody = @{ purge_everything = $true } | ConvertTo-Json
    $purgeResult = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/purge_cache" -Method Post -Headers $headers -Body $purgeBody
    
    if ($purgeResult.success) {
        Write-Host "  ✓ Cache purged successfully!" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Purge failed: $($purgeResult.errors)" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ Purge request failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Enable Development Mode (bypasses cache for 3 hours)
Write-Host "`n[3] Enabling Development Mode (3 hour bypass)..." -ForegroundColor Yellow
try {
    $devModeBody = @{ value = "on" } | ConvertTo-Json
    $devModeResult = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/settings/development_mode" -Method Patch -Headers $headers -Body $devModeBody
    
    if ($devModeResult.success) {
        Write-Host "  ✓ Development Mode enabled!" -ForegroundColor Green
        Write-Host "    Cache bypassed for 3 hours" -ForegroundColor Cyan
    } else {
        Write-Host "  ✗ Failed to enable: $($devModeResult.errors)" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ Request failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  NEXT STEPS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Wait 30 seconds for changes to propagate" -ForegroundColor White
Write-Host "2. Open INCOGNITO/PRIVATE window" -ForegroundColor White
Write-Host "3. Visit: https://care2connects.org" -ForegroundColor Cyan
Write-Host "4. You should see: 'Your Story Matters' frontend" -ForegroundColor Green
Write-Host ""
Write-Host "If still showing backend:" -ForegroundColor Yellow
Write-Host "  - Hard refresh: Ctrl+Shift+R" -ForegroundColor White
Write-Host "  - Clear browser cache completely" -ForegroundColor White
Write-Host "  - Try different browser" -ForegroundColor White
Write-Host ""
