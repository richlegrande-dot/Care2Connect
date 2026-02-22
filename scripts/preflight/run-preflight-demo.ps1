#Requires -Version 5.1
# Run-Preflight-Demo.ps1 -- one-liner before any demo
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/run-preflight-demo.ps1
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "start-preflight.ps1") -Mode Demo
exit $LASTEXITCODE
