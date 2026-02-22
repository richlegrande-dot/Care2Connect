#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Configure PM2 to survive Windows reboots via Task Scheduler.
.DESCRIPTION
    1. Runs `pm2 save` to persist the current process list.
    2. Creates a Windows Scheduled Task that runs `pm2 resurrect` at user logon,
       so all PM2-managed services restore automatically after a reboot.

    Run this ONCE after the stack is healthy and you want reboot-survival enabled.
    Re-running is safe: if the task already exists it prints OK and exits 0.

.PARAMETER TaskName
    Name for the scheduled task. Default: "PM2-Resurrect"

.PARAMETER TaskUser
    Run the task as this user account. Default: current user ($env:USERDOMAIN\$env:USERNAME).

.EXAMPLE
    .\scripts\ops\pm2-enable-startup.ps1

.EXAMPLE
    .\scripts\ops\pm2-enable-startup.ps1 -TaskName "Care2-PM2-Startup" -TaskUser "DESKTOP-ABC\richl"
#>
param(
    [string]$TaskName = "PM2-Resurrect",
    [string]$TaskUser = ""
)

$ErrorActionPreference = "Stop"

# Resolve user
if ([string]::IsNullOrWhiteSpace($TaskUser)) {
    if ($env:USERDOMAIN -and $env:USERNAME) {
        $TaskUser = "$($env:USERDOMAIN)\$($env:USERNAME)"
    } else {
        $TaskUser = $env:USERNAME
    }
}

Write-Host ""
Write-Host "=== PM2 Windows Startup Persistence ===" -ForegroundColor Cyan
Write-Host "Task name : $TaskName" -ForegroundColor Gray
Write-Host "Run as    : $TaskUser" -ForegroundColor Gray
Write-Host ""

# Step 1: Save current PM2 process list
Write-Host "[1/3] Saving PM2 process list (pm2 save)..." -ForegroundColor White
try {
    $saveOut = & pm2 save 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARN] pm2 save returned $LASTEXITCODE -- continuing anyway" -ForegroundColor Yellow
        Write-Host $saveOut -ForegroundColor Gray
    } else {
        Write-Host "      PM2 dump saved." -ForegroundColor Green
    }
} catch {
    Write-Host "[WARN] pm2 not on PATH or save failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "       Ensure pm2 is installed globally: npm install -g pm2" -ForegroundColor Gray
}

# Step 2: Check if task already exists
Write-Host "[2/3] Checking for existing scheduled task '$TaskName'..." -ForegroundColor White
$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "      Task '$TaskName' already exists -- nothing to do." -ForegroundColor Green
    Write-Host ""
    Write-Host "[OK] PM2 startup task is already configured." -ForegroundColor Green
    exit 0
}

# Step 3: Create the scheduled task
Write-Host "[3/3] Creating scheduled task '$TaskName'..." -ForegroundColor White

# Locate pm2.cmd / pm2.ps1 on PATH for a robust absolute path in the task action
$pm2Cmd = (Get-Command pm2 -ErrorAction SilentlyContinue)
if ($pm2Cmd) {
    $pm2Path = $pm2Cmd.Source
    Write-Host "      Resolved pm2 at: $pm2Path" -ForegroundColor Gray
} else {
    # Fallback: common npm global bin locations
    $candidates = @(
        "$($env:APPDATA)\npm\pm2.cmd",
        "$($env:APPDATA)\npm\pm2.ps1",
        "C:\Users\$($env:USERNAME)\AppData\Roaming\npm\pm2.cmd"
    )
    $pm2Path = $null
    foreach ($c in $candidates) {
        if (Test-Path $c) { $pm2Path = $c; break }
    }
    if (-not $pm2Path) {
        Write-Host "[WARN] Cannot locate pm2 on disk. Using 'pm2' and relying on PATH at logon." -ForegroundColor Yellow
        $pm2Path = "pm2"
    }
}

try {
    # Build action: cmd /c "pm2 resurrect" so the console window auto-closes
    $action = New-ScheduledTaskAction `
        -Execute "cmd.exe" `
        -Argument "/c `"& `"$pm2Path`" resurrect`"" `
        -WorkingDirectory $env:USERPROFILE

    # Trigger: at user logon (current user)
    $trigger = New-ScheduledTaskTrigger -AtLogOn -User $TaskUser

    # Settings: allow task to be run on demand; don't open a window
    $settings = New-ScheduledTaskSettingsSet `
        -ExecutionTimeLimit (New-TimeSpan -Minutes 5) `
        -RestartCount 1 `
        -RestartInterval (New-TimeSpan -Minutes 1) `
        -StartWhenAvailable

    # Principal: run as the specified user
    $principal = New-ScheduledTaskPrincipal -UserId $TaskUser -LogonType Interactive -RunLevel Limited

    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Principal $principal `
        -Description "Restore PM2-managed services (Care2Connects) after Windows logon." `
        -Force | Out-Null

    Write-Host "      Task '$TaskName' created successfully." -ForegroundColor Green
} catch {
    Write-Host "" -ForegroundColor Red
    Write-Host "ERROR: Failed to create scheduled task." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "" -ForegroundColor Red
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  - Run this script as Administrator if it fails." -ForegroundColor Gray
    Write-Host "  - Or create the task manually in Task Scheduler:" -ForegroundColor Gray
    Write-Host "      Trigger  : At log on (this user)" -ForegroundColor Gray
    Write-Host "      Action   : cmd /c pm2 resurrect" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host " PM2 startup persistence ENABLED" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Task '$TaskName' will run 'pm2 resurrect' at logon." -ForegroundColor Gray
Write-Host ""
Write-Host "  Reboot checklist:" -ForegroundColor White
Write-Host "    1. Reboot the machine." -ForegroundColor Gray
Write-Host "    2. Log in as $TaskUser" -ForegroundColor Gray
Write-Host "    3. After 30-60s, run: pm2 list" -ForegroundColor Gray
Write-Host "    4. All 4 services should show status=online." -ForegroundColor Gray
Write-Host "    5. Run scripts\preflight\run-gate-open-testing.ps1 to confirm." -ForegroundColor Gray
Write-Host ""
Write-Host "  To remove this task later:" -ForegroundColor White
Write-Host "    Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false" -ForegroundColor Gray
Write-Host ""
