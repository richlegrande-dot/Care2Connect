# Add Content Chunks to Knowledge Vault Sources
# Reads documentation files and creates chunks for each source

$headers = @{
    'x-admin-password' = 'admin2024'
    'Content-Type' = 'application/json'
}

Write-Host "`n=== Adding Content to Knowledge Vault ===" -ForegroundColor Cyan

# Get all sources
$sourcesUrl = "http://localhost:3001/admin/knowledge/sources?page=1&limit=50"
$response = Invoke-RestMethod $sourcesUrl -Headers $headers
$sources = $response.sources

Write-Host "Found $($sources.Count) sources`n" -ForegroundColor White

$totalChunks = 0
$chunkSize = 4000  # ~4KB chunks for better context window usage

foreach ($source in $sources) {
    if ($source.url -match 'file://(.+)') {
        $relativePath = $matches[1]
        $filePath = "C:\Users\richl\Care2system\$relativePath"
        
        if (Test-Path $filePath) {
            Write-Host "Processing: $($source.title)" -ForegroundColor Yellow
            
            # Read file content
            $content = Get-Content $filePath -Raw -Encoding UTF8
            
            if ($content.Length -gt 100) {
                # Split into chunks
                $chunks = @()
                $position = 0
                
                while ($position -lt $content.Length) {
                    $length = [Math]::Min($chunkSize, $content.Length - $position)
                    $chunkText = $content.Substring($position, $length)
                    $chunks += $chunkText
                    $position += $length
                }
                
                Write-Host "  Creating $($chunks.Count) chunks..." -ForegroundColor Gray
                
                # Add each chunk to the source
                $chunkNum = 0
                foreach ($chunk in $chunks) {
                    $chunkNum++
                    
                    $body = @{
                        chunkText = $chunk
                        tags = @($source.sourceType, "documentation")
                        language = "markdown"
                        metadata = @{
                            chunkNumber = $chunkNum
                            totalChunks = $chunks.Count
                            fileName = $relativePath
                        }
                    } | ConvertTo-Json -Compress
                    
                    try {
                        $null = Invoke-RestMethod `
                            -Uri "http://localhost:3001/admin/knowledge/sources/$($source.id)/chunks" `
                            -Method POST `
                            -Headers $headers `
                            -Body $body
                        
                        $totalChunks++
                        Write-Host "    ✓ Chunk $chunkNum/$($chunks.Count)" -ForegroundColor Green
                    }
                    catch {
                        Write-Host "    ✗ Chunk $chunkNum failed: $($_.Exception.Message)" -ForegroundColor Red
                    }
                }
            }
            else {
                Write-Host "  ⚠ File too small, skipping" -ForegroundColor Yellow
            }
        }
        else {
            Write-Host "  ✗ File not found: $filePath" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== ✅ Complete ===" -ForegroundColor Green
Write-Host "Added $totalChunks chunks to $($sources.Count) sources" -ForegroundColor Cyan

# Verify final state
$verifyUrl = "http://localhost:3001/admin/knowledge/sources?page=1&limit=50"
$verification = Invoke-RestMethod $verifyUrl -Headers $headers
Write-Host "`nFinal status:" -ForegroundColor White
foreach ($s in $verification.sources) {
    $chunkCount = $s._count.chunks
    $status = if ($chunkCount -gt 0) { "✅" } else { "⚠" }
    $color = if ($chunkCount -gt 0) { "Green" } else { "Yellow" }
    Write-Host "  $status $($s.title): $chunkCount chunks" -ForegroundColor $color
}
