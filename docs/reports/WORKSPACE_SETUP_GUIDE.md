# Workspace Setup Guide
## Date: January 10, 2026

---

## 🎯 OVERVIEW

Care2system uses an **npm workspaces** monorepo structure with:
- Root workspace (`/`)
- Frontend workspace (`/frontend`)
- Backend workspace (`/backend`)

---

## 📁 STRUCTURE

```
Care2system/
├── package.json          # Root workspace (orchestrator)
├── frontend/
│   ├── package.json      # Frontend workspace
│   └── node_modules/     # Frontend dependencies
├── backend/
│   ├── package.json      # Backend workspace
│   └── node_modules/     # Backend dependencies
└── node_modules/         # Shared dependencies
```

---

## 🚀 SETUP METHODS

### Method 1: Root Workspace (Recommended)

**From project root:**

```powershell
# Install all dependencies (root + frontend + backend)
npm install

# Run both services concurrently
npm run dev

# Run frontend only
npm run dev:frontend

# Run backend only
npm run dev:backend

# Build everything
npm run build

# Test everything
npm run test
```

### Method 2: Individual Workspaces

**Frontend only:**

```powershell
cd frontend
npm install    # Install frontend dependencies
npm run dev    # Start Next.js dev server on port 3000
npm run build  # Build for production
npm run test   # Run frontend tests
```

**Backend only:**

```powershell
cd backend
npm install    # Install backend dependencies
npm run dev    # Start Express server on port 3001
npm run build  # Compile TypeScript
npm run test   # Run backend tests
```

### Method 3: Workspace Commands (Advanced)

**From project root:**

```powershell
# Run command in specific workspace
npm run dev --workspace=frontend
npm run test --workspace=backend

# Install package in specific workspace
npm install axios --workspace=frontend
npm install express --workspace=backend

# List all workspaces
npm ls --workspaces
```

---

## ⚠️ COMMON ISSUES

### Issue 1: ENOWORKSPACES Error

**Symptom:**
```
npm error code ENOWORKSPACES
npm error This command does not support workspaces.
```

**Cause:** Running workspace-specific npm commands from root without proper flags

**Solutions:**

**Option A: Run from workspace directory (simplest)**
```powershell
cd frontend
npm run dev   # ✅ Works
```

**Option B: Use workspace flag from root**
```powershell
npm run dev --workspace=frontend   # ✅ Works
```

**Option C: Use root orchestrator scripts**
```powershell
npm run dev:frontend   # ✅ Uses root package.json script
```

### Issue 2: Dependencies Not Found

**Symptom:**
```
Cannot find module 'next'
Error: Cannot find module 'express'
```

**Cause:** Dependencies not installed in workspace

**Solution:**

```powershell
# Option 1: Install all workspaces from root
npm install

# Option 2: Install specific workspace
cd frontend
npm install

# Option 3: Install from root with workspace flag
npm install --workspace=frontend
```

### Issue 3: Version Conflicts

**Symptom:**
```
npm WARN ERESOLVE overriding peer dependency
```

**Cause:** Conflicting dependency versions between workspaces

**Solution:**

```powershell
# Clean all node_modules
Remove-Item -Recurse -Force node_modules, frontend/node_modules, backend/node_modules

# Delete all package-lock files
Remove-Item package-lock.json, frontend/package-lock.json, backend/package-lock.json -ErrorAction SilentlyContinue

# Reinstall everything
npm install
```

### Issue 4: Port Conflicts

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::3000
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**

```powershell
# Check and kill processes using ports
.\scripts\check-port.ps1 -Port 3000
.\scripts\check-port.ps1 -Port 3001

# Or kill all Node processes
Get-Process node | Stop-Process -Force
```

---

## 📋 RECOMMENDED WORKFLOW

### Initial Setup

```powershell
# 1. Clone repository
git clone <repo-url>
cd Care2system

# 2. Install all dependencies from root
npm install

# 3. Set up environment files
copy backend\.env.example backend\.env
copy frontend\.env.local.example frontend\.env.local

# 4. Configure environment variables
# Edit backend/.env and frontend/.env.local

# 5. Start both services
npm run dev
```

### Daily Development

```powershell
# Start both services (opens 2 terminals)
npm run dev

# OR start individually in separate terminals

# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Adding Dependencies

```powershell
# Frontend dependency
npm install <package> --workspace=frontend

# Backend dependency
npm install <package> --workspace=backend

# Shared dependency (rare)
npm install <package> -w
```

### Testing

```powershell
# Test everything from root
npm test

# Test specific workspace
npm run test:frontend
npm run test:backend

# Or test from workspace directory
cd backend
npm test
```

---

## 🔧 TROUBLESHOOTING COMMANDS

```powershell
# Verify workspace structure
npm ls --workspaces

# Check for issues
npm doctor

# Audit dependencies
npm audit
npm audit fix

# Clean and reinstall
Remove-Item -Recurse node_modules, frontend/node_modules, backend/node_modules
npm install

# Verify installations
npm list --workspace=frontend
npm list --workspace=backend
```

---

## 📊 WORKSPACE SCRIPTS REFERENCE

### Root package.json Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend concurrently |
| `npm run dev:frontend` | Start frontend only |
| `npm run dev:backend` | Start backend only |
| `npm run build` | Build both projects |
| `npm run build:frontend` | Build frontend only |
| `npm run build:backend` | Build backend only |
| `npm run test` | Test both projects |
| `npm run test:frontend` | Test frontend only |
| `npm run test:backend` | Test backend only |
| `npm run install:all` | Install dependencies for all workspaces |

### Frontend Scripts (run from /frontend)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server (port 3000) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Jest tests |

### Backend Scripts (run from /backend)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Express dev server (port 3001) |
| `npm run build` | Compile TypeScript |
| `npm run start` | Start compiled server |
| `npm run test` | Run Jest tests |
| `npm run test:coverage` | Run tests with coverage |

---

## 🎯 BEST PRACTICES

### DO

✅ Run `npm install` from project root  
✅ Use root scripts (`npm run dev`) for convenience  
✅ Navigate to workspace for specific commands (`cd frontend && npm run lint`)  
✅ Keep workspaces isolated (no cross-dependencies)  
✅ Use workspace flags when installing packages

### DON'T

❌ Delete `package-lock.json` unless absolutely necessary  
❌ Run `npm install` in workspaces with global packages  
❌ Mix npm and yarn (stick with npm)  
❌ Hardcode workspace paths in scripts  
❌ Share `node_modules` between workspaces

---

## 🚨 EMERGENCY RESET

If everything is broken:

```powershell
# 1. Stop all Node processes
Get-Process node | Stop-Process -Force

# 2. Delete all node_modules
Remove-Item -Recurse -Force node_modules, frontend/node_modules, backend/node_modules

# 3. Delete all lock files
Remove-Item package-lock.json, frontend/package-lock.json, backend/package-lock.json -ErrorAction SilentlyContinue

# 4. Clean npm cache
npm cache clean --force

# 5. Reinstall everything
npm install

# 6. Verify
npm ls --workspaces
```

---

## 📚 ADDITIONAL RESOURCES

- [npm Workspaces Documentation](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)

---

## ✅ VERIFICATION CHECKLIST

After setup, verify:

- [ ] `npm ls --workspaces` shows both workspaces
- [ ] `npm run dev:frontend` starts on port 3000
- [ ] `npm run dev:backend` starts on port 3001
- [ ] Frontend can reach backend at http://localhost:3001
- [ ] No ENOWORKSPACES errors
- [ ] Tests run successfully: `npm test`

---

**Status:** ✅ Verified Working  
**Last Updated:** January 10, 2026

## 🎓 QUICK REFERENCE

```powershell
# Fresh setup
npm install

# Start everything
npm run dev

# Start individually
cd frontend && npm run dev   # Port 3000
cd backend && npm run dev    # Port 3001

# Add package to workspace
npm install <pkg> --workspace=frontend

# Emergency reset
Get-Process node | Stop-Process -Force
Remove-Item -Recurse node_modules, **/node_modules
npm install
```
