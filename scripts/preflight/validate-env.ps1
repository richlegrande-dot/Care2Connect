#Requires -Version 5.1
<#
.SYNOPSIS
    Validate required environment variables exist without printing values.

.DESCRIPTION
    Checks that both backend/.env and frontend/.env.local contain all
    required keys.  Values are never printed (security).  Reports missing
    keys and exits non-zero if any are absent.

.PARAMETER Fix
    If set, copies .env.example -> .env (or .env.local.example -> .env.local)
    when the target file is completely missing.

.OUTPUTS
    Exit 0 -- all required keys present
    Exit 1 -- missing keys or missing files
#>
param(
    [switch]$Fix
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path $PSScriptRoot -Parent
$Root      = Split-Path $ScriptDir -Parent

$failures = 0

function Check-EnvFile {
    param(
        [string]$Label,
        [string]$EnvPath,
        [string]$ExamplePath,
        [string[]]$RequiredKeys
    )

    Write-Host ""
    Write-Host "-- $Label --" -ForegroundColor Cyan

    if (-not (Test-Path $EnvPath)) {
        if ($Fix -and (Test-Path $ExamplePath)) {
            Copy-Item $ExamplePath $EnvPath
            Write-Host "  [FIX]  Created $EnvPath from example template." -ForegroundColor Yellow
        } else {
            Write-Host "  [FAIL] $EnvPath does not exist." -ForegroundColor Red
            if (Test-Path $ExamplePath) {
                Write-Host "         Copy the example: cp $ExamplePath $EnvPath" -ForegroundColor Gray
            }
            $script:failures++
            return
        }
    }

    $lines = @(Get-Content $EnvPath -ErrorAction SilentlyContinue)
    $definedKeys = @()
    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed -eq "" -or $trimmed.StartsWith("#")) { continue }
        if ($trimmed -match "^([A-Za-z_][A-Za-z0-9_]*)=") {
            $definedKeys += $Matches[1]
        }
    }

    $missing = @()
    foreach ($key in $RequiredKeys) {
        if ($definedKeys -notcontains $key) {
            $missing += $key
        }
    }

    if ($missing.Count -eq 0) {
        Write-Host "  [OK]   All $($RequiredKeys.Count) required keys present." -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Missing $($missing.Count) key(s):" -ForegroundColor Red
        foreach ($k in $missing) {
            Write-Host "         - $k" -ForegroundColor Yellow
        }
        $script:failures += $missing.Count
    }

    # Report total keys found (not values)
    Write-Host "  [INFO] $($definedKeys.Count) total keys defined in file." -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Preflight: Environment Variable Validation                " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

# ---- Backend .env ---------------------------------------------------------
$backendEnv     = Join-Path $Root "backend\.env"
$backendExample = Join-Path $Root "backend\.env.example"
$backendRequired = @(
    "NODE_ENV",
    "PORT",
    "JWT_SECRET",
    "DATABASE_URL"
)

Check-EnvFile -Label "Backend (.env)" `
    -EnvPath $backendEnv `
    -ExamplePath $backendExample `
    -RequiredKeys $backendRequired

# ---- Frontend .env.local --------------------------------------------------
$frontendEnv     = Join-Path $Root "frontend\.env.local"
$frontendExample = Join-Path $Root "frontend\.env.local.example"
$frontendRequired = @(
    "NEXT_PUBLIC_API_URL",
    "BACKEND_INTERNAL_URL",
    "NEXT_PUBLIC_FRONTEND_URL"
)

Check-EnvFile -Label "Frontend (.env.local)" `
    -EnvPath $frontendEnv `
    -ExamplePath $frontendExample `
    -RequiredKeys $frontendRequired

# ---- Summary --------------------------------------------------------------
Write-Host ""
if ($failures -eq 0) {
    Write-Host "  [OK] All environment checks passed." -ForegroundColor Green
    Write-Host ""
    exit 0
} else {
    Write-Host "  [FAIL] $failures issue(s) found. Fix missing keys before starting." -ForegroundColor Red
    Write-Host ""
    exit 1
}
