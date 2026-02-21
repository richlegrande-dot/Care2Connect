$proc = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','eval:v4plus:all' -NoNewWindow -PassThru
if (-not (Wait-Process -Id $proc.Id -Timeout 120)) {
  Write-Host '=== EVALUATION TIMED OUT (120s) - killing process ===' -ForegroundColor Yellow
  try { Stop-Process -Id $proc.Id -Force } catch { }
  exit 124
} else {
  Write-Host '=== EVALUATION COMPLETED'
  exit 0
}
