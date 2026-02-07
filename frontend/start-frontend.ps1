# Start frontend
Write-Host "Starting frontend server..."
# Change to frontend directory and run next directly
Set-Location $PSScriptRoot
# Use npm exec to avoid workspace issues
& "C:\Program Files\nodejs\npm.cmd" exec next dev -- --port 3000