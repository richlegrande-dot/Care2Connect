#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Phase 9B Post-Intake Pipeline Validation â€” Production Domain

.DESCRIPTION
  Creates a session, submits required modules, completes intake, then
  verifies profile (with rank), audit events, and idempotent re-complete.
  Throttles requests (500ms between calls) to avoid Cloudflare 429s.

.PARAMETER BaseUrl
  The base URL to test against. Defaults to https://care2connects.org

.PARAMETER Verbose
  Extra detail in output.
#>

param(
  [string]$BaseUrl,
  [switch]$VerboseOutput
)

if (-not $BaseUrl) {
  $BaseUrl = if ($env:C2C_BASE_URL) { $env:C2C_BASE_URL } else { "https://care2connects.org" }
}

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Invoke-ThrottledRequest {
  param(
    [string]$Uri,
    [string]$Method = "GET",
    [object]$Body = $null,
    [hashtable]$Headers = @{},
    [int]$MaxRetries = 3
  )

  for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
    Start-Sleep -Milliseconds 500  # Cloudflare rate-limit safe

    $params = @{
      Uri              = $Uri
      Method           = $Method
      ContentType      = "application/json"
      UseBasicParsing  = $true
      ErrorAction      = "Stop"
      Headers          = $Headers
    }
    if ($Body) {
      $params["Body"] = ($Body | ConvertTo-Json -Depth 10 -Compress)
    }

    try {
      $response = Invoke-WebRequest @params
      return @{
        StatusCode = $response.StatusCode
        Content    = $response.Content | ConvertFrom-Json
        Headers    = $response.Headers
      }
    } catch [System.Exception] {
      $status = $_.Exception.Response.StatusCode.value__
      if ($status -eq 429 -and $attempt -lt $MaxRetries) {
        $backoff = $attempt * 2000
        Write-Host "  [429] Rate limited â€” backing off ${backoff}ms (attempt $attempt/$MaxRetries)" -ForegroundColor Yellow
        Start-Sleep -Milliseconds $backoff
        continue
      }
      throw
    }
  }
}

function Assert-True {
  param([bool]$Condition, [string]$Message)
  if ($Condition) {
    Write-Host "  [PASS] $Message" -ForegroundColor Green
  } else {
    Write-Host "  [FAIL] $Message" -ForegroundColor Red
    $script:failures += $Message
  }
}

# â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

$failures = @()
$apiBase = "$BaseUrl/api/v2/intake"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Phase 9B: Post-Intake Pipeline Validation" -ForegroundColor Cyan
Write-Host "  Target: $BaseUrl" -ForegroundColor Cyan
Write-Host "  Time:   $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# â”€â”€ Step 1: Create Session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

Write-Host "Step 1: Create session..." -ForegroundColor White
$testHeaders = @{ "X-C2C-Test" = "1" }
$sessionRes = Invoke-ThrottledRequest -Uri "$apiBase/session" -Method "POST" -Headers $testHeaders
$sessionId = $sessionRes.Content.sessionId
Assert-True ($sessionRes.StatusCode -eq 201) "Session created (201)"
Assert-True ($sessionId -ne $null -and $sessionId.Length -gt 10) "Session ID is a CUID: $sessionId"
Write-Host ""

# â”€â”€ Step 2: Submit Required Modules â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

Write-Host "Step 2: Submit required modules..." -ForegroundColor White

# Consent
$consentData = @{
  moduleId = "consent"
  data = @{
    consent_data_collection = $true
    consent_age_confirmation = $true
    preferred_language = "en"
  }
}
$r = Invoke-ThrottledRequest -Uri "$apiBase/session/$sessionId" -Method "PUT" -Body $consentData
Assert-True ($r.StatusCode -eq 200) "Consent saved"

# Demographics
$demoData = @{
  moduleId = "demographics"
  data = @{
    first_name = "PipelineTest"
    last_name = "Validation"
    date_of_birth = "1990-06-15"
    race_ethnicity = @("white")
    gender = "male"
    veteran_status = $false
  }
}
$r = Invoke-ThrottledRequest -Uri "$apiBase/session/$sessionId" -Method "PUT" -Body $demoData
Assert-True ($r.StatusCode -eq 200) "Demographics saved"

# Housing
$housingData = @{
  moduleId = "housing"
  data = @{
    current_living_situation = "emergency_shelter"
    how_long_current = "3_6_months"
    can_return_to_previous = $false
    eviction_notice = $false
  }
}
$r = Invoke-ThrottledRequest -Uri "$apiBase/session/$sessionId" -Method "PUT" -Body $housingData
Assert-True ($r.StatusCode -eq 200) "Housing saved"

# Safety
$safetyData = @{
  moduleId = "safety"
  data = @{
    feels_safe_current_location = "yes"
    fleeing_dv = $false
    fleeing_trafficking = $false
    experienced_violence_recently = $false
    has_protective_order = $false
    mental_health_current = "stable"
    suicidal_ideation_recent = $false
  }
}
$r = Invoke-ThrottledRequest -Uri "$apiBase/session/$sessionId" -Method "PUT" -Body $safetyData
Assert-True ($r.StatusCode -eq 200) "Safety saved"

Write-Host ""

# â”€â”€ Step 3: Complete Intake â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

Write-Host "Step 3: Complete intake..." -ForegroundColor White
$completeRes = Invoke-ThrottledRequest -Uri "$apiBase/session/$sessionId/complete" -Method "POST"
$completeData = $completeRes.Content

Assert-True ($completeRes.StatusCode -eq 200) "Complete returned 200"
Assert-True ($completeData.status -eq "COMPLETED") "Status is COMPLETED"
Assert-True ($completeData.requestId -ne $null) "requestId present: $($completeData.requestId)"
Assert-True ($completeData.score -ne $null) "Score object present"
Assert-True ($completeData.score.totalScore -ge 0 -and $completeData.score.totalScore -le 100) "Score in range: $($completeData.score.totalScore)/100"
Assert-True ($completeData.score.stabilityLevel -ge 0 -and $completeData.score.stabilityLevel -le 5) "Stability level: $($completeData.score.stabilityLevel)"
Assert-True ($completeData.score.priorityTier -ne $null) "Priority tier: $($completeData.score.priorityTier)"
Assert-True ($completeData.explainability -ne $null) "Explainability card present"
Assert-True ($completeData.actionPlan -ne $null) "Action plan present"

Write-Host ""

# â”€â”€ Step 4: Idempotent Re-Complete â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

Write-Host "Step 4: Idempotent re-complete..." -ForegroundColor White
$idempotentRes = Invoke-ThrottledRequest -Uri "$apiBase/session/$sessionId/complete" -Method "POST"
$idempotentData = $idempotentRes.Content

Assert-True ($idempotentRes.StatusCode -eq 200) "Idempotent complete returned 200"
Assert-True ($idempotentData.idempotent -eq $true) "Response flagged as idempotent"
Assert-True ($idempotentData.score.totalScore -eq $completeData.score.totalScore) "Score unchanged on re-complete"

Write-Host ""

# â”€â”€ Step 5: Fetch Profile with Rank â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

Write-Host "Step 5: Fetch profile + rank..." -ForegroundColor White
$profileRes = Invoke-ThrottledRequest -Uri "$apiBase/session/$sessionId/profile"
$profileData = $profileRes.Content

Assert-True ($profileRes.StatusCode -eq 200) "Profile endpoint 200"
Assert-True ($profileData.sessionId -eq $sessionId) "Session ID matches"
Assert-True ($profileData.status -eq "COMPLETED") "Profile status COMPLETED"
Assert-True ($profileData.profile.totalScore -eq $completeData.score.totalScore) "Profile score matches completion score"
Assert-True ($profileData.profile.stabilityLevel -eq $completeData.score.stabilityLevel) "Profile level matches"
Assert-True ($profileData.profile.priorityTier -eq $completeData.score.priorityTier) "Profile tier matches"
Assert-True ($null -ne $profileData.rank) "Rank object present"
Assert-True ($profileData.rank.position -ge 1) "Rank position: $($profileData.rank.position)"
Assert-True ($profileData.rank.of -ge 1) "Rank of: $($profileData.rank.of)"
Assert-True ($null -ne $profileData.rank.sortKey) "Sort key present"
Assert-True ($null -ne $profileData.topFactors) "Top factors present"
Assert-True ($null -ne $profileData.audit) "Audit stats present"
Assert-True ($profileData.audit.count -ge 1) "Audit event count: $($profileData.audit.count)"

Write-Host ""

# â”€â”€ Step 6: Fetch Audit Events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

Write-Host "Step 6: Fetch audit events..." -ForegroundColor White
$auditRes = Invoke-ThrottledRequest -Uri "$apiBase/session/$sessionId/audit"
$auditData = $auditRes.Content

Assert-True ($auditRes.StatusCode -eq 200) "Audit endpoint 200"
Assert-True ($auditData.sessionId -eq $sessionId) "Audit session ID matches"
Assert-True ($auditData.eventCount -ge 5) "At least 5 audit events (got $($auditData.eventCount))"

# Check for required event types
$eventTypes = $auditData.events | ForEach-Object { $_.eventType }
$requiredEvents = @(
  "INTAKE_STARTED",
  "MODULE_SAVED",
  "INTAKE_SUBMITTED",
  "SCORE_COMPUTED",
  "PLAN_GENERATED",
  "SESSION_COMPLETED",
  "SESSION_COMPLETE_IDEMPOTENT_HIT"
)

foreach ($evt in $requiredEvents) {
  Assert-True ($eventTypes -contains $evt) "Audit contains $evt"
}

# Check requestId propagation
$completionEvents = $auditData.events | Where-Object { $_.requestId -ne $null }
Assert-True ($completionEvents.Count -ge 3) "requestId present on $($completionEvents.Count) events"

# Verify no sensitive data in meta
$allMeta = ($auditData.events | ForEach-Object { $_.meta | ConvertTo-Json -Depth 5 }) -join " "
$sensitivePatterns = @("first_name", "last_name", "date_of_birth", "race_ethnicity", "gender", "fleeing_dv", "PipelineTest", "Validation", "1990-06-15")
foreach ($pattern in $sensitivePatterns) {
  Assert-True (-not ($allMeta -match $pattern)) "No sensitive data '$pattern' in audit meta"
}

Write-Host ""

# â”€â”€ Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Session ID:       $sessionId"
Write-Host "  Total Score:      $($completeData.score.totalScore) / 100"
Write-Host "  Stability Level:  $($completeData.score.stabilityLevel)"
Write-Host "  Priority Tier:    $($completeData.score.priorityTier)"
Write-Host "  Rank:             $($profileData.rank.position) of $($profileData.rank.of)"
Write-Host "  Audit Events:     $($auditData.eventCount)"
Write-Host "  Request ID:       $($completeData.requestId)"
Write-Host ""

$totalTests = $failures.Count
if ($failures.Count -eq 0) {
  Write-Host "  ALL ASSERTIONS PASSED" -ForegroundColor Green
  Write-Host ""
  Write-Host "  Acceptance Criteria:" -ForegroundColor White
  Write-Host "  [x] Completion returns score + plan + explainability" -ForegroundColor Green
  Write-Host "  [x] Completion is idempotent" -ForegroundColor Green
  Write-Host "  [x] Profile returns rank" -ForegroundColor Green
  Write-Host "  [x] Audit events are DB-backed with required types" -ForegroundColor Green
  Write-Host "  [x] requestId present and propagated" -ForegroundColor Green
  Write-Host "  [x] No sensitive data in audit meta" -ForegroundColor Green
  Write-Host "  [x] Rate-limit safe (throttled requests)" -ForegroundColor Green
} else {
  Write-Host "  $($failures.Count) ASSERTION(S) FAILED:" -ForegroundColor Red
  foreach ($f in $failures) {
    Write-Host "    - $f" -ForegroundColor Red
  }
}
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

exit $(if ($failures.Count -eq 0) { 0 } else { 1 })
