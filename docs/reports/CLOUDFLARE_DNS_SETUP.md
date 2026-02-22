# Cloudflare DNS Setup for care2connects.org

## Current Status
- ✅ **api.care2connects.org** - Working (Status 200)
- ❌ **care2connects.org** - DNS_PROBE_FINISHED_NXDOMAIN (No DNS record)

## Problem
The `cloudflared tunnel route dns` command creates tunnel routing configuration but does NOT create actual DNS CNAME records in Cloudflare. You must add these manually in the Cloudflare dashboard.

## Solution: Add DNS Records Manually

### Step 1: Log into Cloudflare Dashboard
1. Go to https://dash.cloudflare.com
2. Click on your **care2connects.org** domain
3. Navigate to **DNS** → **Records**

### Step 2: Add Root Domain CNAME Record
Add the following DNS record:

| Type  | Name | Target | Proxy Status |
|-------|------|--------|--------------|
| CNAME | `@`  | `07e7c160-451b-4d41-875c-a58f79700ae8.cfargotunnel.com` | Proxied (🟠) |

**Note:** The `@` symbol represents the root domain (care2connects.org)

### Step 3: Verify API Subdomain Record Exists
Confirm this record is already present (it should be, since api.care2connects.org works):

| Type  | Name  | Target | Proxy Status |
|-------|-------|--------|--------------|
| CNAME | `api` | `07e7c160-451b-4d41-875c-a58f79700ae8.cfargotunnel.com` | Proxied (🟠) |

### Step 4: Wait for DNS Propagation
- DNS changes typically propagate in **2-5 minutes**
- Can take up to 30 minutes globally
- Use `ipconfig /flushdns` to clear local DNS cache

## Current Working Configuration

### Backend Server
- **Port:** 3001
- **Status:** ✅ Running
- **Local URL:** http://localhost:3001

### Cloudflare Tunnel
- **Tunnel ID:** `07e7c160-451b-4d41-875c-a58f79700ae8`
- **Status:** ✅ Running (Process ID: 32688)
- **Config File:** `C:\Users\richl\.cloudflared\config.yml`

### Tunnel Configuration (config.yml)
```yaml
tunnel: 07e7c160-451b-4d41-875c-a58f79700ae8
credentials-file: C:\Users\richl\.cloudflared\07e7c160-451b-4d41-875c-a58f79700ae8.json

ingress:
  - hostname: api.care2connects.org
    service: http://localhost:3001
  - hostname: care2connects.org
    service: http://localhost:3001
  - service: http_status:404
```

## Testing Commands

### Test Local Backend
```powershell
Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing
```

### Test API Subdomain
```powershell
Invoke-WebRequest -Uri "https://api.care2connects.org" -UseBasicParsing
```

### Test Root Domain (after DNS setup)
```powershell
Invoke-WebRequest -Uri "https://care2connects.org" -UseBasicParsing
```

### Check DNS Resolution
```powershell
nslookup care2connects.org
```

## Alternative: Using Cloudflare API (Advanced)

If you have your Cloudflare API token, you can add the DNS record via API:

```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_CLOUDFLARE_API_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    type = "CNAME"
    name = "@"
    content = "07e7c160-451b-4d41-875c-a58f79700ae8.cfargotunnel.com"
    proxied = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/dns_records" `
    -Method Post -Headers $headers -Body $body
```

## Troubleshooting

### If care2connects.org still doesn't work after adding DNS:
1. **Clear DNS cache:** `ipconfig /flushdns`
2. **Check in different browser/incognito mode**
3. **Use online DNS checker:** https://dnschecker.org/#CNAME/care2connects.org
4. **Verify Cloudflare tunnel is running:** `Get-Process cloudflared`
5. **Check tunnel logs in hidden PowerShell window**

### If you need to restart the tunnel:
```powershell
# Stop tunnel
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

# Start tunnel
Start-Process powershell -WindowStyle Hidden -ArgumentList "-NoExit", "-Command", "`$env:PATH = [System.Environment]::GetEnvironmentVariable('PATH', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('PATH', 'User'); cloudflared tunnel run 07e7c160-451b-4d41-875c-a58f79700ae8"
```

## Success Criteria
When setup is complete, both URLs should return HTTP 200:
- ✅ https://api.care2connects.org
- ⏳ https://care2connects.org (pending DNS setup)

---
**Last Updated:** December 14, 2025  
**Tunnel Status:** Running  
**Backend Status:** Running on port 3001
