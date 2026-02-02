# CareConnect Public Server Deployment Script
# This script starts the database, backend server, and Cloudflare tunnel

Write-Host "🚀 Starting CareConnect Public Deployment..." -ForegroundColor Cyan

# Ensure PATH includes cloudflared
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")

# Function to check if port is in use
function Test-Port {
    param($Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Check if database is running
Write-Host "📊 Checking database status..." -ForegroundColor Yellow
if (Test-Port 5432) {
    Write-Host "✅ Database is already running on port 5432" -ForegroundColor Green
} else {
    Write-Host "🔄 Starting database..." -ForegroundColor Yellow
    Start-Job -Name "Database" -ScriptBlock {
        Set-Location "C:\Users\richl\Care2system"
        docker-compose up --build
    }
    
    # Wait for database to be ready
    $timeout = 60
    $elapsed = 0
    while (-not (Test-Port 5432) -and $elapsed -lt $timeout) {
        Start-Sleep -Seconds 2
        $elapsed += 2
        Write-Host "⏳ Waiting for database... ($elapsed/$timeout seconds)" -ForegroundColor Yellow
    }
    
    if (Test-Port 5432) {
        Write-Host "✅ Database is now running" -ForegroundColor Green
    } else {
        Write-Host "❌ Database failed to start within $timeout seconds" -ForegroundColor Red
        exit 1
    }
}

# Check if backend is running
Write-Host "🔧 Checking backend server status..." -ForegroundColor Yellow
$backendRunning = $false
foreach ($port in @(3001, 3002, 3003)) {
    if (Test-Port $port) {
        Write-Host "✅ Backend server is running on port $port" -ForegroundColor Green
        $backendRunning = $true
        $backendPort = $port
        break
    }
}

if (-not $backendRunning) {
    Write-Host "🔄 Starting backend server..." -ForegroundColor Yellow
    Start-Job -Name "Backend" -ScriptBlock {
        Set-Location "C:\Users\richl\Care2system\backend"
        npm run dev
    }
    
    # Wait for backend to be ready
    $timeout = 30
    $elapsed = 0
    while ($elapsed -lt $timeout) {
        Start-Sleep -Seconds 2
        $elapsed += 2
        foreach ($port in @(3001, 3002, 3003)) {
            if (Test-Port $port) {
                Write-Host "✅ Backend server is now running on port $port" -ForegroundColor Green
                $backendRunning = $true
                $backendPort = $port
                break
            }
        }
        if ($backendRunning) { break }
        Write-Host "⏳ Waiting for backend server... ($elapsed/$timeout seconds)" -ForegroundColor Yellow
    }
    
    if (-not $backendRunning) {
        Write-Host "❌ Backend server failed to start within $timeout seconds" -ForegroundColor Red
        exit 1
    }
}

# Start Cloudflare tunnel
Write-Host "🌐 Starting Cloudflare tunnel for port $backendPort..." -ForegroundColor Yellow
Write-Host "ℹ️  Creating public URL for your server..." -ForegroundColor Cyan

try {
    & cloudflared tunnel --url "http://localhost:$backendPort"
} catch {
    Write-Host "❌ Failed to start Cloudflare tunnel: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure cloudflared is properly installed and accessible" -ForegroundColor Yellow
    exit 1
}