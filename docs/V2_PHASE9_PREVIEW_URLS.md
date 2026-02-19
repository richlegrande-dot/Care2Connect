# V2 Phase 9 - Preview URLs

> **Branch**: `v2-intake-scaffold`
> **Date**: 2026-02-19

---

## Local Preview URLs

Start with: `npm run ga:preview:local`

| Endpoint | URL | Auth |
|----------|-----|------|
| Frontend Home | http://localhost:3000/ | None |
| **V2 Intake Wizard** | http://localhost:3000/onboarding/v2 | None (UI) |
| Backend API Root | http://localhost:3001/ | None |
| Backend Health | http://localhost:3001/health/live | None |
| Database Health | http://localhost:3001/health/db | None |
| Service Status  | http://localhost:3001/health/status | None |

### V2 Intake API Endpoints (Local)

| Endpoint | URL | Auth | Method |
|----------|-----|------|--------|
| V2 Health | http://localhost:3001/api/v2/intake/health | None | GET |
| V2 Version | http://localhost:3001/api/v2/intake/version | None | GET |
| V2 Schema (all modules) | http://localhost:3001/api/v2/intake/schema | None | GET |
| V2 Schema (single module) | http://localhost:3001/api/v2/intake/schema/{moduleId} | None | GET |
| Panic Button | http://localhost:3001/api/v2/intake/panic-button | None | GET |
| Create Session | http://localhost:3001/api/v2/intake/session | Bearer | POST |
| Update Session | http://localhost:3001/api/v2/intake/session/{sessionId} | Bearer | PUT |
| Complete Session | http://localhost:3001/api/v2/intake/session/{sessionId}/complete | Bearer | POST |
| Get Session | http://localhost:3001/api/v2/intake/session/{sessionId} | Bearer | GET |
| Export HMIS (single) | http://localhost:3001/api/v2/intake/export/hmis/{sessionId} | Bearer | GET |
| Export HMIS (batch) | http://localhost:3001/api/v2/intake/export/hmis | Bearer | GET |
| Fairness Audit | http://localhost:3001/api/v2/intake/audit/fairness | Bearer | GET |
| Calibration Report | http://localhost:3001/api/v2/intake/calibration | Bearer | GET |

---

## Production Domain Preview URLs

Start with: `npm run ga:preview:deploy`

**Requires**: Caddy + cloudflared running on local machine.

| Endpoint | URL | Auth |
|----------|-----|------|
| Frontend Home | https://care2connects.org/ | None |
| **V2 Intake Wizard** | https://care2connects.org/onboarding/v2 | None (UI) |
| Backend Health | https://api.care2connects.org/health/live | None |
| V2 Health | https://api.care2connects.org/api/v2/intake/health | None |
| V2 Version | https://api.care2connects.org/api/v2/intake/version | None |
| V2 Schema | https://api.care2connects.org/api/v2/intake/schema | None |
| Panic Button | https://api.care2connects.org/api/v2/intake/panic-button | None |
| Create Session | https://api.care2connects.org/api/v2/intake/session | Bearer | POST |

---

## Frontend Routes (All Pages)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page |
| `/about` | About | About CareConnect |
| `/onboarding/v2` | **V2 Intake Wizard** | Multi-step intake form |
| `/tell-story` | Tell Story | Voice-based intake |
| `/tell-your-story` | Tell Your Story | Alternative story input |
| `/find` | Find Resources | Resource finder |
| `/profiles` | Profiles | Client profiles list |
| `/profile/[id]` | Profile Detail | Individual profile |
| `/donate/[slug]` | Donate | Donation page |
| `/funding-setup/[clientId]` | Funding Setup | GoFundMe wizard |
| `/gfm/extract` | GFM Extract | GoFundMe data extraction |
| `/gfm/review` | GFM Review | GoFundMe review |
| `/support` | Support | Support page |
| `/resources` | Resources | Resource directory |
| `/health` | Health Dashboard | System health UI |
| `/system` | System Panel | Admin/system panel |
| `/system/setup-wizard` | Setup Wizard | System setup |
| `/admin/knowledge` | Knowledge Base | Admin knowledge management |

---

## Quick Test Commands (curl)

```bash
# Health check
curl http://localhost:3001/health/live

# V2 health
curl http://localhost:3001/api/v2/intake/health

# V2 version
curl http://localhost:3001/api/v2/intake/version

# V2 schema (all modules)
curl http://localhost:3001/api/v2/intake/schema

# Panic button
curl http://localhost:3001/api/v2/intake/panic-button

# Create session (requires auth)
curl -X POST http://localhost:3001/api/v2/intake/session \
  -H "Authorization: Bearer YOUR_TOKEN"

# Production domain (via tunnel)
curl https://api.care2connects.org/health/live
curl https://api.care2connects.org/api/v2/intake/health
```

---

*End of Preview URLs*
