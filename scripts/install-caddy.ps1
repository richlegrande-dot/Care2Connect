# Install Caddy Reverse Proxy for Production
# Replaces reverse-proxy.js with robust, production-grade proxy

param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Caddy Reverse Proxy Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$CaddyVersion = "2.7.6"
$CaddyDir = "C:\Program Files\Caddy"
$CaddyExe = "$CaddyDir\caddy.exe"
$CaddyDownloadUrl = "https://github.com/caddyserver/caddy/releases/download/v$CaddyVersion/caddy_${CaddyVersion}_windows_amd64.zip"

# Check if already installed
if ((Test-Path $CaddyExe) -and -not $Force) {
    Write-Host "Caddy already installed at: $CaddyExe" -ForegroundColor Green
    & $CaddyExe version
    Write-Host ""
    Write-Host "Use -Force to reinstall" -ForegroundColor Yellow
    exit 0
}

# Create installation directory
Write-Host "[1/5] Creating installation directory..." -ForegroundColor Yellow
if (-not (Test-Path $CaddyDir)) {
    New-Item -ItemType Directory -Path $CaddyDir -Force | Out-Null
    Write-Host "  Created: $CaddyDir" -ForegroundColor Gray
}

# Download Caddy
Write-Host "[2/5] Downloading Caddy v$CaddyVersion..." -ForegroundColor Yellow
$ZipPath = "$env:TEMP\caddy.zip"
try {
    Invoke-WebRequest -Uri $CaddyDownloadUrl -OutFile $ZipPath -UseBasicParsing
    Write-Host "  Downloaded to: $ZipPath" -ForegroundColor Gray
} catch {
    Write-Host "Failed to download Caddy" -ForegroundColor Red
    Write-Host "  URL: $CaddyDownloadUrl" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

# Extract Caddy
Write-Host "[3/5] Extracting Caddy binary..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $ZipPath -DestinationPath $CaddyDir -Force
    Write-Host "  Extracted to: $CaddyDir" -ForegroundColor Gray
} catch {
    Write-Host "Failed to extract Caddy" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

# Verify installation
Write-Host "[4/5] Verifying installation..." -ForegroundColor Yellow
if (Test-Path $CaddyExe) {
    $version = & $CaddyExe version
    Write-Host "  Caddy installed: $version" -ForegroundColor Green
} else {
    Write-Host "Caddy executable not found after extraction" -ForegroundColor Red
    exit 1
}

# Create logs directory
$LogsDir = "C:\Users\richl\Care2system\logs"
if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir -Force | Out-Null
}

# Cleanup
Remove-Item $ZipPath -Force -ErrorAction SilentlyContinue

Write-Host "[5/5] Installation complete!" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Caddy Installation Complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Caddy location: $CaddyExe" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Start production stack" -ForegroundColor Cyan
Write-Host "  .\scripts\start-production-stack.ps1" -ForegroundColor White
Write-Host ""
