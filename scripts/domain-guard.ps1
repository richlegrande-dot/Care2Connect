#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Domain Guard - Strict validation to prevent care2connect.org typo
.DESCRIPTION
    Validates all operational files for correct domain spelling.
    Fails if "care2connect.org" (missing 's') is found outside allowlist.
    Checks: code, configs, .env files, scripts, runbooks, Caddy/Cloudflare configs.
.EXAMPLE
    .\scripts\domain-guard.ps1
#>

param(
    [switch]$Strict  # Fail even on allowlisted files
)

$ErrorActionPreference = "Stop"
$workspaceRoot = Split-Path -Parent $PSScriptRoot

Write-Host "`n=== Domain Guard: Validating Domain Spelling ===" -ForegroundColor Cyan

# Load allowlist
$allowlistPath = "$PSScriptRoot\domain-guard.allowlist.txt"
$allowlist = @()
if (Test-Path $allowlistPath) {
    $allowlist = Get-Content $allowlistPath | Where-Object { 
        $_ -notmatch '^\s*#' -and $_ -notmatch '^\s*$' 
    }
}

# Files to scan
$patterns = @(
    "*.ts", "*.tsx", "*.js", "*.jsx",
    "*.ps1", "*.sh",
    "*.yml", "*.yaml",
    ".env*",
    "Caddyfile*",
    "*.md"
)

# Directories to exclude
$excludeDirs = @("node_modules", ".next", ".git", "bin")

Write-Host "[1] Scanning for 'care2connect.org' typo (missing 's')..." -ForegroundColor Yellow

$violations = @()
$allowedViolations = @()

foreach ($pattern in $patterns) {
    $files = Get-ChildItem -Path $workspaceRoot -Filter $pattern -Recurse -File -ErrorAction SilentlyContinue | 
        Where-Object { 
            $exclude = $false
            foreach ($dir in $excludeDirs) {
                if ($_.FullName -like "*\$dir\*") {
                    $exclude = $true
                    break
                }
            }
            -not $exclude
        }
    
    foreach ($file in $files) {
        $content = (Get-Content $file.FullName -ErrorAction SilentlyContinue) -join "`n"
        if ($content -and $content -match 'care2connect\.org') {
            $relativePath = $file.FullName.Replace("$workspaceRoot\", "").Replace("\", "/")
            
            # Check if in allowlist
            $isAllowed = $false
            foreach ($allowPattern in $allowlist) {
                if ($relativePath -like $allowPattern) {
                    $isAllowed = $true
                    break
                }
            }
            
            if ($isAllowed -and -not $Strict) {
                $allowedViolations += $relativePath
            } else {
                $violations += $relativePath
            }
        }
    }
}

# Check .env files for localhost in production variables
Write-Host "[2] Checking .env files for localhost in NEXT_PUBLIC_* vars..." -ForegroundColor Yellow

$envFiles = Get-ChildItem -Path $workspaceRoot -Filter ".env*" -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -notmatch '\.example$' }

$localhostViolations = @()
foreach ($envFile in $envFiles) {
    $lines = Get-Content $envFile.FullName -ErrorAction SilentlyContinue
    $lineNum = 0
    foreach ($line in $lines) {
        $lineNum++
        if ($line -match 'NEXT_PUBLIC_.*=.*localhost' -or $line -match 'NEXT_PUBLIC_.*=.*127\.0\.0\.1') {
            $relativePath = $envFile.FullName.Replace("$workspaceRoot\", "").Replace("\", "/")
            # Check if it's a local dev file
            if ($envFile.Name -notmatch '\.local' -and $envFile.Name -notmatch '\.development') {
                $localhostViolations += "$relativePath (line $lineNum): $line"
            }
        }
    }
}

# Report results
Write-Host "`n=== Results ===" -ForegroundColor Cyan

if ($allowedViolations.Count -gt 0) {
    Write-Host "`n[ALLOWED] Found $($allowedViolations.Count) typos in allowlisted files:" -ForegroundColor Yellow
    foreach ($file in $allowedViolations) {
        Write-Host "  - $file" -ForegroundColor Gray
    }
}

if ($violations.Count -gt 0) {
    Write-Host "`n[FAIL] Found $($violations.Count) domain typos (care2connect.org):" -ForegroundColor Red
    foreach ($file in $violations) {
        Write-Host "  ❌ $file" -ForegroundColor Red
    }
    Write-Host "`nCorrect domain: care2connects.org (with 's')" -ForegroundColor Yellow
    Write-Host "If this file should be allowed, add it to: scripts/domain-guard.allowlist.txt" -ForegroundColor Gray
    exit 1
}

if ($localhostViolations.Count -gt 0) {
    Write-Host "`n[FAIL] Found $($localhostViolations.Count) localhost references in production .env vars:" -ForegroundColor Red
    foreach ($violation in $localhostViolations) {
        Write-Host "  ❌ $violation" -ForegroundColor Red
    }
    Write-Host "`nProduction NEXT_PUBLIC_* variables should not point to localhost" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ PASS: All domain references correct" -ForegroundColor Green
Write-Host "   - Correct domain used: care2connects.org" -ForegroundColor Gray
Write-Host "   - No localhost in production vars" -ForegroundColor Gray

exit 0
