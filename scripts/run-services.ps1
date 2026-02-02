param(
  [switch]$ShowWindows
)

$ErrorActionPreference = "Stop"

# Repo paths (assumes scripts/ is at repo root/scripts)
$RepoRoot   = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Frontend   = Join-Path $RepoRoot "frontend"
$Backend    = Join-Path $RepoRoot "backend"

# Logs
$LogDir = Join-Path $RepoRoot "logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$SupervisorLog = Join-Path $LogDir "autostart-supervisor.log"

function Log($msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $msg
  $line | Tee-Object -FilePath $SupervisorLog -Append | Out-Null
}

function Ensure-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $name. Install it and re-run setup."
  }
}

Ensure-Command "node"
Ensure-Command "npm"
Ensure-Command "cloudflared"

# Window style
$WindowStyle = if ($ShowWindows) { "Normal" } else { "Hidden" }

# Start child processes as PowerShell hosts so we can track them reliably
function Start-ServiceProcess {
  param(
    [string]$Name,
    [string]$WorkDir,
    [string]$CommandLine,
    [string]$OutLog
  )

  $cmd = @"
`$ErrorActionPreference='Continue'
cd `"$WorkDir`"
$CommandLine
"@

  Log "Starting $Name: $CommandLine (cwd=$WorkDir)"
  $p = Start-Process powershell `
    -WindowStyle $WindowStyle `
    -ArgumentList @("-NoProfile","-ExecutionPolicy","Bypass","-Command",$cmd) `
    -RedirectStandardOutput $OutLog `
    -RedirectStandardError  $OutLog `
    -PassThru

  return $p
}

# Tunnel: uses existing %USERPROFILE%\.cloudflared\config.yml
# (Make sure your config.yml has split routing: care2connects.org->3000, api.*->3001)
$TunnelId = "07e7c160-451b-4d41-875c-a58f79700ae8"

$FrontendLog = Join-Path $LogDir "frontend.log"
$BackendLog  = Join-Path $LogDir "backend.log"
$TunnelLog   = Join-Path $LogDir "tunnel.log"

$frontendProc = $null
$backendProc  = $null
$tunnelProc   = $null

function Ensure-Running {
  param(
    [string]$Name,
    [ref]$ProcRef,
    [string]$WorkDir,
    [string]$Cmd,
    [string]$LogFile
  )

  if ($null -eq $ProcRef.Value -or $ProcRef.Value.HasExited) {
    if ($null -ne $ProcRef.Value) { Log "$Name exited. Restarting..." }
    $ProcRef.Value = Start-ServiceProcess -Name $Name -WorkDir $WorkDir -CommandLine $Cmd -OutLog $LogFile
    Start-Sleep -Seconds 2
  }
}

Log "Supervisor started. RepoRoot=$RepoRoot ShowWindows=$ShowWindows"

while ($true) {
  Ensure-Running -Name "Backend"  -ProcRef ([ref]$backendProc)  -WorkDir $Backend  -Cmd "npm run dev" -LogFile $BackendLog
  Ensure-Running -Name "Frontend" -ProcRef ([ref]$frontendProc) -WorkDir $Frontend -Cmd "npm run dev" -LogFile $FrontendLog
  Ensure-Running -Name "Tunnel"   -ProcRef ([ref]$tunnelProc)   -WorkDir $RepoRoot -Cmd "cloudflared tunnel run $TunnelId" -LogFile $TunnelLog

  Start-Sleep -Seconds 10
}
