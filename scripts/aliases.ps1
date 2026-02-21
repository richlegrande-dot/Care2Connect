# Quick Command Aliases for Care2Connect
# Source this file to get easy shortcuts

# Main command: "start server and send link"
function Start-ServerAndSendLink {
    Write-Host "Starting comprehensive testing..." -ForegroundColor Cyan
    & "$PSScriptRoot\start-server-and-test.ps1"
}

# Aliases for common misspellings and variations
Set-Alias -Name "start" -Value Start-ServerAndSendLink -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name "startserver" -Value Start-ServerAndSendLink -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name "sendlink" -Value Start-ServerAndSendLink -Scope Global -Force -ErrorAction SilentlyContinue

# Export the function
Export-ModuleMember -Function Start-ServerAndSendLink

Write-Host "Care2Connect shortcuts loaded!" -ForegroundColor Green
Write-Host "Commands available:" -ForegroundColor Cyan
Write-Host "  start                    - Start server and test" -ForegroundColor White
Write-Host "  Start-ServerAndSendLink  - Start server and test (full name)" -ForegroundColor White
Write-Host ""
