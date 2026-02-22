#Requires -Version 5.1
<#
.SYNOPSIS
    Detects Next.js App Router routes shadowed by the /api/:path* rewrite rule.

.DESCRIPTION
    If next.config.js rewrites /api/:path* to the backend, any file at
    frontend/app/api/**/route.ts is UNREACHABLE dead code.
    Next.js evaluates rewrites BEFORE the App Router -- the request never
    reaches the route handler.

    Fix: place proxy/relay routes under a different prefix (e.g. /papi/).

.OUTPUTS
    Exit 0  -- no unallowlisted shadowed routes found
    Exit 1  -- at least one shadowed route detected

.EXAMPLE
    powershell -File scripts/preflight/check-next-rewrite-shadow.ps1

#>
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..") | Select-Object -ExpandProperty Path
$NextConfig = Join-Path $Root "frontend\next.config.js"
$AppApiDir  = Join-Path (Join-Path $Root "frontend") "app\api"

# ---------------------------------------------------------------------------
# Allowlist: routes known to be intentionally shadowed (tracked as FIXME).
# Add relative-to-AppApiDir paths here if you consciously accept the shadow.
# ---------------------------------------------------------------------------
$Allowlist = @(
    # No allowlisted routes. The former app/api/health/route.ts was removed
    # in Phase 11 (shadowed dead code -- the /api/health fetch in
    # health/page.tsx intentionally hits the backend via the rewrite).
)

Write-Host ""
Write-Host "[check-next-rewrite-shadow] Scanning for rewrite/route conflicts..."
Write-Host ""

# ---- Step 1: Detect the conflicting rewrite in next.config.js ----
if (-not (Test-Path $NextConfig)) {
    Write-Host "[SKIP] next.config.js not found at: $NextConfig"
    exit 0
}

$configContent = Get-Content $NextConfig -Raw
$rewritePattern = 'source\s*:\s*["'']/api/?\*?'
$hasRewrite = $configContent -match $rewritePattern

if (-not $hasRewrite) {
    Write-Host "[OK] No /api/:path* rewrite found in next.config.js. No shadowing risk."
    exit 0
}

# Extract the rewrite source line for display
$rewriteLine = ($configContent -split "`n" | Where-Object { $_ -match $rewritePattern } | Select-Object -First 1).Trim()
Write-Host "[WARN] Conflicting rewrite detected in next.config.js:"
Write-Host "       $rewriteLine"
Write-Host ""
Write-Host "       Next.js rewrites run BEFORE the App Router."
Write-Host "       All routes under app/api/** will be unreachable (dead code)."
Write-Host "       Use /papi/* or another non-conflicting prefix instead."
Write-Host ""

# ---- Step 2: Find all route.ts files under app/api/ ----
if (-not (Test-Path $AppApiDir)) {
    Write-Host "[OK] No app/api/ directory exists. No shadowed routes."
    exit 0
}

$routeFiles = @(Get-ChildItem -Path $AppApiDir -Recurse -Filter "route.ts" -ErrorAction SilentlyContinue)

if ($routeFiles.Count -eq 0) {
    Write-Host "[OK] No route.ts files found under app/api/. No shadowed routes."
    exit 0
}

# ---- Step 3: Filter out allowlisted routes ----
$offending = @()
foreach ($f in $routeFiles) {
    $relPath = $f.FullName.Substring($AppApiDir.Length).TrimStart("\").TrimStart("/")
    $allowed = $false
    foreach ($entry in $Allowlist) {
        if ($relPath -eq $entry) {
            Write-Host "[ALLOW] $relPath (allowlisted -- tracked as FIXME)"
            $allowed = $true
            break
        }
    }
    if (-not $allowed) {
        $offending += $relPath
    }
}

if ($offending.Count -eq 0) {
    Write-Host ""
    Write-Host "[OK] All app/api/ routes are either allowlisted or absent."
    Write-Host "     (Allowlisted routes are still unreachable -- fix them before launch.)"
    exit 0
}

# ---- Step 4: Report offending routes ----
Write-Host ""
Write-Host "[FAIL] $($offending.Count) UNREACHABLE route(s) found under app/api/:"
Write-Host ""
foreach ($r in $offending) {
    Write-Host "       frontend/app/api/$r"
}
Write-Host ""
Write-Host "ACTION REQUIRED:"
Write-Host "  Option A (recommended): Move the route to a non-conflicting prefix."
Write-Host "    - Rename: frontend/app/papi/<route>/route.ts"
Write-Host "    - Update all fetch() calls from /api/<route> to /papi/<route>"
Write-Host ""
Write-Host "  Option B: Narrow the rewrite in next.config.js."
Write-Host "    - Change source from '/api/:path*' to '/api/v2/:path*'"
Write-Host "    - Only safe if NO client code calls non-v2 /api/* paths"
Write-Host "    - Search: grep -r fetch.*/api/ frontend/app frontend/components"
Write-Host ""
Write-Host "  Option C: Add to Allowlist in this script (only for tracked FIXMEs)."
Write-Host ""
exit 1
