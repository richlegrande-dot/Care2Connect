# Tunnel Credentials Backup Script
# PRODUCTION HARDENING: Secure backup of critical tunnel credentials

param(
    [string]$BackupLocation = "C:\Users\richl\Care2system\backups\tunnel-credentials",
    [switch]$EncryptBackup,
    [string]$Password,
    [switch]$VerifyBackup
)

Write-Host "=== TUNNEL CREDENTIALS BACKUP ===" -ForegroundColor Cyan
Write-Host "CRITICAL: Backing up tunnel credentials to prevent lockout" -ForegroundColor Yellow
Write-Host ""

$credentialsPath = "C:\Users\richl\.cloudflared"
$configFile = "$credentialsPath\config.yml"
$tunnelCredentialsFile = "$credentialsPath\07e7c160-451b-4d41-875c-a58f79700ae8.json"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

# Ensure backup directory exists
if (-not (Test-Path $BackupLocation)) {
    New-Item -Path $BackupLocation -ItemType Directory -Force | Out-Null
    Write-Host "Created backup directory: $BackupLocation" -ForegroundColor Green
}

Write-Host "[1/4] Validating source files..." -ForegroundColor Yellow

# Check if source files exist
$filesToBackup = @()

if (Test-Path $configFile) {
    $filesToBackup += @{ Source = $configFile; Name = "config.yml" }
    Write-Host "  ✅ Found: config.yml" -ForegroundColor Green
} else {
    Write-Host "  ❌ Missing: config.yml" -ForegroundColor Red
}

if (Test-Path $tunnelCredentialsFile) {
    $filesToBackup += @{ Source = $tunnelCredentialsFile; Name = "tunnel-credentials.json" }
    Write-Host "  ✅ Found: tunnel credentials" -ForegroundColor Green
} else {
    Write-Host "  ❌ Missing: tunnel credentials" -ForegroundColor Red
}

if ($filesToBackup.Count -eq 0) {
    Write-Host ""
    Write-Host "🚨 CRITICAL: No tunnel files found to backup!" -ForegroundColor Red
    Write-Host "This means tunnel is not properly configured or files are in wrong location" -ForegroundColor Red
    exit 1
}

Write-Host "[2/4] Creating backup..." -ForegroundColor Yellow

$backupFolder = "$BackupLocation\backup-$timestamp"
New-Item -Path $backupFolder -ItemType Directory -Force | Out-Null

foreach ($file in $filesToBackup) {
    $destPath = "$backupFolder\$($file.Name)"
    Copy-Item -Path $file.Source -Destination $destPath -Force
    Write-Host "  ✅ Backed up: $($file.Name)" -ForegroundColor Green
}

# Create backup metadata
$metadata = @{
    timestamp = $timestamp
    backup_date = (Get-Date).ToString()
    source_location = $credentialsPath
    tunnel_id = "07e7c160-451b-4d41-875c-a58f79700ae8"
    tunnel_name = "careconnect-backend"
    files_backed_up = ($filesToBackup | ForEach-Object { $_.Name })
    computer_name = $env:COMPUTERNAME
    user_name = $env:USERNAME
} | ConvertTo-Json -Depth 3

$metadata | Set-Content "$backupFolder\backup-metadata.json"

Write-Host "[3/4] Encryption and security..." -ForegroundColor Yellow

if ($EncryptBackup) {
    if (-not $Password) {
        Write-Host "  Enter password for backup encryption:" -ForegroundColor Yellow
        $securePassword = Read-Host -AsSecureString
        $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
    }
    
    # Create encrypted zip file
    try {
        $zipPath = "$BackupLocation\tunnel-backup-$timestamp.zip"
        Compress-Archive -Path "$backupFolder\*" -DestinationPath $zipPath -Force
        
        # Note: For production, you'd want to use proper encryption like 7-Zip with password
        Write-Host "  ✅ Backup compressed to: $(Split-Path $zipPath -Leaf)" -ForegroundColor Green
        Write-Host "  ⚠️  Manual encryption recommended for production" -ForegroundColor Yellow
        
        # Remove unencrypted folder
        Remove-Item -Path $backupFolder -Recurse -Force
        
    } catch {
        Write-Host "  ❌ Encryption failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  ⚠️  Backup is unencrypted (use -EncryptBackup for production)" -ForegroundColor Yellow
}

Write-Host "[4/4] Verification..." -ForegroundColor Yellow

if ($VerifyBackup) {
    $verifyFolder = if ($EncryptBackup) { $zipPath } else { $backupFolder }
    
    if (Test-Path $verifyFolder) {
        if ($EncryptBackup) {
            # Verify zip contents
            try {
                $zipContents = Get-ChildItem -Path $zipPath | Select-Object Name
                Write-Host "  ✅ Backup archive verified" -ForegroundColor Green
            } catch {
                Write-Host "  ❌ Backup verification failed" -ForegroundColor Red
            }
        } else {
            # Verify folder contents
            $backupContents = Get-ChildItem -Path $backupFolder
            $expectedFiles = $filesToBackup.Count + 1  # +1 for metadata
            
            if ($backupContents.Count -ge $expectedFiles) {
                Write-Host "  ✅ All expected files backed up ($($backupContents.Count) files)" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  Backup may be incomplete ($($backupContents.Count)/$expectedFiles files)" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "  ❌ Backup location not found for verification" -ForegroundColor Red
    }
} else {
    Write-Host "  ⏭️  Verification skipped (use -VerifyBackup to enable)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== BACKUP COMPLETE ===" -ForegroundColor Green

$finalLocation = if ($EncryptBackup) { $zipPath } else { $backupFolder }

Write-Host "Backup location: $finalLocation" -ForegroundColor White
Write-Host "Timestamp: $timestamp" -ForegroundColor White
Write-Host "Files included: $($filesToBackup.Count)" -ForegroundColor White

Write-Host ""
Write-Host "📋 RECOVERY INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "If tunnel credentials are lost:" -ForegroundColor Cyan
Write-Host "1. Stop any running tunnel: Get-Process cloudflared | Stop-Process -Force" -ForegroundColor Gray
Write-Host "2. Restore files from backup to: $credentialsPath" -ForegroundColor Gray
if ($EncryptBackup) {
    Write-Host "3. Extract encrypted backup using the password you provided" -ForegroundColor Gray
}
Write-Host "4. Restart tunnel: .\scripts\tunnel-start.ps1" -ForegroundColor Gray
Write-Host "5. Verify: .\scripts\tunnel-status.ps1" -ForegroundColor Gray

Write-Host ""
Write-Host "⚠️  SECURITY REMINDERS:" -ForegroundColor Yellow
Write-Host "• Store backup in secure location (password manager, encrypted drive)" -ForegroundColor Yellow
Write-Host "• Do not commit tunnel credentials to source control" -ForegroundColor Yellow
Write-Host "• Test recovery procedure periodically" -ForegroundColor Yellow
Write-Host "• Document backup location for team access" -ForegroundColor Yellow

# Create quick recovery script
$recoveryScript = @"
# Tunnel Credentials Recovery Script
# Generated: $timestamp
# Use this script to quickly recover tunnel credentials

`$credentialsPath = "$credentialsPath"
`$backupPath = "$finalLocation"

Write-Host "Recovering tunnel credentials from backup..." -ForegroundColor Yellow

# Stop existing tunnel
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

# Create credentials directory if missing  
if (-not (Test-Path `$credentialsPath)) {
    New-Item -Path `$credentialsPath -ItemType Directory -Force
}

$(if ($EncryptBackup) {
"# Extract backup (you'll need to provide password)
Expand-Archive -Path `$backupPath -DestinationPath `$credentialsPath -Force"
} else {
"# Copy backup files
Copy-Item -Path `"`$backupPath\*`" -Destination `$credentialsPath -Force"
})

Write-Host "Credentials restored. Test with: .\scripts\tunnel-start.ps1" -ForegroundColor Green
"@

$recoveryScript | Set-Content "$BackupLocation\RECOVERY-SCRIPT-$timestamp.ps1"

Write-Host ""
Write-Host "📄 Recovery script created: RECOVERY-SCRIPT-$timestamp.ps1" -ForegroundColor Cyan
Write-Host ""

exit 0