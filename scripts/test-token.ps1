# Test Firebase Token with Backend
# This script tests Firebase authentication token verification with the backend API
# Usage: .\scripts\test-token.ps1

$token = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImE4ZGY2MmQzYTBhNDRlM2RmY2RjYWZjNmRhMTM4Mzc3NDU5ZjliMDEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiY29kZXIgYm90IiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2NvZGUtYXJlbmEtYW5zaHVsIiwiYXVkIjoiY29kZS1hcmVuYS1hbnNodWwiLCJhdXRoX3RpbWUiOjE3NTI5NDcyNjEsInVzZXJfaWQiOiJTNW96ckEzbU5kWTJSREhtYVE1UXdLY2Q5ancxIiwic3ViIjoiUzVvenJBM21OZFkyUkRIbWFRNVF3S2NkOWp3MSIsImlhdCI6MTc1Mjk0NzI2MSwiZXhwIjoxNzUyOTUwODYxLCJlbWFpbCI6InVzZXJAY29kZWFyZW5hLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJ1c2VyQGNvZGVhcmVuYS5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.FMXY7AojaY_Tz8zm1KVxNMRiOoAis41PaZBhQ4_zP78N2cMfTL8MXIDonmllbJmeStqMhMYyOQeWmYkGew-QIg6omUrRXM2bjUkpJaRCgJCq7_h8aw7dETtO6Zp5VMzEAAFQvaactkFX2R1xV63tkXrhHueuinWauik39nTpEbcuKI9Lxpq0pv0uh-hMfNXejcua-eh2TMk7qG2bHTwH0a2hg1Lsos7pABlHd_KIYMRS-cv1ROHjBEw9-F7zdBt8GJMXDkmtzDGbypyod3FMt47xauMOWu3yFHT0H1iQilQK82mbKlVZZQGoTb3gqo5h1dkz-5hoaQ0wUzuaiaQrjQ"

$body = @{
    idToken = $token
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/verify" -Method POST -ContentType "application/json" -Body $body
    Write-Host "✅ SUCCESS! Token verified successfully:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ ERROR: Failed to verify token" -ForegroundColor Red
    Write-Host $_.Exception.Message
} 