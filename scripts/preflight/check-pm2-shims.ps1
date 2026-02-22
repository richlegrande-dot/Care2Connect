#Requires -Version 5.1
<#
.SYNOPSIS
    Detect PM2 ecosystem configs that reference .bin/ shims (bash scripts).

.DESCRIPTION
    On Windows, node_modules/.bin/* stubs are bash scripts that fail silently.
    PM2 script/args fields must reference the real entry point:
      GOOD:  node_modules/next/dist/bin/next
      BAD:   node_modules/.bin/next

    This preflight script scans every ecosystem*.config.js in the repo and
    flags any script/args value containing ".bin/" or ".bin\".

.OUTPUTS
    Exit 0 -- no shim references found
    Exit 1 -- at least one shim reference found
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path $PSScriptRoot -Parent
$Root      = Split-Path $ScriptDir -Parent

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Preflight: PM2 Bash-Shim Detection                       " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

$found = 0
$scanned = 0

$configFiles = @(Get-ChildItem -Path $Root -Recurse -Filter "ecosystem*.config.js" -File -ErrorAction SilentlyContinue)

if ($configFiles.Count -eq 0) {
    Write-Host "  [WARN] No ecosystem*.config.js files found in $Root" -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

foreach ($file in $configFiles) {
    $scanned++
    $relPath = $file.FullName.Replace($Root, "").TrimStart("\", "/")
    $lines = Get-Content $file.FullName -ErrorAction SilentlyContinue
    $lineNum = 0
    foreach ($line in $lines) {
        $lineNum++
        # Match .bin/ or .bin\ in script or args fields
        if ($line -match '\.bin[/\\]') {
            # Skip comment-only lines
            if ($line.Trim().StartsWith("//") -or $line.Trim().StartsWith("*") -or $line.Trim().StartsWith("/*")) {
                continue
            }
            $found++
            Write-Host "  [FAIL] $relPath line ${lineNum}:" -ForegroundColor Red
            Write-Host "         $($line.Trim())" -ForegroundColor Yellow
            Write-Host "         Fix: Replace .bin/ shim with the real entry point." -ForegroundColor Gray
            Write-Host "         Example: node_modules/next/dist/bin/next" -ForegroundColor Gray
            Write-Host ""
        }
    }
    if ($found -eq 0) {
        Write-Host "  [OK]   $relPath -- no shim references" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "  Scanned $scanned config file(s)." -ForegroundColor Gray

if ($found -gt 0) {
    Write-Host ""
    Write-Host "  [FAIL] Found $found bash-shim reference(s)." -ForegroundColor Red
    Write-Host "  PM2 will silently fail on Windows if .bin/ stubs are used." -ForegroundColor Red
    Write-Host "  Replace with direct node_modules/<package>/dist/bin/<name>" -ForegroundColor Yellow
    Write-Host ""
    exit 1
} else {
    Write-Host ""
    Write-Host "  [OK] All PM2 configs use direct entry points (no .bin/ shims)." -ForegroundColor Green
    Write-Host ""
    exit 0
}
