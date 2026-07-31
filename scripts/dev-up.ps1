# Start local infra for CWMS development
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
docker compose -f deploy/docker/docker-compose.yml up -d
Write-Host "Postgres :5432  MinIO :9000  Console :9001"
