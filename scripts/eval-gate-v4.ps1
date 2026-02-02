# Parser Phase Gate Validator v4
# Runs dataset-level evaluations and checks for catastrophic regressions

param(
    [string]$BaselineFile = "",
    [switch]$SaveBaseline = $false
)

$ErrorActionPreference = "Stop"
$workspaceRoot = Split-Path -Parent $PSScriptRoot

# Change to backend directory
Push-Location "$workspaceRoot\backend"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PARSER PHASE GATE VALIDATION v4" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Results storage
$results = @{
    core30 = @{}
    realistic50 = @{}
    hard60 = @{}
    fuzz200 = @{}
    overall = @{}
}

# Run each dataset evaluation
Write-Host "[1/5] Running Core30 evaluation..." -ForegroundColor Yellow
try {
    npm run eval:v4plus:core 2>&1 | Out-Null
    $core30Report = Get-ChildItem "eval\v4plus\reports\v4plus_core30_*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($core30Report) {
        $core30Data = Get-Content $core30Report.FullName | ConvertFrom-Json
        $results.core30 = @{
            passRate = $core30Data.passRate
            passed = $core30Data.passed
            failed = $core30Data.failed
            totalCases = $core30Data.totalCases
        }
        Write-Host "  [OK] Core30: $($core30Data.passRate)% ($($core30Data.passed)/$($core30Data.totalCases))" -ForegroundColor Green
    }
} catch {
    Write-Host "  [X] Core30 evaluation failed: $_" -ForegroundColor Red
    $results.core30.passRate = 0
}

Write-Host "[2/5] Running realistic50 evaluation..." -ForegroundColor Yellow
try {
    npm run eval:v4plus:realistic 2>&1 | Out-Null
    $real50Report = Get-ChildItem "eval\v4plus\reports\v4plus_realistic50_*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($real50Report) {
        $real50Data = Get-Content $real50Report.FullName | ConvertFrom-Json
        $results.realistic50 = @{
            passRate = $real50Data.passRate
            passed = $real50Data.passed
            failed = $real50Data.failed
            totalCases = $real50Data.totalCases
        }
        Write-Host "  [OK] realistic50: $($real50Data.passRate)% ($($real50Data.passed)/$($real50Data.totalCases))" -ForegroundColor Green
    }
} catch {
    Write-Host "  [X] realistic50 evaluation failed: $_" -ForegroundColor Red
    $results.realistic50.passRate = 0
}

Write-Host "[3/5] Running Hard60 evaluation..." -ForegroundColor Yellow
try {
    npm run eval:v4plus:hard 2>&1 | Out-Null
    $hard60Report = Get-ChildItem "eval\v4plus\reports\v4plus_hard60_*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($hard60Report) {
        $hard60Data = Get-Content $hard60Report.FullName | ConvertFrom-Json
        $results.hard60 = @{
            passRate = $hard60Data.passRate
            passed = $hard60Data.passed
            failed = $hard60Data.failed
            totalCases = $hard60Data.totalCases
        }
        Write-Host "  [OK] Hard60: $($hard60Data.passRate)% ($($hard60Data.passed)/$($hard60Data.totalCases))" -ForegroundColor Green
    }
} catch {
    Write-Host "  [X] Hard60 evaluation failed: $_" -ForegroundColor Red
    $results.hard60.passRate = 0
}

Write-Host "[4/5] Running Fuzz200 evaluation..." -ForegroundColor Yellow
try {
    npm run eval:v4plus:fuzz 2>&1 | Out-Null
    $fuzz200Report = Get-ChildItem "eval\v4plus\reports\v4plus_fuzz200_*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($fuzz200Report) {
        $fuzz200Data = Get-Content $fuzz200Report.FullName | ConvertFrom-Json
        $results.fuzz200 = @{
            passRate = $fuzz200Data.passRate
            passed = $fuzz200Data.passed
            failed = $fuzz200Data.failed
            totalCases = $fuzz200Data.totalCases
        }
        Write-Host "  [OK] Fuzz200: $($fuzz200Data.passRate)% ($($fuzz200Data.passed)/$($fuzz200Data.totalCases))" -ForegroundColor Green
    }
} catch {
    Write-Host "  [X] Fuzz200 evaluation failed: $_" -ForegroundColor Red
    $results.fuzz200.passRate = 0
}

Write-Host "[5/5] Running full suite evaluation..." -ForegroundColor Yellow
try {
    npm run eval:v4plus:all 2>&1 | Out-Null
    $allReport = Get-ChildItem "eval\v4plus\reports\v4plus_all_*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($allReport) {
        $allData = Get-Content $allReport.FullName | ConvertFrom-Json
        
        # Count failure types
        $urgencyUnder = 0
        $urgencyOver = 0
        $categoryWrong = 0
        $nameWrong = 0
        $amountMissing = 0
        
        foreach ($case in $allData.cases) {
            if ($case.failureReasons) {
                if ($case.failureReasons -contains "urgency_under_assessed") { $urgencyUnder++ }
                if ($case.failureReasons -contains "urgency_over_assessed") { $urgencyOver++ }
                if ($case.failureReasons -contains "category_wrong") { $categoryWrong++ }
                if ($case.failureReasons -contains "name_wrong") { $nameWrong++ }
                if ($case.failureReasons -contains "amount_missing") { $amountMissing++ }
            }
        }
        
        $results.overall = @{
            passRate = $allData.passRate
            passed = $allData.passed
            failed = $allData.failed
            totalCases = $allData.totalCases
            urgency_under_assessed = $urgencyUnder
            urgency_over_assessed = $urgencyOver
            urgency_total = $urgencyUnder + $urgencyOver
            category_wrong = $categoryWrong
            name_wrong = $nameWrong
            amount_missing = $amountMissing
        }
        Write-Host "  [OK] Overall: $($allData.passRate)% ($($allData.passed)/$($allData.totalCases))" -ForegroundColor Green
    }
} catch {
    Write-Host "  [X] Full suite evaluation failed: $_" -ForegroundColor Red
    $results.overall.passRate = 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dataset Pass Rates:" -ForegroundColor White
Write-Host "  Core30:       $($results.core30.passRate)% ($($results.core30.passed)/$($results.core30.totalCases))"
Write-Host "  realistic50:  $($results.realistic50.passRate)% ($($results.realistic50.passed)/$($results.realistic50.totalCases))"
Write-Host "  Hard60:       $($results.hard60.passRate)% ($($results.hard60.passed)/$($results.hard60.totalCases))"
Write-Host "  Fuzz200:      $($results.fuzz200.passRate)% ($($results.fuzz200.passed)/$($results.fuzz200.totalCases))"
Write-Host "  OVERALL:      $($results.overall.passRate)% ($($results.overall.passed)/$($results.overall.totalCases))" -ForegroundColor Cyan
Write-Host ""
Write-Host "Failure Breakdown:" -ForegroundColor White
Write-Host "  Urgency Under: $($results.overall.urgency_under_assessed)"
Write-Host "  Urgency Over:  $($results.overall.urgency_over_assessed)"
Write-Host "  Urgency Total: $($results.overall.urgency_total)"
Write-Host "  Category Wrong: $($results.overall.category_wrong)"
Write-Host "  Name Wrong: $($results.overall.name_wrong)"
Write-Host "  Amount Missing: $($results.overall.amount_missing)"
Write-Host ""

# Save baseline if requested
if ($SaveBaseline) {
    $baselineData = @{
        timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
        results = $results
    }
    $baselinePath = "$workspaceRoot\baseline-gate-v4.json"
    $baselineData | ConvertTo-Json -Depth 10 | Set-Content $baselinePath
    Write-Host "[OK] Baseline saved to: $baselinePath" -ForegroundColor Green
    Write-Host ""
}

# Check for catastrophic regression if baseline provided
$catastrophicRegression = $false
if ($BaselineFile -and (Test-Path $BaselineFile)) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "REGRESSION CHECK" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $baseline = Get-Content $BaselineFile | ConvertFrom-Json
    
    # Check each dataset for >10 point drop
    $datasets = @("core30", "realistic50", "hard60", "fuzz200", "overall")
    foreach ($dataset in $datasets) {
        $baselineRate = $baseline.results.$dataset.passRate
        $currentRate = $results.$dataset.passRate
        $drop = $baselineRate - $currentRate
        
        if ($drop -gt 10) {
            Write-Host "  [X] CATASTROPHIC: $dataset dropped $drop points ($baselineRate% -> $currentRate%)" -ForegroundColor Red
            $catastrophicRegression = $true
        } elseif ($drop -gt 0) {
            Write-Host "  [!] Warning: $dataset dropped $drop points ($baselineRate% -> $currentRate%)" -ForegroundColor Yellow
        } else {
            $improvement = $currentRate - $baselineRate
            Write-Host "  [OK] $dataset improved $improvement points ($baselineRate% -> $currentRate%)" -ForegroundColor Green
        }
    }
    
    # Check urgency failures increase >10%
    $baselineUrgency = $baseline.results.overall.urgency_total
    $currentUrgency = $results.overall.urgency_total
    $urgencyIncrease = (($currentUrgency - $baselineUrgency) / $baselineUrgency) * 100
    
    if ($urgencyIncrease -gt 10) {
        Write-Host "  [X] CATASTROPHIC: Urgency failures increased ${urgencyIncrease}% ($baselineUrgency -> $currentUrgency)" -ForegroundColor Red
        $catastrophicRegression = $true
    } elseif ($urgencyIncrease -gt 0) {
        Write-Host "  [!] Warning: Urgency failures increased ${urgencyIncrease}% ($baselineUrgency -> $currentUrgency)" -ForegroundColor Yellow
    } else {
        $urgencyReduction = [Math]::Abs($urgencyIncrease)
        Write-Host "  [OK] Urgency failures reduced ${urgencyReduction}% ($baselineUrgency -> $currentUrgency)" -ForegroundColor Green
    }
    
    Write-Host ""
}

Pop-Location

# Exit with appropriate code
if ($catastrophicRegression) {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "GATE FAILED: CATASTROPHIC REGRESSION" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
} else {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "GATE CHECK COMPLETE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    exit 0
}
