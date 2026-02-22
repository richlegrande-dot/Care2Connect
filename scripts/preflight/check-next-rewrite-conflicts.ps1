<#
.SYNOPSIS
    Detects App Router routes that are silently shadowed by next.config.js rewrite rules.
.DESCRIPTION
    If next.config.js contains a blanket rewrite: source "/api/:path*" -> backend
    then ANY route under frontend/app/api/** is unreachable dead code because
    Next.js evaluates rewrites BEFORE consulting the App Router.

    CONTEXT (Feb 2026):
    app/api/provider/[...path]/route.ts was unreachable dead code.
    All requests hit Express at /api/provider/* (wrong path) -> 404 -> 500.

    APPROVED PREFIX: Use /papi/* for App Router proxy routes.
    These are NOT matched by the /api/:path* rewrite and are fully reachable.
#>
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$WorkspaceRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$NextConfig    = Join-Path (Join-Path $WorkspaceRoot "frontend") "next.config.js"
$AppApiDir     = Join-Path (Join-Path (Join-Path $WorkspaceRoot "frontend") "app") "api"

# Add routes here that are intentionally allowed despite the rewrite
# NOTE: entries here are SHADOWED (unreachable) but known/tracked.
$Allowlist = @(
    # FIXME: frontend/app/api/health/route.ts is a pre-existing shadowed route.
    # It was intended to return frontend service identity but /api/health is
    # intercepted by the blanket rewrite and hits the backend instead.
    # Track fix: rename to /api/frontend-health or expose via a non-api prefix.
    "frontend/app/api/health/route.ts"
)

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  PREFLIGHT: Next.js Rewrite / App Router Conflict Check  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $NextConfig)) {
    Write-Error "next.config.js not found at: $NextConfig"
    exit 1
}

$configContent = Get-Content $NextConfig -Raw
Write-Host "[1/3] Parsed: $NextConfig" -ForegroundColor Gray

$blankApiRewrite = $configContent -match 'source\s*:\s*["'']/api/'

if (-not $blankApiRewrite) {
    Write-Host "[2/3] No blanket /api/:path* rewrite found. app/api/ routes are safe." -ForegroundColor Green
    Write-Host ""
    Write-Host "PASS -- No rewrite/router conflicts detected." -ForegroundColor Green
    exit 0
}

Write-Host "[2/3] DETECTED blanket /api/* rewrite in next.config.js" -ForegroundColor Yellow
Write-Host "      Any route under frontend/app/api/ is UNREACHABLE (rewrite runs first)." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path $AppApiDir)) {
    Write-Host "[3/3] No frontend/app/api/ directory found -- nothing to conflict with." -ForegroundColor Green
    Write-Host ""
    Write-Host "PASS -- Directory frontend/app/api/ does not exist." -ForegroundColor Green
    exit 0
}

$routeFiles = @(Get-ChildItem -Path $AppApiDir -Recurse -Filter "route.ts" -File -ErrorAction SilentlyContinue)

if ($routeFiles.Count -eq 0) {
    Write-Host "[3/3] No route.ts files under frontend/app/api/ -- no conflicts." -ForegroundColor Green
    Write-Host ""
    Write-Host "PASS -- No shadowed App Router routes." -ForegroundColor Green
    exit 0
}

$conflicts = @()
foreach ($file in $routeFiles) {
    $relPath = $file.FullName.Replace($WorkspaceRoot.ToString(), "").TrimStart("\").Replace("\", "/")
    if ($Allowlist -contains $relPath) {
        Write-Host "  [ALLOWLISTED] $relPath" -ForegroundColor DarkGray
    } else {
        $conflicts += $relPath
    }
}

if ($conflicts.Count -eq 0) {
    Write-Host "[3/3] All app/api/ routes are in the allowlist." -ForegroundColor Green
    Write-Host ""
    Write-Host "PASS -- No un-allowlisted shadowed routes." -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Red
Write-Host "  FAIL -- SHADOWED APP ROUTER ROUTES     " -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Red
Write-Host ""
Write-Host "The following route.ts files are UNREACHABLE because" -ForegroundColor Red
Write-Host "next.config.js has a blanket rewrite: /api/:path* -> backend" -ForegroundColor Red
Write-Host "All /api/* requests are intercepted BEFORE the App Router." -ForegroundColor Red
Write-Host ""

foreach ($c in $conflicts) {
    Write-Host "  SHADOWED: $c" -ForegroundColor Red
}

Write-Host ""
Write-Host "HOW TO FIX" -ForegroundColor Yellow
Write-Host "----------" -ForegroundColor Yellow
Write-Host "Option A (RECOMMENDED): Move the route to /papi/* prefix." -ForegroundColor Yellow
Write-Host "  Example: frontend/app/papi/[...path]/route.ts (already in use)." -ForegroundColor Yellow
Write-Host ""
Write-Host "Option B: Add to the allowlist in this script (only if backend handles it)." -ForegroundColor Yellow
Write-Host ""
Write-Host "See docs/DEPLOY_PROCESS_HARDENING.md for full context." -ForegroundColor Cyan
Write-Host ""
exit 1
