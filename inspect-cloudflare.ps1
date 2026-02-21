# Cloudflare DNS and Settings Inspector
# Zone ID: 0b6345d646f1d114dc38d07ae970e841

param(
    [string]$ApiToken = $env:CF_API_TOKEN
)

$ZoneId = "0b6345d646f1d114dc38d07ae970e841"

if (-not $ApiToken) {
    Write-Host "Please provide API token via -ApiToken parameter or CF_API_TOKEN environment variable" -ForegroundColor Red
    Write-Host "Get token from: https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $ApiToken"
    "Content-Type" = "application/json"
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  CLOUDFLARE CONFIGURATION INSPECTOR" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Get DNS records
Write-Host "[1] DNS Records:" -ForegroundColor Yellow
try {
    $dnsRecords = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/dns_records" -Headers $headers -Method Get
    
    foreach ($record in $dnsRecords.result) {
        $proxied = if ($record.proxied) { "[PROXIED]" } else { "[DNS ONLY]" }
        Write-Host "  $($record.type) $($record.name) → $($record.content) $proxied" -ForegroundColor $(if($record.proxied){"Cyan"}else{"Gray"})
    }
} catch {
    Write-Host "  ✗ Failed to get DNS records: $($_.Exception.Message)" -ForegroundColor Red
}

# Check cache settings
Write-Host "`n[2] Cache Settings:" -ForegroundColor Yellow
try {
    $cacheLevel = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/settings/cache_level" -Headers $headers -Method Get
    Write-Host "  Cache Level: $($cacheLevel.result.value)" -ForegroundColor Cyan
    
    $devMode = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/settings/development_mode" -Headers $headers -Method Get
    $devStatus = if ($devMode.result.value -eq "on") { "ENABLED (cache bypassed)" } else { "DISABLED" }
    Write-Host "  Development Mode: $devStatus" -ForegroundColor $(if($devMode.result.value -eq "on"){"Green"}else{"Gray"})
} catch {
    Write-Host "  ✗ Failed to get cache settings: $($_.Exception.Message)" -ForegroundColor Red
}

# Check SSL settings
Write-Host "`n[3] SSL/TLS Settings:" -ForegroundColor Yellow
try {
    $ssl = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/settings/ssl" -Headers $headers -Method Get
    Write-Host "  SSL Mode: $($ssl.result.value)" -ForegroundColor Cyan
} catch {
    Write-Host "  ✗ Failed to get SSL settings: $($_.Exception.Message)" -ForegroundColor Red
}

# List Page Rules (these can affect caching)
Write-Host "`n[4] Page Rules:" -ForegroundColor Yellow
try {
    $pageRules = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/pagerules" -Headers $headers -Method Get
    
    if ($pageRules.result.Count -eq 0) {
        Write-Host "  No page rules configured" -ForegroundColor Gray
    } else {
        foreach ($rule in $pageRules.result) {
            Write-Host "  $($rule.targets[0].constraint.value)" -ForegroundColor Cyan
            foreach ($action in $rule.actions) {
                Write-Host "    - $($action.id): $($action.value)" -ForegroundColor Gray
            }
        }
    }
} catch {
    Write-Host "  ✗ Failed to get page rules: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
