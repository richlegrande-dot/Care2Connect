<#
.SYNOPSIS
    Validates required environment variables exist in frontend/.env.local
    and backend/.env (or .env.local). Never prints values.
.DESCRIPTION
    Reads each env file line by line, checks that required keys exist
    and are not empty or set to the placeholder __SET_ME__.

    Exit codes:
      0 = all critical keys present
      1 = one or more critical keys missing or file not found

    Required frontend keys:
      NEXT_PUBLIC_ENABLE_V2_INTAKE  -- missing = /onboarding/v2 redirects to /
      NEXT_PUBLIC_API_URL            -- missing = all /api/* rewrites fail
      BACKEND_INTERNAL_URL           -- optional but recommended (falls back to NEXT_PUBLIC_API_URL)

    Required backend keys:
      ENABLE_V2_INTAKE               -- enables /api/v2/intake/* endpoints
      PROVIDER_DASHBOARD_TOKEN       -- auth for provider dashboard
      DATABASE_URL                   -- PostgreSQL connection string
#>
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$WorkspaceRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$CritFails = [System.Collections.Generic.List[string]]::new()
$Warnings  = [System.Collections.Generic.List[string]]::new()

$FrontendRequired = @(
    [PSCustomObject]@{ Key="NEXT_PUBLIC_ENABLE_V2_INTAKE"; Critical=$true;  Note="Without this, /onboarding/v2 silently redirects to /" }
    [PSCustomObject]@{ Key="NEXT_PUBLIC_API_URL";          Critical=$true;  Note="All /api/* rewrites target this URL" }
    [PSCustomObject]@{ Key="BACKEND_INTERNAL_URL";         Critical=$false; Note="Server-side proxy should target localhost directly (falls back to NEXT_PUBLIC_API_URL if absent)" }
    [PSCustomObject]@{ Key="NEXT_PUBLIC_PROVIDER_DASHBOARD_TOKEN"; Critical=$false; Note="Pre-fills provider login form" }
)

$BackendRequired = @(
    [PSCustomObject]@{ Key="ENABLE_V2_INTAKE";         Critical=$true;  Note="Enables /api/v2/intake/* endpoints" }
    [PSCustomObject]@{ Key="PROVIDER_DASHBOARD_TOKEN"; Critical=$true;  Note="Auth token for provider dashboard" }
    [PSCustomObject]@{ Key="DATABASE_URL";             Critical=$true;  Note="PostgreSQL connection string" }
    [PSCustomObject]@{ Key="JWT_SECRET";               Critical=$false; Note="Required for JWT-protected endpoints" }
    [PSCustomObject]@{ Key="NODE_ENV";                 Critical=$false; Note="Should be 'development' or 'production'" }
)

function Parse-EnvFile($path) {
    $result = @{}
    if (-not (Test-Path $path)) { return $result }
    foreach ($line in (Get-Content $path)) {
        $line = $line.Trim()
        if ($line -eq "" -or $line.StartsWith("#")) { continue }
        $eq = $line.IndexOf("=")
        if ($eq -lt 0) { continue }
        $key = $line.Substring(0, $eq).Trim()
        $val = $line.Substring($eq + 1).Trim()
        $result[$key] = $val
    }
    return $result
}

function Check-EnvFile($envPath, $label, $requiredKeys) {
    Write-Host "  File: $label" -ForegroundColor Gray
    if (-not (Test-Path $envPath)) {
        Write-Host "  NOT FOUND: $label" -ForegroundColor Red
        Write-Host "  Copy the .example file and fill in real values." -ForegroundColor Yellow
        foreach ($req in $requiredKeys) {
            $msg = "MISSING FILE $label (key: $($req.Key))"
            if ($req.Critical) { $script:CritFails.Add($msg) } else { $script:Warnings.Add($msg) }
        }
        return
    }
    $env = Parse-EnvFile $envPath
    foreach ($req in $requiredKeys) {
        $key = $req.Key
        $present = $env.ContainsKey($key)
        $val     = if ($present) { $env[$key] } else { "" }
        $state   = if (-not $present) { "MISSING" } elseif ($val -eq "") { "EMPTY" } elseif ($val -eq "__SET_ME__") { "PLACEHOLDER" } else { "OK" }
        if ($state -eq "OK") {
            Write-Host "  OK : $key" -ForegroundColor Green
        } elseif ($req.Critical) {
            Write-Host "  FAIL [$state] : $key -- $($req.Note)" -ForegroundColor Red
            $script:CritFails.Add("$label -- $key is $state. $($req.Note)")
        } else {
            Write-Host "  WARN [$state] : $key -- $($req.Note)" -ForegroundColor Yellow
            $script:Warnings.Add("$label -- $key is $state. $($req.Note)")
        }
    }
}

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  PREFLIGHT: Environment Variable Validation          " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

Write-Host ""; Write-Host "-- Frontend (.env.local) --" -ForegroundColor Cyan
Check-EnvFile (Join-Path (Join-Path $WorkspaceRoot "frontend") ".env.local") "frontend/.env.local" $FrontendRequired

Write-Host ""; Write-Host "-- Backend (.env) --" -ForegroundColor Cyan
$backendEnvPath = $null
foreach ($candidate in @(".env.local", ".env")) {
    $full = Join-Path (Join-Path $WorkspaceRoot "backend") $candidate
    if (Test-Path $full) { $backendEnvPath = $full; break }
}
if (-not $backendEnvPath) { $backendEnvPath = Join-Path (Join-Path $WorkspaceRoot "backend") ".env" }
$backendLabel = "backend/" + [System.IO.Path]::GetFileName($backendEnvPath)
Check-EnvFile $backendEnvPath $backendLabel $BackendRequired

Write-Host ""
if ($Warnings.Count -gt 0) {
    Write-Host "WARNINGS ($($Warnings.Count)):" -ForegroundColor Yellow
    foreach ($w in $Warnings) { Write-Host "  * $w" -ForegroundColor Yellow }
}

Write-Host ""
if ($CritFails.Count -eq 0) {
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  PASS -- All critical env keys are present.   " -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    exit 0
} else {
    Write-Host "======================================================" -ForegroundColor Red
    Write-Host "  FAIL -- $($CritFails.Count) critical key(s) missing.  " -ForegroundColor Red
    Write-Host "======================================================" -ForegroundColor Red
    foreach ($f in $CritFails) { Write-Host "  * $f" -ForegroundColor Red }
    Write-Host ""
    Write-Host "Use .example files as reference:" -ForegroundColor Yellow
    Write-Host "  frontend/.env.local.example  ->  frontend/.env.local" -ForegroundColor Cyan
    Write-Host "  backend/.env.example         ->  backend/.env" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}
