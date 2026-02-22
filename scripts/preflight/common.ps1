<#
.SYNOPSIS
    Shared helper functions for Care2Connect preflight scripts.

.DESCRIPTION
    Common utilities imported by preflight sub-checks.
    Import at the top of any preflight script with:

        . (Join-Path $PSScriptRoot "common.ps1")

    Functions provided:
      Test-Pm2ProcessIdentity  -- Check whether a process command line matches
                                  an expected pattern or is PM2-managed.
      Get-EnvFileValue         -- Read a single key from a .env file.

    PS 5.1 compatible.
#>

# Guard against double-import
if ($script:careConnectCommonLoaded) { return }
$script:careConnectCommonLoaded = $true

# ---------------------------------------------------------------------------
# Test-Pm2ProcessIdentity
# ---------------------------------------------------------------------------
<#
.SYNOPSIS
    Returns $true if the process command line matches the expected app pattern
    OR if it is a PM2-managed Node.js process container.

.DESCRIPTION
    PM2 in fork mode does not expose the application entry point in the OS
    command line. The actual process is:
        node .../ProcessContainerFork.js

    This function accepts both the direct pattern and the PM2 container
    pattern so that preflight identity checks work in both dev and PM2 modes.

.PARAMETER CommandLine
    The full command line string of the process to check.

.PARAMETER AppPattern
    A regex pattern that matches the expected direct-launch command line
    (e.g. 'dist[/\\]server\.js' for the backend, 'next.*3000' for the frontend).

.PARAMETER AppLabel
    Human-readable label for log messages (e.g. 'backend', 'frontend').

.OUTPUTS
    [hashtable] with keys:
        Pass    [bool]   -- whether the check passed
        Message [string] -- pass/fail explanation
#>
function Test-Pm2ProcessIdentity {
    param(
        [string]$CommandLine,
        [string]$AppPattern,
        [string]$AppLabel = "process"
    )

    if ($CommandLine -match $AppPattern) {
        return @{
            Pass    = $true
            Message = "$AppLabel identity confirmed (direct launch)"
        }
    }

    if ($CommandLine -match "ProcessContainerFork") {
        return @{
            Pass    = $true
            Message = "$AppLabel identity confirmed (PM2-managed process container)"
        }
    }

    return @{
        Pass    = $false
        Message = "$AppLabel command line does not match expected pattern. Got: $CommandLine"
    }
}

# ---------------------------------------------------------------------------
# Get-EnvFileValue
# ---------------------------------------------------------------------------
<#
.SYNOPSIS
    Read a single key=value from a .env file.

.PARAMETER EnvFile
    Path to the .env file.

.PARAMETER Key
    The key to look up (case-sensitive).

.OUTPUTS
    [string] value, or $null if not found or file does not exist.
#>
function Get-EnvFileValue {
    param(
        [string]$EnvFile,
        [string]$Key
    )

    if (-not (Test-Path $EnvFile)) { return $null }

    $line = Get-Content $EnvFile -ErrorAction SilentlyContinue |
                Where-Object { $_ -match "^$Key=" } |
                Select-Object -First 1

    if ($line) {
        return ($line -replace "^$Key=", "").Trim()
    }
    return $null
}

# ---------------------------------------------------------------------------
# Test-FrontendBuildFreshness
# ---------------------------------------------------------------------------
<#
.SYNOPSIS
    Checks whether the Next.js .next/BUILD_ID is older than any source file.

.PARAMETER FrontendRoot
    Path to the frontend directory (containing .next/ and src/).

.OUTPUTS
    [hashtable] with keys:
        Stale   [bool]   -- true if source files are newer than the build artifact
        File    [string] -- first stale source file name (or $null)
        Message [string] -- human-readable summary
#>
function Test-FrontendBuildFreshness {
    param([string]$FrontendRoot)

    $buildIdPath = Join-Path $FrontendRoot ".next\BUILD_ID"
    $srcPath     = Join-Path $FrontendRoot "src"

    if (-not (Test-Path $buildIdPath)) {
        return @{ Stale = $false; File = $null; Message = "BUILD_ID not found -- skipping freshness check" }
    }
    if (-not (Test-Path $srcPath)) {
        return @{ Stale = $false; File = $null; Message = "src/ not found -- skipping freshness check" }
    }

    $buildTime = (Get-Item $buildIdPath).LastWriteTime
    $staleFile = Get-ChildItem $srcPath -Recurse -Include "*.ts","*.tsx" -ErrorAction SilentlyContinue |
                    Where-Object { $_.LastWriteTime -gt $buildTime } |
                    Select-Object -First 1

    if ($staleFile) {
        return @{
            Stale   = $true
            File    = $staleFile.Name
            Message = "Build may be stale: $($staleFile.Name) is newer than BUILD_ID ($buildTime)"
        }
    }

    return @{
        Stale   = $false
        File    = $null
        Message = "Frontend build is current (no source files newer than BUILD_ID)"
    }
}
