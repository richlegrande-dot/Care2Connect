# 🛡️ CONFIGURATION PRESERVATION GUIDELINES

**Purpose:** Prevent loss of working configurations, test results, and version history to enable reliable rollbacks and progress tracking.

**Created:** February 7, 2026  
**Trigger Event:** Loss of 51% (304/590) working configuration due to uncommitted changes

---

## 🚨 CRITICAL INCIDENT SUMMARY

### What Was Lost
- **Configuration:** UrgencyAssessmentService.js that achieved 304/590 (51.53%)
- **Timestamp:** February 7, 2026 at 14:41
- **Root Cause:** File modified at 11:09 AM without committing working 14:41 version
- **Impact:** 45 cases lost (304 → 259), 8 percentage point regression
- **Recovery:** IMPOSSIBLE - no version history exists

### Why It Happened
1. ✗ Working service file never committed to Git
2. ✗ No configuration documentation at time of success
3. ✗ Enhancement files (V1b, V2a, V1c_3.1) untracked
4. ✗ No environment variable recording
5. ✗ No baseline snapshot before modifications
6. ✗ Test reports didn't capture service configuration

---

## 📋 MANDATORY PROCEDURES

### PROCEDURE 1: IMMEDIATE GIT COMMIT ON SUCCESS

**WHEN:** Any evaluation achieves a new performance milestone

**STEPS:**
```powershell
# 1. Immediately after successful test run
git add backend/src/services/*.js
git add backend/eval/v4plus/reports/*.json
git add backend/eval/v4plus/reports/*.md

# 2. Commit with descriptive message including test results
git commit -m "✅ MILESTONE: 51.53% (304/590) - UrgencyAssessmentService baseline

- Evaluation timestamp: 2026-02-07T14:41:40.029Z
- Pass rate: 304/590 (51.53%)
- Dataset: all500 (core30 + hard60 + fuzz500)
- Enhancements: [list all active env vars]
- Critical files: UrgencyAssessmentService.js, [others]
- Notes: [any relevant context]
"

# 3. Tag the milestone
git tag -a v1.0-51pct -m "51.53% baseline (304/590 cases)"

# 4. Push immediately
git push origin master --tags
```

**ENFORCEMENT:** Never proceed with further modifications until commit is complete.

---

### PROCEDURE 2: CONFIGURATION SNAPSHOT

**WHEN:** Before AND after every evaluation run

**REQUIRED ARTIFACTS:**

#### A. Environment Variables Snapshot
```powershell
# Save to: snapshots/env-<timestamp>.txt
Get-ChildItem Env:USE_* | Out-File "snapshots/env-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
```

**Example Format:**
```
USE_V1B_ENHANCEMENTS=true
USE_V2A_ENHANCEMENTS=true
USE_V1C_31_ENHANCEMENTS=false
USE_V1D_32_ENHANCEMENTS=false
```

#### B. Service Configuration Snapshot
```powershell
# Save to: snapshots/config-<timestamp>.json
@{
    timestamp = Get-Date -Format "o"
    dataset = "all500"
    services = @{
        urgency = @{
            file = "UrgencyAssessmentService.js"
            lastModified = (Get-Item backend/src/services/UrgencyAssessmentService.js).LastWriteTime
            hash = (Get-FileHash backend/src/services/UrgencyAssessmentService.js).Hash
            enhancements = @("V1b", "V2a")  # List active enhancements
        }
        category = @{
            file = "CategoryClassificationService.js"
            lastModified = (Get-Item backend/src/services/CategoryClassificationService.js).LastWriteTime
            hash = (Get-FileHash backend/src/services/CategoryClassificationService.js).Hash
        }
    }
    thresholds = @{
        CRITICAL = 0.80
        HIGH = 0.50
        MEDIUM = 0.15
    }
} | ConvertTo-Json -Depth 10 | Out-File "snapshots/config-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
```

#### C. Full Service File Backup
```powershell
# Save to: snapshots/services-<timestamp>/
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
New-Item -ItemType Directory -Path "snapshots/services-$timestamp"
Copy-Item backend/src/services/*.js "snapshots/services-$timestamp/"
```

---

### PROCEDURE 3: PRE-MODIFICATION CHECKLIST

**WHEN:** Before modifying any service file or enhancement logic

**CHECKLIST:**
```
□ Current baseline documented (% and case count)
□ Git status clean (all changes committed)
□ Configuration snapshot created
□ Enhancement files tracked in Git
□ Environment variables recorded
□ Test report archived with config details
□ Rollback plan documented
□ Modification purpose clearly stated
```

**SCRIPT:** `scripts/pre-modification-check.ps1`
```powershell
# Pre-Modification Safety Check
# Usage: .\scripts\pre-modification-check.ps1

Write-Host "🔍 Pre-Modification Safety Check" -ForegroundColor Cyan

# Check 1: Git status
Write-Host "`n📊 Git Status Check..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "❌ STOP: Uncommitted changes detected" -ForegroundColor Red
    Write-Host $gitStatus
    Write-Host "`nRun: git add . && git commit -m 'Checkpoint before modifications'" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Git is clean" -ForegroundColor Green

# Check 2: Baseline documented
Write-Host "`n📊 Baseline Documentation Check..." -ForegroundColor Yellow
$latestReport = Get-ChildItem backend/eval/v4plus/reports/*.json | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $latestReport) {
    Write-Host "❌ STOP: No baseline test report found" -ForegroundColor Red
    exit 1
}
$report = Get-Content $latestReport.FullName | ConvertFrom-Json
Write-Host "✅ Latest baseline: $($report.summary.strictPassRate) ($($report.summary.strictPasses)/$($report.metadata.totalCases))" -ForegroundColor Green
Write-Host "   Timestamp: $($report.metadata.timestamp)" -ForegroundColor Gray

# Check 3: Configuration snapshot
Write-Host "`n📊 Configuration Snapshot Check..." -ForegroundColor Yellow
if (-not (Test-Path "snapshots")) {
    New-Item -ItemType Directory -Path "snapshots" | Out-Null
}
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
Get-ChildItem Env:USE_* | Out-File "snapshots/env-$timestamp.txt"
Write-Host "✅ Environment variables saved to snapshots/env-$timestamp.txt" -ForegroundColor Green

# Check 4: Service file backup
Write-Host "`n📊 Service File Backup..." -ForegroundColor Yellow
$backupDir = "snapshots/services-$timestamp"
New-Item -ItemType Directory -Path $backupDir | Out-Null
Copy-Item backend/src/services/*.js $backupDir/
Write-Host "✅ Service files backed up to $backupDir" -ForegroundColor Green

Write-Host "`n✅ ALL CHECKS PASSED - Safe to proceed with modifications" -ForegroundColor Green
Write-Host "📝 Rollback command: git checkout HEAD -- backend/src/services/" -ForegroundColor Cyan
Write-Host "📝 Service restore: Copy-Item $backupDir/* backend/src/services/" -ForegroundColor Cyan
```

---

### PROCEDURE 4: POST-EVALUATION DOCUMENTATION

**WHEN:** Immediately after ANY evaluation run (success or failure)

**REQUIRED DOCUMENTATION:**

#### A. Create Milestone Document (if new best performance)
```powershell
# File: MILESTONE_<percentage>_<date>.md
```

**Template:** `templates/MILESTONE_TEMPLATE.md`
```markdown
# 🎯 MILESTONE: [XX.X]% ([NNN]/590 cases)

**Achieved:** [Timestamp]  
**Dataset:** all500 (core30 + hard60 + fuzz500)  
**Previous Best:** [XX.X]% ([NNN]/590)  
**Improvement:** +[N] cases

## Configuration

### Environment Variables
\```
USE_V1B_ENHANCEMENTS=true
USE_V2A_ENHANCEMENTS=true
[list all USE_* variables]
\```

### Service Versions
- **UrgencyAssessmentService.js**
  - Last Modified: [timestamp]
  - Git Hash: [commit hash or "UNCOMMITTED"]
  - Active Enhancements: V1b, V2a
  - Thresholds: CRITICAL=0.80, HIGH=0.50, MEDIUM=0.15

- **CategoryClassificationService.js**
  - Last Modified: [timestamp]
  - Git Hash: [commit hash]
  - Active Enhancements: V2a

- **Enhancement Files:**
  - UrgencyEnhancements_v1b.js (modified: [timestamp])
  - CategoryEnhancements_v2a.js (modified: [timestamp])

### Test Report
- **Location:** backend/eval/v4plus/reports/v4plus_all500_[timestamp].json
- **Pass Rate:** [XX.X]% ([NNN]/590)
- **Performance:** [timing info]

## Reproduction Steps

1. **Set Environment Variables:**
   \```powershell
   $env:USE_V1B_ENHANCEMENTS='true'
   $env:USE_V2A_ENHANCEMENTS='true'
   \```

2. **Verify Service Files:**
   \```powershell
   # Check file hashes match:
   Get-FileHash backend/src/services/UrgencyAssessmentService.js
   # Expected: [hash]
   \```

3. **Run Evaluation:**
   \```powershell
   cd backend/eval/v4plus
   node runners/run_eval_v4plus.js --dataset all500
   \```

4. **Expected Result:** [NNN]/590 cases (±2 tolerance)

## Failure Analysis

### Top 3 Failure Buckets
1. [bucket_name] ([count] cases, [%])
2. [bucket_name] ([count] cases, [%])
3. [bucket_name] ([count] cases, [%])

### Core30 Regressions
[List any core30 test failures with case IDs]

## Next Steps
[What improvements to attempt next]

## Rollback Instructions

If this configuration needs to be restored:

1. **From Git:**
   \```powershell
   git checkout [commit-hash] -- backend/src/services/
   \```

2. **From Snapshot:**
   \```powershell
   Copy-Item snapshots/services-[timestamp]/* backend/src/services/
   \```

3. **Set Environment:**
   \```powershell
   # Load from snapshots/env-[timestamp].txt
   \```
\```

---

### PROCEDURE 5: GIT WORKFLOW FOR ENHANCEMENTS

**REQUIRED BRANCH STRATEGY:**

```powershell
# 1. NEVER work on master for experimental enhancements
git checkout -b enhancement/v1d-precision-tuning

# 2. Commit frequently with descriptive messages
git add backend/src/services/UrgencyEnhancements_v1d_32.js
git commit -m "Add V1d_3.2: Surgical precision enhancement

- Target: urgency_under_assessed bucket
- Patterns: medical emergency, housing crisis
- Expected impact: +5-10 cases
- Baseline: 259/590 (43.90%)
"

# 3. Test and document results
node runners/run_eval_v4plus.js --dataset all500
# Result: 259/590 (0% improvement)

# 4. Commit test results
git add backend/eval/v4plus/reports/
git commit -m "V1d_3.2 test results: 259/590 (0% improvement)

- No matches on target patterns
- Root cause: Pattern combinations too restrictive
- Decision: Abandon approach, try V1d_3.3
"

# 5. If successful, merge to master
git checkout master
git merge enhancement/v1d-precision-tuning
git tag -a v1.1-52pct -m "52% with V1d precision tuning"

# 6. If failed, keep branch for reference but don't merge
git checkout master
# Branch remains for historical reference
```

---

### PROCEDURE 6: ENHANCEMENT FILE TRACKING

**RULE:** All enhancement files MUST be tracked in Git before testing

```powershell
# Before first test of new enhancement
git add backend/src/services/UrgencyEnhancements_v1d_32.js
git commit -m "Initial implementation: V1d_3.2 enhancement

- File: UrgencyEnhancements_v1d_32.js
- Purpose: Surgical precision patterns
- Status: UNTESTED
"

# Track changes during development
git add backend/src/services/UrgencyEnhancements_v1d_32.js
git commit -m "V1d_3.2: Fix method signature bug"

# Never leave enhancement files untracked
```

---

### PROCEDURE 7: TEST REPORT ARCHIVING

**LOCATION:** `backend/eval/v4plus/reports/`

**RETENTION:** Keep ALL test reports (Git tracks them)

**NAMING:** Auto-generated format: `v4plus_all500_[ISO-timestamp].json`

**REQUIRED FIELDS IN REPORTS:**
```json
{
  "metadata": {
    "dataset": "all500",
    "totalCases": 590,
    "timestamp": "2026-02-07T14:41:40.029Z",
    "config": {
      // System config
    },
    "serviceVersions": {
      "urgency": {
        "file": "UrgencyAssessmentService.js",
        "hash": "abc123...",
        "enhancements": ["V1b", "V2a"]
      }
    },
    "environmentVariables": {
      "USE_V1B_ENHANCEMENTS": "true",
      "USE_V2A_ENHANCEMENTS": "true"
    }
  }
}
```

**ACTION REQUIRED:** Update evaluation runner to capture this metadata

---

## 🔧 IMPLEMENTATION CHECKLIST

### Immediate Actions (Do Now)
- [x] Create this guidelines document
- [ ] Create `snapshots/` directory structure
- [ ] Create `scripts/pre-modification-check.ps1`
- [ ] Create `templates/MILESTONE_TEMPLATE.md`
- [ ] Commit all current enhancement files to Git
- [ ] Tag current baseline in Git
- [ ] Update evaluation runner to capture configuration metadata

### Setup Actions (One-Time)
```powershell
# 1. Create directory structure
New-Item -ItemType Directory -Path "snapshots" -Force
New-Item -ItemType Directory -Path "templates" -Force
New-Item -ItemType Directory -Path "scripts" -Force

# 2. Track all enhancement files
git add backend/src/services/*Enhancement*.js
git commit -m "Track all enhancement files for version control"

# 3. Create .gitignore exceptions
# Ensure reports/ and snapshots/ are NOT ignored
```

### Ongoing Practices
1. **Before ANY modification:**
   - Run `scripts/pre-modification-check.ps1`
   - Create Git branch for experimental work
   - Document expected outcome

2. **After ANY test run:**
   - Review results immediately
   - If new best: Create milestone document
   - If new best: Commit everything immediately
   - If regression: Document why before reverting

3. **Daily:**
   - Push all commits to remote
   - Verify Git is clean before end of day

4. **Weekly:**
   - Review all active branches
   - Merge or archive completed work
   - Clean up failed experiment branches

---

## 📊 CONFIGURATION METADATA STANDARD

### Required Information for Every Test Run

**Capture in:** Test report metadata + milestone document

```yaml
configuration:
  timestamp: "2026-02-07T14:41:40.029Z"
  
  dataset:
    name: "all500"
    totalCases: 590
    breakdown:
      core30: 30
      hard60: 60
      fuzz500: 500
  
  services:
    urgency:
      file: "UrgencyAssessmentService.js"
      lastModified: "2026-02-07T09:36:55Z"
      gitCommit: "abc123..." # or "UNCOMMITTED"
      fileHash: "sha256:..."
      
      enhancements:
        - name: "V1b"
          file: "UrgencyEnhancements_v1b.js"
          enabled: true
          lastModified: "2026-02-07T09:36:55Z"
          
        - name: "V1c_3.1"
          file: "UrgencyEnhancements_v1c_31.js"
          enabled: false
          
      thresholds:
        CRITICAL: 0.80
        HIGH: 0.50
        MEDIUM: 0.15
        
      boostCaps:
        maxBoost: 0.08
        
    category:
      file: "CategoryClassificationService.js"
      enhancements:
        - name: "V2a"
          enabled: true
          
  environment:
    USE_V1B_ENHANCEMENTS: "true"
    USE_V2A_ENHANCEMENTS: "true"
    USE_V1C_31_ENHANCEMENTS: "false"
    # ... all USE_* variables
    
  system:
    nodeVersion: "v20.x.x"
    platform: "Windows"
    
  results:
    passRate: "51.53%"
    passingCases: 304
    failingCases: 286
```

---

## 🎯 ROLLBACK PROCEDURES

### Scenario 1: Recent Modification Broke System

**If changes are uncommitted:**
```powershell
# Discard all changes
git checkout HEAD -- backend/src/services/
git clean -fd backend/src/services/

# Restore from latest snapshot
$latest = Get-ChildItem snapshots/services-* | Sort-Object Name -Descending | Select-Object -First 1
Copy-Item $latest.FullName/* backend/src/services/ -Force
```

**If changes are committed:**
```powershell
# Find last working commit
git log --oneline backend/src/services/UrgencyAssessmentService.js

# Revert to specific commit
git checkout <commit-hash> -- backend/src/services/

# Test to verify
node runners/run_eval_v4plus.js --dataset all500
```

### Scenario 2: Need to Restore Specific Milestone

**From Git Tag:**
```powershell
# List available milestones
git tag -l

# Restore milestone
git checkout v1.0-51pct -- backend/src/services/

# Restore environment
# (Use snapshots/env-<timestamp>.txt from milestone doc)
```

**From Snapshot:**
```powershell
# List available snapshots
Get-ChildItem snapshots/services-* | Sort-Object Name

# Restore specific snapshot
Copy-Item snapshots/services-20260207-144100/* backend/src/services/ -Force
```

### Scenario 3: Lost Configuration (Prevention)

**This should NEVER happen again if guidelines are followed:**

1. ✅ **Git commits** preserve exact file versions
2. ✅ **Snapshots** provide backup if Git fails
3. ✅ **Milestone docs** provide reproduction steps
4. ✅ **Test reports** capture configuration metadata
5. ✅ **Environment snapshots** preserve settings

---

## 🚨 ENFORCEMENT

### Automated Checks (To Implement)

1. **Pre-commit Hook:** `./git/hooks/pre-commit`
   - Verify all enhancement files are tracked
   - Warn if service files modified without tests

2. **Test Runner Enhancement:**
   - Automatically create snapshot before/after tests
   - Capture full configuration in test report
   - Warn if Git has uncommitted changes

3. **CI/CD Integration:**
   - Require clean Git status for test runs
   - Automatically tag successful milestone runs
   - Fail build if configuration not documented

### Manual Reviews

**Weekly:** Review compliance with guidelines
- Are all test runs documented?
- Are milestones properly tagged?
- Are snapshots being created?

**Monthly:** Archive cleanup
- Compress old snapshots (keep last 30 days uncompressed)
- Verify remote backups exist
- Review and archive failed experiment branches

---

## 📝 LESSONS LEARNED

### From 51% Configuration Loss (Feb 7, 2026)

1. **Never trust working directory as source of truth**
   - Always commit immediately when reaching milestone
   - Don't rely on file timestamps or "current state"

2. **Configuration is invisible without documentation**
   - Service files alone don't capture full configuration
   - Environment variables are critical
   - Enhancement loading order matters

3. **Test reports must be self-contained**
   - Report should allow exact reproduction
   - "Current config" changes constantly
   - Metadata is as important as results

4. **Branch protection matters**
   - Experimental work on branches
   - Master only for proven improvements
   - Failed experiments kept for reference

5. **Automation prevents human error**
   - Pre-modification checks
   - Automatic snapshots
   - Configuration capture in test reports

---

## 🔄 VERSION HISTORY

- **v1.0** (2026-02-07): Initial guidelines after 51% configuration loss
- [Future versions will be tracked here]

---

## ✅ QUICK REFERENCE CHECKLIST

### Before Testing New Enhancement
```
□ Run scripts/pre-modification-check.ps1
□ Create feature branch (git checkout -b enhancement/<name>)
□ Document expected impact
□ Commit enhancement file
```

### After Test Run
```
□ Review results immediately
□ If new best: Create MILESTONE_<pct>_<date>.md
□ If new best: git commit && git tag
□ If new best: Push to remote immediately
□ Document results in commit message
```

### Before Modifying Working Service
```
□ Verify current baseline documented
□ Create snapshot
□ Commit current state
□ Document modification purpose
□ Have rollback plan ready
```

### End of Day
```
□ Git push all commits
□ Verify Git status clean
□ Check all milestones documented
□ No uncommitted working configurations
```

---

**REMEMBER:** "If it's not in Git with a milestone doc, it doesn't exist."
