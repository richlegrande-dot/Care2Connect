# V2 Phase 9 - Deployment Discovery

> **Date**: 2026-02-19
> **Branch**: `v2-intake-scaffold` at `a08c194`
> **Purpose**: Factual assessment of how production is deployed TODAY

---

## How Production Runs TODAY

```
Internet
  |
  v
Cloudflare DNS (care2connects.org / api.care2connects.org)
  |
  v
cloudflared tunnel (07e7c160-451b-4d41-875c-a58f79700ae8) on LOCAL WINDOWS MACHINE
  |  (routes ALL hostnames -> 127.0.0.1:8080)
  v
Caddy reverse proxy (:8080) -- Caddyfile.production
  |-- care2connects.org       -> 127.0.0.1:3000  (Next.js frontend)
  |-- api.care2connects.org   -> 127.0.0.1:3001  (Express backend)

Backend: node dist/server.js (port 3001) or tsx watch src/server.ts (dev mode)
Frontend: next start (port 3000) or next dev (dev mode)
```

**Key fact**: Everything runs on the local Windows machine. There is no cloud hosting active.

## Deployment Components

| Component | File | Status |
|-----------|------|--------|
| Cloudflared tunnel | `C:\Users\richl\.cloudflared\config.yml` | ACTUAL - installed v2025.8.1, tunnel 07e7c160 |
| Caddy reverse proxy | `Caddyfile.production` | ACTUAL - routes 8080 to 3000/3001 |
| PM2 process manager | `ecosystem.prod.config.js` | ACTUAL - installed, multiple configs |
| Port config | `config/ports.json` | Frontend 3000, Backend 3001, Proxy 8080 |
| Stack start script | `scripts/start-stack.ps1` | CANONICAL start script |
| Auto-restart (supervisor) | `scripts/run-services.ps1` | Infinite loop supervisor |
| Watchdog | `scripts/watchdog-stack.ps1` | Port/process monitoring |
| Docker configs | `Dockerfile.*`, `docker-compose*.yml` | ASPIRATIONAL - not used |
| Vercel config | `frontend/vercel.json`, deploy.yml | ASPIRATIONAL - not connected |
| Render config | `render.yaml`, deploy.yml | ASPIRATIONAL - not connected |

## Current System State (Feb 19, 2026)

- 2 node processes running (likely backend)
- No Caddy process running
- No cloudflared process running
- No PM2 managed processes
- Production domain likely offline

## Feature Flags (Backend)

| Flag | Default | Effect |
|------|---------|--------|
| `ENABLE_V2_INTAKE` | `false` | Gates `/api/v2/intake/*` routes (404 when false) |
| `ENABLE_V2_INTAKE_AUTH` | `true` | Requires Bearer token on V2 endpoints |
| `ZERO_OPENAI_MODE` | `true` | Disables OpenAI API calls |
| `V1_STABLE` | `true` | Production behavior mode |
| `AI_PROVIDER` | `rules` | Deterministic AI processing |

## Health Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /health/live` | Liveness probe (always 200 if running) |
| `GET /health/db` | Database connectivity |
| `GET /health/status` | Comprehensive service health |

## Can Preview Deploy From Feature Branch?

**YES** - because production deploys FROM this local machine, not from GitHub/CI.

The stack start scripts run whatever code is checked out locally. Since we are on `v2-intake-scaffold`, starting the local stack will serve the V2 code directly. No merge to main required.

**Preview approach**: Start local stack with `ENABLE_V2_INTAKE=true` + `ENABLE_V2_INTAKE_AUTH=true`, then start cloudflared tunnel. The production domain will serve V2 preview, gated by auth token.

## Security Gate for Preview

The `ENABLE_V2_INTAKE_AUTH=true` flag requires a Bearer token for all V2 endpoints. This provides access gating without new code.

## Domain Note

Production uses `care2connects.org` (with 's'). Some config files reference `careconnect.org` (without 's') - this is a known typo in aspirational configs. Actual cloudflare tunnel routes use the correct `care2connects.org` domain.

---

*End of Deployment Discovery*
