$node = "node"
$script = Join-Path $PSScriptRoot "..\tools\run_custom_cases.js"
$timeout = 300
Write-Host "Starting custom runner with $timeout second timeout..."
$proc = Start-Process -FilePath $node -ArgumentList $script -PassThru -WorkingDirectory (Join-Path $PSScriptRoot "..") -NoNewWindow
try {
  if (-not (Wait-Process -Id $proc.Id -Timeout $timeout)) {
    Write-Host "=== TIMED OUT after $timeout sec - killing process ==="
    Stop-Process -Id $proc.Id -Force
    exit 1
  } else {
    Write-Host "Process completed within timeout."
    exit 0
  }
} catch {
  Write-Host "Error while waiting for process: $_"
  if ($proc -and $proc.Id) { Stop-Process -Id $proc.Id -Force }
  exit 1
}
