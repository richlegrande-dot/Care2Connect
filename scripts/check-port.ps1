# Port Check - Ensure port 3001 is available before starting backend
# Run this before starting the server to detect port conflicts

param(
    [int]$Port = 3001
)

$ErrorActionPreference = "Stop"

Write-Host "🔍 Checking if port $Port is available..." -ForegroundColor Cyan

# Check if port is in use
$connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

if ($connection) {
    Write-Host "`n❌ PORT CONFLICT DETECTED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Port $Port is already in use." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📊 Process Information:" -ForegroundColor Cyan
    
    foreach ($conn in $connection) {
        $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        
        if ($process) {
            Write-Host "   Process Name: $($process.ProcessName)" -ForegroundColor White
            Write-Host "   Process ID (PID): $($process.Id)" -ForegroundColor White
            Write-Host "   Started: $($process.StartTime)" -ForegroundColor White
            Write-Host "   State: $($conn.State)" -ForegroundColor White
            Write-Host ""
        }
    }
    
    Write-Host "🔧 Solutions:" -ForegroundColor Yellow
    Write-Host "   Option 1: Stop the conflicting process"
    Write-Host "      Stop-Process -Id <PID> -Force"
    Write-Host ""
    Write-Host "   Option 2: Use a different port"
    Write-Host "      Set PORT=3002 in .env"
    Write-Host ""
    Write-Host "   Option 3: Kill all Node processes"
    Write-Host "      Get-Process node | Stop-Process -Force"
    Write-Host ""
    
    exit 1
} else {
    Write-Host "✅ Port $Port is available!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ready to start backend on port $Port" -ForegroundColor Cyan
    exit 0
}
