<#
.SYNOPSIS
    Comprehensive Hardened System Monitor
    
.DESCRIPTION
    PHASE 6M HARDENING: Complete System Health Monitoring
    - Monitors all services (Prisma, Tunnel, Server)
    - Auto-recovery triggers
    - Performance metrics
    - Detailed logging
#>

param(
    [int]$Interval = 60,  # seconds between checks
    [string]$LogFile = "C:\Users\richl\Care2system\logs\system-monitor.log"
)

# Ensure log directory exists
$logDir = Split-Path $LogFile -Parent
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN"  { "Yellow" }
        "SUCCESS" { "Green" }
        "INFO" { "Cyan" }
        default { "White" }
    }
    Write-Host $logMessage -ForegroundColor $color
    Add-Content -Path $LogFile -Value $logMessage
}

function Test-Backend {
    try {
        $response = Invoke-RestMethod "http://localhost:3001/health/live" -TimeoutSec 5
        Write-Log "✅ Backend: $($response.status) (PID: $($response.pid), Uptime: $([math]::Round($response.uptime))s)"
        return $true
    } catch {
        Write-Log "❌ Backend unreachable: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Test-Frontend {
    try {
        $response = Invoke-WebRequest "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
        Write-Log "✅ Frontend: HTTP $($response.StatusCode)"
        return $true
    } catch {
        Write-Log "❌ Frontend unreachable: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Test-ProductionSite {
    try {
        $response = Invoke-WebRequest "https://care2connects.org" -TimeoutSec 10 -UseBasicParsing
        Write-Log "✅ Production: HTTP $($response.StatusCode)"
        return $true
    } catch {
        Write-Log "❌ Production site down: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Test-Tunnel {
    try {
        $process = Get-Process cloudflared -ErrorAction SilentlyContinue
        if ($process) {
            Write-Log "✅ Tunnel: Running (PID: $($process.Id))"
            return $true
        } else {
            Write-Log "⚠️ Tunnel: Not running" "WARN"
            return $false
        }
    } catch {
        Write-Log "❌ Tunnel check failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Get-DetailedHealth {
    try {
        $health = Invoke-RestMethod "http://localhost:3001/health/status" -TimeoutSec 5
        
        Write-Log "📊 System Status: $($health.status)" $(if ($health.status -eq 'healthy') { "SUCCESS" } else { "WARN" })
        
        # Service details
        foreach ($service in $health.services.PSObject.Properties) {
            $status = if ($service.Value.healthy) { "✅" } else { "❌" }
            $latency = if ($service.Value.latency) { "$($service.Value.latency)ms" } else { "N/A" }
            Write-Log "  $status $($service.Name): $latency"
        }
        
        # Speech Intelligence
        if ($health.speechIntelligence.enabled) {
            $status = if ($health.speechIntelligence.running) { "✅" } else { "❌" }
            Write-Log "  $status Speech Intelligence: $(if ($health.speechIntelligence.running) { 'Running' } else { 'Stopped' })"
        }
        
        # Incidents
        if ($health.incidents.open -gt 0) {
            Write-Log "  ⚠️ Open Incidents: $($health.incidents.open)" "WARN"
        }
        
        return $health.status -eq 'healthy'
    } catch {
        Write-Log "❌ Health check failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Get-PrismaHealth {
    try {
        $health = Invoke-RestMethod "http://localhost:3001/health/status" -TimeoutSec 5
        $prisma = $health.services.prisma
        
        if ($prisma.healthy) {
            Write-Log "✅ Prisma: Healthy ($($prisma.latency)ms)"
            return $true
        } else {
            Write-Log "❌ Prisma: Unhealthy - $($prisma.error)" "ERROR"
            return $false
        }
    } catch {
        Write-Log "❌ Prisma check failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Get-RecoveryStats {
    try {
        $stats = Invoke-RestMethod "http://localhost:3001/health/recovery-stats" -TimeoutSec 5
        
        if ($stats.stats.total -gt 0) {
            Write-Log "🔄 Recovery Stats: $($stats.stats.successful)/$($stats.stats.total) successful ($($stats.stats.successRate))" "INFO"
            
            if ($stats.needsRecovery.needed) {
                Write-Log "⚠️ Recovery needed for: $($stats.needsRecovery.services -join ', ')" "WARN"
            }
        }
    } catch {
        # Recovery stats not critical, just log
        Write-Log "Recovery stats unavailable" "INFO"
    }
}

function Invoke-AutoRecovery {
    Write-Log "🔄 Triggering auto-recovery..." "WARN"
    
    try {
        $headers = @{'x-admin-password' = 'admin2024'}
        $result = Invoke-RestMethod "http://localhost:3001/health/recover" -Method POST -Headers $headers -TimeoutSec 10
        
        if ($result.attempted) {
            Write-Log "✅ Recovery attempted for: $($result.services -join ', ')" "SUCCESS"
            Write-Log "   Success Rate: $($result.stats.successRate)" "INFO"
        } else {
            Write-Log "ℹ️ $($result.message)" "INFO"
        }
        
        return $true
    } catch {
        Write-Log "❌ Auto-recovery failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Main monitoring loop
Write-Log "========================================" "INFO"
Write-Log "🚀 PHASE 6M HARDENED SYSTEM MONITOR" "SUCCESS"
Write-Log "Check Interval: $Interval seconds" "INFO"
Write-Log "Log File: $LogFile" "INFO"
Write-Log "========================================" "INFO"

$checkCount = 0
$lastRecoveryAttempt = $null

while ($true) {
    $checkCount++
    Write-Log "`n--- Health Check #$checkCount ---" "INFO"
    
    # Test all components
    $backendOk = Test-Backend
    $frontendOk = Test-Frontend
    $tunnelOk = Test-Tunnel
    $productionOk = Test-ProductionSite
    
    # Detailed health
    $servicesOk = Get-DetailedHealth
    $prismaOk = Get-PrismaHealth
    
    # Recovery stats
    Get-RecoveryStats
    
    # Check if recovery is needed
    $needsRecovery = -not ($backendOk -and $servicesOk -and $prismaOk)
    
    if ($needsRecovery) {
        Write-Log "⚠️ System health degraded - considering recovery..." "WARN"
        
        # Rate limit recovery attempts (max once per 5 minutes)
        $canRecover = $true
        if ($lastRecoveryAttempt) {
            $timeSinceLastRecovery = (Get-Date) - $lastRecoveryAttempt
            if ($timeSinceLastRecovery.TotalMinutes -lt 5) {
                $canRecover = $false
                Write-Log "⏳ Recovery cooldown active (last attempt $([math]::Round($timeSinceLastRecovery.TotalMinutes, 1)) min ago)" "INFO"
            }
        }
        
        if ($canRecover) {
            $lastRecoveryAttempt = Get-Date
            Invoke-AutoRecovery
        }
    } else {
        Write-Log "✅ All systems operational" "SUCCESS"
    }
    
    # Summary
    $overallStatus = if ($backendOk -and $frontendOk -and $tunnelOk -and $productionOk) { "HEALTHY" } else { "DEGRADED" }
    Write-Log "`n📊 Overall Status: $overallStatus" $(if ($overallStatus -eq "HEALTHY") { "SUCCESS" } else { "WARN" })
    
    # Wait before next check
    Write-Log "Next check in $Interval seconds..." "INFO"
    Start-Sleep -Seconds $Interval
}
