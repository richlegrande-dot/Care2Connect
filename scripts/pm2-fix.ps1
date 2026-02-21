# PM2 Quick Fix Utility
# One-command solution for common PM2 issues on Windows

param(
    [Parameter(Position=0)]
    [ValidateSet("restart", "rebuild", "reset", "status", "logs")]
    [string]$Action = "status",
    
    [switch]$Verbose = $false
)

$ErrorActionPreference = 'Continue'
$workspaceRoot = Split-Path $PSScriptRoot -Parent

function Write-Header {
    param($Text)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-Success {
    param($Text)
    Write-Host "✓ $Text" -ForegroundColor Green
}

function Write-Error {
    param($Text)
    Write-Host "✗ $Text" -ForegroundColor Red
}

function Write-Info {
    param($Text)
    Write-Host "→ $Text" -ForegroundColor Yellow
}

function Get-PM2Status {
    try {
        $processes = pm2 jlist 2>&1 | ConvertFrom-Json
        return @{
            success = $true
            processes = $processes
            online = ($processes | Where-Object { $_.pm2_env.status -eq 'online' }).Count
            total = $processes.Count
        }
    } catch {
        return @{
            success = $false
            error = $_.Exception.Message
        }
    }
}

function Show-Status {
    Write-Header "PM2 STATUS"
    
    $status = Get-PM2Status
    
    if (-not $status.success) {
        Write-Error "PM2 not responding: $($status.error)"
        Write-Info "Try: pm2-fix reset"
        return
    }
    
    if ($status.total -eq 0) {
        Write-Error "No PM2 processes running"
        Write-Info "Try: pm2-fix restart"
        return
    }
    
    Write-Host "Processes: $($status.online) online / $($status.total) total`n"
    
    $status.processes | ForEach-Object {
        $icon = switch ($_.pm2_env.status) {
            "online" { "OK" }
            "stopped" { "STOPPED" }
            "errored" { "ERROR" }
            default { "UNKNOWN" }
        }
        
        $color = switch ($_.pm2_env.status) {
            "online" { "Green" }
            "stopped" { "Yellow" }
            "errored" { "Red" }
            default { "Gray" }
        }
        
        $uptime = if ($_.pm2_env.status -eq 'online') {
            $uptimeSec = [math]::Round((Get-Date).Subtract([datetime]::FromFileTimeUtc($_.pm2_env.pm_uptime)).TotalSeconds)
            "$uptimeSec" + "s"
        } else {
            "N/A"
        }
        
        Write-Host "$icon " -ForegroundColor $color -NoNewline
        Write-Host "$($_.name) " -NoNewline
        Write-Host "[$($_.pm2_env.status)] " -ForegroundColor $color -NoNewline
        Write-Host "uptime: $uptime, restarts: $($_.pm2_env.restart_time)"
    }
    
    if ($status.online -lt $status.total) {
        Write-Host "`n"
        Write-Info "Some processes are not online. Try: pm2-fix restart"
    }
}

function Restart-Services {
    Write-Header "RESTARTING PM2 SERVICES"
    
    # Validate configuration first
    Write-Info "Validating PM2 configuration..."
    & "$workspaceRoot\scripts\validate-pm2-config.ps1" -AutoFix
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Configuration validation failed"
        return
    }
    
    Write-Info "Restarting all PM2 processes..."
    pm2 restart all
    
    Start-Sleep -Seconds 3
    Show-Status
}

function Rebuild-All {
    Write-Header "REBUILDING SERVICES"
    
    Write-Info "Building backend..."
    Push-Location "$workspaceRoot\backend"
    npm run build
    $backendSuccess = $LASTEXITCODE -eq 0
    Pop-Location
    
    if ($backendSuccess) {
        Write-Success "Backend built successfully"
    } else {
        Write-Error "Backend build failed"
        return
    }
    
    Write-Info "Building frontend..."
    Push-Location "$workspaceRoot\frontend"
    npm run build
    $frontendSuccess = $LASTEXITCODE -eq 0
    Pop-Location
    
    if ($frontendSuccess) {
        Write-Success "Frontend built successfully"
    } else {
        Write-Error "Frontend build failed"
        return
    }
    
    Write-Info "Restarting PM2 services..."
    pm2 restart all
    
    Start-Sleep -Seconds 3
    Show-Status
}

function Reset-PM2 {
    Write-Header "RESETTING PM2 COMPLETELY"
    
    Write-Info "Stopping all PM2 processes..."
    pm2 delete all 2>&1 | Out-Null
    
    Write-Info "Validating ecosystem configuration..."
    & "$workspaceRoot\scripts\validate-pm2-config.ps1" -AutoFix
    
    Write-Info "Starting PM2 services..."
    pm2 start "$workspaceRoot\ecosystem.config.js"
    
    Start-Sleep -Seconds 3
    Show-Status
    
    Write-Host "`n"
    Write-Success "PM2 reset complete"
    Write-Info "Save PM2 startup: pm2 save"
}

function Show-Logs {
    Write-Header "PM2 LOGS"
    
    Write-Host "Opening PM2 logs (Ctrl+C to exit)...`n"
    Start-Sleep -Seconds 1
    pm2 logs --lines 50
}

# Main execution
switch ($Action) {
    "status" {
        Show-Status
    }
    "restart" {
        Restart-Services
    }
    "rebuild" {
        Rebuild-All
    }
    "reset" {
        Reset-PM2
    }
    "logs" {
        Show-Logs
    }
}

Write-Host "`n"
