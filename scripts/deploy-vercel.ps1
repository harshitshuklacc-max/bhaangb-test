# Smart Step Academy — Vercel deploy helper
# Run from repo root in PowerShell

$ErrorActionPreference = "Stop"
$NodeDir = Join-Path $PSScriptRoot ".." ".tools" "node"
if (Test-Path $NodeDir) {
  $env:PATH = "$NodeDir;$env:PATH"
}

Write-Host "=== Smart Step Academy — Vercel Deploy ===" -ForegroundColor Cyan

# Install Vercel CLI if needed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  Write-Host "Installing Vercel CLI..."
  npm install -g vercel
}

Write-Host ""
Write-Host "Step 1: Log in to Vercel (browser will open if needed)"
vercel login

Write-Host ""
Write-Host "Step 2: Link project (choose frontend as root when prompted)"
Set-Location (Join-Path $PSScriptRoot ".." "frontend")
vercel link

Write-Host ""
Write-Host "Step 3: Set environment variables (paste when prompted)"
Write-Host "Required: DATABASE_URL (from Vercel Postgres), JWT_SECRET, JWT_REFRESH_SECRET"
Write-Host "Optional defaults: ADMIN_USERNAME=smartstep05618, ADMIN_PASSWORD=Smartedhub123"
Write-Host ""
vercel env add JWT_SECRET production
vercel env add JWT_REFRESH_SECRET production
vercel env add ADMIN_USERNAME production
vercel env add ADMIN_PASSWORD production

Write-Host ""
Write-Host "NOTE: Add Vercel Postgres in dashboard first, then:"
Write-Host "  vercel env pull .env.production"
Write-Host ""

Write-Host "Step 4: Deploy to production"
vercel --prod

Write-Host ""
Write-Host "Done! Open your deployment URL + /login/admin" -ForegroundColor Green
