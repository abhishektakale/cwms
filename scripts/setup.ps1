# CWMS local setup scripts (ED-016)
#
# Before each milestone:  pull-down.ps1
# After each milestone:   start-up.ps1

param(
  [ValidateSet('down', 'up')]
  [string]$Action = 'up'
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Compose = Join-Path $Root 'deploy\docker\docker-compose.yml'

function Stop-CwmsNodeProcesses {
  Get-CimInstance Win32_Process |
    Where-Object {
      $_.Name -match 'node|npm' -and
      $_.CommandLine -match 'CWMS\\(backend|frontend)|nest start|vite'
    } |
    ForEach-Object {
      Write-Host "Stopping PID $($_.ProcessId): $($_.CommandLine.Substring(0, [Math]::Min(80, $_.CommandLine.Length)))..."
      Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }
}

if ($Action -eq 'down') {
  Write-Host '=== CWMS pull-down ==='
  Stop-CwmsNodeProcesses
  docker compose -f $Compose down
  Write-Host 'Setup pulled down.'
  exit 0
}

Write-Host '=== CWMS start-up ==='
docker compose -f $Compose up -d
Start-Sleep -Seconds 3
docker compose -f $Compose ps

Write-Host ''
Write-Host 'Start API and SPA in separate terminals:'
Write-Host '  npm run dev:backend'
Write-Host '  npm run dev:frontend'
Write-Host ''
Write-Host 'SPA http://localhost:5173  |  API http://localhost:3000/api/v1/health'
Write-Host 'Postgres localhost:5433  |  MinIO console localhost:9001'
