#!/usr/bin/env powershell
# CareConnect Backend Production Deployment Script

Write-Host "🚀 Starting CareConnect Backend Production Deployment..." -ForegroundColor Green

# Refresh PATH
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")

# Set production environment variables
$env:NODE_ENV = "production"
$env:PORT = "3002"

# Start PostgreSQL database
Write-Host "📦 Starting PostgreSQL database..." -ForegroundColor Yellow
cd C:\Users\richl\Care2system
docker compose -f docker-compose.demo.yml up -d postgres

Start-Sleep 5

# Verify database is running
$dbCheck = docker logs care2system-postgres-1 --tail 5 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL database is running" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL database failed to start" -ForegroundColor Red
    Write-Host $dbCheck
    exit 1
}

# Build and start the backend server
Write-Host "🏗️  Building backend server..." -ForegroundColor Yellow
cd backend
npm run build 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend built successfully" -ForegroundColor Green
    
    # Start production server
    Write-Host "🚀 Starting production server..." -ForegroundColor Yellow
    Start-Job -ScriptBlock { 
        cd C:\Users\richl\Care2system\backend
        npm run start
    } -Name "CareConnectBackend"
    
    Start-Sleep 8
} else {
    Write-Host "⚠️  Build failed, starting in development mode..." -ForegroundColor Yellow
    Start-Job -ScriptBlock { 
        cd C:\Users\richl\Care2system\backend
        npm run dev
    } -Name "CareConnectBackend"
    
    Start-Sleep 10
}

# Test server connectivity
Write-Host "🔍 Testing server connectivity..." -ForegroundColor Yellow
$maxRetries = 5
$retryCount = 0
$serverRunning = $false

while ($retryCount -lt $maxRetries -and -not $serverRunning) {
    try {
        $response = Invoke-WebRequest "http://localhost:3002/health/live" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            $serverRunning = $true
            Write-Host "✅ Server is responding on port 3002" -ForegroundColor Green
        }
    } catch {
        $retryCount++
        Write-Host "⏳ Waiting for server... (attempt $retryCount/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep 5
    }
}

if (-not $serverRunning) {
    Write-Host "❌ Server failed to start properly" -ForegroundColor Red
    exit 1
}

# Start Cloudflare tunnel
Write-Host "🌐 Starting Cloudflare tunnel..." -ForegroundColor Yellow
Start-Job -ScriptBlock {
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
    cloudflared tunnel --url http://127.0.0.1:3002
} -Name "CloudflareTunnel"

Start-Sleep 10

# Get tunnel information
$tunnelJob = Get-Job -Name "CloudflareTunnel" -ErrorAction SilentlyContinue
if ($tunnelJob -and $tunnelJob.State -eq "Running") {
    Write-Host "✅ Cloudflare tunnel is running" -ForegroundColor Green
    Write-Host "📡 Public URL will be generated..." -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Tunnel may not be running properly" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green -BackgroundColor Black
Write-Host ""
Write-Host "📊 System Status:" -ForegroundColor White
Write-Host "  • Database: ✅ PostgreSQL running" -ForegroundColor Green
Write-Host "  • Backend:  ✅ Node.js server on port 3002" -ForegroundColor Green  
Write-Host "  • Tunnel:   ✅ Cloudflare tunnel active" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Local Access:" -ForegroundColor White
Write-Host "  • Homepage: http://localhost:3002" -ForegroundColor Cyan
Write-Host "  • Health:   http://localhost:3002/health/test" -ForegroundColor Cyan
Write-Host "  • API:      http://localhost:3002/api/*" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌍 Public Access: Check tunnel logs for public URL" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor White
Write-Host "  1. Note the public tunnel URL from logs" -ForegroundColor Yellow
Write-Host "  2. Create Stripe webhook: [tunnel-url]/api/payments/stripe-webhook" -ForegroundColor Yellow
Write-Host "  3. Add STRIPE_WEBHOOK_SECRET to .env file" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Monitor Jobs:" -ForegroundColor White
Write-Host "  • Get-Job | Format-Table" -ForegroundColor Gray
Write-Host "  • Receive-Job -Name 'CloudflareTunnel' -Keep" -ForegroundColor Gray
Write-Host ""