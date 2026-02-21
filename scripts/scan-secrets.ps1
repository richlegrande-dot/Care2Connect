# Secret Scanner - Detect exposed secrets in documentation
# Run this before committing to prevent accidental secret exposure

Write-Host "🔍 Scanning for exposed secrets..." -ForegroundColor Cyan

$violations = 0
$scannedFiles = 0

# Get all markdown files
$files = Get-ChildItem -Path . -Include *.md -Recurse -ErrorAction SilentlyContinue | Where-Object { 
    $_.FullName -notmatch "node_modules"
}

foreach ($file in $files) {
    $scannedFiles++
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    
    if (!$content) { continue }
    
    # Check for OpenAI keys
    if ($content -like "*sk-proj-*") {
        Write-Host "❌ Found OpenAI key pattern in $($file.Name)" -ForegroundColor Red
        $violations++
    }
    
    # Check for Stripe keys
    if ($content -like "*sk_live_*" -or $content -like "*sk_test_*") {
        Write-Host "❌ Found Stripe key pattern in $($file.Name)" -ForegroundColor Red
        $violations++
    }
    
    # Check for AssemblyAI keys (32 char hex)
    if ($content -match "ASSEMBLYAI_API_KEY=\w{30,}") {
        Write-Host "❌ Found AssemblyAI key in $($file.Name)" -ForegroundColor Red
        $violations++
    }
    
    # Check for Cloudflare tokens  
    if ($content -match "CLOUDFLARE_API_TOKEN=\w{30,}") {
        Write-Host "❌ Found Cloudflare token in $($file.Name)" -ForegroundColor Red
        $violations++
    }
}

Write-Host "`n📊 Scan Results:" -ForegroundColor Cyan
Write-Host "   Files Scanned: $scannedFiles"
Write-Host "   Violations Found: $violations`n"

if ($violations -gt 0) {
    Write-Host "⚠️  SECURITY VIOLATION: Secrets detected in documentation!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Required Actions:" -ForegroundColor Yellow
    Write-Host "   1. Replace all secrets with placeholders"
    Write-Host "   2. Example: OPENAI_API_KEY='***' or '<your-key>'"
    Write-Host "   3. Rotate any exposed production secrets"
    Write-Host ""
    exit 1
} else {
    Write-Host "✅ No secrets detected. Safe to commit!" -ForegroundColor Green
    exit 0
}
