# Admin Story Browser Test Script

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Admin Story Browser API Tests" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# Test 1: Login with wrong password
Write-Host "Test 1: Login with wrong password" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"password":"wrongpassword"}' `
        -WebSession $session `
        -ErrorAction Stop
    Write-Host "❌ FAIL: Should have returned 401" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASS: Returned 401 Unauthorized" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: Unexpected error: $_" -ForegroundColor Red
    }
}
Write-Host ""

# Test 2: Login with correct password
Write-Host "Test 2: Login with correct password" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"password":"Hayfield::"}' `
        -WebSession $session `
        -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PASS: Login successful (200)" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Response: $($data.message)" -ForegroundColor Gray
    } else {
        Write-Host "❌ FAIL: Expected 200, got $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ FAIL: Login failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Check session with /api/admin/me
Write-Host "Test 3: Validate session with /api/admin/me" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/me" `
        -Method GET `
        -WebSession $session `
        -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PASS: Session valid (200)" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Authenticated: $($data.authenticated)" -ForegroundColor Gray
    } else {
        Write-Host "❌ FAIL: Expected 200, got $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ FAIL: Session check failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get story list
Write-Host "Test 4: Get story list" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/story-list?page=1&limit=20" `
        -Method GET `
        -WebSession $session `
        -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PASS: Story list retrieved (200)" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Total recordings: $($data.pagination.total)" -ForegroundColor Gray
        Write-Host "   Current page: $($data.pagination.page)" -ForegroundColor Gray
        Write-Host "   Records returned: $($data.data.Count)" -ForegroundColor Gray
    } else {
        Write-Host "❌ FAIL: Expected 200, got $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ FAIL: Story list failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Logout
Write-Host "Test 5: Logout" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/logout" `
        -Method POST `
        -WebSession $session `
        -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PASS: Logout successful (200)" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Response: $($data.message)" -ForegroundColor Gray
    } else {
        Write-Host "❌ FAIL: Expected 200, got $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ FAIL: Logout failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Verify session is cleared
Write-Host "Test 6: Verify session cleared after logout" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/me" `
        -Method GET `
        -WebSession $session `
        -ErrorAction Stop
    Write-Host "❌ FAIL: Should have returned 401 after logout" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASS: Session cleared (401)" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: Unexpected error: $_" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Test suite complete!" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
