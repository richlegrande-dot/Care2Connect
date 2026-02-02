# Cloudflare Cache Purge Script
# Automatically purges cache for care2connects.org

param(
    [string]$ApiToken = $env:CLOUDFLARE_API_TOKEN,
    [string]$ZoneId = $env:CLOUDFLARE_ZONE_ID,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Cloudflare Cache Purge Script
==============================

Usage:
  .\purge-cloudflare-cache.ps1 [-ApiToken <token>] [-ZoneId <id>]

Setup (First Time):
  1. Get API Token: https://dash.cloudflare.com/profile/api-tokens
     - Click "Create Token"
     - Use template: "Edit zone DNS" or "Cache Purge"
     - Permissions: Zone > Cache Purge > Purge
  
  2. Get Zone ID:
     - Go to your domain dashboard
     - Scroll down on Overview page
     - Copy "Zone ID" from right sidebar

  3. Set environment variables (recommended):
     `$env:CLOUDFLARE_API_TOKEN = "your_token_here"
     `$env:CLOUDFLARE_ZONE_ID = "your_zone_id_here"

  4. Or pass as parameters:
     .\purge-cloudflare-cache.ps1 -ApiToken "xxx" -ZoneId "yyy"

"@
    exit 0
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  CLOUDFLARE CACHE PURGE - care2connects.org" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check for required parameters
if (-not $ApiToken) {
    Write-Host "❌ ERROR: Cloudflare API Token not provided" -ForegroundColor Red
    Write-Host ""
    Write-Host "Option 1: Set environment variable" -ForegroundColor Yellow
    Write-Host '  $env:CLOUDFLARE_API_TOKEN = "your_token_here"' -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Pass as parameter" -ForegroundColor Yellow
    Write-Host '  .\purge-cloudflare-cache.ps1 -ApiToken "your_token" -ZoneId "your_zone_id"' -ForegroundColor White
    Write-Host ""
    Write-Host "Get your API token: https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor Cyan
    Write-Host "Run: .\purge-cloudflare-cache.ps1 -Help for detailed instructions" -ForegroundColor Cyan
    exit 1
}

if (-not $ZoneId) {
    Write-Host "❌ ERROR: Cloudflare Zone ID not provided" -ForegroundColor Red
    Write-Host ""
    Write-Host "Option 1: Set environment variable" -ForegroundColor Yellow
    Write-Host '  $env:CLOUDFLARE_ZONE_ID = "your_zone_id_here"' -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Pass as parameter" -ForegroundColor Yellow
    Write-Host '  .\purge-cloudflare-cache.ps1 -ApiToken "your_token" -ZoneId "your_zone_id"' -ForegroundColor White
    Write-Host ""
    Write-Host "Find Zone ID: https://dash.cloudflare.com → Select domain → Copy from Overview" -ForegroundColor Cyan
    Write-Host "Run: .\purge-cloudflare-cache.ps1 -Help for detailed instructions" -ForegroundColor Cyan
    exit 1
}

# Cloudflare API endpoint
$apiUrl = "https://api.cloudflare.com/v4/zones/$ZoneId/purge_cache"

# Headers
$headers = @{
    "Authorization" = "Bearer $ApiToken"
    "Content-Type" = "application/json"
}

# Purge everything
$body = @{
    purge_everything = $true
} | ConvertTo-Json

Write-Host "🔄 Purging cache..." -ForegroundColor Yellow
Write-Host "   Domain: care2connects.org"
Write-Host "   Zone ID: $($ZoneId.Substring(0, 8))..."
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Headers $headers -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ SUCCESS: Cache purged!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Cache Status:" -ForegroundColor Cyan
        Write-Host "  • All files purged from edge servers" -ForegroundColor White
        Write-Host "  • CDN will fetch fresh content on next request" -ForegroundColor White
        Write-Host ""
        Write-Host "⏱️  Propagation Time: 30-60 seconds" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🧪 Test URLs:" -ForegroundColor Cyan
        Write-Host "   Homepage: https://care2connects.org" -ForegroundColor White
        Write-Host "   API: https://api.care2connects.org/health/live" -ForegroundColor White
        Write-Host "   Webhook: https://api.care2connects.org/api/payments/stripe-webhook" -ForegroundColor White
        Write-Host ""
        Write-Host "💡 TIP: Wait 60 seconds, then hard refresh (Ctrl+Shift+R) in browser" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
        
        # Wait and test
        Write-Host ""
        $test = Read-Host "Test URLs now? (y/n)"
        if ($test -eq 'y') {
            Write-Host ""
            Write-Host "Waiting 10 seconds for propagation..." -ForegroundColor Yellow
            Start-Sleep 10
            
            Write-Host ""
            Write-Host "Testing homepage..." -ForegroundColor Cyan
            try {
                $homeResponse = Invoke-WebRequest "https://care2connects.org" -UseBasicParsing -TimeoutSec 15
                if ($homeResponse.Content -match "Your Story.*Matters|Government-Supported|CareConnect") {
                    Write-Host "  ✅ Frontend detected! ($($homeResponse.StatusCode))" -ForegroundColor Green
                } elseif ($homeResponse.Content -match "Backend.*Health|Process ID") {
                    Write-Host "  ⚠️  Still showing backend - wait 30 more seconds" -ForegroundColor Yellow
                } else {
                    Write-Host "  ✅ Status: $($homeResponse.StatusCode)" -ForegroundColor Green
                }
            } catch {
                Write-Host "  ⚠️  $($_.Exception.Message)" -ForegroundColor Yellow
            }
            
            Write-Host ""
            Write-Host "Testing API..." -ForegroundColor Cyan
            try {
                $apiResponse = Invoke-RestMethod "https://api.care2connects.org/health/live"
                Write-Host "  ✅ API responding: $($apiResponse.status)" -ForegroundColor Green
            } catch {
                Write-Host "  ⚠️  $($_.Exception.Message)" -ForegroundColor Yellow
            }
            
            Write-Host ""
            Write-Host "Testing webhook..." -ForegroundColor Cyan
            try {
                $webhookResponse = Invoke-RestMethod "https://api.care2connects.org/api/payments/stripe-webhook"
                if ($webhookResponse.ok) {
                    Write-Host "  ✅ Webhook endpoint OK: $($webhookResponse.endpoint)" -ForegroundColor Green
                }
            } catch {
                Write-Host "  ⚠️  $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
        
        exit 0
    } else {
        Write-Host "❌ FAILED: Cloudflare API returned error" -ForegroundColor Red
        Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ ERROR: Failed to purge cache" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "Authentication failed - Check your API token" -ForegroundColor Yellow
        Write-Host "Generate new token: https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor Cyan
    } elseif ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "Permission denied - Token needs 'Cache Purge' permission" -ForegroundColor Yellow
        Write-Host "Edit token: https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor Cyan
    } elseif ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "Zone not found - Check your Zone ID" -ForegroundColor Yellow
        Write-Host "Find Zone ID: https://dash.cloudflare.com → Select domain → Overview" -ForegroundColor Cyan
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Run: .\purge-cloudflare-cache.ps1 -Help for setup instructions" -ForegroundColor Cyan
    exit 1
}
