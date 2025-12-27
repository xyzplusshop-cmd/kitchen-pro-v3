$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    email = "guest@kitchenpro.com"
    password = "guest123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/login" -Method POST -Headers $headers -Body $body -UseBasicParsing
    Write-Host "Status Code:" $response.StatusCode
    Write-Host "Response:"
    Write-Host $response.Content
} catch {
    Write-Host "ERROR:" $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body:" $responseBody
    }
}
