# CWMS local setup scripts (ED-016 / ED-017)
#
# Full stack in Docker: Postgres, MinIO, API, SPA
#   powershell -File scripts/setup.ps1 -Action up
#   powershell -File scripts/setup.ps1 -Action down

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

Write-Host '=== CWMS start-up (full Docker stack) ==='
Stop-CwmsNodeProcesses
docker compose -f $Compose up -d --build
Start-Sleep -Seconds 5
docker compose -f $Compose ps

Write-Host ''
Write-Host 'App (SPA + API proxy):  http://localhost:8080'
Write-Host 'API direct:             http://localhost:3000/api/v1/health'
Write-Host 'Postgres:               localhost:5433'
Write-Host 'MinIO console:          http://localhost:9001'
Write-Host 'Demo login:             Administrator / Password@123'
Write-Host ''
Write-Host 'Optional host-side Vite/Nest (infra already in Docker):'
Write-Host '  npm run dev:backend'
Write-Host '  npm run dev:frontend'
