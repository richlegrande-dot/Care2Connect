# Unified Admin Portal - Quick Reference

**URL**: https://care2connects.org/health  
**Password**: `admin2024`  
**Status**: ✅ PRODUCTION READY

---

## Quick Access

| Feature | Tab | Description |
|---------|-----|-------------|
| **System Health** | Tab 1 | Monitoring, metrics, self-heal |
| **Knowledge Vault** | Tab 2 | Manage sources and chunks |
| **Audit Log** | Tab 3 | View change history |

---

## Authentication

### Login
1. Navigate to `/health`
2. Enter password: `admin2024`
3. Click "Unlock Admin Portal"

### Diagnostics
If login fails:
1. Click "Run Diagnostics"
2. Review test results
3. Follow troubleshooting tips

### Lock Portal
Click "Lock Portal" button (top-right) to log out

---

## System Health Tab

### Features
- **Real-time Metrics**: CPU, memory, disk, network
- **Service Status**: Database, storage, speech, monitoring
- **Actions**:
  - Self-Heal: Restart unhealthy services
  - Support Logs: Download logs for troubleshooting
  - Metrics: View detailed performance data
  - Full Diagnostics: Run comprehensive health checks

### Auto-Refresh
Status updates every 30 seconds automatically

### Status Colors
- 🟢 **Green**: Healthy/OK/Operational
- 🟡 **Yellow**: Degraded/Warning
- 🔴 **Red**: Down/Error/Critical

---

## Knowledge Vault Tab

### View Sources
- Grid layout showing all knowledge sources
- Click any source to view details

### Search
Use search box to filter by title or description

### Source Details
Click a source card to open modal with:
- Title and description
- URL and type
- Status and priority
- Chunk count
- Actions: Edit, Delete, View Chunks

### Add Source
1. Click "Add New Source"
2. Fill in details:
   - Title (required)
   - Description
   - URL
   - Type (documentation, code, faq, etc.)
   - Priority (high, medium, low)
3. Click "Save"

### Edit Source
1. Open source details
2. Click "Edit"
3. Modify fields
4. Click "Save Changes"
5. **Audit log entry created automatically**

### Delete Source
1. Open source details
2. Click "Delete"
3. Confirm deletion
4. **Audit log entry created automatically**

### View Chunks
1. Open source details
2. Click "View Chunks"
3. See all text chunks for this source

---

## Audit Log Tab

### View Logs
Complete history of all Knowledge Vault changes

### Columns
- **Timestamp**: When change occurred
- **Action**: create, update, or delete
- **Entity**: Type (KnowledgeSource, KnowledgeChunk)
- **Actor**: Who made the change
- **Details**: Click row for full details

### Filter by Type
Use dropdown to filter:
- All
- KnowledgeSource
- KnowledgeChunk
- System

### View Details
Click any log entry to see:
- Full action details
- Entity ID
- Before state (JSON)
- After state (JSON)
- Actor information
- Exact timestamp

### Action Colors
- 🟢 **Green**: Create/Created
- 🔵 **Blue**: Update/Updated
- 🔴 **Red**: Delete/Deleted

---

## API Integration

All admin features use centralized API:

```typescript
import { getApiUrl, apiFetch } from '@/lib/api';

// Get URL (same-origin via proxy)
const url = getApiUrl('admin/knowledge/sources');

// Fetch with auto URL resolution
const response = await apiFetch('admin/knowledge/sources', {
  headers: {
    'x-admin-password': password,
  },
});
```

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health/status` | GET | System health data |
| `/api/admin/knowledge/sources` | GET | List sources |
| `/api/admin/knowledge/sources/:id` | GET | Source details |
| `/api/admin/knowledge/sources` | POST | Create source |
| `/api/admin/knowledge/sources/:id` | PUT | Update source |
| `/api/admin/knowledge/sources/:id` | DELETE | Delete source |
| `/api/admin/knowledge/audit` | GET | Audit logs |

### Authentication Header
All admin endpoints require:
```typescript
headers: {
  'x-admin-password': 'admin2024'
}
```

---

## Diagnostics

### When to Run
- Login failing
- Connectivity issues
- After deployment
- Regular health checks

### Tests Performed
1. ✅ **Environment Detection**
   - Hostname
   - Protocol (HTTP/HTTPS)
   - Resolved API base URL

2. ✅ **Health Endpoint (Proxy)**
   - Tests `/api/health/live`
   - Verifies Next.js proxy working
   - Confirms backend connectivity

3. ⚠️ **Direct Backend Connection**
   - Tests direct backend URL
   - May fail due to CORS (this is OK)
   - Used for troubleshooting only

4. ✅ **CORS Configuration**
   - Explains same-origin strategy
   - Confirms proxy eliminates CORS

### Interpreting Results

**All Green**: System healthy, proxy working
```
✅ Environment Detection
✅ Health Endpoint (Proxy)
⚠️ Direct Backend (CORS blocked - OK if proxy works)
✅ CORS Configuration
```

**Health Endpoint Failed**: Backend down or proxy broken
```
✅ Environment Detection
❌ Health Endpoint (Proxy) - "Failed to fetch"
❌ Direct Backend
❌ CORS Configuration
```
**Action**: Check backend running, verify next.config.js rewrites

---

## Troubleshooting

### "Failed to fetch" on login

**Diagnosis**:
1. Click "Run Diagnostics"
2. Check which tests fail

**Solutions**:
- Health Endpoint failed → Backend not running (check port 3001)
- Environment detection failed → Check hostname configuration
- All tests pass but still error → Check browser console

### "Invalid password"

**Diagnosis**:
Backend rejecting password

**Solutions**:
1. Verify password: `admin2024`
2. Check backend `.env` for `ADMIN_PASSWORD`
3. Restart backend if recently changed

### Can't switch tabs

**Diagnosis**:
JavaScript error or component issue

**Solutions**:
1. Check browser console for errors
2. Hard refresh (Ctrl+Shift+R)
3. Clear cache and reload

### Audit log empty

**Diagnosis**:
No changes made yet OR backend endpoint missing

**Solutions**:
1. Make a change in Knowledge Vault (triggers audit log)
2. Check backend has `/api/admin/knowledge/audit` endpoint
3. Verify audit logging middleware installed

---

## Architecture

### Same-Origin Proxying

```
User → https://care2connects.org/health
        ↓
Frontend makes request to: /api/admin/knowledge/sources (same-origin)
        ↓
Next.js rewrites to: http://localhost:3001/api/admin/knowledge/sources
        ↓
Backend processes request
        ↓
Response flows back through Next.js
        ↓
Frontend receives response (appears same-origin)
```

**Benefits**:
- No CORS issues (all same-origin)
- Transparent proxying
- Works in dev and production
- Simplified frontend code

### Component Architecture

```
/health (page.tsx)
└── AdminAuthGate (authentication)
    └── Tab Container
        ├── SystemHealthTab (Tab 1)
        ├── KnowledgeVaultTab (Tab 2)
        └── AuditLogTab (Tab 3)
```

### API Architecture

```
lib/api.ts (centralized API config)
├── getApiUrl(path) → Returns '/api/{path}'
├── getDirectBackendUrl() → Returns direct URL (diagnostics only)
├── apiFetch(path, opts) → Fetch with automatic URL resolution
└── runApiDiagnostics() → Returns diagnostic test results
```

---

## Security

### Password Storage
- ❌ **NOT stored**: Raw password never in localStorage
- ✅ **Stored**: Session token after successful authentication
- ✅ **Verification**: Token verified on component mount
- ✅ **Expiration**: Token cleared on "Lock Portal" or 401 response

### Rate Limiting
- 🔄 **Future**: Rate limit password attempts (5/minute per IP)
- 🔄 **Future**: Account lockout after 10 failed attempts

### Audit Logging
- ✅ **Logged**: All Knowledge Vault changes
- ❌ **NOT logged**: Passwords, API keys, sensitive data
- ✅ **Retention**: Indefinite (for compliance)

### HTTPS
- ✅ **Production**: Always HTTPS (via Cloudflare)
- ⚠️ **Development**: HTTP on localhost (OK for dev)

---

## Maintenance

### Update Admin Password

**Backend**:
```env
# backend/.env
ADMIN_PASSWORD=new_password_here
```

**Restart backend**:
```powershell
Restart-Service Care2Backend
# OR
Stop-Process -Name node; npm run start
```

### Update API Base URL

**Only if backend moves to different port/host**:

```env
# v1-frontend/.env.local
BACKEND_URL=http://localhost:3002
```

**Restart frontend**:
```powershell
npm run dev
```

### Clear Session Token

**Browser DevTools**:
```javascript
localStorage.removeItem('adminToken');
location.reload();
```

**OR** click "Lock Portal" button

---

## Testing

### Manual Test Checklist

- [ ] Navigate to `/health`
- [ ] Enter correct password → unlocks
- [ ] Enter wrong password → "Invalid password" error
- [ ] Click "Run Diagnostics" → shows 4 tests
- [ ] Switch to System Health tab → displays metrics
- [ ] Switch to Knowledge Vault tab → lists sources
- [ ] Switch to Audit Log tab → shows history
- [ ] Click "Lock Portal" → returns to login
- [ ] Refresh page → stays logged in (token persists)

### Automated Tests

```typescript
// Test authentication
describe('AdminAuthGate', () => {
  it('shows login form when no token', () => {
    // Test implementation
  });
  
  it('validates token on mount', () => {
    // Test implementation
  });
  
  it('distinguishes wrong password vs network error', () => {
    // Test implementation
  });
});

// Test diagnostics
describe('runApiDiagnostics', () => {
  it('returns 4 test results', async () => {
    const results = await runApiDiagnostics();
    expect(results).toHaveLength(4);
  });
});
```

---

## Support

### Documentation
- [Root Cause Analysis](ADMIN_AUTH_CONNECTIVITY_ROOT_CAUSE_AND_HARDENING.md) - Complete problem and solution documentation
- [System Status Report](../SYSTEM_STATUS_REPORT.md) - Current system health
- [API Documentation](API.md) - Backend API reference

### Contact
- **Development Team**: Check GitHub issues
- **System Owner**: Check project README

### Reporting Issues
When reporting authentication issues, include:
1. Diagnostic test results (click "Run Diagnostics")
2. Browser console logs
3. Network tab showing failed requests
4. Steps to reproduce

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Navigate between tabs (after login) |
| Escape | Close modals |
| Ctrl+R | Refresh data |
| Ctrl+Shift+R | Hard refresh (clear cache) |

---

**Last Updated**: December 17, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
