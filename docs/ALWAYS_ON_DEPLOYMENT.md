# CareConnect - Always-On Deployment Guide

## Executive Summary

**Current Limitation**: The Cloudflare tunnel running on your laptop **cannot stay online when the laptop is off, sleeping, or disconnected**. This is a fundamental limitation of hosting on personal devices.

**Two Solutions**:
1. **Auto-Start on Laptop Boot** (Free, but not 24/7)
2. **Always-On Cloud Hosting** (Low cost, true 24/7 availability)

---

## Option 1: Always-On Cloud Hosting (Recommended for Production)

### Why This is Best for Production

- ✅ True 24/7 availability
- ✅ No dependency on personal laptop
- ✅ Professional reliability
- ✅ Better performance (dedicated resources)
- ✅ Automatic restarts on failure
- ✅ Industry standard approach

### Cost Estimate

**Total: ~$10-15/month for complete hosting**

| Component | Provider Options | Monthly Cost |
|-----------|-----------------|--------------|
| Backend Server | DigitalOcean Droplet ($6), AWS Lightsail ($5), Render ($7) | $5-7 |
| Frontend | Vercel (Free), Cloudflare Pages (Free), Netlify (Free) | $0 |
| Database | Supabase (Free tier), Railway ($5), DigitalOcean ($7) | $0-7 |
| Cloudflare Tunnel | Free (Zero Trust) | $0 |

### Recommended Architecture

```
┌─────────────────────────────────────────┐
│  Cloudflare DNS & Tunnel (Free)         │
│  - care2connects.org                    │
│  - api.care2connects.org                │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────┐
│  Frontend   │  │   Backend   │
│  Vercel     │  │   Render    │
│  (Free)     │  │   ($7/mo)   │
└─────────────┘  └──────┬──────┘
                        │
                 ┌──────▼──────┐
                 │  Database   │
                 │  Supabase   │
                 │  (Free)     │
                 └─────────────┘
```

### Step-by-Step Deployment

#### 1. Deploy Database (5 minutes)

**Using Supabase (Free, Recommended)**

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new project (select region closest to you)
4. Copy the "Connection String" from Settings → Database
5. Update your backend `.env`:
   ```
   DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
   ```

**Alternative: Railway (Simple, $5/mo)**

```bash
# Install Railway CLI
npm install -g railway

# Login and create project
railway login
railway init
railway add postgres

# Get connection string
railway variables
```

#### 2. Deploy Backend (10 minutes)

**Using Render (Easiest, $7/mo)**

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `careconnect-backend`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node
   - **Plan**: Starter ($7/mo)
5. Add Environment Variables (from your `backend/.env`):
   ```
   DATABASE_URL=[from step 1]
   OPENAI_API_KEY=[your key]
   STRIPE_SECRET_KEY=[your key]
   ADMIN_DIAGNOSTICS_TOKEN=[create secure token]
   NODE_ENV=production
   PORT=3001
   ```
6. Click "Create Web Service"
7. Copy the service URL (e.g., `https://careconnect-backend.onrender.com`)

**Alternative: DigitalOcean App Platform ($6/mo)**

1. Push code to GitHub
2. Create new App on DigitalOcean
3. Select "Backend - Node.js"
4. Configure environment variables
5. Deploy (automatic HTTPS included)

#### 3. Deploy Frontend (5 minutes)

**Using Vercel (Free, Easiest)**

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? careconnect-frontend
# - Directory? ./
# - Want to modify settings? Yes
# - Build command? npm run build
# - Output directory? .next
# - Development command? npm run dev

# Set environment variables
vercel env add NEXT_PUBLIC_BACKEND_URL production
# Enter: https://api.care2connects.org

vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://api.care2connects.org

vercel env add NEXT_PUBLIC_FRONTEND_URL production
# Enter: https://care2connects.org

# Deploy to production
vercel --prod
```

#### 4. Configure Cloudflare Tunnel on Server (10 minutes)

**Install cloudflared on your VPS** (Render example):

Since Render provides a URL, you don't need to run cloudflared on Render itself. Instead:

1. Update your Cloudflare DNS:
   ```bash
   # Point api subdomain to your Render backend
   cloudflared tunnel route dns [TUNNEL_ID] api.care2connects.org
   ```

2. Update tunnel config (local machine for testing):
   ```yaml
   # ~/.cloudflared/config.yml
   tunnel: 07e7c160-451b-4d41-875c-a58f79700ae8
   credentials-file: ~/.cloudflared/07e7c160-451b-4d41-875c-a58f79700ae8.json

   ingress:
     - hostname: api.care2connects.org
       service: https://careconnect-backend.onrender.com
     - hostname: care2connects.org
       service: https://careconnect-frontend.vercel.app
     - service: http_status:404
   ```

**OR Use Cloudflare DNS Only (Simpler)**

If your hosting providers give you URLs, you can skip the tunnel entirely:

1. In Cloudflare Dashboard → DNS:
   - `care2connects.org` → CNAME → `careconnect-frontend.vercel.app`
   - `api.care2connects.org` → CNAME → `careconnect-backend.onrender.com`
2. Enable "Proxied" (orange cloud icon)
3. Done! Cloudflare handles SSL automatically

### Verification Steps

1. **Test Backend API**:
   ```bash
   curl https://api.care2connects.org/health/live
   # Should return: {"status":"alive",...}
   ```

2. **Test Frontend**:
   ```bash
   curl -I https://care2connects.org
   # Should return: HTTP/2 200
   ```

3. **Test System Console**:
   - Visit `https://care2connects.org/system`
   - Enter admin password
   - Verify health dashboard loads
   - Click "Run Tests" - should show all green

### Monitoring & Alerts

**Enable Uptime Monitoring (Free)**

1. [UptimeRobot](https://uptimerobot.com) - Free tier: 50 monitors
   - Add monitor for `https://care2connects.org`
   - Add monitor for `https://api.care2connects.org/health/live`
   - Get email alerts on downtime

2. Cloudflare Analytics (Built-in)
   - Track traffic, errors, performance
   - View in Cloudflare Dashboard → Analytics

### Maintenance

**Auto-Updates**: Enable on hosting platforms
- Render: Auto-deploys on git push
- Vercel: Auto-deploys on git push
- Supabase: Managed updates

**Backup Strategy**:
```bash
# Weekly database backup (cron job)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

---

## Option 2: Auto-Start on Laptop Boot (Free, Limited Uptime)

⚠️ **Important Limitations**:
- Only works when laptop is ON and connected to internet
- No availability during sleep, shutdown, or network issues
- Not suitable for public-facing production services
- Good for: Personal projects, testing, demonstrations

### Implementation

See [LOCAL_AUTOSTART.md](./LOCAL_AUTOSTART.md) for detailed instructions.

**Quick Summary**:
1. Install services as Windows services or Task Scheduler tasks
2. Configure auto-start on boot
3. Set up process monitoring with PM2

---

## Decision Matrix

| Factor | Always-On Cloud | Laptop Auto-Start |
|--------|----------------|-------------------|
| **Cost** | ~$10-15/month | Free |
| **Uptime** | 99.9% (24/7) | Only when laptop ON |
| **Reliability** | Professional | Personal device |
| **Speed** | Fast (dedicated) | Depends on laptop |
| **Maintenance** | Minimal | Manual updates |
| **Security** | Industry standard | Laptop-dependent |
| **Best For** | Production, public use | Testing, demos |

## Recommendation

**For public access to care2connects.org**: Use Always-On Cloud Hosting (Option 1)
**For personal testing only**: Use Laptop Auto-Start (Option 2)

---

## Support & Troubleshooting

### Common Issues

1. **"502 Bad Gateway"**
   - Check if backend service is running
   - Verify tunnel/DNS configuration
   - Check service logs

2. **CORS Errors**
   - Ensure backend allows `https://care2connects.org` origin
   - Check CORS configuration in `backend/src/server.ts`

3. **Database Connection Failed**
   - Verify DATABASE_URL is correct
   - Check database service status
   - Review connection string format

### Getting Help

1. Check service status pages:
   - [Render Status](https://status.render.com)
   - [Vercel Status](https://www.vercel-status.com)
   - [Cloudflare Status](https://www.cloudflarestatus.com)

2. Review application logs:
   ```bash
   # Render
   Visit dashboard → Logs

   # Vercel
   vercel logs [deployment-url]
   ```

---

## Next Steps

1. Choose your hosting approach (Cloud vs Local)
2. Follow deployment guide for chosen option
3. Update DNS records
4. Enable monitoring
5. Test all functionality
6. Document custom configuration

**Estimated Total Setup Time**:
- Always-On Cloud: 30-45 minutes
- Laptop Auto-Start: 20-30 minutes
