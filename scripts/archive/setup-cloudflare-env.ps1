# Cloudflare Environment Setup
# Sets up API token and Zone ID for automated cache purging

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  CLOUDFLARE CREDENTIALS SETUP" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you configure Cloudflare API credentials" -ForegroundColor White
Write-Host "for automated cache purging." -ForegroundColor White
Write-Host ""

# Step 1: API Token
Write-Host "STEP 1: API Token" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "To get your API token:" -ForegroundColor White
Write-Host "  1. Go to: https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor Cyan
Write-Host "  2. Click 'Create Token'" -ForegroundColor White
Write-Host "  3. Use template: 'Edit zone DNS' or create custom token" -ForegroundColor White
Write-Host "  4. Required permission: Zone > Cache Purge > Purge" -ForegroundColor White
Write-Host "  5. Copy the token" -ForegroundColor White
Write-Host ""

$apiToken = Read-Host "Enter your Cloudflare API Token (or press Enter to skip)"

if ($apiToken) {
    # Set for current session
    $env:CLOUDFLARE_API_TOKEN = $apiToken
    
    # Set permanently (User scope)
    [System.Environment]::SetEnvironmentVariable("CLOUDFLARE_API_TOKEN", $apiToken, "User")
    
    Write-Host "  ✅ API Token saved!" -ForegroundColor Green
    Write-Host "     (Set for current session and user profile)" -ForegroundColor Gray
} else {
    Write-Host "  ⏭️  Skipped API Token" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Zone ID
Write-Host "STEP 2: Zone ID" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "To get your Zone ID:" -ForegroundColor White
Write-Host "  1. Go to: https://dash.cloudflare.com" -ForegroundColor Cyan
Write-Host "  2. Click on your domain: care2connects.org" -ForegroundColor White
Write-Host "  3. Scroll down on the Overview page" -ForegroundColor White
Write-Host "  4. Find 'Zone ID' in the right sidebar" -ForegroundColor White
Write-Host "  5. Click to copy" -ForegroundColor White
Write-Host ""

$zoneId = Read-Host "Enter your Zone ID (or press Enter to skip)"

if ($zoneId) {
    # Set for current session
    $env:CLOUDFLARE_ZONE_ID = $zoneId
    
    # Set permanently (User scope)
    [System.Environment]::SetEnvironmentVariable("CLOUDFLARE_ZONE_ID", $zoneId, "User")
    
    Write-Host "  ✅ Zone ID saved!" -ForegroundColor Green
    Write-Host "     (Set for current session and user profile)" -ForegroundColor Gray
} else {
    Write-Host "  ⏭️  Skipped Zone ID" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Summary
Write-Host ""
Write-Host "CONFIGURATION SUMMARY" -ForegroundColor Green
Write-Host "────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

$currentToken = [System.Environment]::GetEnvironmentVariable("CLOUDFLARE_API_TOKEN", "User")
$currentZoneId = [System.Environment]::GetEnvironmentVariable("CLOUDFLARE_ZONE_ID", "User")

if ($currentToken) {
    Write-Host "  ✅ API Token: Set ($($currentToken.Substring(0, 8))...)" -ForegroundColor Green
} else {
    Write-Host "  ❌ API Token: Not set" -ForegroundColor Red
}

if ($currentZoneId) {
    Write-Host "  ✅ Zone ID: Set ($($currentZoneId.Substring(0, 8))...)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Zone ID: Not set" -ForegroundColor Red
}

Write-Host ""

if ($currentToken -and $currentZoneId) {
    Write-Host "✅ Setup complete! You can now run:" -ForegroundColor Green
    Write-Host "   .\purge-cloudflare-cache.ps1" -ForegroundColor Cyan
    Write-Host ""
    
    $testNow = Read-Host "Test cache purge now? (y/n)"
    if ($testNow -eq 'y') {
        Write-Host ""
        & "$PSScriptRoot\purge-cloudflare-cache.ps1"
    }
} else {
    Write-Host "⚠️  Incomplete setup" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can set credentials later by:" -ForegroundColor White
    Write-Host "  • Running this script again" -ForegroundColor Gray
    Write-Host "  • Manually setting environment variables:" -ForegroundColor Gray
    Write-Host '    $env:CLOUDFLARE_API_TOKEN = "your_token"' -ForegroundColor Cyan
    Write-Host '    $env:CLOUDFLARE_ZONE_ID = "your_zone_id"' -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or pass as parameters:" -ForegroundColor White
    Write-Host '  .\purge-cloudflare-cache.ps1 -ApiToken "xxx" -ZoneId "yyy"' -ForegroundColor Cyan
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
