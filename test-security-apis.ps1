# PDF Security Suite API Testing Script
Write-Host "🔧 Testing PDF Security Suite API Endpoints..." -ForegroundColor Cyan
Write-Host "=============================================="
Write-Host ""

# Test server is running
Write-Host "1. Testing server availability..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Server is running on http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not running. Start with: npm run dev" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test API endpoints exist (they will return 405 for GET requests, which is expected)
Write-Host "2. Testing API endpoints availability..." -ForegroundColor Yellow

# Test Encrypt endpoint
Write-Host "   Testing /api/security/encrypt..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/security/encrypt" -Method GET -ErrorAction Stop
    Write-Host "   ❌ Encrypt endpoint unexpected response" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 405) {
        Write-Host "   ✅ Encrypt endpoint exists (405 = Method Not Allowed for GET, expects POST)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Encrypt endpoint issue (Status: $($_.Exception.Response.StatusCode))" -ForegroundColor Red
    }
}

# Test Permissions endpoint
Write-Host "   Testing /api/security/permissions..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/security/permissions" -Method GET -ErrorAction Stop
    Write-Host "   ❌ Permissions endpoint unexpected response" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 405) {
        Write-Host "   ✅ Permissions endpoint exists (405 = Method Not Allowed for GET, expects POST)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Permissions endpoint issue (Status: $($_.Exception.Response.StatusCode))" -ForegroundColor Red
    }
}

# Test Watermark endpoint
Write-Host "   Testing /api/security/watermark..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/security/watermark" -Method GET -ErrorAction Stop
    Write-Host "   ❌ Watermark endpoint unexpected response" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 405) {
        Write-Host "   ✅ Watermark endpoint exists (405 = Method Not Allowed for GET, expects POST)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Watermark endpoint issue (Status: $($_.Exception.Response.StatusCode))" -ForegroundColor Red
    }
}

# Test Audit endpoint
Write-Host "   Testing /api/security/audit..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/security/audit" -Method GET -ErrorAction Stop
    Write-Host "   ❌ Audit endpoint unexpected response" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 405) {
        Write-Host "   ✅ Audit endpoint exists (405 = Method Not Allowed for GET, expects POST)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Audit endpoint issue (Status: $($_.Exception.Response.StatusCode))" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 API Endpoint Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Open http://localhost:3000 in your browser"
Write-Host "   2. Navigate to Security Features section"
Write-Host "   3. Upload PDF files to test security features"
Write-Host "   4. Try password protection, permissions, watermarks, and audit logging"
Write-Host ""
Write-Host "📊 Features Ready for Testing:" -ForegroundColor Magenta
Write-Host "   • Password Protection & Encryption"
Write-Host "   • Access Control & Permissions" 
Write-Host "   • Security Watermarking"
Write-Host "   • Audit Trail & Logging"
Write-Host ""
