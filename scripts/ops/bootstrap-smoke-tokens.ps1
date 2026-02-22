<#
.SYNOPSIS
    Bootstrap smoke-test tokens into backend/.env.

.DESCRIPTION
    Generates long-lived JWT tokens required by the Phase 10 smoke test suite
    and appends them to backend/.env if not already present.

    Tokens generated:
      V2_INTAKE_TOKEN  -- 365-day system-admin JWT for the chat pipeline smoke test
                          (required when ENABLE_V2_INTAKE_AUTH=true)

    The script reads JWT_SECRET from backend/.env and uses the `jsonwebtoken`
    package that is already present in backend/node_modules.

    backend/.env is gitignored -- tokens are never committed to the repository.

.EXAMPLE
    .\scripts\ops\bootstrap-smoke-tokens.ps1

.NOTES
    Run once on a new machine or after rebuilding the environment.
    Safe to re-run: skips generation if the token key is already present.

    PS 5.1 compatible.
#>

param(
    [switch]$Force   # Re-generate tokens even if already present
)

$ErrorActionPreference = "Stop"

$Root   = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$EnvFile = Join-Path $Root "backend\.env"

Write-Host "=== Smoke Token Bootstrap ===" -ForegroundColor Cyan
Write-Host "  env file : $EnvFile"

if (-not (Test-Path $EnvFile)) {
    Write-Host "  [ERROR] backend/.env not found. Create it from backend/.env.example first." -ForegroundColor Red
    exit 1
}

# Read current .env content
$envLines = Get-Content $EnvFile

# ---------------------------------------------------------------------------
# Helper: extract a value from .env lines
# ---------------------------------------------------------------------------
function Get-EnvValue($lines, $key) {
    $line = $lines | Where-Object { $_ -match "^$key=" } | Select-Object -First 1
    if ($line) { return ($line -replace "^$key=", "").Trim() }
    return $null
}

# ---------------------------------------------------------------------------
# Helper: append a key=value line only if key is not present
# ---------------------------------------------------------------------------
function Append-EnvKey($envFile, $lines, $key, $value, $comment) {
    if (($lines | Where-Object { $_ -match "^$key=" }) -and -not $Force) {
        Write-Host "  [SKIP] $key already present in backend/.env (use -Force to regenerate)" -ForegroundColor Gray
        return $false
    }

    # Remove existing line if -Force
    if ($Force) {
        $lines = $lines | Where-Object { $_ -notmatch "^$key=" }
        Set-Content $envFile $lines -Encoding utf8
    }

    # Append
    Add-Content $envFile "" -Encoding utf8
    if ($comment) { Add-Content $envFile "# $comment" -Encoding utf8 }
    Add-Content $envFile "$key=$value" -Encoding utf8
    return $true
}

# ---------------------------------------------------------------------------
# 1. Read JWT_SECRET
# ---------------------------------------------------------------------------
$jwtSecret = Get-EnvValue $envLines "JWT_SECRET"
if (-not $jwtSecret) {
    Write-Host "  [ERROR] JWT_SECRET not found in backend/.env" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] JWT_SECRET found" -ForegroundColor Green

# ---------------------------------------------------------------------------
# 2. Generate V2_INTAKE_TOKEN
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "  Generating V2_INTAKE_TOKEN (system-admin, 365d)..." -ForegroundColor Yellow

$nodeScript = @"
const jwt = require('jsonwebtoken');
const tok = jwt.sign(
  { type: 'system-admin', userId: 'smoke-test-admin', sub: 'smoke-test-admin' },
  process.env.BOOTSTRAP_JWT_SECRET,
  { expiresIn: '365d' }
);
process.stdout.write(tok);
"@

$env:BOOTSTRAP_JWT_SECRET = $jwtSecret

$backendDir = Join-Path $Root "backend"
$tokenValue = $null
try {
    $tokenValue = (
        $nodeScript | node -e "$(($nodeScript -split "`n" | ForEach-Object { $_ }) -join ' ')" 2>&1
    )
    # Use node -e via argument to avoid multiline issues
    $nodeCmd = "const jwt=require('jsonwebtoken');const tok=jwt.sign({type:'system-admin',userId:'smoke-test-admin',sub:'smoke-test-admin'},process.env.BOOTSTRAP_JWT_SECRET,{expiresIn:'365d'});process.stdout.write(tok);"
    $tokenValue = & node --input-type=commonjs -e $nodeCmd 2>&1
    if ($LASTEXITCODE -ne 0) { throw "node exited $LASTEXITCODE" }
} catch {
    # Fallback: run via shell redirection
    $tmpJs = Join-Path $env:TEMP "bootstrap_token.js"
    Set-Content $tmpJs $nodeScript -Encoding utf8
    Push-Location $backendDir
    try {
        $tokenValue = (node $tmpJs 2>&1)
    } finally {
        Pop-Location
        Remove-Item $tmpJs -ErrorAction SilentlyContinue
    }
}
Remove-Item "env:BOOTSTRAP_JWT_SECRET" -ErrorAction SilentlyContinue

if (-not $tokenValue -or $tokenValue.Length -lt 20) {
    Write-Host "  [ERROR] Failed to generate JWT. Is node.js installed and jsonwebtoken in backend/node_modules?" -ForegroundColor Red
    Write-Host "          Run: cd backend; npm install" -ForegroundColor Gray
    exit 1
}

# Re-read after possible -Force modifications
$envLines = Get-Content $EnvFile
$added = Append-EnvKey $EnvFile $envLines "V2_INTAKE_TOKEN" $tokenValue `
    "Smoke-test system-admin JWT for chat pipeline (generated by bootstrap-smoke-tokens.ps1)"

if ($added) {
    Write-Host "  [ADDED] V2_INTAKE_TOKEN written to backend/.env" -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# 3. Summary
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "  Bootstrap complete. Run Gate A to verify:" -ForegroundColor Cyan
Write-Host "    .\scripts\preflight\run-gate-demo.ps1" -ForegroundColor White
