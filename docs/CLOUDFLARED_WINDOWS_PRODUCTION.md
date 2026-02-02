# Cloudflared Windows Production Setup Guide

**Target Audience:** System Administrators, DevOps Engineers  
**Environment:** Windows 10/11, Windows Server 2016+  
**Prerequisites:** Administrator privileges, PowerShell 5.1+  

## Overview

This guide provides production-ready setup instructions for Cloudflare tunnels on Windows systems. It covers installation, configuration, service setup, and operational best practices for stable tunnel connectivity.

## Table of Contents

1. [Installation](#installation)
2. [Version Management](#version-management)
3. [Authentication Setup](#authentication-setup)
4. [Tunnel Configuration](#tunnel-configuration)
5. [Windows Service Setup](#windows-service-setup)
6. [Certificate Pool Configuration](#certificate-pool-configuration)
7. [Operational Procedures](#operational-procedures)
8. [Monitoring & Health Checks](#monitoring--health-checks)
9. [Troubleshooting](#troubleshooting)
10. [Security Considerations](#security-considerations)

---

## Installation

### Method 1: WinGet Package Manager (Recommended)

```powershell
# Check if winget is available
winget --version

# Install cloudflared
winget install cloudflare.cloudflared

# Verify installation
cloudflared --version
```

### Method 2: Direct Download

```powershell
# Download latest release
$url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
$output = "C:\Program Files\Cloudflare\cloudflared.exe"

# Create directory
New-Item -ItemType Directory -Force -Path "C:\Program Files\Cloudflare"

# Download
Invoke-WebRequest -Uri $url -OutFile $output

# Add to PATH
$env:PATH += ";C:\Program Files\Cloudflare"
[Environment]::SetEnvironmentVariable("PATH", $env:PATH, "Machine")
```

### Installation Verification

```powershell
# Verify installation
cloudflared --version

# Expected output format:
# cloudflared version 2025.11.1 (built 2025-11-15-1234 UTC)

# Check help
cloudflared --help
```

---

## Version Management

### Checking Current Version

```powershell
# Get current version
cloudflared --version

# Check for updates (if installed via winget)
winget upgrade cloudflare.cloudflared
```

### Upgrade Procedures

#### Via WinGet (Recommended)

```powershell
# Check available updates
winget upgrade --id cloudflare.cloudflared

# Upgrade to latest
winget upgrade cloudflare.cloudflared

# Verify upgrade
cloudflared --version
```

#### Manual Upgrade

```powershell
# Stop running tunnel service
Stop-Service -Name "Cloudflared" -ErrorAction SilentlyContinue

# Download new version
$url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
$backup = "C:\Program Files\Cloudflare\cloudflared-backup.exe"
$current = "C:\Program Files\Cloudflare\cloudflared.exe"

# Backup current version
Copy-Item $current $backup

# Download new version
Invoke-WebRequest -Uri $url -OutFile $current

# Start service
Start-Service -Name "Cloudflared" -ErrorAction SilentlyContinue

# Verify
cloudflared --version
```

---

## Authentication Setup

### Initial Authentication

```powershell
# Login to Cloudflare (opens browser)
cloudflared tunnel login

# This creates: C:\Users\<username>\.cloudflared\cert.pem
# Verify certificate exists
Test-Path "C:\Users\$env:USERNAME\.cloudflared\cert.pem"
```

### Service Account Setup (Production)

For production environments, use service accounts:

```powershell
# Create service-specific directory
$serviceDir = "C:\ProgramData\Cloudflared"
New-Item -ItemType Directory -Force -Path $serviceDir

# Copy authentication certificate
Copy-Item "C:\Users\$env:USERNAME\.cloudflared\cert.pem" "$serviceDir\cert.pem"

# Set appropriate permissions
$acl = Get-Acl $serviceDir
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("NT SERVICE\Cloudflared","FullControl","ContainerInherit,ObjectInherit","None","Allow")
$acl.SetAccessRule($accessRule)
Set-Acl -Path $serviceDir -AclObject $acl
```

---

## Tunnel Configuration

### Create Named Tunnel

```powershell
# Create tunnel
cloudflared tunnel create careconnect-backend

# Expected output:
# Tunnel credentials written to C:\Users\<user>\.cloudflared\<uuid>.json
# Created tunnel careconnect-backend with id <uuid>
```

### Configuration File Setup

Create `C:\ProgramData\Cloudflared\config.yml`:

```yaml
tunnel: <tunnel-id-from-creation>
credentials-file: C:\ProgramData\Cloudflared\<tunnel-id>.json

# Logging
loglevel: info
logfile: C:\ProgramData\Cloudflared\cloudflared.log

# Origin certificate (fixes Windows certificate pool warnings)
origincert: C:\ProgramData\Cloudflared\cert.pem

# Ingress rules
ingress:
  - hostname: care2connects.org
    service: http://localhost:3002
  - hostname: api.care2connects.org
    service: http://localhost:3002
  - service: http_status:404
```

### DNS Configuration

```powershell
# Create DNS records
cloudflared tunnel route dns <tunnel-id> care2connects.org
cloudflared tunnel route dns <tunnel-id> api.care2connects.org

# Verify DNS records
nslookup care2connects.org 8.8.8.8
```

---

## Windows Service Setup

### Service Installation

```powershell
# Install as Windows service
cloudflared service install

# Alternative with custom config path
cloudflared --config "C:\ProgramData\Cloudflared\config.yml" service install
```

### Service Configuration

```powershell
# Configure service for automatic startup
Set-Service -Name "Cloudflared" -StartupType Automatic

# Set service recovery options
sc.exe failure "Cloudflared" reset= 60 actions= restart/5000/restart/10000/restart/30000

# Configure service to restart on failure
$service = Get-WmiObject -Class Win32_Service -Filter "Name='Cloudflared'"
$service.Change($null,$null,$null,$null,$null,$null,$null,$null,$null,3,5000)
```

### Service Management Commands

```powershell
# Start service
Start-Service -Name "Cloudflared"

# Stop service
Stop-Service -Name "Cloudflared"

# Restart service
Restart-Service -Name "Cloudflared"

# Check service status
Get-Service -Name "Cloudflared"

# View service logs
Get-EventLog -LogName Application -Source "Cloudflared" -Newest 10
```

---

## Certificate Pool Configuration

### Resolve Certificate Pool Warnings

Windows systems may show certificate pool warnings. To resolve:

#### Method 1: Origin Certificate Configuration

Add to `config.yml`:

```yaml
# Use Cloudflare origin certificate
origincert: C:\ProgramData\Cloudflared\cert.pem

# Alternative: specify certificate pool path
origin-ca-pool: C:\ProgramData\Cloudflared\ca-certificates.crt
```

#### Method 2: Download Certificate Bundle

```powershell
# Download Mozilla CA bundle
$caUrl = "https://curl.se/ca/cacert.pem"
$caPath = "C:\ProgramData\Cloudflared\ca-certificates.crt"
Invoke-WebRequest -Uri $caUrl -OutFile $caPath

# Update config.yml to reference bundle
# origin-ca-pool: C:\ProgramData\Cloudflared\ca-certificates.crt
```

---

## Operational Procedures

### Daily Operations

```powershell
# Health check script (save as check-tunnel.ps1)
$serviceName = "Cloudflared"
$logPath = "C:\ProgramData\Cloudflared\cloudflared.log"

# Check service status
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if ($service.Status -eq "Running") {
    Write-Host "✅ Cloudflared service is running" -ForegroundColor Green
} else {
    Write-Host "❌ Cloudflared service is not running" -ForegroundColor Red
    Write-Host "Attempting to start service..." -ForegroundColor Yellow
    Start-Service -Name $serviceName
}

# Check recent logs for errors
if (Test-Path $logPath) {
    $recentLogs = Get-Content $logPath -Tail 10
    $errorCount = ($recentLogs | Select-String -Pattern "ERR|ERROR|FATAL").Count
    if ($errorCount -gt 0) {
        Write-Host "⚠️  Found $errorCount errors in recent logs" -ForegroundColor Yellow
    } else {
        Write-Host "✅ No errors in recent logs" -ForegroundColor Green
    }
}

# Test tunnel connectivity
try {
    $response = Invoke-WebRequest -Uri "https://care2connects.org/health/live" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Tunnel connectivity successful" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Tunnel connectivity failed: $($_.Exception.Message)" -ForegroundColor Red
}
```

### Scheduled Tasks

Create a scheduled task for automated health checks:

```powershell
# Create scheduled task for tunnel monitoring
$action = New-ScheduledTaskAction -Execute 'PowerShell.exe' -Argument '-File "C:\Scripts\check-tunnel.ps1"'
$trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 5) -At (Get-Date) -Once
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserID "NT AUTHORITY\SYSTEM" -LogonType ServiceAccount

Register-ScheduledTask -TaskName "CloudflaredHealthCheck" -Action $action -Trigger $trigger -Settings $settings -Principal $principal
```

---

## Monitoring & Health Checks

### Log Management

```powershell
# View live logs
Get-Content "C:\ProgramData\Cloudflared\cloudflared.log" -Wait

# Search for specific events
Get-Content "C:\ProgramData\Cloudflared\cloudflared.log" | Select-String "connection.*registered"

# Log rotation (implement in scheduled task)
$logPath = "C:\ProgramData\Cloudflared\cloudflared.log"
$maxSize = 50MB
if ((Get-Item $logPath).Length -gt $maxSize) {
    Move-Item $logPath "$logPath.old"
    Restart-Service -Name "Cloudflared"
}
```

### Performance Monitoring

```powershell
# Monitor tunnel connections
cloudflared tunnel info careconnect-backend

# Check tunnel metrics (if metrics server enabled)
Invoke-RestMethod -Uri "http://localhost:20241/metrics"
```

### Alerting Setup

```powershell
# Simple email alerting function
function Send-TunnelAlert {
    param($Message, $Severity)
    
    # Configure your email settings
    $smtpServer = "your-smtp-server.com"
    $from = "alerts@yourcompany.com"
    $to = "admin@yourcompany.com"
    
    $subject = "Cloudflare Tunnel Alert - $Severity"
    $body = @"
Tunnel Alert: $Message

Timestamp: $(Get-Date)
Server: $env:COMPUTERNAME
Service Status: $(Get-Service Cloudflared).Status

Please investigate immediately.
"@
    
    Send-MailMessage -SmtpServer $smtpServer -From $from -To $to -Subject $subject -Body $body
}

# Usage in monitoring scripts
if ($service.Status -ne "Running") {
    Send-TunnelAlert "Cloudflared service stopped unexpectedly" "CRITICAL"
}
```

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: Service Won't Start

```powershell
# Check service dependencies
Get-Service -Name "Cloudflared" | Select-Object -ExpandProperty ServicesDependedOn

# Check Windows Event Logs
Get-EventLog -LogName Application -Source "Cloudflared" -Newest 5

# Test configuration file
cloudflared tunnel --config "C:\ProgramData\Cloudflared\config.yml" --dry-run

# Check file permissions
Get-Acl "C:\ProgramData\Cloudflared" | Format-List
```

#### Issue: Connection Timeouts

```powershell
# Test local service
Invoke-WebRequest -Uri "http://localhost:3002/health/live" -UseBasicParsing

# Check firewall rules
Get-NetFirewallRule -DisplayName "*cloudflared*"

# Add firewall exception if needed
New-NetFirewallRule -DisplayName "Cloudflared" -Direction Inbound -Program "C:\Program Files\Cloudflare\cloudflared.exe" -Action Allow
```

#### Issue: Certificate Errors

```powershell
# Verify certificate file exists and is readable
Test-Path "C:\ProgramData\Cloudflared\cert.pem"
Get-Acl "C:\ProgramData\Cloudflared\cert.pem"

# Re-authenticate if needed
cloudflared tunnel login

# Check certificate expiration
$cert = Get-Content "C:\ProgramData\Cloudflared\cert.pem" -Raw
# Parse certificate and check expiry date
```

### Diagnostic Commands

```powershell
# Full system diagnostic
Write-Host "=== Cloudflared Diagnostic Report ===" -ForegroundColor Cyan

# Version check
Write-Host "`nVersion Information:" -ForegroundColor Yellow
cloudflared --version

# Service status
Write-Host "`nService Status:" -ForegroundColor Yellow
Get-Service -Name "Cloudflared" | Format-Table -AutoSize

# Configuration verification
Write-Host "`nConfiguration Check:" -ForegroundColor Yellow
if (Test-Path "C:\ProgramData\Cloudflared\config.yml") {
    Write-Host "✅ Config file exists"
    cloudflared tunnel --config "C:\ProgramData\Cloudflared\config.yml" --dry-run
} else {
    Write-Host "❌ Config file not found"
}

# Connectivity test
Write-Host "`nConnectivity Test:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://care2connects.org/health/live" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Tunnel responding (Status: $($response.StatusCode))"
} catch {
    Write-Host "❌ Tunnel not responding: $($_.Exception.Message)"
}

# Recent errors
Write-Host "`nRecent Log Errors:" -ForegroundColor Yellow
$logPath = "C:\ProgramData\Cloudflared\cloudflared.log"
if (Test-Path $logPath) {
    $errors = Get-Content $logPath -Tail 50 | Select-String -Pattern "ERR|ERROR|FATAL"
    if ($errors.Count -gt 0) {
        $errors | Select-Object -Last 5 | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    } else {
        Write-Host "  No errors found in recent logs"
    }
} else {
    Write-Host "  Log file not found"
}
```

---

## Security Considerations

### File Permissions

```powershell
# Secure configuration directory
$configDir = "C:\ProgramData\Cloudflared"
$acl = Get-Acl $configDir

# Remove inherited permissions
$acl.SetAccessRuleProtection($true, $false)

# Add specific permissions
$adminRule = New-Object System.Security.AccessControl.FileSystemAccessRule("BUILTIN\Administrators","FullControl","ContainerInherit,ObjectInherit","None","Allow")
$serviceRule = New-Object System.Security.AccessControl.FileSystemAccessRule("NT SERVICE\Cloudflared","ReadAndExecute","ContainerInherit,ObjectInherit","None","Allow")

$acl.SetAccessRule($adminRule)
$acl.SetAccessRule($serviceRule)
Set-Acl -Path $configDir -AclObject $acl
```

### Credential Management

- Store tunnel credentials in `C:\ProgramData\Cloudflared\` (system-wide)
- Use service accounts instead of user accounts
- Regularly rotate authentication certificates
- Monitor access to credential files

### Network Security

```powershell
# Restrict cloudflared network access
New-NetFirewallRule -DisplayName "Cloudflared Outbound" -Direction Outbound -Program "C:\Program Files\Cloudflare\cloudflared.exe" -RemoteAddress "198.41.192.0/24,198.41.200.0/24" -Action Allow

# Block other outbound traffic for the service (optional)
New-NetFirewallRule -DisplayName "Cloudflared Block Others" -Direction Outbound -Program "C:\Program Files\Cloudflare\cloudflared.exe" -Action Block
```

---

## Best Practices Summary

### Installation
- ✅ Use WinGet for easy updates
- ✅ Install as Windows service for reliability
- ✅ Store configuration in `C:\ProgramData\Cloudflared\`
- ✅ Keep cloudflared up to date (check monthly)

### Configuration
- ✅ Use named tunnels (not quick tunnels) for production
- ✅ Specify origin certificate to avoid warnings
- ✅ Enable detailed logging for troubleshooting
- ✅ Configure service recovery options

### Operations
- ✅ Monitor service status with scheduled tasks
- ✅ Implement log rotation to prevent disk space issues
- ✅ Set up alerting for service failures
- ✅ Test tunnel connectivity regularly

### Security
- ✅ Secure configuration files with appropriate permissions
- ✅ Use service accounts for tunnel authentication
- ✅ Monitor access to tunnel credentials
- ✅ Keep certificates up to date

---

## Support Resources

- **Cloudflare Documentation:** https://developers.cloudflare.com/cloudflare-one/
- **GitHub Issues:** https://github.com/cloudflare/cloudflared/issues
- **Community Forum:** https://community.cloudflare.com/
- **Status Page:** https://www.cloudflarestatus.com/

---

**Document Version:** 1.0  
**Last Updated:** December 14, 2025  
**Tested On:** Windows 10, Windows 11, Windows Server 2019/2022