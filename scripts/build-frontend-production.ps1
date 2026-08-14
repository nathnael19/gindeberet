# Build production frontend locally (Windows PowerShell)
# Usage: from repo root →  .\scripts\build-frontend-production.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$fe = Join-Path $root "frontend"

if (-not (Test-Path (Join-Path $fe ".env.production"))) {
  Copy-Item (Join-Path $fe ".env.production.example") (Join-Path $fe ".env.production")
  Write-Host "Created frontend/.env.production from example — edit VITE_API_URL if needed."
}

Set-Location $fe
npm ci
npm run build
Write-Host ""
Write-Host "Build OK → frontend/dist/"
Write-Host "Upload ALL contents of dist/ into cPanel public_html/"
