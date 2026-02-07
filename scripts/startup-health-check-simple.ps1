# Simple Startup Health Check Script

param(
  [switch]$AutoFix = $true,
  [int]$MaxFixRounds = 2,
  [switch]$NeverExitNonZero = $false
)

$script:failures = @()
$script:actions = @()

function Write-ColorOutput($message, $color = "White") {
  Write-Host $message -ForegroundColor $color
}

function Test-BackendHealth {
  Write-ColorOutput "[BACKEND] Testing backend health..." "Yellow"
  try {
    $response = Invoke-RestMethod "http://localhost:3001/health/live" -TimeoutSec 5 -ErrorAction Stop
    if ($response.status -eq "alive") {
      Write-ColorOutput "  ✓ Backend alive" "Green"
      return $true
    } else {
      Write-ColorOutput "  ✗ Backend returned unexpected status" "Red"
      return $false
    }
  } catch {
    Write-ColorOutput "  ✗ Backend health check failed: $($_.Exception.Message)" "Red"
    $script:failures += @{ name = "Backend Health"; detail = $_.Exception.Message }
    return $false
  }
}

# Main execution
Write-ColorOutput "STARTUP HEALTH CHECK" "Cyan"

$backendOk = Test-BackendHealth

if ($script:failures.Count -eq 0) {
  Write-ColorOutput "✓ All systems healthy!" "Green"
  exit 0
} else {
  Write-ColorOutput "✗ Found $($script:failures.Count) issues:" "Red"
  exit 1
}