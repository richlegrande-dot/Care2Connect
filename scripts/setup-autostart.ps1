$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Runner   = Join-Path $RepoRoot "scripts\run-services.ps1"

if (-not (Test-Path $Runner)) {
  throw "Missing $Runner. Create run-services.ps1 first."
}

# Task name
$TaskName = "Care2Connects_AutoStart"

# Action: run the supervisor at logon
$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument (
  "-NoProfile -ExecutionPolicy Bypass -File `"$Runner`""
)

# Trigger: at logon for current user
$Trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

# Settings: keep alive-ish (if it stops, Task Scheduler can restart it)
$Settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -ExecutionTimeLimit (New-TimeSpan -Hours 0) `
  -RestartCount 999 `
  -RestartInterval (New-TimeSpan -Minutes 1)

# Register task in current user context (no admin required)
Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $Action `
  -Trigger $Trigger `
  -Settings $Settings `
  -Description "Auto-start Care2Connects frontend+backend+Cloudflare tunnel on login and keep them running." `
  -Force | Out-Null

Write-Host "✅ Installed Scheduled Task: $TaskName" -ForegroundColor Green
Write-Host "It will start on next login. To start now, run:" -ForegroundColor Cyan
Write-Host "  Start-ScheduledTask -TaskName `"$TaskName`"" -ForegroundColor Gray
