# Generates JWT secrets — copy output into Vercel Environment Variables
$bytes = New-Object byte[] 48
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$jwt = [Convert]::ToBase64String($bytes)
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$refresh = [Convert]::ToBase64String($bytes)

Write-Host "JWT_SECRET=$jwt"
Write-Host "JWT_REFRESH_SECRET=$refresh"
