# 🚀 Automated Cloudflare Cache Purge

**Status:** ✅ Ready to Use  
**Created:** December 14, 2025

---

## Quick Start

### First Time Setup (One-time only):

```powershell
cd C:\Users\richl\Care2system
.\setup-cloudflare-env.ps1
```

**What it does:**
- Guides you to get API Token from Cloudflare
- Guides you to get Zone ID
- Saves credentials permanently

---

## Daily Usage

### Purge Cache Anytime:

```powershell
.\purge-cloudflare-cache.ps1
```

**What it does:**
- Connects to Cloudflare API
- Purges all cached content
- Tests URLs automatically (optional)
- Shows propagation status

**Time:** ~5 seconds + 30-60 seconds propagation

---

## Getting Cloudflare Credentials

### API Token (Required once):

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use template: **"Edit zone DNS"** or create custom
4. **Required Permission:** Zone > Cache Purge > Purge
5. Click **"Continue to summary"**
6. Click **"Create Token"**
7. **Copy the token** (starts with a long string of letters/numbers)

### Zone ID (Required once):

1. Go to: https://dash.cloudflare.com
2. Click on **care2connects.org**
3. Scroll down on **Overview** page
4. Look in **right sidebar** for "Zone ID"
5. Click to **copy** (32-character hex string)

---

## Usage Examples

### Example 1: Standard Purge

```powershell
# After changing frontend code
.\purge-cloudflare-cache.ps1

# Wait 60 seconds
# Visit: https://care2connects.org
```

### Example 2: Purge + Test

```powershell
.\purge-cloudflare-cache.ps1
# When prompted "Test URLs now?", type: y
# Script automatically tests all endpoints
```

### Example 3: One-time with Parameters

```powershell
# Without saving credentials (for testing)
.\purge-cloudflare-cache.ps1 -ApiToken "your_token" -ZoneId "your_zone_id"
```

---

## What Gets Purged

When you run the purge script:

✅ **Purged:**
- All homepage content (care2connects.org)
- All API responses (api.care2connects.org)
- All images, CSS, JavaScript
- All API endpoint caches
- Edge server caches globally

❌ **Not Affected:**
- Local server (still running)
- Database content
- Environment variables
- Tunnel configuration

---

## Troubleshooting

### Error: "API Token not provided"

**Solution:**
```powershell
.\setup-cloudflare-env.ps1  # Run setup again
```

Or set manually:
```powershell
$env:CLOUDFLARE_API_TOKEN = "your_token_here"
$env:CLOUDFLARE_ZONE_ID = "your_zone_id_here"
```

### Error: "Authentication failed (401)"

**Problem:** Invalid or expired API token  
**Solution:**
1. Generate new token: https://dash.cloudflare.com/profile/api-tokens
2. Run `.\setup-cloudflare-env.ps1` again
3. Enter new token

### Error: "Permission denied (403)"

**Problem:** Token missing "Cache Purge" permission  
**Solution:**
1. Edit token: https://dash.cloudflare.com/profile/api-tokens
2. Add permission: Zone > Cache Purge > Purge
3. Save changes

### Error: "Zone not found (404)"

**Problem:** Wrong Zone ID  
**Solution:**
1. Verify Zone ID: https://dash.cloudflare.com → care2connects.org → Overview
2. Copy correct Zone ID
3. Run `.\setup-cloudflare-env.ps1` again

### Still Showing Old Content

**After purging, if still seeing old content:**

1. **Wait 60 seconds** for propagation
2. **Hard refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Try incognito:** Open in private/incognito window
4. **Check tunnel:** Verify correct ports in config.yml
5. **Restart tunnel:** If routing changed

---

## Integration with Deployment

### Add to Deployment Script:

```powershell
# After deploying changes
Write-Host "Deploying changes..."
# ... deployment commands ...

Write-Host "Purging Cloudflare cache..."
.\purge-cloudflare-cache.ps1

Write-Host "Deployment complete!"
```

### Automatic Purge on Code Change:

Create `deploy-and-purge.ps1`:

```powershell
# Stop services
Get-Process node | Stop-Process -Force
Get-Process cloudflared | Stop-Process -Force

# Start services
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"  
Start-Sleep 20

# Start tunnel
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cloudflared tunnel run 07e7c160..."
Start-Sleep 10

# Purge cache
.\purge-cloudflare-cache.ps1

Write-Host "✅ Deployment complete with cache purge!"
```

---

## Files Created

| File | Purpose | Location |
|------|---------|----------|
| `purge-cloudflare-cache.ps1` | Main purge script | `C:\Users\richl\Care2system\` |
| `setup-cloudflare-env.ps1` | Credential setup wizard | `C:\Users\richl\Care2system\` |
| `CLOUDFLARE_PURGE_GUIDE.md` | This documentation | `C:\Users\richl\Care2system\` |

---

## Security Notes

### API Token Security:

✅ **Safe:**
- Stored in Windows environment variables
- Only accessible to your user account
- Not committed to git (in .gitignore)

⚠️ **Keep Secret:**
- Never share API token
- Never commit to git
- Regenerate if exposed

### Permissions Required:

**Minimum:** Zone > Cache Purge > Purge  
**Recommended:** Zone > Cache Purge > Purge (only)

**Do NOT give:**
- Full zone edit permissions (unless needed)
- DNS edit permissions (unless needed)
- Account-level permissions

---

## Testing

### Verify Setup:

```powershell
# Check if credentials are set
$env:CLOUDFLARE_API_TOKEN
$env:CLOUDFLARE_ZONE_ID

# Both should show values (or null if not set)
```

### Test Purge:

```powershell
# Dry run with help
.\purge-cloudflare-cache.ps1 -Help

# Real purge
.\purge-cloudflare-cache.ps1
```

### Verify Cache Cleared:

```powershell
# Check URLs
Invoke-WebRequest "https://care2connects.org" -UseBasicParsing
Invoke-WebRequest "https://api.care2connects.org/health/live" -UseBasicParsing

# Should show updated content after 60 seconds
```

---

## When to Purge

**Always purge after:**
- ✅ Frontend code changes (homepage, components, styling)
- ✅ API endpoint changes (if responses cached)
- ✅ Static asset updates (images, CSS, JS)
- ✅ Tunnel routing changes
- ✅ Environment variable changes affecting responses

**No need to purge for:**
- ❌ Backend logic that doesn't change response format
- ❌ Database updates (data not cached at edge)
- ❌ Local development testing
- ❌ Configuration file changes (unless affecting HTTP responses)

---

## Advanced Usage

### Purge Specific Files Only:

Edit `purge-cloudflare-cache.ps1`, change body to:

```powershell
$body = @{
    files = @(
        "https://care2connects.org/",
        "https://care2connects.org/tell-your-story"
    )
} | ConvertTo-Json
```

### Purge by Cache Tag:

```powershell
$body = @{
    tags = @("homepage", "api")
} | ConvertTo-Json
```

### Purge by Prefix:

```powershell
$body = @{
    prefixes = @("https://care2connects.org/assets/")
} | ConvertTo-Json
```

---

## FAQ

**Q: How often can I purge?**  
A: Unlimited, but rate-limited to ~1200 requests/5 minutes

**Q: Does purging affect performance?**  
A: No, only first request after purge is slower (fetches from origin)

**Q: Can I schedule automatic purges?**  
A: Yes, use Windows Task Scheduler with this script

**Q: What if I lose my API token?**  
A: Generate a new one, old token stops working

**Q: Does this purge DNS cache?**  
A: No, only HTTP cache. DNS TTL is separate.

---

**Last Updated:** December 14, 2025  
**Status:** ✅ Production Ready  
**Support:** Run `.\purge-cloudflare-cache.ps1 -Help` for more info
