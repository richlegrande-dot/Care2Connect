<#
.SYNOPSIS
    Detects node_modules/.bin/ shim paths inside PM2 ecosystem configs.
.DESCRIPTION
    On Windows, node_modules/.bin/* are Unix bash scripts (#!/bin/sh).
    When passed as arguments to the `node` binary via PM2 they cause:
        SyntaxError: missing ) after argument list
    PM2 enters a crash-restart loop and may leave orphan child processes.

    This script scans all ecosystem*.js files and fails if any args reference .bin/ paths.

    Context (Feb 2026):
    ecosystem.dev.config.js had:
        args: ['node_modules/.bin/next', 'dev', '--port', '3000']
    Fix: use  args: ['node_modules/next/dist/bin/next', 'dev', '--port', '3000']

    To find the JS entry for any package:
        (Get-Content node_modules/<pkg>/package.json | ConvertFrom-Json).bin
#>
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$WorkspaceRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$Failures = [System.Collections.Generic.List[string]]::new()

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  PREFLIGHT: PM2 Windows Bash Shim Detection          " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$ecosystemFiles = @(Get-ChildItem -Path $WorkspaceRoot -Filter "ecosystem*.js" -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch "node_modules" })

if ($ecosystemFiles.Count -eq 0) {
    Write-Host "  No ecosystem*.js files found. Nothing to check." -ForegroundColor Gray
    Write-Host ""
    Write-Host "PASS -- No ecosystem configs found." -ForegroundColor Green
    exit 0
}

foreach ($file in $ecosystemFiles) {
    $relPath = $file.FullName.Replace($WorkspaceRoot.ToString(), "").TrimStart("\")
    Write-Host "  Scanning: $relPath" -ForegroundColor Gray
    $lineNum = 0
    $fileHasShim = $false
    foreach ($line in (Get-Content $file.FullName)) {
        $lineNum++
        if ($line -match "node_modules[\\/]\.bin[\\/]") {
            $trimmed = $line.Trim()
            Write-Host "  [SHIM] Line $lineNum of ${relPath}: $trimmed" -ForegroundColor Red
            $Failures.Add("$relPath line $lineNum -- bash shim: $trimmed")
            $fileHasShim = $true
        }
    }
    if (-not $fileHasShim) {
        Write-Host "  OK -- no .bin shims." -ForegroundColor Green
    }
}

Write-Host ""
if ($Failures.Count -eq 0) {
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  PASS -- No Windows bash shim paths detected.  " -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    exit 0
}

Write-Host "=======================================================" -ForegroundColor Red
Write-Host "  FAIL -- PM2 ecosystem config has .bin/ shim path(s)  " -ForegroundColor Red
Write-Host "=======================================================" -ForegroundColor Red
Write-Host ""
Write-Host "WHY THIS BREAKS ON WINDOWS:" -ForegroundColor Yellow
Write-Host "  node_modules/.bin/<name> is a Unix bash script (#!/bin/sh)." -ForegroundColor Yellow
Write-Host "  When passed as 'node <shim>', Node throws:" -ForegroundColor Yellow
Write-Host "    SyntaxError: missing ) after argument list" -ForegroundColor Yellow
Write-Host "  PM2 enters crash loop; spawned children may persist on ports." -ForegroundColor Yellow
Write-Host ""
Write-Host "HOW TO FIX:" -ForegroundColor Cyan
Write-Host "  Replace .bin path with the actual JS entry. Example for Next.js:" -ForegroundColor Cyan
Write-Host "  BEFORE: args: ['node_modules/.bin/next', 'dev', '--port', '3000']" -ForegroundColor Red
Write-Host "  AFTER:  args: ['node_modules/next/dist/bin/next', 'dev', '--port', '3000']" -ForegroundColor Green
Write-Host ""
Write-Host "  Find the entry for any package:" -ForegroundColor Cyan
Write-Host "    (Get-Content node_modules/<pkg>/package.json | ConvertFrom-Json).bin" -ForegroundColor Gray
Write-Host ""
foreach ($f in $Failures) { Write-Host "  * $f" -ForegroundColor Red }
Write-Host ""
Write-Host "See docs/DEPLOY_PROCESS_HARDENING.md for full context." -ForegroundColor Cyan
exit 1
