Set-Location $PSScriptRoot
Write-Host "=== Running Phase 6C Eval ==="
$result = npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 2>&1
$result | Out-File -FilePath "$PSScriptRoot\phase6c_output.txt" -Encoding utf8
Write-Host "PHASE6C_COMPLETE"
Write-Host ($result | Select-String -Pattern "STRICT|Urgency|Engine|Accuracy|FIELD|Under|Over" | Out-String)
