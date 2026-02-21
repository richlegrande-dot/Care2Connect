# Enhanced Process Management for Care2system
# PRODUCTION HARDENING: Graceful process lifecycle management

param(
    [ValidateSet("start", "stop", "restart", "status", "cleanup", "health")]
    [string]$Action = "status",
    
    [ValidateSet("backend", "frontend", "tunnel", "all")]
    [string]$Service = "all",
    
    [int]$GracefulTimeoutSeconds = 30,
    [switch]$Force,
    [switch]$Verbose
)

Write-Host "=== ENHANCED PROCESS MANAGEMENT ===" -ForegroundColor Cyan
Write-Host "Action: $Action | Service: $Service" -ForegroundColor White
Write-Host ""

# Process definitions with enhanced configuration
$processes = @{
    backend = @{
        name = "care2system-backend"
        startScript = ".\scripts\prod-start.ps1"
        healthEndpoint = "http://localhost:3001/health/live"
        pidFile = "backend.pid"
        logFile = "logs\backend.log"
        description = "Care2system Backend API"
    }
    frontend = @{
        name = "care2system-frontend" 
        startScript = "npm run dev"
        healthEndpoint = "http://localhost:3000"
        pidFile = "frontend.pid"
        logFile = "logs\frontend.log"
        description = "Care2system Frontend (Next.js)"
    }
    tunnel = @{
        name = "cloudflared"
        startScript = ".\scripts\tunnel-start.ps1"
        healthEndpoint = "https://care2connects.org/ops/health/production"
        pidFile = "tunnel.pid"  
        logFile = "logs\tunnel.log"
        description = "Cloudflare Tunnel"
    }
}

function Write-ProcessLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    if ($Verbose -or $Level -eq "ERROR" -or $Level -eq "WARN") {
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "INFO" { "White" }
            default { "Gray" }
        }
        Write-Host $logEntry -ForegroundColor $color
    }
    
    # Also log to file
    $logEntry | Add-Content "logs\process-manager.log" -ErrorAction SilentlyContinue
}

function Get-ProcessByName {
    param([string]$ProcessName)
    
    try {
        $process = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
        return $process
    } catch {
        return $null
    }
}

function Get-ProcessHealth {
    param([hashtable]$ProcessConfig)
    
    $health = @{
        running = $false
        responding = $false
        pid = $null
        uptime = $null
        healthCheck = $false
        issues = @()
    }
    
    # Check if process is running
    $process = Get-ProcessByName $ProcessConfig.name
    if ($process) {
        $health.running = $true
        $health.pid = $process.Id
        $health.uptime = (Get-Date) - $process.StartTime
        
        # Check if process is responding (basic check)
        try {
            $health.responding = -not $process.HasExited
        } catch {
            $health.responding = $false
            $health.issues += "Process state check failed"
        }
        
        # Health endpoint check if available
        if ($ProcessConfig.healthEndpoint) {
            try {
                $response = Invoke-WebRequest -Uri $ProcessConfig.healthEndpoint -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
                $health.healthCheck = $response.StatusCode -eq 200
                if (-not $health.healthCheck) {
                    $health.issues += "Health endpoint returned: $($response.StatusCode)"
                }
            } catch {
                $health.healthCheck = $false
                $health.issues += "Health endpoint unreachable: $($_.Exception.Message)"
            }
        }
    } else {
        $health.issues += "Process not found"
    }
    
    return $health
}

function Start-ProcessGracefully {
    param([string]$ServiceName, [hashtable]$ProcessConfig)
    
    Write-ProcessLog "Starting $ServiceName ($($ProcessConfig.description))" "INFO"
    
    # Check if already running
    $health = Get-ProcessHealth $ProcessConfig
    if ($health.running) {
        Write-ProcessLog "$ServiceName is already running (PID: $($health.pid))" "WARN"
        return $true
    }
    
    # Ensure log directory exists
    $logDir = Split-Path $ProcessConfig.logFile -Parent
    if ($logDir -and -not (Test-Path $logDir)) {
        New-Item -Path $logDir -ItemType Directory -Force | Out-Null
    }
    
    try {
        # Start the process
        if ($ProcessConfig.startScript.EndsWith(".ps1")) {
            $startProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $ProcessConfig.startScript -PassThru -NoNewWindow
        } else {
            $startProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $ProcessConfig.startScript -PassThru -NoNewWindow
        }
        
        # Store PID
        if ($startProcess.Id) {
            $startProcess.Id | Set-Content $ProcessConfig.pidFile
            Write-ProcessLog "$ServiceName started with PID: $($startProcess.Id)" "INFO"
        }
        
        # Wait for health check
        $maxWaitTime = 60
        $waitInterval = 2
        $elapsed = 0
        
        while ($elapsed -lt $maxWaitTime) {
            Start-Sleep $waitInterval
            $elapsed += $waitInterval
            
            $health = Get-ProcessHealth $ProcessConfig
            if ($health.running -and ($health.healthCheck -or -not $ProcessConfig.healthEndpoint)) {
                Write-ProcessLog "$ServiceName is healthy after $elapsed seconds" "INFO"
                return $true
            }
            
            Write-Host "  Waiting for $ServiceName health check... ($elapsed/$maxWaitTime seconds)" -ForegroundColor Gray
        }
        
        Write-ProcessLog "$ServiceName failed to become healthy within $maxWaitTime seconds" "ERROR"
        return $false
        
    } catch {
        Write-ProcessLog "Failed to start $ServiceName: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Stop-ProcessGracefully {
    param([string]$ServiceName, [hashtable]$ProcessConfig)
    
    Write-ProcessLog "Stopping $ServiceName ($($ProcessConfig.description))" "INFO"
    
    $process = Get-ProcessByName $ProcessConfig.name
    if (-not $process) {
        Write-ProcessLog "$ServiceName is not running" "INFO"
        return $true
    }
    
    Write-ProcessLog "Found $ServiceName running with PID: $($process.Id)" "INFO"
    
    try {
        # Try graceful shutdown first
        if (-not $Force) {
            Write-ProcessLog "Attempting graceful shutdown of $ServiceName..." "INFO"
            
            # For Node.js processes, try SIGTERM
            if ($ServiceName -eq "backend" -or $ServiceName -eq "frontend") {
                # Send CTRL+C signal (graceful)
                try {
                    [System.Diagnostics.Process]::GetProcessById($process.Id).CloseMainWindow()
                    
                    # Wait for graceful shutdown
                    $waitTime = 0
                    while ($waitTime -lt $GracefulTimeoutSeconds -and -not $process.HasExited) {
                        Start-Sleep 1
                        $waitTime++
                        try {
                            $process.Refresh()
                        } catch {
                            # Process has exited
                            break
                        }
                    }
                    
                    if ($process.HasExited) {
                        Write-ProcessLog "$ServiceName stopped gracefully" "INFO"
                        return $true
                    }
                    
                } catch {
                    Write-ProcessLog "Graceful shutdown failed: $($_.Exception.Message)" "WARN"
                }
            }
        }
        
        # Force kill if graceful shutdown failed or Force was specified
        Write-ProcessLog "Force stopping $ServiceName..." "WARN"
        $process.Kill()
        
        # Wait for process to actually exit
        $process.WaitForExit(10000)  # 10 second timeout
        
        Write-ProcessLog "$ServiceName force stopped" "INFO"
        
        # Clean up PID file
        if (Test-Path $ProcessConfig.pidFile) {
            Remove-Item $ProcessConfig.pidFile -Force -ErrorAction SilentlyContinue
        }
        
        return $true
        
    } catch {
        Write-ProcessLog "Failed to stop $ServiceName: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Show-ProcessStatus {
    param([string]$ServiceName, [hashtable]$ProcessConfig)
    
    $health = Get-ProcessHealth $ProcessConfig
    
    Write-Host ""
    Write-Host "🔍 $($ProcessConfig.description) Status" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
    
    if ($health.running) {
        Write-Host "Status: RUNNING" -ForegroundColor Green
        Write-Host "PID: $($health.pid)" -ForegroundColor White
        Write-Host "Uptime: $($health.uptime.ToString('dd\.hh\:mm\:ss'))" -ForegroundColor White
        
        if ($health.responding) {
            Write-Host "Process State: RESPONDING" -ForegroundColor Green
        } else {
            Write-Host "Process State: NOT RESPONDING" -ForegroundColor Red
        }
        
        if ($ProcessConfig.healthEndpoint) {
            if ($health.healthCheck) {
                Write-Host "Health Check: PASSING" -ForegroundColor Green
            } else {
                Write-Host "Health Check: FAILING" -ForegroundColor Red
            }
            Write-Host "Health URL: $($ProcessConfig.healthEndpoint)" -ForegroundColor Gray
        }
        
    } else {
        Write-Host "Status: NOT RUNNING" -ForegroundColor Red
    }
    
    if ($health.issues.Count -gt 0) {
        Write-Host ""
        Write-Host "Issues:" -ForegroundColor Yellow
        foreach ($issue in $health.issues) {
            Write-Host "  • $issue" -ForegroundColor Yellow
        }
    }
}

function Cleanup-OrphanedProcesses {
    Write-ProcessLog "Cleaning up orphaned processes..." "INFO"
    
    $cleaned = 0
    
    # Look for orphaned Node.js processes
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    foreach ($nodeProc in $nodeProcesses) {
        try {
            $commandLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($nodeProc.Id)").CommandLine
            if ($commandLine -and ($commandLine.Contains("care2system") -or $commandLine.Contains("next"))) {
                Write-ProcessLog "Found potential orphaned Node.js process: PID $($nodeProc.Id)" "WARN"
                
                if ($Force) {
                    $nodeProc.Kill()
                    Write-ProcessLog "Killed orphaned Node.js process: PID $($nodeProc.Id)" "INFO"
                    $cleaned++
                } else {
                    Write-ProcessLog "Use -Force to clean up orphaned processes" "INFO"
                }
            }
        } catch {
            # Ignore WMI errors for inaccessible processes
        }
    }
    
    # Look for orphaned cloudflared processes
    $tunnelProcesses = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    foreach ($tunnelProc in $tunnelProcesses) {
        Write-ProcessLog "Found cloudflared process: PID $($tunnelProc.Id)" "INFO"
        
        if ($Force) {
            try {
                $tunnelProc.Kill()
                Write-ProcessLog "Killed cloudflared process: PID $($tunnelProc.Id)" "INFO"
                $cleaned++
            } catch {
                Write-ProcessLog "Failed to kill cloudflared process: $($_.Exception.Message)" "WARN"
            }
        }
    }
    
    # Clean up stale PID files
    $pidFiles = @("backend.pid", "frontend.pid", "tunnel.pid")
    foreach ($pidFile in $pidFiles) {
        if (Test-Path $pidFile) {
            try {
                $pid = Get-Content $pidFile -ErrorAction Stop
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                
                if (-not $process) {
                    Remove-Item $pidFile -Force
                    Write-ProcessLog "Cleaned up stale PID file: $pidFile" "INFO"
                    $cleaned++
                }
            } catch {
                Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
                Write-ProcessLog "Removed invalid PID file: $pidFile" "INFO"
                $cleaned++
            }
        }
    }
    
    Write-ProcessLog "Cleanup complete. $cleaned items cleaned." "INFO"
}

# Main execution logic
$servicesToProcess = if ($Service -eq "all") { @("backend", "frontend", "tunnel") } else { @($Service) }

switch ($Action) {
    "start" {
        foreach ($svc in $servicesToProcess) {
            $success = Start-ProcessGracefully $svc $processes[$svc]
            if (-not $success) {
                Write-ProcessLog "Failed to start $svc" "ERROR"
                exit 1
            }
        }
    }
    
    "stop" {
        foreach ($svc in $servicesToProcess) {
            $success = Stop-ProcessGracefully $svc $processes[$svc]
            if (-not $success) {
                Write-ProcessLog "Failed to stop $svc" "ERROR"
                exit 1
            }
        }
    }
    
    "restart" {
        foreach ($svc in $servicesToProcess) {
            Write-ProcessLog "Restarting $svc..." "INFO"
            Stop-ProcessGracefully $svc $processes[$svc] | Out-Null
            Start-Sleep 2  # Brief pause between stop and start
            $success = Start-ProcessGracefully $svc $processes[$svc]
            if (-not $success) {
                Write-ProcessLog "Failed to restart $svc" "ERROR"
                exit 1
            }
        }
    }
    
    "status" {
        foreach ($svc in $servicesToProcess) {
            Show-ProcessStatus $svc $processes[$svc]
        }
    }
    
    "cleanup" {
        Cleanup-OrphanedProcesses
    }
    
    "health" {
        $allHealthy = $true
        
        foreach ($svc in $servicesToProcess) {
            $health = Get-ProcessHealth $processes[$svc]
            
            if (-not $health.running -or ($processes[$svc].healthEndpoint -and -not $health.healthCheck)) {
                $allHealthy = $false
                Write-ProcessLog "$svc is not healthy" "ERROR"
            } else {
                Write-ProcessLog "$svc is healthy" "INFO"
            }
        }
        
        if ($allHealthy) {
            Write-Host ""
            Write-Host "✅ All services are healthy" -ForegroundColor Green
            exit 0
        } else {
            Write-Host ""
            Write-Host "❌ Some services are unhealthy" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host ""
Write-Host "Process management complete." -ForegroundColor Green