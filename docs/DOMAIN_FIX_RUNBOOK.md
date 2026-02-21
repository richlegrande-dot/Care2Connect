# Domain Fix Runbook - care2connect.org

**Purpose:** Guide for resolving DNS nameserver issues preventing public access to care2connect.org  
**Last Updated:** December 15, 2025  
**Status:** Nameservers pointing to Argeweb (incorrect) - needs Cloudflare delegation

---

## Problem Statement

The domain `care2connect.org` was purchased on the Cloudflare platform but DNS queries are still being resolved by **Argeweb nameservers** instead of **Cloudflare nameservers**. This prevents the Cloudflare Tunnel from receiving traffic and blocks public access to the application.

**Current State:**
- Domain registered: care2connect.org
- Registrar: Argeweb (original)
- DNS Provider (intended): Cloudflare
- DNS Provider (actual): Argeweb
- Result: Users see Argeweb parking page instead of application

---

## Why This Cannot Be Fully Automated

Nameserver delegation requires **registrar-level access** to modify the domain's authoritative nameservers. This is a security feature that cannot be changed via API alone. Only the domain registrar (Argeweb) or the domain owner with registrar login credentials can update nameservers.

Cloudflare APIs can:
- ✅ Create DNS records (once nameservers point to Cloudflare)
- ✅ Configure tunnels and routes
- ✅ Manage Cloudflare settings

Cloudflare APIs **cannot**:
- ❌ Change nameservers at the registrar
- ❌ Force nameserver propagation
- ❌ Bypass registrar authentication

**Bottom line:** Manual registrar configuration is required.

---

## DNS Record Requirements

Once nameservers are pointing to Cloudflare, the following CNAME records must exist:

### Required CNAME Records

**Tunnel ID:** `07e7c160-451b-4d41-875c-a58f79700ae8`  
**Tunnel Hostname:** `07e7c160-451b-4d41-875c-a58f79700ae8.cfargotunnel.com`

```
Record 1 - Root Domain:
  Type:    CNAME
  Name:    @
  Target:  07e7c160-451b-4d41-875c-a58f79700ae8.cfargotunnel.com
  Proxy:   ✅ ON (orange cloud)
  TTL:     Auto

Record 2 - WWW Subdomain:
  Type:    CNAME
  Name:    www
  Target:  07e7c160-451b-4d41-875c-a58f79700ae8.cfargotunnel.com
  Proxy:   ✅ ON (orange cloud)
  TTL:     Auto

Record 3 - API Subdomain:
  Type:    CNAME
  Name:    api
  Target:  07e7c160-451b-4d41-875c-a58f79700ae8.cfargotunnel.com
  Proxy:   ✅ ON (orange cloud)
  TTL:     Auto
```

### Exact Cloudflare Tunnel Hostname Format

The tunnel hostname follows this pattern:
```
<tunnel-id>.cfargotunnel.com
```

For this deployment:
```
07e7c160-451b-4d41-875c-a58f79700ae8.cfargotunnel.com
```

**Important:** 
- Do NOT use `care2connect.org.cfargotunnel.com`
- Do NOT use `<tunnel-name>.cfargotunnel.com`
- ONLY use the UUID tunnel ID as shown above

---

## Nameserver Mismatch Explanation

### Current State (Incorrect)

```powershell
nslookup -type=ns care2connect.org
```

**Current Output:**
```
care2connect.org    nameserver = ns2.argewebhosting.com
care2connect.org    nameserver = ns1.argewebhosting.eu
care2connect.org    nameserver = ns3.argewebhosting.nl
```

**Problem:** These are Argeweb nameservers, not Cloudflare nameservers.

### Expected State (Correct)

**Expected Output:**
```
care2connect.org    nameserver = dns1.cloudflare.com
care2connect.org    nameserver = dns2.cloudflare.com
```

Or similar Cloudflare nameservers like:
```
name.ns.cloudflare.com
name2.ns.cloudflare.com
```

**How to verify:** Cloudflare dashboard will show the exact nameservers to use for your account.

---

## Step-by-Step Fix Procedure

### Step 1: Verify Current Nameservers

Run this command to check current DNS state:

```powershell
nslookup -type=ns care2connect.org
```

If the output shows **Argeweb nameservers**, proceed to Step 2.  
If the output shows **Cloudflare nameservers**, skip to Step 5.

---

### Step 2: Log Into Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com
2. Log in with your Cloudflare account
3. Click on `care2connect.org` in your sites list

**Check the status indicator at the top:**
- ✅ **"Active"** with green checkmark = nameservers are correct
- ⚠️ **"Pending Nameserver Update"** = action required

If status is "Active", the issue may be DNS propagation delay - wait 30-60 minutes and check again.

If status is "Pending Nameserver Update", continue to Step 3.

---

### Step 3: Get Cloudflare Nameservers

In the Cloudflare dashboard for care2connect.org:

1. Look for a banner or notice showing nameservers to use
2. Or go to: **DNS** → **Records** → Look for nameserver instructions
3. Or go to: **Overview** tab → Look for "Nameservers" section

**Example Cloudflare nameservers (yours will be specific to your account):**
```
name1.ns.cloudflare.com
name2.ns.cloudflare.com
```

**Write these down** - you'll need them for Step 4.

---

### Step 4: Update Nameservers at Argeweb

**Option A: If Domain is Managed by Argeweb Registrar**

1. Log into your **Argeweb account**: https://www.argeweb.nl
2. Navigate to **Domain Management** or **My Domains**
3. Select `care2connect.org`
4. Find **Nameserver Settings** (may be called "DNS Settings" or "Name Servers")
5. Change from Argeweb nameservers to Cloudflare nameservers:
   - Remove: `ns1.argewebhosting.eu`, `ns2.argewebhosting.com`, `ns3.argewebhosting.nl`
   - Add: The Cloudflare nameservers from Step 3
6. Save changes
7. Wait for confirmation email (usually arrives within minutes)

**Option B: If Domain was Transferred to Cloudflare**

If you transferred the domain registration to Cloudflare Registrar:

1. In Cloudflare dashboard → `care2connect.org` → **Overview**
2. Look for "Registrar" section
3. If it shows "Cloudflare Registrar", nameservers should update automatically
4. Click "Check Nameservers" button if available
5. Cloudflare will automatically use its own nameservers for registered domains

**Propagation Time:**
- Initial update: 10-60 minutes
- Full global propagation: 24-48 hours (maximum)
- In practice: Usually works within 2-4 hours

---

### Step 5: Wait for Propagation and Verify

Keep checking nameserver status every 10-15 minutes:

```powershell
nslookup -type=ns care2connect.org
```

**You're looking for Cloudflare nameservers in the output.**

Once you see Cloudflare nameservers, proceed to Step 6.

**Patience Required:** DNS propagation is outside your control. Some ISPs cache DNS longer than others.

---

### Step 6: Route Domain to Cloudflare Tunnel

Once Cloudflare is authoritative (Step 5 complete), create DNS records using `cloudflared` CLI:

```powershell
# Verify tunnel exists
cloudflared tunnel list

# Route root domain
cloudflared tunnel route dns 07e7c160-451b-4d41-875c-a58f79700ae8 care2connect.org

# Route www subdomain
cloudflared tunnel route dns 07e7c160-451b-4d41-875c-a58f79700ae8 www.care2connect.org

# Route api subdomain
cloudflared tunnel route dns 07e7c160-451b-4d41-875c-a58f79700ae8 api.care2connect.org
```

**Expected Output:**
```
Successfully added route for care2connect.org over tunnel 07e7c160-451b-4d41-875c-a58f79700ae8
```

**Alternative: Manual DNS Record Creation**

If you prefer, create records manually in Cloudflare dashboard:

1. Go to **DNS** → **Records**
2. Click **Add Record**
3. Create each CNAME record as specified in "DNS Record Requirements" section above

---

### Step 7: Verify Tunnel Configuration

Check your tunnel config file: `C:\Users\richl\.cloudflared\config.yml`

**Required Configuration:**

```yaml
tunnel: 07e7c160-451b-4d41-875c-a58f79700ae8
credentials-file: C:\Users\richl\.cloudflared\<uuid>.json

ingress:
  # API subdomain → backend (port 3003)
  - hostname: api.care2connect.org
    service: http://localhost:3003
  
  # WWW subdomain → frontend (port 3000)
  - hostname: www.care2connect.org
    service: http://localhost:3000
  
  # Root domain → frontend (port 3000)
  - hostname: care2connect.org
    service: http://localhost:3000
  
  # Catch-all
  - service: http_status:404
```

**Port Verification:**

```powershell
# Frontend should be on port 3000
Get-NetTCPConnection -LocalPort 3000 -State Listen

# Backend should be on port 3003
Get-NetTCPConnection -LocalPort 3003 -State Listen
```

---

### Step 8: Start Tunnel and Test

**Start tunnel:**

```powershell
cloudflared tunnel run 07e7c160-451b-4d41-875c-a58f79700ae8
```

**Expected Output:**
```
INFO Connection <UUID> registered
INFO Each HA connection's tunnel IDs: map[0:07e7c160-451b-4d41-875c-a58f79700ae8]
```

**Test locally first:**

```powershell
# Test frontend
curl http://localhost:3000

# Test backend
curl http://localhost:3003/health/live
```

**Test public domain (after DNS propagates):**

```powershell
# Test frontend
curl https://www.care2connect.org

# Test backend API
curl https://api.care2connect.org/health/live

# Test DNS endpoint
curl https://api.care2connect.org/health/dns
```

---

## How to Confirm with nslookup/dig

### Using nslookup (Windows PowerShell)

```powershell
# Check nameservers
nslookup -type=ns care2connect.org

# Check A record (should show Cloudflare IPs)
nslookup www.care2connect.org

# Check CNAME record
nslookup -type=cname www.care2connect.org
```

### Using dig (Windows with WSL or Git Bash)

```bash
# Check nameservers
dig care2connect.org NS

# Check CNAME record
dig www.care2connect.org CNAME

# Check full resolution path
dig www.care2connect.org +trace
```

### Expected Results (Success)

**Nameservers:**
```
care2connect.org    nameserver = name1.ns.cloudflare.com
care2connect.org    nameserver = name2.ns.cloudflare.com
```

**CNAME Record:**
```
www.care2connect.org CNAME 07e7c160-451b-4d41-875c-a58f79700ae8.cfargotunnel.com
```

**A Record (resolved from CNAME):**
```
www.care2connect.org A 104.x.x.x  (Cloudflare IP range)
```

---

## Global Propagation Checker

Use online tools to verify DNS propagation globally:

**DNSChecker.org:**
https://dnschecker.org/#CNAME/www.care2connect.org

**What You See:**  (Cloudflare tunnel hostname)

**Green checkmarks globally** = DNS propagated successfully

**Mixed results** = Still propagating (wait 1-2 hours)

---

## Troubleshooting

### Problem: Nameservers Won't Update

**Symptom:** After changing nameservers at registrar, `nslookup` still shows Argeweb

**Possible Causes:**
1. **Propagation delay** - Wait 30-60 minutes
2. **DNS cache** - Your local resolver is caching old data
3. **Registrar delay** - Some registrars take hours to process nameserver changes

**Solutions:**
```powershell
# Clear local DNS cache
ipconfig /flushdns

# Query specific DNS server (Cloudflare public DNS)
nslookup care2connect.org 1.1.1.1

# Query Google public DNS
nslookup care2connect.org 8.8.8.8
```

---

### Problem: CNAME Record Not Found

**Symptom:** `nslookup -type=cname www.care2connect.org` returns no result

**Possible Causes:**
1. Cloudflare proxy is enabled (CNAME hidden, shows A record instead)
2. DNS record not created yet
3. Propagation delay

**Solution:**
- Check Cloudflare dashboard → DNS → Records
- Ensure CNAME exists with orange cloud icon (proxy enabled)
- Wait 5 minutes for Cloudflare edge propagation

---

### Problem: Tunnel Not Receiving Traffic

**Symptom:** DNS resolves correctly but application doesn't load

**Check:**
1. Is tunnel running? `Get-Process cloudflared`
2. Are services running? `Get-NetTCPConnection -LocalPort 3000,3003 -State Listen`
3. Check tunnel logs:
   ```powershell
   cloudflared tunnel run 07e7c160-451b-4d41-875c-a58f79700ae8
   ```
4. Test DNS validation endpoint: `https://api.care2connect.org/health/dns`

---

### Problem: "ERR_CONNECTION_REFUSED"

**Symptom:** Browser shows connection refused error

**Possible Causes:**
1. Backend/frontend not running on correct ports
2. Tunnel not running
3. Ingress rules incorrect in config.yml

**Solution:**
```powershell
# Run the startup script
.\scripts\start-all.ps1

# Verify all services
.\scripts\verify-domain.ps1
```

---

## Success Criteria

✅ **DNS Nameservers:** Pointing to Cloudflare nameservers  
✅ **CNAME Records:** Created for @, www, and api subdomains  
✅ **Tunnel Running:** `cloudflared` process active  
✅ **Services Running:** Frontend (3000) and Backend (3003) listening  
✅ **Public Access:** https://www.care2connect.org loads application  
✅ **API Access:** https://api.care2connect.org/health/live returns JSON  
✅ **Global Propagation:** DNSChecker shows green globally  

---

## Automation Script

See: `scripts/verify-domain.ps1` for automated DNS validation

---

**Last Updated:** December 15, 2025  
**Maintainer:** Care2Connect DevOps Team
