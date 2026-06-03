$NodeDir = Join-Path $PSScriptRoot ".tools\node"
if (Test-Path $NodeDir) {
  $env:PATH = "$NodeDir;" + $env:PATH
}

Write-Host "Starting Smart Step Academy..."
Write-Host "Backend: http://localhost:4000"
Write-Host "Website: http://localhost:3000"
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"
Start-Sleep -Seconds 8
Start-Process "http://localhost:3000"
