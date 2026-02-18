#!/usr/bin/env pwsh
# Stability Test - Run evaluation multiple times and analyze variance
# Usage: .\scripts\stability-test.ps1 [-Runs 10] [-Dataset "all"]

param(
    [int]$Runs = 10,
    [string]$Dataset = "all"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STABILITY TEST - $Runs Runs" -ForegroundColor Cyan
Write-Host "  Dataset: $Dataset" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results = @()
$passCount = @()
$totalTests = 0
$parseFailures = 0

for ($i = 1; $i -le $Runs; $i++) {
    Write-Host "Run $i/$Runs..." -NoNewline
    
    # Run evaluation and capture output
    $output = & node backend/eval/v4plus/runners/run_eval_v4plus.js --dataset $Dataset 2>&1 | Out-String
    
    # Try multiple parsing strategies
    $parsed = $false
    
    # Strategy 1: Look for "STRICT (≥95%):      54.12% (184/340)" pattern
    if ($output -match 'STRICT\s*\([^\)]*\):\s*(\d+\.\d+)%\s*\((\d+)/(\d+)\)') {
        $rate = [double]$matches[1]
        $pass = [int]$matches[2]
        $total = [int]$matches[3]
        $results += $rate
        $passCount += $pass
        $totalTests = $total
        $parsed = $true
        Write-Host " ✓ $rate% ($pass/$total)" -ForegroundColor Green
    }
    
    # Strategy 2: Look for any "XX.XX% (NNN/340)" pattern
    elseif ($output -match '(\d+\.\d+)%\s*\((\d+)/(\d+)\)') {
        $rate = [double]$matches[1]
        $pass = [int]$matches[2]
        $total = [int]$matches[3]
        $results += $rate
        $passCount += $pass
        $totalTests = $total
        $parsed = $true
        Write-Host " ✓ $rate% ($pass/$total)" -ForegroundColor Yellow
    }
    
    if (-not $parsed) {
        Write-Host " ✗ Parse failed" -ForegroundColor Red
        $parseFailures += 1
        # Try to show what we got
        $lines = $output -split "`n" | Where-Object { $_ -match '\d+%' } | Select-Object -First 3
        if ($lines) {
            Write-Host "   Sample: $($lines[0])" -ForegroundColor Gray
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  STABILITY ANALYSIS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

if ($results.Count -eq 0) {
    Write-Host "ERROR: No results captured!" -ForegroundColor Red
    Write-Host "Debug: Check output format" -ForegroundColor Red
    exit 1
}

if ($parseFailures -gt 0) {
    Write-Host "ERROR: $parseFailures run(s) failed to parse. Stopping." -ForegroundColor Red
    exit 1
}

# Calculate statistics
$mean = ($results | Measure-Object -Average).Average
$min = ($results | Measure-Object -Minimum).Minimum
$max = ($results | Measure-Object -Maximum).Maximum
$range = $max - $min

# Calculate median
$sorted = $results | Sort-Object
$count = $sorted.Count
if ($count -gt 0) {
    if ($count % 2 -eq 1) {
        $median = $sorted[[int]($count / 2)]
    } else {
        $midHigh = $sorted[$count / 2]
        $midLow = $sorted[($count / 2) - 1]
        $median = ($midLow + $midHigh) / 2
    }
}

# Calculate standard deviation
$sumSquaredDiff = 0
foreach ($val in $results) {
    $diff = $val - $mean
    $sumSquaredDiff += $diff * $diff
}
$variance = $sumSquaredDiff / $results.Count
$stddev = [Math]::Sqrt($variance)

# Display results
Write-Host ""
Write-Host "Runs:        $($results.Count)" -ForegroundColor Cyan
Write-Host "Mean:        $($mean.ToString('F2'))%" -ForegroundColor Cyan
Write-Host "Median:      $($median.ToString('F2'))%" -ForegroundColor Cyan
Write-Host "Std Dev:     $($stddev.ToString('F3'))%" -ForegroundColor Cyan
Write-Host "Min:         $($min.ToString('F2'))%" -ForegroundColor Cyan
Write-Host "Max:         $($max.ToString('F2'))%" -ForegroundColor Cyan
Write-Host "Range:       $($range.ToString('F2'))%" -ForegroundColor Cyan

if ($totalTests -gt 0) {
    $meanPass = ($passCount | Measure-Object -Average).Average
    $minPass = ($passCount | Measure-Object -Minimum).Minimum
    $maxPass = ($passCount | Measure-Object -Maximum).Maximum
    Write-Host ""
    Write-Host "Pass Count:  $($meanPass.ToString('F1')) ± $($maxPass - $minPass) (range: $minPass-$maxPass)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "All Values: $($results -join ', ')" -ForegroundColor Gray
Write-Host ""

# Stability verdict
if ($stddev -lt 1.0) {
    Write-Host "✅ STABLE (σ < 1.0%)" -ForegroundColor Green
    Write-Host "   Phase 1.1 surgical fixes show consistent results." -ForegroundColor Green

    Write-Host "`nRunning final eval + debug metrics..." -ForegroundColor Cyan
    & node backend/eval/v4plus/runners/run_eval_v4plus.js --dataset $Dataset | Out-Host
    & node backend/eval/v4plus/runners/debug_metrics_post_eval.js --dataset $Dataset | Out-Host
    exit 0
} elseif ($stddev -lt 2.0) {
    Write-Host "⚠️  MARGINAL (1.0% ≤ σ < 2.0%)" -ForegroundColor Yellow
    Write-Host "   Some variation present but acceptable." -ForegroundColor Yellow

    Write-Host "`nRunning final eval + debug metrics..." -ForegroundColor Cyan
    & node backend/eval/v4plus/runners/run_eval_v4plus.js --dataset $Dataset | Out-Host
    & node backend/eval/v4plus/runners/debug_metrics_post_eval.js --dataset $Dataset | Out-Host
    exit 0
} else {
    Write-Host "❌ UNSTABLE (σ ≥ 2.0%)" -ForegroundColor Red
    Write-Host "   High variation detected - investigate flaky tests." -ForegroundColor Red
    exit 1
}
