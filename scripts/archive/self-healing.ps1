# ============================================================================
# CARE2SYSTEM - SELF-HEALING & TROUBLESHOOTING SERVICE
# ============================================================================
# Automatically monitors, detects, and fixes common system issues
# Usage: .\self-healing.ps1 -Mode [Monitor|Fix|FullAuto]

param(
    [ValidateSet("Monitor", "Fix", "FullAuto")]
    [string]$Mode = "FullAuto",
    
    [int]$CheckIntervalSeconds = 30,
    
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"

# ============================================================================
# CONFIGURATION
# ============================================================================

$Config = @{
    BackendPath = "C:\Users\richl\Care2system\backend"
    FrontendPath = "C:\Users\richl\Care2system\frontend"
    BackendPort = 3001
    FrontendPort = 3000
    TunnelId = "07e7c160-451b-4d41-875c-a58f79700ae8"
    TunnelConfigPath = "C:\Users\richl\.cloudflared\config.yml"
    LogPath = "C:\Users\richl\Care2system\self-healing.log"
    MaxRestartAttempts = 3
    RestartCooldownMinutes = 5
}

# Service restart tracking
$RestartHistory = @{
    Backend = @()
    Frontend = @()
    Tunnel = @()
}

# ============================================================================
# LOGGING
# ============================================================================

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet("INFO", "WARN", "ERROR", "SUCCESS", "HEAL")]
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Console output with colors
    switch ($Level) {
        "INFO"    { Write-Host $logEntry -ForegroundColor Cyan }
        "WARN"    { Write-Host $logEntry -ForegroundColor Yellow }
        "ERROR"   { Write-Host $logEntry -ForegroundColor Red }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
        "HEAL"    { Write-Host $logEntry -ForegroundColor Magenta }
    }
    
    # File logging
    Add-Content -Path $Config.LogPath -Value $logEntry
}

# ============================================================================
# SERVICE HEALTH CHECKS
# ============================================================================

function Test-ServiceHealth {
    param([string]$ServiceName)
    
    $health = @{
        Service = $ServiceName
        Healthy = $false
        Port = $null
        ProcessId = $null
        Issues = @()
        Recommendations = @()
    }
    
    switch ($ServiceName) {
        "Backend" {
            $health.Port = $Config.BackendPort
            
            # Check if port is listening
            $listening = netstat -ano | findstr ":$($Config.BackendPort).*LISTENING"
            if (-not $listening) {
                $health.Issues += "Port $($Config.BackendPort) not listening"
                $health.Recommendations += "Restart backend service"
                return $health
            }
            
            # Extract PID
            if ($listening -match "\s+(\d+)\s*$") {
                $health.ProcessId = $matches[1]
            }
            
            # HTTP health check
            try {
                $response = Invoke-RestMethod "http://localhost:$($Config.BackendPort)/health/live" -TimeoutSec 5
                if ($response.status -eq "alive") {
                    $health.Healthy = $true
                    if ($Verbose) {
                        Write-Log "Backend healthy: Port $($response.port), PID $($health.ProcessId)" "INFO"
                    }
                } else {
                    $health.Issues += "Health endpoint returned unexpected status: $($response.status)"
                }
            } catch {
                $health.Issues += "Health endpoint not responding: $($_.Exception.Message)"
                $health.Recommendations += "Backend may be starting or crashed"
            }
        }
        
        "Frontend" {
            $health.Port = $Config.FrontendPort
            
            # Check if port is listening
            $listening = netstat -ano | findstr ":$($Config.FrontendPort).*LISTENING"
            if (-not $listening) {
                $health.Issues += "Port $($Config.FrontendPort) not listening"
                $health.Recommendations += "Restart frontend service"
                return $health
            }
            
            # Extract PID
            if ($listening -match "\s+(\d+)\s*$") {
                $health.ProcessId = $matches[1]
            }
            
            # HTTP content check
            try {
                $response = Invoke-WebRequest "http://localhost:$($Config.FrontendPort)" -UseBasicParsing -TimeoutSec 5
                if ($response.Content -match "Your Story Matters") {
                    $health.Healthy = $true
                    if ($Verbose) {
                        Write-Log "Frontend healthy: Port $($Config.FrontendPort), PID $($health.ProcessId)" "INFO"
                    }
                } elseif ($response.Content -match "CareConnect Backend") {
                    $health.Issues += "Frontend serving backend content (wrong service on port)"
                    $health.Recommendations += "Check port configuration, restart services"
                } else {
                    $health.Issues += "Frontend serving unexpected content"
                    $health.Recommendations += "Verify Next.js build and restart"
                }
            } catch {
                $health.Issues += "Frontend not responding: $($_.Exception.Message)"
                $health.Recommendations += "Frontend may be starting or crashed"
            }
        }
        
        "Tunnel" {
            # Check if cloudflared process is running
            $process = Get-Process cloudflared -ErrorAction SilentlyContinue
            if (-not $process) {
                $health.Issues += "Cloudflared process not running"
                $health.Recommendations += "Start tunnel with: cloudflared tunnel run"
                return $health
            }
            
            $health.ProcessId = $process.Id
            
            # Check tunnel config exists
            if (-not (Test-Path $Config.TunnelConfigPath)) {
                $health.Issues += "Tunnel config file missing: $($Config.TunnelConfigPath)"
                $health.Recommendations += "Recreate tunnel configuration"
                return $health
            }
            
            # Verify public URLs (quick DNS check)
            try {
                $dnsCheck = Resolve-DnsName "care2connects.org" -ErrorAction Stop
                $health.Healthy = $true
                if ($Verbose) {
                    Write-Log "Tunnel healthy: PID $($health.ProcessId)" "INFO"
                }
            } catch {
                $health.Issues += "DNS resolution failed for care2connects.org"
                $health.Recommendations += "Check Cloudflare DNS settings"
            }
        }
        
        "Database" {
            # Check PostgreSQL container
            try {
                $container = docker ps --filter "name=postgres" --format "{{.Names}}" 2>$null
                if ($container) {
                    $health.Healthy = $true
                    $health.ProcessId = "Docker:$container"
                    if ($Verbose) {
                        Write-Log "Database healthy: Container $container running" "INFO"
                    }
                } else {
                    $health.Issues += "PostgreSQL container not running"
                    $health.Recommendations += "Start with: docker compose -f docker-compose.demo.yml up -d postgres"
                }
            } catch {
                $health.Issues += "Docker check failed: $($_.Exception.Message)"
                $health.Recommendations += "Ensure Docker Desktop is running"
            }
        }
    }
    
    return $health
}

# ============================================================================
# SELF-HEALING ACTIONS
# ============================================================================

function Start-ServiceHealing {
    param(
        [string]$ServiceName,
        [hashtable]$HealthReport
    )
    
    # Check restart cooldown
    $recentRestarts = $RestartHistory[$ServiceName] | Where-Object { 
        $_ -gt (Get-Date).AddMinutes(-$Config.RestartCooldownMinutes)
    }
    
    if ($recentRestarts.Count -ge $Config.MaxRestartAttempts) {
        Write-Log "Service $ServiceName restarted $($recentRestarts.Count) times in last $($Config.RestartCooldownMinutes) minutes - PAUSING auto-restart" "ERROR"
        Write-Log "Manual intervention required for $ServiceName" "ERROR"
        return $false
    }
    
    Write-Log "🔧 HEALING: $ServiceName (Issues: $($HealthReport.Issues.Count))" "HEAL"
    
    switch ($ServiceName) {
        "Backend" {
            # Kill existing process if stuck
            if ($HealthReport.ProcessId) {
                Write-Log "Stopping existing backend process: PID $($HealthReport.ProcessId)" "HEAL"
                Stop-Process -Id $HealthReport.ProcessId -Force -ErrorAction SilentlyContinue
                Start-Sleep 2
            } else {
                # Kill all node processes on backend port
                $procs = netstat -ano | findstr ":$($Config.BackendPort)"
                if ($procs -match "\s+(\d+)\s*$") {
                    Stop-Process -Id $matches[1] -Force -ErrorAction SilentlyContinue
                }
            }
            
            # Start backend
            Write-Log "Starting backend service on port $($Config.BackendPort)..." "HEAL"
            $job = Start-Job -ScriptBlock {
                param($path)
                Set-Location $path
                npm run dev 2>&1
            } -ArgumentList $Config.BackendPath
            
            Write-Log "Backend job started: Job ID $($job.Id)" "SUCCESS"
            $RestartHistory.Backend += Get-Date
            
            # Wait for startup
            Start-Sleep 8
            
            # Verify
            $verify = Test-ServiceHealth "Backend"
            if ($verify.Healthy) {
                Write-Log "✓ Backend successfully healed and running" "SUCCESS"
                return $true
            } else {
                Write-Log "✗ Backend healing failed: $($verify.Issues -join ', ')" "ERROR"
                Write-Log "Backend job output:" "ERROR"
                Receive-Job $job -Keep | Select-Object -Last 20 | ForEach-Object { Write-Log $_ "ERROR" }
                return $false
            }
        }
        
        "Frontend" {
            # Kill existing process
            if ($HealthReport.ProcessId) {
                Write-Log "Stopping existing frontend process: PID $($HealthReport.ProcessId)" "HEAL"
                Stop-Process -Id $HealthReport.ProcessId -Force -ErrorAction SilentlyContinue
                Start-Sleep 2
            }
            
            # Start frontend
            Write-Log "Starting frontend service on port $($Config.FrontendPort)..." "HEAL"
            $job = Start-Job -ScriptBlock {
                param($path)
                Set-Location $path
                npm run dev 2>&1
            } -ArgumentList $Config.FrontendPath
            
            Write-Log "Frontend job started: Job ID $($job.Id)" "SUCCESS"
            $RestartHistory.Frontend += Get-Date
            
            # Wait for startup
            Start-Sleep 10
            
            # Verify
            $verify = Test-ServiceHealth "Frontend"
            if ($verify.Healthy) {
                Write-Log "✓ Frontend successfully healed and running" "SUCCESS"
                return $true
            } else {
                Write-Log "✗ Frontend healing failed: $($verify.Issues -join ', ')" "ERROR"
                return $false
            }
        }
        
        "Tunnel" {
            # Stop existing tunnel
            Write-Log "Stopping existing cloudflared tunnel..." "HEAL"
            Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
            Start-Sleep 2
            
            # Verify config
            if (-not (Test-Path $Config.TunnelConfigPath)) {
                Write-Log "Creating tunnel configuration..." "HEAL"
                $configContent = @"
tunnel: $($Config.TunnelId)
credentials-file: C:\Users\richl\.cloudflared\$($Config.TunnelId).json

ingress:
  - hostname: api.care2connects.org
    service: http://localhost:$($Config.BackendPort)
  - hostname: care2connects.org
    service: http://localhost:$($Config.FrontendPort)
  - service: http_status:404
"@
                $configContent | Out-File -FilePath $Config.TunnelConfigPath -Encoding UTF8
            }
            
            # Start tunnel
            Write-Log "Starting cloudflared tunnel..." "HEAL"
            $job = Start-Job -ScriptBlock {
                param($tunnelId)
                cloudflared tunnel run $tunnelId 2>&1
            } -ArgumentList $Config.TunnelId
            
            Write-Log "Tunnel job started: Job ID $($job.Id)" "SUCCESS"
            $RestartHistory.Tunnel += Get-Date
            
            # Wait for startup
            Start-Sleep 5
            
            # Verify
            $verify = Test-ServiceHealth "Tunnel"
            if ($verify.Healthy) {
                Write-Log "✓ Tunnel successfully healed and running" "SUCCESS"
                return $true
            } else {
                Write-Log "✗ Tunnel healing failed: $($verify.Issues -join ', ')" "ERROR"
                return $false
            }
        }
        
        "Database" {
            Write-Log "Starting PostgreSQL container..." "HEAL"
            Set-Location "C:\Users\richl\Care2system"
            docker compose -f docker-compose.demo.yml up -d postgres 2>&1 | ForEach-Object { Write-Log $_ "INFO" }
            Start-Sleep 5
            
            $verify = Test-ServiceHealth "Database"
            if ($verify.Healthy) {
                Write-Log "✓ Database successfully healed and running" "SUCCESS"
                return $true
            } else {
                Write-Log "✗ Database healing failed" "ERROR"
                return $false
            }
        }
    }
    
    return $false
}

# ============================================================================
# CLOUDFLARE CACHE MANAGEMENT
# ============================================================================

function Clear-CloudflareCache {
    param([string]$Reason = "Automatic healing")
    
    if (-not $env:CF_API_TOKEN -or -not $env:CF_ZONE_ID) {
        Write-Log "Cloudflare API not configured - skipping cache purge" "WARN"
        return $false
    }
    
    Write-Log "Purging Cloudflare cache: $Reason" "HEAL"
    
    try {
        $headers = @{
            "Authorization" = "Bearer $($env:CF_API_TOKEN)"
            "Content-Type" = "application/json"
        }
        
        $body = @{ purge_everything = $true } | ConvertTo-Json
        
        $response = Invoke-RestMethod `
            -Uri "https://api.cloudflare.com/client/v4/zones/$($env:CF_ZONE_ID)/purge_cache" `
            -Method Delete `
            -Headers $headers `
            -Body $body
        
        if ($response.success) {
            Write-Log "✓ Cloudflare cache purged successfully" "SUCCESS"
            return $true
        } else {
            Write-Log "✗ Cloudflare cache purge failed: $($response.errors -join ', ')" "ERROR"
            return $false
        }
    } catch {
        Write-Log "✗ Cloudflare cache purge error: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# ============================================================================
# COMPREHENSIVE SYSTEM CHECK
# ============================================================================

function Invoke-SystemCheck {
    Write-Log "═══════════════════════════════════════════════════════" "INFO"
    Write-Log "SYSTEM HEALTH CHECK - $(Get-Date -Format 'HH:mm:ss')" "INFO"
    Write-Log "═══════════════════════════════════════════════════════" "INFO"
    
    $allHealthy = $true
    $servicesChecked = @("Database", "Backend", "Frontend", "Tunnel")
    
    foreach ($service in $servicesChecked) {
        $health = Test-ServiceHealth $service
        
        if ($health.Healthy) {
            Write-Log "✓ $service: Healthy" "SUCCESS"
        } else {
            Write-Log "✗ $service: UNHEALTHY" "ERROR"
            $allHealthy = $false
            
            foreach ($issue in $health.Issues) {
                Write-Log "  - Issue: $issue" "ERROR"
            }
            
            foreach ($rec in $health.Recommendations) {
                Write-Log "  - Recommendation: $rec" "WARN"
            }
            
            # Auto-heal if in FullAuto mode
            if ($Mode -eq "FullAuto" -or $Mode -eq "Fix") {
                Write-Log "  → Attempting automatic healing..." "HEAL"
                $healed = Start-ServiceHealing $service $health
                
                if ($healed) {
                    # If backend or frontend was healed, purge cache
                    if ($service -in @("Backend", "Frontend")) {
                        Start-Sleep 2
                        Clear-CloudflareCache "Service $service was restarted"
                    }
                }
            }
        }
    }
    
    if ($allHealthy) {
        Write-Log "═══════════════════════════════════════════════════════" "SUCCESS"
        Write-Log "ALL SYSTEMS OPERATIONAL ✓" "SUCCESS"
        Write-Log "═══════════════════════════════════════════════════════" "SUCCESS"
    } else {
        Write-Log "═══════════════════════════════════════════════════════" "WARN"
        Write-Log "ISSUES DETECTED - Review above" "WARN"
        Write-Log "═══════════════════════════════════════════════════════" "WARN"
    }
    
    return $allHealthy
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        CARE2SYSTEM - SELF-HEALING SERVICE v1.0                ║" -ForegroundColor White
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Mode: $Mode" -ForegroundColor Yellow
Write-Host "Check Interval: $CheckIntervalSeconds seconds" -ForegroundColor Yellow
Write-Host "Log File: $($Config.LogPath)" -ForegroundColor Yellow
Write-Host ""

Write-Log "Self-healing service started in $Mode mode" "INFO"

switch ($Mode) {
    "Monitor" {
        Write-Log "Monitor mode: Will check health but NOT auto-heal" "INFO"
        while ($true) {
            Invoke-SystemCheck | Out-Null
            Write-Host "`nNext check in $CheckIntervalSeconds seconds... (Ctrl+C to stop)" -ForegroundColor Gray
            Start-Sleep $CheckIntervalSeconds
        }
    }
    
    "Fix" {
        Write-Log "Fix mode: Running one-time health check and healing" "INFO"
        Invoke-SystemCheck
        Write-Log "One-time healing complete" "INFO"
    }
    
    "FullAuto" {
        Write-Log "FullAuto mode: Continuous monitoring with auto-healing" "INFO"
        Write-Host "Press Ctrl+C to stop monitoring...`n" -ForegroundColor Yellow
        
        while ($true) {
            try {
                Invoke-SystemCheck | Out-Null
                Write-Host "`nNext check in $CheckIntervalSeconds seconds..." -ForegroundColor Gray
                Start-Sleep $CheckIntervalSeconds
            } catch {
                Write-Log "Error in monitoring loop: $($_.Exception.Message)" "ERROR"
                Start-Sleep 10
            }
        }
    }
}
