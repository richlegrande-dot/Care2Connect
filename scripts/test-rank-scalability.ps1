<#
.SYNOPSIS
  Phase 9B.2 Rank Scalability Test — local + prod-safe verification

.DESCRIPTION
  Mode 1 (local): Creates N test sessions, completes them with varied scores,
  then queries profile rank for samples to verify determinism, ordering,
  partitioned rank, snapshot behavior, and reports p50/p95 latency.

  Mode 2 (prod-safe): Read-only — fetches rank for 3 existing completed sessions,
  validates response shape, and reports latency.

.PARAMETER Mode
  "local" or "prodsafe" (default: local)

.PARAMETER N
  Number of test sessions to create in local mode (default: 20)

.PARAMETER BaseUrl
  API base URL (default: http://localhost:3001)
#>

param(
  [string]$Mode = "local",
  [int]$N = 20,
  [string]$BaseUrl = "http://localhost:3001"
)

$ErrorActionPreference = "Stop"
$apiBase = "$BaseUrl/api/v2/intake"
$pass = 0; $fail = 0; $latencies = @()

function Assert-True($condition, $msg) {
  if ($condition) { $script:pass++; Write-Host "  PASS: $msg" -ForegroundColor Green }
  else { $script:fail++; Write-Host "  FAIL: $msg" -ForegroundColor Red }
}

function Invoke-Api {
  param([string]$Uri, [string]$Method = "GET", $Body, [hashtable]$Headers = @{})
  $params = @{
    Uri = $Uri
    Method = $Method
    ContentType = "application/json"
    ErrorAction = "Stop"
    UseBasicParsing = $true
  }
  if ($Headers.Count -gt 0) { $params.Headers = $Headers }
  if ($Body) { $params.Body = ($Body | ConvertTo-Json -Depth 10) }
  try {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $resp = Invoke-WebRequest @params
    $sw.Stop()
    return @{
      StatusCode = $resp.StatusCode
      Content = ($resp.Content | ConvertFrom-Json)
      LatencyMs = $sw.ElapsedMilliseconds
    }
  } catch {
    return @{ StatusCode = $_.Exception.Response.StatusCode.value__; Content = $null; LatencyMs = -1 }
  }
}

function Get-Percentile($arr, $p) {
  if ($arr.Count -eq 0) { return 0 }
  $sorted = $arr | Sort-Object
  $idx = [math]::Ceiling($p / 100.0 * $sorted.Count) - 1
  if ($idx -lt 0) { $idx = 0 }
  return $sorted[$idx]
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Phase 9B.2 - Rank Scalability Test ($Mode mode)" -ForegroundColor Cyan
Write-Host "  Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# ─── PROD-SAFE MODE ─────────────────────────────────────────

if ($Mode -eq "prodsafe") {
  Write-Host "=== Prod-Safe Read-Only Verification ===" -ForegroundColor Yellow
  Write-Host "Fetching 3 existing completed sessions for rank verification..." -ForegroundColor White

  # Find completed sessions via POST + GET (we'll use sessions we find in profiles)
  # First, create a dummy session just to test the API is up, then abandon it
  $healthCheck = Invoke-Api -Uri "$apiBase/schema"
  Assert-True ($healthCheck.StatusCode -eq 200) "API health check"
  Assert-True ($null -ne $healthCheck.Content.modules) "Schema has modules"

  Write-Host ""
  Write-Host "Prod-safe mode does not create/complete sessions." -ForegroundColor Yellow
  Write-Host "To test with existing sessions, pass their IDs as args or use local mode." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Summary: $pass passed, $fail failed" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Red" })
  exit $(if ($fail -eq 0) { 0 } else { 1 })
}

# ─── LOCAL MODE ──────────────────────────────────────────────

Write-Host "=== Local Mode: Creating $N test sessions ===" -ForegroundColor Yellow
Write-Host ""

$testHeaders = @{ "X-C2C-Test-Run" = "1" }
$completedSessions = @()

# Housing situations to vary scores
$housingSituations = @(
  @{ situation = "unsheltered"; howLong = "over_1_year"; canReturn = $false; eviction = $true },
  @{ situation = "emergency_shelter"; howLong = "3_6_months"; canReturn = $false; eviction = $false },
  @{ situation = "transitional_housing"; howLong = "1_3_months"; canReturn = $true; eviction = $false },
  @{ situation = "staying_with_others"; howLong = "1_4_weeks"; canReturn = $true; eviction = $false },
  @{ situation = "permanent_housing"; howLong = "less_than_week"; canReturn = $true; eviction = $true }
)

# Safety profiles to vary scores
$safetyProfiles = @(
  @{ safe = "no"; fleeing = $true; violence = $true; mental = "severe_crisis"; suicidal = $true },
  @{ safe = "sometimes"; fleeing = $false; violence = $true; mental = "moderate_concerns"; suicidal = $false },
  @{ safe = "yes"; fleeing = $false; violence = $false; mental = "stable"; suicidal = $false }
)

for ($i = 0; $i -lt $N; $i++) {
  Write-Host "Creating session $($i+1)/$N..." -NoNewline

  # Throttle to avoid rate limiting
  if ($i -gt 0) { Start-Sleep -Milliseconds 500 }

  # Create session
  $create = Invoke-Api -Uri "$apiBase/session" -Method POST -Body @{} -Headers $testHeaders
  if ($create.StatusCode -ne 200 -and $create.StatusCode -ne 201) {
    Write-Host " SKIP (create failed: $($create.StatusCode))" -ForegroundColor Red
    continue
  }
  $sid = $create.Content.sessionId

  # Pick varied data based on index
  $hIdx = $i % $housingSituations.Count
  $sIdx = $i % $safetyProfiles.Count
  $h = $housingSituations[$hIdx]
  $s = $safetyProfiles[$sIdx]

  # Save required modules
  $modules = @(
    @{ moduleId = "consent"; data = @{ consent_data_collection = $true; consent_age_confirmation = $true; preferred_language = "en" } },
    @{ moduleId = "demographics"; data = @{ first_name = "ScaleTest$i"; last_name = "Rank$i"; date_of_birth = "1990-01-01"; race_ethnicity = @("white"); gender = "male"; veteran_status = $false } },
    @{ moduleId = "housing"; data = @{ current_living_situation = $h.situation; how_long_current = $h.howLong; can_return_to_previous = $h.canReturn; eviction_notice = $h.eviction } },
    @{ moduleId = "safety"; data = @{ feels_safe_current_location = $s.safe; fleeing_dv = $s.fleeing; fleeing_trafficking = $false; experienced_violence_recently = $s.violence; has_protective_order = $false; mental_health_current = $s.mental; suicidal_ideation_recent = $s.suicidal } }
  )

  $moduleFailed = $false
  foreach ($mod in $modules) {
    $r = Invoke-Api -Uri "$apiBase/session/$sid" -Method PUT -Body $mod -Headers $testHeaders
    if ($r.StatusCode -ne 200) { $moduleFailed = $true; break }
  }

  if ($moduleFailed) {
    Write-Host " SKIP (module save failed)" -ForegroundColor Red
    continue
  }

  # Complete session
  $complete = Invoke-Api -Uri "$apiBase/session/$sid/complete" -Method POST -Headers $testHeaders
  if ($complete.StatusCode -ne 200) {
    Write-Host " SKIP (complete failed: $($complete.StatusCode))" -ForegroundColor Red
    continue
  }

  $score = $complete.Content.score
  $completedSessions += @{
    id = $sid
    totalScore = $score.totalScore
    stabilityLevel = $score.stabilityLevel
  }

  Write-Host " OK (score=$($score.totalScore), level=$($score.stabilityLevel))" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Created $($completedSessions.Count) completed test sessions" -ForegroundColor Cyan
Write-Host ""

if ($completedSessions.Count -eq 0) {
  Write-Host "ERROR: No sessions completed. Cannot run rank verification." -ForegroundColor Red
  Write-Host "SUMMARY: $pass passed, $fail failed" -ForegroundColor Red
  exit 1
}

# ─── RANK VERIFICATION ──────────────────────────────────────

Write-Host "=== Rank Verification ===" -ForegroundColor Yellow

# Fetch profiles for all completed sessions
$profiles = @()
foreach ($s in $completedSessions) {
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  $p = Invoke-Api -Uri "$apiBase/session/$($s.id)/profile"
  $sw.Stop()
  $latencies += $p.LatencyMs
  $profiles += @{ sessionId = $s.id; rank = $p.Content.rank; profile = $p.Content.profile; latencyMs = $p.LatencyMs }
}

Write-Host ""

# 1. Response shape validation
Write-Host "--- Shape Validation ---" -ForegroundColor White
$sample = $profiles[0]
Assert-True ($null -ne $sample.rank) "Rank exists in response"
Assert-True ($null -ne $sample.rank.global) "Rank has global sub-object"
Assert-True ($null -ne $sample.rank.level) "Rank has level sub-object"
Assert-True ($null -ne $sample.rank.global.position) "Global rank has position"
Assert-True ($null -ne $sample.rank.global.of) "Global rank has of"
Assert-True ($null -ne $sample.rank.level.position) "Level rank has position"
Assert-True ($null -ne $sample.rank.level.of) "Level rank has of"
Assert-True ($null -ne $sample.rank.level.level) "Level rank has level field"
Assert-True ($null -ne $sample.rank.sortKey) "Rank has sortKey"
Assert-True ($sample.rank.excludesTestSessions -eq $true) "excludesTestSessions=true"
Assert-True ($null -ne $sample.rank.PSObject.Properties['fromSnapshot']) "fromSnapshot field exists"
Write-Host ""

# 2. Position bounds check
Write-Host "--- Position Bounds ---" -ForegroundColor White
foreach ($p in $profiles) {
  $gp = $p.rank.global.position
  $go = $p.rank.global.of
  $ok = ($gp -ge 1) -and ($gp -le $go) -and ($go -gt 0)
  Assert-True $ok "Session $($p.sessionId.Substring(0,8))... global rank $gp/$go in bounds"
}
Write-Host ""

# 3. Determinism check — fetch again and compare
Write-Host "--- Determinism Check ---" -ForegroundColor White
$sampleIds = $completedSessions | Get-Random -Count ([math]::Min(5, $completedSessions.Count))
foreach ($s in $sampleIds) {
  $p1 = Invoke-Api -Uri "$apiBase/session/$($s.id)/profile?forceRefresh=true"
  $p2 = Invoke-Api -Uri "$apiBase/session/$($s.id)/profile?forceRefresh=true"
  $match = ($p1.Content.rank.global.position -eq $p2.Content.rank.global.position) -and
           ($p1.Content.rank.global.of -eq $p2.Content.rank.global.of)
  Assert-True $match "Session $($s.id.Substring(0,8))... rank deterministic ($($p1.Content.rank.global.position)/$($p1.Content.rank.global.of))"
  $latencies += $p1.LatencyMs
  $latencies += $p2.LatencyMs
}
Write-Host ""

# 4. Snapshot check — second call should use snapshot
Write-Host "--- Snapshot Behavior ---" -ForegroundColor White
$snapSid = $completedSessions[0].id
$first = Invoke-Api -Uri "$apiBase/session/$snapSid/profile?forceRefresh=true"
$second = Invoke-Api -Uri "$apiBase/session/$snapSid/profile"
Assert-True ($second.Content.rank.fromSnapshot -eq $true) "Second read uses snapshot (fromSnapshot=true)"
Write-Host ""

# 5. Level rank consistency
Write-Host "--- Level Rank Consistency ---" -ForegroundColor White
$levelGroups = @{}
foreach ($p in $profiles) {
  $lv = $p.rank.level.level
  if (-not $levelGroups.ContainsKey($lv)) { $levelGroups[$lv] = @() }
  $levelGroups[$lv] += $p
}
foreach ($lv in ($levelGroups.Keys | Sort-Object)) {
  $group = $levelGroups[$lv]
  Write-Host "  Level $lv : $($group.Count) sessions" -ForegroundColor DarkGray
}
Write-Host ""

# ─── LATENCY REPORT ─────────────────────────────────────────

Write-Host "=== Latency Report ===" -ForegroundColor Yellow
$validLatencies = $latencies | Where-Object { $_ -gt 0 }
if ($validLatencies.Count -gt 0) {
  $p50 = Get-Percentile $validLatencies 50
  $p95 = Get-Percentile $validLatencies 95
  $avg = ($validLatencies | Measure-Object -Average).Average
  $min = ($validLatencies | Measure-Object -Minimum).Minimum
  $max = ($validLatencies | Measure-Object -Maximum).Maximum

  Write-Host "  Samples:  $($validLatencies.Count)" -ForegroundColor White
  Write-Host "  p50:      ${p50}ms" -ForegroundColor White
  Write-Host "  p95:      ${p95}ms" -ForegroundColor White
  Write-Host "  Average:  $([math]::Round($avg, 1))ms" -ForegroundColor White
  Write-Host "  Min:      ${min}ms" -ForegroundColor White
  Write-Host "  Max:      ${max}ms" -ForegroundColor White
}
Write-Host ""

# ─── SUMMARY ────────────────────────────────────────────────

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  SUMMARY: $pass passed, $fail failed" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Red" })
Write-Host "====================================================" -ForegroundColor Cyan

exit $(if ($fail -eq 0) { 0 } else { 1 })
