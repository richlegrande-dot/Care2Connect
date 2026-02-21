# Enhanced Parsing Test Suite Runner
# Runs Phase 4 and Phase 5 tests and collects results

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ENHANCED PARSING TEST SUITE - COMPREHENSIVE TESTING        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$resultFile = "test-results-$timestamp.txt"

Write-Host "📋 Test Results will be saved to: $resultFile`n" -ForegroundColor Yellow

# Phase 4: Adversarial Stress Testing
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 4: ADVERSARIAL STRESS TESTING" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Magenta

$phase4Start = Get-Date
npm test adversarial-phase4.test.ts 2>&1 | Tee-Object -Append -FilePath $resultFile | Out-String | Write-Host
$phase4End = Get-Date
$phase4Duration = ($phase4End - $phase4Start).TotalSeconds

Write-Host "`n⏱️  Phase 4 Duration: $([math]::Round($phase4Duration, 2)) seconds`n" -ForegroundColor Yellow

# Phase 5: Extreme Edge Cases
Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 5: EXTREME EDGE CASES" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Magenta

$phase5Start = Get-Date
npm test extreme-edge-cases-phase5.test.ts 2>&1 | Tee-Object -Append -FilePath $resultFile | Out-String | Write-Host
$phase5End = Get-Date
$phase5Duration = ($phase5End - $phase5Start).TotalSeconds

Write-Host "`n⏱️  Phase 5 Duration: $([math]::Round($phase5Duration, 2)) seconds`n" -ForegroundColor Yellow

# Summary
$totalDuration = $phase4Duration + $phase5Duration

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  TEST EXECUTION COMPLETE                                     ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 Total Execution Time: $([math]::Round($totalDuration, 2)) seconds" -ForegroundColor Cyan
Write-Host "📁 Results saved to: $resultFile`n" -ForegroundColor Cyan

# Extract summary from results
if (Test-Path $resultFile) {
    $content = Get-Content $resultFile -Raw
    
    # Extract test counts
    if ($content -match "Tests:\s+(\d+) failed,\s+(\d+) passed,\s+(\d+) total") {
        $failed = [int]$matches[1]
        $passed = [int]$matches[2]
        $total = [int]$matches[3]
        $passRate = [math]::Round(($passed / $total) * 100, 1)
        
        Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "  SUMMARY STATISTICS" -ForegroundColor Cyan
        Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "  ✅ Passed: $passed" -ForegroundColor Green
        Write-Host "  ❌ Failed: $failed" -ForegroundColor Red
        Write-Host "  📊 Total: $total" -ForegroundColor White
        Write-Host "  📈 Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 70) { "Green" } elseif ($passRate -ge 50) { "Yellow" } else { "Red" })
        Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    }
}

Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Review $resultFile for detailed results" -ForegroundColor White
Write-Host "   2. Analyze failure patterns" -ForegroundColor White
Write-Host "   3. Document findings for improvement roadmap" -ForegroundColor White
Write-Host ""
