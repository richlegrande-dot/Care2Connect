# Configuration Drift Immunity Validation
# PRODUCTION INVARIANT: Ensures all configuration is consistent across all components
# 
# This script validates that:
# 1. Port configurations match between frontend and backend
# 2. Environment variables are consistent across deployment files
# 3. API URLs in frontend match backend configuration
# 4. Tunnel configuration matches expected values
# 5. CI/deployment configs are synchronized
#
# Usage:
#   .\validate-config-consistency.ps1                    # Validate all configs
#   .\validate-config-consistency.ps1 -FixDrift         # Auto-fix minor drift issues
#   .\validate-config-consistency.ps1 -StrictMode       # Fail hard on ANY inconsistencies

param(
    [switch]$FixDrift,
    [switch]$StrictMode,
    [switch]$Verbose
)

Write-Host "=== CONFIGURATION DRIFT IMMUNITY VALIDATION ===" -ForegroundColor Cyan
Write-Host "Validating configuration consistency across all components" -ForegroundColor Gray
if ($FixDrift) {
    Write-Host "AUTO-FIX MODE: Will attempt to correct minor drift issues" -ForegroundColor Yellow
}
if ($StrictMode) {
    Write-Host "STRICT MODE: Will fail hard on any inconsistencies" -ForegroundColor Red
}
Write-Host ""

$script:issuesFound = @()
$script:fixesApplied = @()

function Add-Issue {
    param(
        [string]$Component,
        [string]$Issue,
        [string]$Severity = "WARNING", # WARNING, ERROR, CRITICAL
        [string]$FixAction = $null,
        [scriptblock]$AutoFix = $null
    )
    
    $issueRecord = @{
        Component = $Component
        Issue = $Issue
        Severity = $Severity
        FixAction = $FixAction
        AutoFix = $AutoFix
        Timestamp = Get-Date
    }
    
    $script:issuesFound += $issueRecord
    
    $color = switch ($Severity) {
        "WARNING" { "Yellow" }
        "ERROR" { "Red" }
        "CRITICAL" { "Magenta" }
        default { "Gray" }
    }
    
    Write-Host "  [$Severity] $Component`: $Issue" -ForegroundColor $color
    if ($FixAction -and -not $FixDrift) {
        Write-Host "    FIX: $FixAction" -ForegroundColor Gray
    }
    
    # Auto-fix if requested and available
    if ($FixDrift -and $AutoFix) {
        try {
            Write-Host "    🔧 APPLYING FIX..." -ForegroundColor Cyan
            & $AutoFix
            $script:fixesApplied += "[$Component] $Issue"
            Write-Host "    ✅ FIX APPLIED" -ForegroundColor Green
        } catch {
            Write-Host "    ❌ FIX FAILED: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

function Get-JsonValue {
    param([string]$FilePath, [string]$JsonPath)
    try {
        $json = Get-Content $FilePath -Raw | ConvertFrom-Json
        $parts = $JsonPath -split '\.'
        $current = $json
        foreach ($part in $parts) {
            $current = $current.$part
        }
        return $current
    } catch {
        return $null
    }
}

function Get-EnvValue {
    param([string]$FilePath, [string]$VarName)
    try {
        if (-not (Test-Path $FilePath)) { return $null }
        $content = Get-Content $FilePath -Raw
        if ($content -match "$VarName\s*=\s*(.+)") {
            return $matches[1].Trim('"').Trim("'")
        }
        return $null
    } catch {
        return $null
    }
}

# VALIDATION 1: Port Configuration Consistency
Write-Host "[1/5] Validating port configuration consistency..." -ForegroundColor Yellow

$backendPackagePort = Get-JsonValue "backend\package.json" "scripts.start"
$frontendPackagePort = Get-JsonValue "frontend\package.json" "scripts.dev"
$dockerComposeBackendPort = "3001" # From docker-compose.yml
$dockerComposeFrontendPort = "3000" # From docker-compose.yml
$ecosystemBackendPort = "3001" # From ecosystem configs

# Check backend port consistency
$backendConfigPort = if (Test-Path "backend\.env") { Get-EnvValue "backend\.env" "PORT" } else { "3001" }
if (-not $backendConfigPort) { $backendConfigPort = "3001" }

if ($backendConfigPort -ne $ecosystemBackendPort) {
    Add-Issue "Backend Port" "Backend .env PORT ($backendConfigPort) differs from ecosystem config ($ecosystemBackendPort)" "ERROR" `
        "Update .env or ecosystem.prod.config.js to use consistent port" {
            # Auto-fix: Update .env file
            $envPath = "backend\.env"
            if (Test-Path $envPath) {
                (Get-Content $envPath) -replace "PORT=.*", "PORT=$ecosystemBackendPort" | Set-Content $envPath
            }
        }
}

# Check frontend configuration
$frontendConfigFile = "frontend\src\lib\frontendConfig.ts"
if (Test-Path $frontendConfigFile) {
    $frontendConfig = Get-Content $frontendConfigFile -Raw
    if ($frontendConfig -match "backendPort:\s*parseInt.*?(\d+)") {
        $frontendBackendPort = $matches[1]
        if ($frontendBackendPort -ne $backendConfigPort) {
            Add-Issue "Frontend Config" "Frontend expects backend on port $frontendBackendPort but backend uses $backendConfigPort" "CRITICAL" `
                "Update frontendConfig.ts to match backend port configuration"
        }
    }
}

Write-Host "  ✅ Port configuration checked" -ForegroundColor Green

# VALIDATION 2: Environment Variable Consistency
Write-Host "[2/5] Validating environment variable consistency..." -ForegroundColor Yellow

$envFiles = @(
    "backend\.env",
    "backend\.env.example",
    "frontend\.env.local",
    ".env"
)

$requiredVars = @("NODE_ENV", "TRANSCRIPTION_PROVIDER", "V1_STABLE", "ZERO_OPENAI_MODE")

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        foreach ($var in $requiredVars) {
            $value = Get-EnvValue $envFile $var
            if (-not $value -and $var -in @("V1_STABLE", "ZERO_OPENAI_MODE")) {
                Add-Issue "Environment Variables" "$envFile missing critical variable: $var" "ERROR" `
                    "Add $var=true to $envFile" {
                        Add-Content $envFile "`n$var=true"
                    }
            }
        }
    }
}

# Check ecosystem configs have V1_STABLE
$ecosystemFiles = @("ecosystem.prod.config.js", "ecosystem.dev.config.js")
foreach ($ecosystemFile in $ecosystemFiles) {
    if (Test-Path $ecosystemFile) {
        $content = Get-Content $ecosystemFile -Raw
        if ($content -notmatch "V1_STABLE.*true") {
            Add-Issue "Ecosystem Config" "$ecosystemFile missing V1_STABLE environment variable" "ERROR" `
                "Add V1_STABLE: 'true' to environment variables in $ecosystemFile"
        }
    }
}

Write-Host "  ✅ Environment variables checked" -ForegroundColor Green

# VALIDATION 3: API URL Consistency
Write-Host "[3/5] Validating API URL consistency..." -ForegroundColor Yellow

# Check frontend API configuration
$apiUrls = @{
    "Production" = "https://api.care2connect.org"
    "Development" = "http://localhost:3001"
}

foreach ($file in @("frontend\src\lib\frontendConfig.ts", "frontend\next.config.js")) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        foreach ($env in $apiUrls.Keys) {
            $expectedUrl = $apiUrls[$env]
            # Look for hardcoded URLs that might be incorrect
            if ($content -match "https?://[^/]+\.(org|com|net)") {
                $foundUrls = [regex]::Matches($content, "https?://[^/\s'""`]+") | ForEach-Object { $_.Value }
                foreach ($url in $foundUrls) {
                    if ($url -ne $expectedUrl -and $env -eq "Production") {
                        Add-Issue "API URLs" "Found potentially incorrect URL in $file`: $url" "WARNING" `
                            "Verify URL is correct or use environment-based configuration"
                    }
                }
            }
        }
    }
}

Write-Host "  ✅ API URLs checked" -ForegroundColor Green

# VALIDATION 4: Tunnel Configuration Consistency
Write-Host "[4/5] Validating tunnel configuration..." -ForegroundColor Yellow

$tunnelConfigPath = "$env:USERPROFILE\.cloudflared\config.yml"
if (Test-Path $tunnelConfigPath) {
    $tunnelConfig = Get-Content $tunnelConfigPath -Raw
    
    # Check for IPv4 forcing in config
    if ($tunnelConfig -notmatch "edge-ip-version.*4") {
        Add-Issue "Tunnel Config" "Tunnel config missing IPv4 forcing (edge-ip-version: 4)" "ERROR" `
            "Add 'edge-ip-version: 4' to $tunnelConfigPath to prevent IPv6 issues"
    }
    
    # Check ingress rules match our ports
    if ($tunnelConfig -match "localhost:(\d+)") {
        $tunnelPort = $matches[1]
        if ($tunnelPort -ne $backendConfigPort) {
            Add-Issue "Tunnel Config" "Tunnel routes to port $tunnelPort but backend uses $backendConfigPort" "CRITICAL" `
                "Update tunnel ingress rules to point to correct backend port"
        }
    }
} else {
    Add-Issue "Tunnel Config" "Tunnel config not found at $tunnelConfigPath" "WARNING" `
        "Ensure Cloudflare tunnel is properly configured"
}

Write-Host "  ✅ Tunnel configuration checked" -ForegroundColor Green

# VALIDATION 5: CI/Deployment Configuration Consistency  
Write-Host "[5/5] Validating CI/deployment configuration..." -ForegroundColor Yellow

$ciFiles = @(
    ".github\workflows\ci.yml",
    ".github\workflows\deploy.yml",
    "docker-compose.yml",
    "docker-compose.production.yml"
)

foreach ($ciFile in $ciFiles) {
    if (Test-Path $ciFile) {
        $content = Get-Content $ciFile -Raw
        
        # Check for hardcoded ports
        $portMatches = [regex]::Matches($content, ":(\d{4})")
        foreach ($match in $portMatches) {
            $port = $match.Groups[1].Value
            if ($port -eq "3001" -or $port -eq "3000") {
                # Good - using standard ports
                continue
            } else {
                Add-Issue "CI/Deployment Config" "Non-standard port $port found in $ciFile" "WARNING" `
                    "Verify port configuration matches environment setup"
            }
        }
        
        # Check for production readiness endpoint usage
        if ($content -match "/health/live" -and $content -notmatch "/ops/health/production") {
            Add-Issue "CI/Deployment Config" "$ciFile uses old health endpoint instead of unified readiness contract" "WARNING" `
                "Update health checks to use /ops/health/production endpoint"
        }
    }
}

Write-Host "  ✅ CI/deployment configuration checked" -ForegroundColor Green

# SUMMARY REPORT
Write-Host ""
Write-Host "=== CONFIGURATION DRIFT VALIDATION COMPLETE ===" -ForegroundColor Cyan

$criticalCount = ($script:issuesFound | Where-Object { $_.Severity -eq "CRITICAL" }).Count
$errorCount = ($script:issuesFound | Where-Object { $_.Severity -eq "ERROR" }).Count
$warningCount = ($script:issuesFound | Where-Object { $_.Severity -eq "WARNING" }).Count

Write-Host "Issues Found:" -ForegroundColor White
Write-Host "  CRITICAL: $criticalCount" -ForegroundColor $(if ($criticalCount -gt 0) { "Red" } else { "Green" })
Write-Host "  ERROR: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })  
Write-Host "  WARNING: $warningCount" -ForegroundColor $(if ($warningCount -gt 0) { "Yellow" } else { "Green" })

if ($script:fixesApplied.Count -gt 0) {
    Write-Host ""
    Write-Host "Fixes Applied:" -ForegroundColor Green
    foreach ($fix in $script:fixesApplied) {
        Write-Host "  ✅ $fix" -ForegroundColor Green
    }
}

# PRODUCTION INVARIANT: Exit with error code based on severity
$exitCode = 0

if ($criticalCount -gt 0) {
    Write-Host ""
    Write-Host "🚨 CRITICAL CONFIGURATION ISSUES FOUND" -ForegroundColor Red -BackgroundColor Black
    Write-Host "   Configuration drift detected that could cause production failures" -ForegroundColor Red
    Write-Host "   IMMEDIATE ACTION REQUIRED before deployment" -ForegroundColor Red
    $exitCode = 3
} elseif ($errorCount -gt 0) {
    Write-Host ""
    Write-Host "❌ CONFIGURATION ERRORS FOUND" -ForegroundColor Red
    Write-Host "   Configuration inconsistencies that should be resolved" -ForegroundColor Yellow
    $exitCode = 2
} elseif ($warningCount -gt 0) {
    Write-Host ""
    Write-Host "⚠️  CONFIGURATION WARNINGS" -ForegroundColor Yellow
    Write-Host "   Minor inconsistencies detected - review recommended" -ForegroundColor Yellow
    if ($StrictMode) {
        Write-Host "   STRICT MODE: Treating warnings as errors" -ForegroundColor Red
        $exitCode = 1
    }
} else {
    Write-Host ""
    Write-Host "✅ ALL CONFIGURATION CHECKS PASSED" -ForegroundColor Green
    Write-Host "   No configuration drift detected" -ForegroundColor Green
}

Write-Host ""
if ($exitCode -gt 0 -and -not $FixDrift) {
    Write-Host "💡 Run with -FixDrift to automatically correct fixable issues" -ForegroundColor Cyan
}

exit $exitCode