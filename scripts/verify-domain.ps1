# PowerShell script to verify DNS configuration for care2connect.org
# Checks nameservers, CNAME records, and provides PASS/FAIL verdict

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Care2Connect - DNS Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$overallPass = $true
$domain = "care2connect.org"
$wwwDomain = "www.care2connect.org"
$apiDomain = "api.care2connect.org"
$expectedTunnelHostname = "07e7c160-451b-4d41-875c-a58f79700ae8.cfargotunnel.com"

# Function to check nameservers
function Test-Nameservers {
    param([string]$Domain)
    
    Write-Host "`n[1] Checking nameservers for $Domain..." -ForegroundColor Cyan
    
    try {
        $ns = nslookup -type=ns $Domain 2>&1 | Select-String "nameserver"
        
        if ($ns) {
            Write-Host "Current nameservers:" -ForegroundColor White
            $ns | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
            
            # Check if any nameserver contains "cloudflare"
            $hasCloudflare = $ns | Select-String -Pattern "cloudflare" -Quiet
            
            if ($hasCloudflare) {
                Write-Host "✅ PASS: Nameservers pointing to Cloudflare" -ForegroundColor Green
                return $true
            } else {
                Write-Host "❌ FAIL: Nameservers NOT pointing to Cloudflare" -ForegroundColor Red
                Write-Host "   Expected: *.ns.cloudflare.com" -ForegroundColor Yellow
                Write-Host "   Action: Update nameservers at registrar (see docs/DOMAIN_FIX_RUNBOOK.md)" -ForegroundColor Yellow
                return $false
            }
        } else {
            Write-Host "❌ FAIL: Could not retrieve nameservers" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ ERROR: Failed to query nameservers - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to check CNAME record
function Test-CNAMERecord {
    param(
        [string]$Hostname,
        [string]$ExpectedTarget
    )
    
    Write-Host "`n[2] Checking CNAME for $Hostname..." -ForegroundColor Cyan
    
    try {
        $result = nslookup -type=cname $Hostname 2>&1
        
        # Check if CNAME exists
        $hasCNAME = $result | Select-String -Pattern "canonical name" -Quiet
        
        if ($hasCNAME) {
            Write-Host "CNAME record found:" -ForegroundColor White
            $cnameLines = $result | Select-String "canonical name"
            $cnameLines | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
            
            # Check if it points to expected tunnel hostname
            $hasCorrectTarget = $result | Select-String -Pattern $ExpectedTarget -Quiet
            
            if ($hasCorrectTarget) {
                Write-Host "✅ PASS: CNAME points to correct tunnel hostname" -ForegroundColor Green
                return $true
            } else {
                Write-Host "⚠️  WARNING: CNAME exists but may not point to tunnel" -ForegroundColor Yellow
                Write-Host "   Expected: $ExpectedTarget" -ForegroundColor Yellow
                return $false
            }
        } else {
            # Cloudflare proxy might show A record instead of CNAME
            Write-Host "No CNAME record found (may be proxied)" -ForegroundColor Yellow
            
            # Try to resolve to IP
            $ip = nslookup $Hostname 2>&1 | Select-String -Pattern "Address:\s+\d+" | Select-Object -First 1
            
            if ($ip) {
                Write-Host "Resolved to IP:" -ForegroundColor White
                Write-Host "  $ip" -ForegroundColor Gray
                
                # Check if IP is in Cloudflare range (104.x.x.x or 172.x.x.x)
                if ($ip -match "104\.|172\.") {
                    Write-Host "✅ PASS: Resolves to Cloudflare IP (proxy enabled)" -ForegroundColor Green
                    return $true
                } else {
                    Write-Host "⚠️  WARNING: IP does not appear to be Cloudflare" -ForegroundColor Yellow
                    return $false
                }
            } else {
                Write-Host "❌ FAIL: No DNS record found" -ForegroundColor Red
                Write-Host "   Action: Create CNAME record in Cloudflare dashboard" -ForegroundColor Yellow
                return $false
            }
        }
    } catch {
        Write-Host "❌ ERROR: Failed to query CNAME - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to test HTTP endpoint
function Test-HTTPEndpoint {
    param(
        [string]$Url,
        [string]$Description
    )
    
    Write-Host "`n[3] Testing $Description - $Url..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ PASS: $Description accessible (HTTP 200)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️  WARNING: $Description returned HTTP $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ FAIL: $Description not accessible" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $false
    }
}

# Run all checks
$nsPass = Test-Nameservers -Domain $domain

if ($nsPass) {
    $wwwPass = Test-CNAMERecord -Hostname $wwwDomain -ExpectedTarget $expectedTunnelHostname
    $apiPass = Test-CNAMERecord -Hostname $apiDomain -ExpectedTarget $expectedTunnelHostname
    
    # Only test HTTP if DNS is configured
    $httpFrontendPass = Test-HTTPEndpoint -Url "https://$wwwDomain" -Description "Frontend"
    $httpBackendPass = Test-HTTPEndpoint -Url "https://$apiDomain/health/live" -Description "Backend API"
    
    $overallPass = $wwwPass -and $apiPass -and $httpFrontendPass -and $httpBackendPass
} else {
    Write-Host "`n⚠️  Skipping CNAME and HTTP tests (nameservers must point to Cloudflare first)" -ForegroundColor Yellow
    $overallPass = $false
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DNS Verification Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($overallPass) {
    Write-Host "`n✅ OVERALL: PASS" -ForegroundColor Green
    Write-Host "   DNS is correctly configured and domain is accessible" -ForegroundColor Green
} else {
    Write-Host "`n❌ OVERALL: FAIL" -ForegroundColor Red
    Write-Host "   DNS configuration issues detected" -ForegroundColor Red
    Write-Host "`n   Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Review failed checks above" -ForegroundColor White
    Write-Host "   2. See docs/DOMAIN_FIX_RUNBOOK.md for detailed instructions" -ForegroundColor White
    Write-Host "   3. If nameservers are incorrect, update at registrar" -ForegroundColor White
    Write-Host "   4. If nameservers are correct, wait for propagation (10-60 min)" -ForegroundColor White
}

# DNS validation endpoint
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Additional Diagnostic Tools" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend DNS validation endpoint:" -ForegroundColor White
Write-Host "  http://localhost:3003/health/dns" -ForegroundColor Gray
Write-Host "  https://$apiDomain/health/dns" -ForegroundColor Gray
Write-Host "`nOnline DNS checker:" -ForegroundColor White
Write-Host "  https://dnschecker.org/#CNAME/$wwwDomain" -ForegroundColor Gray

Write-Host "`n========================================`n" -ForegroundColor Cyan

# Exit with appropriate code
if ($overallPass) {
    exit 0
} else {
    exit 1
}
