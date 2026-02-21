# 🎯 MILESTONE: [XX.X]% ([NNN]/590 cases)

**Achieved:** [YYYY-MM-DDTHH:MM:SS.MMMZ]  
**Dataset:** all500 (core30 + hard60 + fuzz500)  
**Previous Best:** [XX.X]% ([NNN]/590)  
**Improvement:** +[N] cases (+[X.X]%)

---

## 📊 Configuration

### Environment Variables
```powershell
USE_V1B_ENHANCEMENTS=true
USE_V2A_ENHANCEMENTS=true
# [Add all USE_* variables from snapshots/env-<timestamp>.txt]
```

### Service Versions

#### UrgencyAssessmentService.js
- **Last Modified:** [YYYY-MM-DD HH:MM:SS]
- **Git Commit:** [commit hash] or "UNCOMMITTED - SNAPSHOT ONLY"
- **File Hash:** [SHA256 first 16 chars]
- **Active Enhancements:** V1b, V2a, [others]
- **Thresholds:**
  - CRITICAL: 0.80
  - HIGH: 0.50
  - MEDIUM: 0.15
- **Boost Caps:** maxBoost=0.08

#### CategoryClassificationService.js
- **Last Modified:** [YYYY-MM-DD HH:MM:SS]
- **Git Commit:** [commit hash]
- **Active Enhancements:** V2a

#### Enhancement Files
- **UrgencyEnhancements_v1b.js**
  - Modified: [timestamp]
  - Git tracked: Yes/No
  - Purpose: [brief description]

- **CategoryEnhancements_v2a.js**
  - Modified: [timestamp]
  - Git tracked: Yes/No
  - Purpose: [brief description]

### Test Report
- **Location:** `backend/eval/v4plus/reports/v4plus_all500_[timestamp].json`
- **Pass Rate:** [XX.X]% ([NNN]/590)
- **Performance:** [avg latency] ms avg, [total] ms total
- **Budget Status:** Within/Over budget

---

## 🔄 Reproduction Steps

### 1. Restore Files from Git
```powershell
# If this config is committed:
git checkout [commit-hash] -- backend/src/services/

# If not committed, restore from snapshot:
Copy-Item snapshots/services-[timestamp]/* backend/src/services/ -Force
```

### 2. Set Environment Variables
```powershell
# Load from snapshot or set manually:
$env:USE_V1B_ENHANCEMENTS='true'
$env:USE_V2A_ENHANCEMENTS='true'
# [Add all environment variables]
```

### 3. Verify File Integrity
```powershell
# Check that file hashes match:
Get-FileHash backend/src/services/UrgencyAssessmentService.js
# Expected: SHA256: [hash from above]

# If hash doesn't match, restoration failed - check snapshot
```

### 4. Run Evaluation
```powershell
cd backend/eval/v4plus
Remove-Item Env:USE_V1C_31_ENHANCEMENTS -ErrorAction SilentlyContinue
Remove-Item Env:USE_V1D_* -ErrorAction SilentlyContinue
node runners/run_eval_v4plus.js --dataset all500
```

### 5. Expected Result
- **Pass Rate:** [NNN]/590 ± 2 cases (tolerance for randomness)
- **If result differs significantly:** Check environment variables and file hashes

---

## 📉 Failure Analysis

### Top 10 Failure Buckets
1. **[bucket_name]** ([count] cases, [XX.X]%)
   - Description: [what's failing]
   - Examples: [test case IDs]
   - Priority: HIGH/MEDIUM/LOW

2. **[bucket_name]** ([count] cases, [XX.X]%)
   - Description: [what's failing]
   - Examples: [test case IDs]

[Continue for top 10...]

### Core30 Regressions
[If any core30 tests are failing:]
- **T00X:** [issue description]
- **T00Y:** [issue description]

[If none:]
- ✅ All core30 tests passing

### Known Issues
- [List any known problems with this configuration]
- [E.g., "T007 category mismatch - low priority"]

---

## 🎯 What Changed (vs Previous Baseline)

### Code Changes
- [Describe what was modified in service files]
- [E.g., "Adjusted urgency thresholds: HIGH 0.45→0.50"]

### Enhancement Changes
- [What enhancements were added/removed/modified]
- [E.g., "Enabled V2a category intelligence"]

### Impact
- **Cases Gained:** [which failure buckets improved]
- **Cases Lost:** [any regressions]
- **Net Change:** +[N] cases

---

## 🚀 Next Steps

### Recommended Improvements
1. **[Target next biggest failure bucket]**
   - Estimated impact: +[N] cases
   - Effort: [LOW/MEDIUM/HIGH]
   - Risk: [LOW/MEDIUM/HIGH]

2. **[Fix Core30 regressions]**
   - Cases: T00X, T00Y
   - Estimated impact: +[N] cases

3. **[Other improvement]**
   - Description: [what to try next]

### Risks to Avoid
- [Things that might cause regression]
- [E.g., "Don't lower CRITICAL threshold - causes over-assessment"]

---

## 🔐 Preservation Checklist

[Mark these as you complete them:]

- [ ] Configuration committed to Git
- [ ] Git tag created: `git tag -a v[version]-[XX]pct -m "[description]"`
- [ ] Snapshot created in `snapshots/services-[timestamp]/`
- [ ] Environment variables saved in `snapshots/env-[timestamp].txt`
- [ ] Test report archived in Git
- [ ] This milestone document created and committed
- [ ] Git pushed to remote: `git push origin master --tags`

---

## 📝 Notes

[Any additional context, observations, or discoveries during testing]

[E.g., "Surgery detection is boosting correctly now after threshold adjustment"]

---

## 🔄 Rollback Instructions

### Quick Rollback (if this config breaks something)

```powershell
# From Git (if committed):
git checkout [commit-hash] -- backend/src/services/

# From Snapshot (if not committed):
Copy-Item snapshots/services-[timestamp]/* backend/src/services/ -Force

# Restore environment:
# [Manually set env vars from above]

# Verify:
cd backend/eval/v4plus
node runners/run_eval_v4plus.js --dataset all500
# Expected: [NNN]/590 cases
```

### If Rollback Fails
1. Check Git commit hash is correct
2. Verify snapshot directory exists
3. Check file hashes after restoration
4. Verify all environment variables set
5. Check for conflicting environment variables (remove USE_V1C_31_*, USE_V1D_*, etc.)

---

**Document Version:** 1.0  
**Created By:** [Name/System]  
**Status:** VERIFIED / ACTIVE / SUPERSEDED  
**Superseded By:** [Future milestone document or "N/A"]
