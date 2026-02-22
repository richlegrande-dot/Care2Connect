#Requires -Version 5.1
# Run-Preflight-Open-Testing.ps1 -- one-liner before opening site to testers
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/run-preflight-open-testing.ps1
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "start-preflight.ps1") -Mode OpenTesting
exit $LASTEXITCODE
