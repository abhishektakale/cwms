# Start full CWMS Docker stack (infra + API + SPA)
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
docker compose -f deploy/docker/docker-compose.yml up -d --build
Write-Host "App http://localhost:8080  API :3000  Postgres :5433  MinIO :9000/:9001"
