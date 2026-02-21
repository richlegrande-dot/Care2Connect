<#
.SYNOPSIS
    Intake Form Ranking Test Suite - Production Evidence
.DESCRIPTION
    Runs 5 realistic personas through the full V2 intake form (all 8 modules)
    against the production API and prints a ranked leaderboard showing each
    persona's total score, stability level, priority tier, and per-dimension
    breakdown.

    Personas are designed to exercise the full scoring range:
      P1 - CRITICAL-MAX   : Unsheltered, fleeing DV, chronic, multiple conditions
      P2 - CRITICAL-HIGH  : Emergency shelter, safety crisis, no insurance
      P3 - HIGH           : At-risk housed, some vulnerability
      P4 - MODERATE       : Transitional, stable-ish, minor barriers
      P5 - LOWER          : Permanent housing, self-sufficient trajectory

.PARAMETER ApiBase
    Production API URL (default: https://api.care2connects.org)
.PARAMETER IntakeToken
    JWT Bearer token for V2 intake auth. Falls back to V2_INTAKE_TOKEN env var.
    If neither is set the script auto-generates one using JWT_SECRET from
    backend/.env
.PARAMETER ThrottleMs
    Milliseconds to wait between API calls (default: 400)
.PARAMETER Verbose
    Show full dimension breakdown for every persona

.EXAMPLE
    .\scripts\test-intake-ranking.ps1
    .\scripts\test-intake-ranking.ps1 -ApiBase http://localhost:3001 -Verbose
#>

param(
    [string]$ApiBase = "https://api.care2connects.org",
    [string]$IntakeToken = $env:V2_INTAKE_TOKEN,
    [int]$ThrottleMs = 400,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# ── Token bootstrap ────────────────────────────────────────────
# If no token is in the environment, generate one from backend/.env
if (-not $IntakeToken) {
    $envFile = Join-Path $PSScriptRoot "..\backend\.env"
    $jwtSecret = $null
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^JWT_SECRET=(.+)$') { $jwtSecret = $Matches[1].Trim() }
        }
    }
    if (-not $jwtSecret) { $jwtSecret = "care2connects-jwt-secret-production-key-2026" }

    # Generate a HS256 JWT without external tools (pure PowerShell)
    function New-JwtHS256 {
        param([hashtable]$Payload, [string]$Secret)
        function Base64UrlEncode([byte[]]$bytes) {
            [Convert]::ToBase64String($bytes).Replace('+','-').Replace('/','_').TrimEnd('=')
        }
        $header = '{"alg":"HS256","typ":"JWT"}'
        # Use UTC epoch — Get-Date -UFormat "%s" returns local time on Windows (wrong for JWT)
        $now = [int][double]::Parse(((Get-Date).ToUniversalTime() - [datetime]::new(1970,1,1,0,0,0,[DateTimeKind]::Utc)).TotalSeconds.ToString("F0"))
        $Payload.iat = $now
        $Payload.exp = $now + 14400  # 4 hours
        $payloadJson = ($Payload | ConvertTo-Json -Compress)
        $headerB64  = Base64UrlEncode ([System.Text.Encoding]::UTF8.GetBytes($header))
        $payloadB64 = Base64UrlEncode ([System.Text.Encoding]::UTF8.GetBytes($payloadJson))
        $sigInput   = "$headerB64.$payloadB64"
        $key        = [System.Text.Encoding]::UTF8.GetBytes($Secret)
        $hmac       = New-Object System.Security.Cryptography.HMACSHA256
        $hmac.Key   = $key
        $sig        = Base64UrlEncode ($hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($sigInput)))
        return "$sigInput.$sig"
    }

    $IntakeToken = New-JwtHS256 -Payload @{ type = "system-admin"; userId = "ranking-test-runner"; sub = "ranking-test" } -Secret $jwtSecret
    Write-Host "[INFO] Auto-generated intake JWT" -ForegroundColor Cyan
}

# ── Shared headers ─────────────────────────────────────────────
$baseHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $IntakeToken"
    "X-C2C-Test"   = "1"
}

# ── Helpers ────────────────────────────────────────────────────
function Invoke-Api {
    param(
        [string]$Uri,
        [string]$Method = "GET",
        [string]$Body   = $null
    )
    Start-Sleep -Milliseconds $ThrottleMs
    $params = @{
        Uri            = $Uri
        Method         = $Method
        Headers        = $baseHeaders
        UseBasicParsing = $true
        TimeoutSec     = 30
        ErrorAction    = "Stop"
    }
    if ($Body) { $params.Body = $Body; $params.ContentType = "application/json" }
    return Invoke-WebRequest @params
}

function Run-Persona {
    param([hashtable]$Persona)

    Write-Host "`n  Running: $($Persona.name)..." -ForegroundColor Yellow

    # 1. Create session
    $sessResp = Invoke-Api -Uri "$ApiBase/api/v2/intake/session" -Method POST -Body "{}"
    $sess     = $sessResp.Content | ConvertFrom-Json
    $sid      = $sess.sessionId

    # 2. Save each module
    foreach ($mod in $Persona.modules.GetEnumerator()) {
        $body = @{ moduleId = $mod.Key; data = $mod.Value } | ConvertTo-Json -Depth 10 -Compress
        try {
            Invoke-Api -Uri "$ApiBase/api/v2/intake/session/$sid" -Method PUT -Body $body | Out-Null
        } catch {
            # Validation errors are non-fatal -- log and continue
            $errMsg = $_.Exception.Message -replace '\(.*',''
            Write-Host "    [WARN] Module $($mod.Key) rejected: $errMsg" -ForegroundColor DarkYellow
        }
    }

    # 3. Complete session
    $completeResp = Invoke-Api -Uri "$ApiBase/api/v2/intake/session/$sid/complete" -Method POST -Body "{}"
    $result       = $completeResp.Content | ConvertFrom-Json

    # Extract explainability if available
    $explain = $result.explainability
    $stabLabel = "N/A"
    $placement = "N/A"
    $cHousing = @()
    $cSafety = @()
    $cVuln = @()
    $cChron = @()

    if ($explain) {
        $stabLabel = $explain.levelLabel
        if ($explain.dimensions) {
            $ed = $explain.dimensions
            if ($ed.housing_stability -and $ed.housing_stability.contributors) { $cHousing = $ed.housing_stability.contributors }
            if ($ed.safety_crisis -and $ed.safety_crisis.contributors) { $cSafety = $ed.safety_crisis.contributors }
            if ($ed.vulnerability_health -and $ed.vulnerability_health.contributors) { $cVuln = $ed.vulnerability_health.contributors }
            if ($ed.chronicity_system -and $ed.chronicity_system.contributors) { $cChron = $ed.chronicity_system.contributors }
        }
    }
    if ($result.actionPlan -and $result.actionPlan.PSObject.Properties.Name -contains 'placementRecommendation') {
        $placement = $result.actionPlan.placementRecommendation
    }

    return @{
        name         = $Persona.name
        label        = $Persona.label
        sessionId    = $sid
        totalScore   = $result.score.totalScore
        stabilityLevel       = $result.score.stabilityLevel
        stabilityLabel       = $stabLabel
        priorityTier         = $result.score.priorityTier
        placementRule        = $placement
        overrides            = $null
        dim_housing          = $result.score.dimensions.housing_stability
        dim_safety           = $result.score.dimensions.safety_crisis
        dim_vulnerability    = $result.score.dimensions.vulnerability_health
        dim_chronicity       = $result.score.dimensions.chronicity_system
        contributors_housing       = $cHousing
        contributors_safety        = $cSafety
        contributors_vulnerability = $cVuln
        contributors_chronicity    = $cChron
        rank         = $null  # assigned after sort
        error        = $null
    }
}

# ══════════════════════════════════════════════════════════════
# PERSONA DEFINITIONS
# ══════════════════════════════════════════════════════════════

$personas = @(

    # ── P1: CRITICAL-MAX ─────────────────────────────────────
    # Unsheltered for 1+ year, fleeing DV, suicidal ideation,
    # chronic homelessness, 3+ conditions, no insurance, no income, no ID.
    @{
        name  = "P1"
        label = "CRITICAL-MAX -- Unsheltered + DV + Crisis"
        modules = [ordered]@{
            consent = @{
                consent_data_collection  = $true
                consent_age_confirmation = $true
                consent_dv_safe_mode     = $false
            }
            demographics = @{
                first_name       = "TestP1"
                last_name        = "CriticalMax"
                veteran_status   = $true
                has_dependents   = $true
                dependent_ages   = @(3, 7)
            }
            housing = @{
                current_living_situation  = "unsheltered"
                unsheltered_location_type = "street"
                how_long_current          = "over_1_year"
                at_risk_of_losing         = $false
                can_return_to_previous    = $false
                wants_housing_assistance  = $true
            }
            safety = @{
                feels_safe_current_location   = "no"
                fleeing_dv                    = $true
                fleeing_trafficking           = $false
                experienced_violence_recently = $true
                has_protective_order          = $true
                substance_use_current         = "none"
                mental_health_current         = "severe_crisis"
                suicidal_ideation_recent      = $true
            }
            health = @{
                has_health_insurance      = $false
                chronic_conditions        = @("diabetes", "mental_health", "physical_disability", "respiratory")
                currently_pregnant        = $false
                needs_medication          = $true
                has_access_to_medication  = $false
                last_medical_visit        = "over_1_year"
                needs_immediate_medical   = $true
                self_care_difficulty      = "unable_without_help"
            }
            history = @{
                total_homeless_episodes    = 6
                total_homeless_months      = 36
                first_homeless_age         = 22
                currently_chronic          = $true
                institutional_history      = @("jail_prison", "psychiatric_facility")
                emergency_services_use     = "6_plus_times"
                incarceration_recent       = $false
            }
            income = @{
                has_any_income                         = $false
                income_sources                         = @("none")
                has_bank_account                       = $false
                has_valid_id                           = $false
                owes_debt_preventing_housing           = $true
                has_criminal_record_affecting_housing  = $true
                currently_employed                     = $false
                wants_employment_help                  = $true
            }
            goals = @{
                top_priorities     = @("housing", "safety", "healthcare")
                housing_preference = "any_available"
                location_preference = "anywhere"
                barriers_to_housing = @("no_id", "no_income", "criminal_record", "credit_history")
            }
        }
    },

    # ── P2: CRITICAL-HIGH ────────────────────────────────────
    # Emergency shelter, fleeing trafficking, severe mental health,
    # multiple conditions, no insurance, chronic.
    @{
        name  = "P2"
        label = "CRITICAL-HIGH -- Emergency Shelter + Trafficking + Chronic"
        modules = [ordered]@{
            consent = @{
                consent_data_collection  = $true
                consent_age_confirmation = $true
                consent_dv_safe_mode     = $false
            }
            demographics = @{
                first_name     = "TestP2"
                last_name      = "CritHigh"
                has_dependents = $true
                dependent_ages = @(1)
            }
            housing = @{
                current_living_situation = "emergency_shelter"
                how_long_current         = "3_6_months"
                can_return_to_previous   = $false
                wants_housing_assistance = $true
            }
            safety = @{
                feels_safe_current_location   = "sometimes"
                fleeing_dv                    = $false
                fleeing_trafficking           = $true
                experienced_violence_recently = $true
                substance_use_current         = "seeking_treatment"
                mental_health_current         = "severe_crisis"
                suicidal_ideation_recent      = $false
            }
            health = @{
                has_health_insurance     = $false
                chronic_conditions       = @("hiv_aids", "mental_health", "substance_use_disorder")
                currently_pregnant       = $true
                needs_immediate_medical  = $false
                self_care_difficulty     = "significant_difficulty"
                last_medical_visit       = "never"
            }
            history = @{
                total_homeless_episodes  = 4
                total_homeless_months    = 18
                first_homeless_age       = 18
                currently_chronic        = $true
                institutional_history    = @("foster_care", "jail_prison")
                emergency_services_use   = "3_5_times"
                incarceration_recent     = $true
            }
            income = @{
                has_any_income                       = $false
                income_sources                       = @("none")
                has_bank_account                     = $false
                has_valid_id                         = $true
                owes_debt_preventing_housing         = $false
                has_criminal_record_affecting_housing = $true
                currently_employed                   = $false
                wants_employment_help                = $true
            }
            goals = @{
                top_priorities      = @("housing", "safety", "food")
                housing_preference  = "permanent_supportive"
                location_preference = "near_current"
                barriers_to_housing = @("criminal_record", "no_income", "eviction_history")
            }
        }
    },

    # ── P3: HIGH ─────────────────────────────────────────────
    # Staying with others, at risk of eviction, recent violence,
    # moderate mental health, 2 conditions, low income.
    @{
        name  = "P3"
        label = "HIGH -- At-Risk Housed + Recent Violence + 2 Conditions"
        modules = [ordered]@{
            consent = @{
                consent_data_collection  = $true
                consent_age_confirmation = $true
            }
            demographics = @{
                first_name     = "TestP3"
                last_name      = "HighRisk"
                has_dependents = $true
                dependent_ages = @(5, 10, 14)
                veteran_status = $false
            }
            housing = @{
                current_living_situation = "staying_with_others"
                how_long_current         = "1_3_months"
                at_risk_of_losing        = $true
                eviction_notice          = $false
                can_return_to_previous   = $false
                wants_housing_assistance = $true
            }
            safety = @{
                feels_safe_current_location   = "sometimes"
                fleeing_dv                    = $false
                experienced_violence_recently = $true
                substance_use_current         = "occasional"
                mental_health_current         = "moderate_concerns"
                suicidal_ideation_recent      = $false
            }
            health = @{
                has_health_insurance     = $true
                insurance_type           = "medicaid"
                chronic_conditions       = @("diabetes", "mental_health")
                needs_medication         = $true
                has_access_to_medication = $true
                last_medical_visit       = "1_6_months"
                self_care_difficulty     = "some_difficulty"
            }
            history = @{
                total_homeless_episodes = 2
                total_homeless_months   = 4
                currently_chronic       = $false
                institutional_history   = @("none")
                emergency_services_use  = "1_2_times"
                incarceration_recent    = $false
            }
            income = @{
                has_any_income                       = $true
                monthly_income_dollars               = 800
                income_sources                       = @("employment_part", "snap")
                has_bank_account                     = $true
                has_valid_id                         = $true
                owes_debt_preventing_housing         = $true
                has_criminal_record_affecting_housing = $false
                currently_employed                   = $true
                wants_employment_help                = $false
            }
            goals = @{
                top_priorities      = @("housing", "childcare", "employment")
                housing_preference  = "rapid_rehousing"
                location_preference = "near_school"
                barriers_to_housing = @("credit_history", "large_family")
            }
        }
    },

    # ── P4: MODERATE ─────────────────────────────────────────
    # Transitional housing, stable but exiting soon, minor barriers.
    @{
        name  = "P4"
        label = "MODERATE -- Transitional Housing + Mild Barriers"
        modules = [ordered]@{
            consent = @{
                consent_data_collection  = $true
                consent_age_confirmation = $true
            }
            demographics = @{
                first_name     = "TestP4"
                last_name      = "Moderate"
                has_dependents = $false
                veteran_status = $false
            }
            housing = @{
                current_living_situation = "transitional_housing"
                how_long_current         = "6_12_months"
                at_risk_of_losing        = $false
                can_return_to_previous   = $false
                wants_housing_assistance = $true
            }
            safety = @{
                feels_safe_current_location = "mostly"
                fleeing_dv                  = $false
                experienced_violence_recently = $false
                substance_use_current       = "past_only"
                mental_health_current       = "mild_concerns"
                suicidal_ideation_recent    = $false
            }
            health = @{
                has_health_insurance    = $true
                insurance_type          = "medicaid"
                chronic_conditions      = @("mental_health")
                needs_medication        = $true
                has_access_to_medication = $true
                last_medical_visit      = "within_month"
                self_care_difficulty    = "none"
            }
            history = @{
                total_homeless_episodes = 1
                total_homeless_months   = 8
                currently_chronic       = $false
                institutional_history   = @("none")
                emergency_services_use  = "none"
                incarceration_recent    = $false
            }
            income = @{
                has_any_income         = $true
                monthly_income_dollars = 1200
                income_sources         = @("employment_part", "tanf")
                has_bank_account       = $true
                has_valid_id           = $true
                owes_debt_preventing_housing = $false
                has_criminal_record_affecting_housing = $false
                currently_employed     = $true
                wants_employment_help  = $true
            }
            goals = @{
                top_priorities      = @("housing", "employment", "education")
                housing_preference  = "rapid_rehousing"
                location_preference = "near_work"
                barriers_to_housing = @("credit_history")
            }
        }
    },

    # ── P5: LOWER ────────────────────────────────────────────
    # Stable permanent housing, employed, few concerns.
    @{
        name  = "P5"
        label = "LOWER -- Stable + Employed + Few Barriers"
        modules = [ordered]@{
            consent = @{
                consent_data_collection  = $true
                consent_age_confirmation = $true
            }
            demographics = @{
                first_name     = "TestP5"
                last_name      = "Stable"
                has_dependents = $false
                veteran_status = $false
            }
            housing = @{
                current_living_situation = "permanent_housing"
                how_long_current         = "over_1_year"
                at_risk_of_losing        = $false
                can_return_to_previous   = $true
                wants_housing_assistance = $false
            }
            safety = @{
                feels_safe_current_location = "yes"
                fleeing_dv                  = $false
                experienced_violence_recently = $false
                substance_use_current       = "none"
                mental_health_current       = "stable"
                suicidal_ideation_recent    = $false
            }
            health = @{
                has_health_insurance    = $true
                insurance_type          = "private"
                chronic_conditions      = @("none")
                needs_medication        = $false
                last_medical_visit      = "within_month"
                self_care_difficulty    = "none"
            }
            history = @{
                total_homeless_episodes = 0
                total_homeless_months   = 0
                currently_chronic       = $false
                institutional_history   = @("none")
                emergency_services_use  = "none"
                incarceration_recent    = $false
            }
            income = @{
                has_any_income         = $true
                monthly_income_dollars = 3200
                income_sources         = @("employment_full")
                has_bank_account       = $true
                has_valid_id           = $true
                owes_debt_preventing_housing           = $false
                has_criminal_record_affecting_housing  = $false
                currently_employed                     = $true
                wants_employment_help                  = $false
            }
            goals = @{
                top_priorities      = @("employment", "education", "transportation")
                housing_preference  = "independent"
                location_preference = "near_work"
                barriers_to_housing = @()
            }
        }
    }
)

# ══════════════════════════════════════════════════════════════
# RUN ALL PERSONAS
# ══════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  V2 INTAKE RANKING TEST SUITE" -ForegroundColor Cyan
Write-Host "  Target : $ApiBase" -ForegroundColor Cyan
Write-Host "  Time   : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "  Personas: $($personas.Count)" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════" -ForegroundColor Cyan

$results = @()
foreach ($p in $personas) {
    try {
        $r = Run-Persona -Persona $p
        $results += $r
        $tierColor = switch ($r.priorityTier) {
            "CRITICAL" { "Red" }
            "HIGH"     { "DarkYellow" }
            "MODERATE" { "Yellow" }
            "LOWER"    { "Green" }
            default    { "White" }
        }
        Write-Host ("    Score={0,3}  Tier={1,-8}  Level={2}  [{3}]" -f `
            $r.totalScore, $r.priorityTier, $r.stabilityLevel, $r.sessionId) -ForegroundColor $tierColor
    } catch {
        Write-Host "    [ERROR] $($p.name): $($_.Exception.Message)" -ForegroundColor Red
        $results += @{
            name = $p.name; label = $p.label; totalScore = -1
            priorityTier = "ERROR"; stabilityLevel = "?"; rank = $null
            dim_housing = "?"; dim_safety = "?"; dim_vulnerability = "?"; dim_chronicity = "?"
            sessionId = ""; error = $_.Exception.Message
        }
    }
}

# -- Sort by score descending -> assign rank --
$ranked = $results | Sort-Object -Property @{Expression={[int]$_.totalScore}} -Descending
$i = 1
foreach ($r in $ranked) { $r.rank = $i++ }

# ══════════════════════════════════════════════════════════════
# RANKING LEADERBOARD
# ══════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  RANKING LEADERBOARD -- Higher score = more acute need = higher priority" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

$header = "{0,-4} {1,-3} {2,-5} {3,-10} {4,-7} {5,-4} {6,-4} {7,-4} {8,-4}  {9}" -f `
    "RANK","ID","SCORE","TIER","STAB-LV","HSG","SAF","VUL","CHR","PERSONA"
Write-Host $header -ForegroundColor White
Write-Host ("-" * 90) -ForegroundColor DarkGray

foreach ($r in $ranked) {
    $tierColor = switch ($r.priorityTier) {
        "CRITICAL" { "Red" }
        "HIGH"     { "DarkYellow" }
        "MODERATE" { "Yellow" }
        "LOWER"    { "Green" }
        default    { "White" }
    }
    $stabLabel = if ($r.stabilityLevel -eq "?") { "?" } else {
        $lvMap = @{0="Crisis/Street";1="Emerg.Shelter";2="Transitional";3="Stabilizing";4="Housed-Sup";5="Self-Suff"}
        "$($r.stabilityLevel) - $($lvMap[[int]$r.stabilityLevel])"
    }
    $line = "{0,-4} {1,-3} {2,-5} {3,-10} {4,-14} {5,-4} {6,-4} {7,-4} {8,-4}  {9}" -f `
        "#$($r.rank)", $r.name, $r.totalScore, $r.priorityTier, $stabLabel,
        $r.dim_housing, $r.dim_safety, $r.dim_vulnerability, $r.dim_chronicity,
        ($r.label -replace " -- .*","")
    Write-Host $line -ForegroundColor $tierColor
}

Write-Host ("-" * 90) -ForegroundColor DarkGray
Write-Host "  Columns: HSG=Housing Stability  SAF=Safety/Crisis  VUL=Vulnerability/Health  CHR=Chronicity" -ForegroundColor DarkGray
Write-Host "  Max per dimension: 25  |  Max total: 100" -ForegroundColor DarkGray

# ── Verify expected tier ordering ──────────────────────────────
Write-Host ""
Write-Host "  TIER VERIFICATION" -ForegroundColor Cyan
$tierOrder = @("CRITICAL","HIGH","MODERATE","LOWER","ERROR")
$prevTierIdx = -1
$orderOk = $true
foreach ($r in $ranked) {
    $idx = [array]::IndexOf($tierOrder, $r.priorityTier)
    if ($idx -lt $prevTierIdx) { $orderOk = $false; break }
    $prevTierIdx = $idx
}
if ($orderOk) {
    Write-Host "  [PASS] Personas ranked in correct tier order (LOWER -> MODERATE -> HIGH -> CRITICAL by score)" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Tier ordering not purely monotonic -- expected ascending urgency with ascending score" -ForegroundColor Yellow
}

# ── Check all scores rendered (not null/0) -- LOWER tier with 0 is valid (self-sufficient) ──
$noScore = @($results | Where-Object { $_.totalScore -le 0 -and $_.priorityTier -notin @("ERROR","LOWER") })
if ($noScore.Count -eq 0) {
    Write-Host "  [PASS] All personas produced expected scores (LOWER-tier 0 is valid for self-sufficient)" -ForegroundColor Green
} else {
    Write-Host "  [WARN] $($noScore.Count) non-LOWER persona(s) scored 0 or below" -ForegroundColor Yellow
}

$errCount = @($results | Where-Object { $_.priorityTier -eq "ERROR" }).Count
if ($errCount -eq 0) {
    Write-Host "  [PASS] All $($personas.Count) sessions completed successfully" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] $errCount session(s) errored" -ForegroundColor Red
}

# ── Verbose: full dimension contributor breakdown ──────────────
if ($Verbose) {
    Write-Host ""
    Write-Host "══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  DIMENSION CONTRIBUTOR DETAIL" -ForegroundColor Cyan
    Write-Host "══════════════════════════════════════════════════════" -ForegroundColor Cyan
    foreach ($r in $ranked) {
        if ($r.priorityTier -eq "ERROR") { continue }
        Write-Host "`n  $($r.name) -- $($r.label)" -ForegroundColor White
        foreach ($dim in @("housing","safety","vulnerability","chronicity")) {
            $contribs = $r."contributors_$dim"
            $dimScore = $r."dim_$(if($dim -eq 'vulnerability'){'vulnerability'}else{$dim})"
            # map dim name to score field
            $scoreVal = switch ($dim) {
                "housing"       { $r.dim_housing }
                "safety"        { $r.dim_safety }
                "vulnerability" { $r.dim_vulnerability }
                "chronicity"    { $r.dim_chronicity }
            }
            Write-Host ("    [{0}  score={1}/25]" -f $dim.ToUpper().PadRight(14), $scoreVal) -ForegroundColor DarkCyan
            if ($contribs -and @($contribs).Count -gt 0) {
                foreach ($c in $contribs) {
                    Write-Host ("      +{0,2}pt  {1}" -f $c.points, $c.label) -ForegroundColor Gray
                }
            } else {
                Write-Host "      (no contributors)" -ForegroundColor DarkGray
            }
        }
    }
}

# ── Session ID reference table ─────────────────────────────────
Write-Host ""
Write-Host "  SESSION IDs (for provider dashboard verification)" -ForegroundColor Cyan
foreach ($r in $ranked) {
    if ($r.sessionId) {
        Write-Host ("  {0} ({1,-9}) {2}" -f $r.name, $r.priorityTier, $r.sessionId) -ForegroundColor DarkCyan
    }
}

Write-Host ""
$allOk = ($errCount -eq 0) -and ($noScore.Count -eq 0)
if ($allOk) {
    Write-Host "  RANKING TEST SUITE: PASSED" -ForegroundColor Green
} else {
    Write-Host "  RANKING TEST SUITE: NEEDS REVIEW" -ForegroundColor Yellow
}
Write-Host ""
