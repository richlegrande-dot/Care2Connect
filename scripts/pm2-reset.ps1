# PM2 Reset Script
# Clean PM2 state and optionally kill all Node.js processes
# Usage:
#   .\scripts\pm2-reset.ps1
#   .\scripts\pm2-reset.ps1 -KillNode
#   .\scripts\pm2-reset.ps1 -RestartConfig ecosystem.dev.config.js

param(
    [switch]$KillNode = $false,
    [string]$RestartConfig = ""
)

Write-Host "🔄 PM2 Reset Script" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop PM2 daemon
Write-Host "1️⃣ Stopping PM2 daemon..." -ForegroundColor Yellow
try {
    pm2 kill 2>&1 | Out-Null
    Write-Host "   ✅ PM2 daemon stopped" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  PM2 daemon was not running" -ForegroundColor DarkYellow
}

# Step 2: Delete all processes
Write-Host ""
Write-Host "2️⃣ Deleting all PM2 processes..." -ForegroundColor Yellow
try {
    pm2 delete all 2>&1 | Out-Null
    Write-Host "   ✅ All processes deleted" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  No processes to delete" -ForegroundColor DarkYellow
}

# Step 3: Kill Node.js processes (optional)
if ($KillNode) {
    Write-Host ""
    Write-Host "3️⃣ Killing all Node.js processes..." -ForegroundColor Yellow
    
    $nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "   Found $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor White
        foreach ($proc in $nodeProcesses) {
            Write-Host "   Killing PID $($proc.Id)..." -ForegroundColor Gray
        }
        
        try {
            Stop-Process -Name node -Force
            Write-Host "   ✅ All Node.js processes terminated" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Failed to kill Node.js processes: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "   ℹ️  No Node.js processes running" -ForegroundColor DarkGray
    }
} else {
    Write-Host ""
    Write-Host "3️⃣ Skipping Node.js process cleanup (use -KillNode to enable)" -ForegroundColor DarkGray
}

# Step 4: Restart with config (optional)
if ($RestartConfig) {
    Write-Host ""
    Write-Host "4️⃣ Starting PM2 with config: $RestartConfig" -ForegroundColor Yellow
    
    if (Test-Path $RestartConfig) {
        try {
            pm2 start $RestartConfig
            Write-Host "   ✅ PM2 started successfully" -ForegroundColor Green
            Write-Host ""
            Write-Host "📊 Current PM2 status:" -ForegroundColor Cyan
            pm2 status
            Write-Host ""
            Write-Host "5️⃣ Saving PM2 configuration..." -ForegroundColor Yellow
            pm2 save
            Write-Host "   ✅ Configuration saved" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Failed to start PM2: $_" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "   ❌ Config file not found: $RestartConfig" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "4️⃣ Not restarting (use -RestartConfig to specify config file)" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "✅ PM2 Reset Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  • pm2 start ecosystem.dev.config.js    (development)" -ForegroundColor White
Write-Host "  • pm2 start ecosystem.prod.config.js   (production)" -ForegroundColor White
Write-Host "  • pm2 status                           (check status)" -ForegroundColor White
Write-Host "  • pm2 logs                             (view logs)" -ForegroundColor White
Write-Host ""
