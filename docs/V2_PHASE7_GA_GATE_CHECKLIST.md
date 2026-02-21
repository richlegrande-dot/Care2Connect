# V2 Intake — Phase 7: GA Gate Checklist (Runnable)

> **Date**: February 18, 2026
> **Phase**: 7 — GA Enablement
> **Purpose**: Executable checklist converting all 44 GO/NO-GO criteria into trackable items
> **Source**: `docs/V2_GENERAL_AVAILABILITY_GATE.md`
> **Rule**: All 44 required criteria must pass. Every criterion is binary (met / not met).

---

## How to Use This Checklist

1. Work through each section sequentially
2. For each criterion: run the verification, record evidence, check the box
3. Items marked `✅ PRE-VERIFIED` were confirmed during Phases 4–6B and should be re-verified at launch time
4. Items marked `⏳ AWAITING HUMAN` require stakeholder action before they can be checked
5. Items marked `🔧 VERIFY AT LAUNCH` require re-execution on launch day
6. When all 44 boxes are checked, execute the GO/NO-GO decision (§8)

---

## Summary Dashboard

| Gate | Total | Pre-Verified | Awaiting Human | Verify at Launch |
|------|-------|-------------|----------------|-----------------|
| 1. Blockers | 6 required (+1 optional) | 1 | 4 | 2 |
| 2. Infrastructure | 10 | 9 | 0 | 10 (re-verify) |
| 3. Governance | 8 | 2 | 6 | 0 |
| 4. Clinical | 5 | 0 | 5 | 0 |
| 5. DV Safety | 7 | 0 | 7 | 0 |
| 6. Security | 8 | 8 | 0 | 8 (re-verify) |
| **TOTAL** | **44** | **20** | **22** | **20** |

**Current readiness**: 20/44 pre-verified (45%) — remaining 22 blocked on human coordination + 2 on infra actions.

---

## 1. Blockers Cleared Gate (6 required + 1 optional)

**Tag**: `BLOCKERS` | **Gate Rule**: Items 1–6 ALL REQUIRED

| # | Criterion | Tag | Current Status | Verification | Evidence |
|---|-----------|-----|---------------|-------------|----------|
| B1 | Git remote configured | `✅ PRE-VERIFIED` | ✅ SSH remote set, branch pushed | `git remote -v` | origin = `git@github.com:richlegrande-dot/Care2Connect.git` |
| B2 | Remote CI verified | `🔧 VERIFY AT LAUNCH` | ⏳ PR not yet created | GitHub Actions URL showing `test-v2-intake` pass | ________________ |
| B3 | Branch protection applied | `🔧 VERIFY AT LAUNCH` | ⏳ Documented, not yet applied | GitHub Settings screenshot | ________________ |
| B4 | Calibration session completed | `⏳ AWAITING HUMAN` | ⏳ Outreach sent | Sign-off doc from Clinical Director | ________________ |
| B5 | DV testing completed | `⏳ AWAITING HUMAN` | ⏳ Kickoff sent | Sign-off doc from DV advocate | ________________ |
| B6 | All stakeholder approvals (4/4) | `⏳ AWAITING HUMAN` | ⏳ 2 requests sent, 2 pending | 4 sign-offs in `V2_PILOT_REVIEW.md` | ________________ |
| B7 | `gh` CLI installed (OPTIONAL) | `OPTIONAL` | ❌ Not installed | `gh --version` or N/A | N/A — workaround via web UI |

### Blocker Gate Checklist

- [ ] B1: Git remote shows origin pointing to GitHub (SSH or HTTPS)
- [ ] B2: GitHub Actions shows green `test-v2-intake` job
- [ ] B3: Branch protection rules active on `main` and `develop`
- [ ] B4: Clinical Director signed calibration session minutes
- [ ] B5: DV advocate signed safety assessment (Safe or Conditionally Safe)
- [ ] B6: 4/4 stakeholder sign-offs recorded in `V2_PILOT_REVIEW.md`

**Status**: [ ] / 6 PASSED

---

## 2. Infrastructure Gate (10 required)

**Tag**: `INFRA` | **Gate Rule**: ALL 10 must pass

All items were verified during Phase 6 pilot but must be re-verified on launch day.

| # | Criterion | Tag | Verification Command | Expected | Pre-Verified |
|---|-----------|-----|---------------------|----------|-------------|
| I1 | Server running | `🔧 VERIFY AT LAUNCH` | `curl http://localhost:3001/health/live` | 200, `alive` | ✅ Phase 6 |
| I2 | V2 routes active | `🔧 VERIFY AT LAUNCH` | `curl http://localhost:3001/api/v2/intake/health` | 200, `healthy` | ✅ Phase 6 |
| I3 | Database connected | `🔧 VERIFY AT LAUNCH` | V2 health → `database: connected` | `connected` | ✅ Phase 6 |
| I4 | Auth enforcing | `🔧 VERIFY AT LAUNCH` | `POST /session` without token | 401 | ✅ Phase 6 |
| I5 | Migrations current | `🔧 VERIFY AT LAUNCH` | `npx prisma migrate status` | `up to date` | ✅ Phase 6 |
| I6 | Feature flag correct | `🔧 VERIFY AT LAUNCH` | V2 health → `featureFlag: true` | `true` | ✅ Phase 6 |
| I7 | Policy pack version | `🔧 VERIFY AT LAUNCH` | V2 version → `policyPack` | `v1.0.0` (or bumped) | ✅ Phase 6 |
| I8 | No critical incidents | `🔧 VERIFY AT LAUNCH` | Incidents table audit | 0 open critical | ✅ Phase 6 |
| I9 | Rate limiting active | `🔧 VERIFY AT LAUNCH` | `.env` → `DISABLE_RATE_LIMITING=false` | `false` | ✅ Phase 6 |
| I10 | Secrets configured | `🔧 VERIFY AT LAUNCH` | Env audit → all `[REDACTED_SET]` | All present | ✅ Phase 4 |

### Infrastructure Gate Checklist

- [ ] I1: `curl /health/live` → 200
- [ ] I2: `curl /api/v2/intake/health` → 200
- [ ] I3: Database shows `connected`
- [ ] I4: Unauthenticated POST returns 401
- [ ] I5: `npx prisma migrate status` → up to date
- [ ] I6: Feature flag = `true`
- [ ] I7: Policy pack version matches (v1.0.0 or calibration-bumped)
- [ ] I8: Zero open critical incidents
- [ ] I9: Rate limiting = active (`false` in env)
- [ ] I10: All secrets present and set

**Status**: [ ] / 10 PASSED

### Quick Re-Verification Script

```bash
# Run all 10 infra checks in sequence:
echo "=== I1: Server Health ==="
curl -s http://localhost:3001/health/live

echo "=== I2: V2 Routes ==="
curl -s http://localhost:3001/api/v2/intake/health

echo "=== I3-I8: V2 Health Details ==="
curl -s http://localhost:3001/api/v2/intake/health | node -e "
  const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  console.log('Database:', data.database);
  console.log('Feature Flag:', data.featureFlag);
  console.log('Policy Pack:', data.policyPack || data.version);
"

echo "=== I4: Auth Enforcement ==="
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/api/v2/intake/session

echo "=== I5: Migration Status ==="
cd backend && npx prisma migrate status 2>&1 | tail -3

echo "=== I9-I10: Env Audit ==="
grep -E "DISABLE_RATE_LIMITING|BLOCK_SENSITIVE_DATA|REQUIRE_CONSENT" .env | sed 's/=.*/=[CHECKED]/'
```

---

## 3. Governance Gate (8 required)

**Tag**: `GOVERNANCE` | **Gate Rule**: ALL 8 must pass

| # | Criterion | Tag | Evidence Location | Current Status |
|---|-----------|-----|-------------------|---------------|
| G1 | Technical Lead sign-off | `⏳ AWAITING HUMAN` | `V2_PILOT_REVIEW.md` §3.3 | Request sent 2026-02-18 |
| G2 | Data Privacy sign-off | `⏳ AWAITING HUMAN` | `V2_PILOT_REVIEW.md` §3.4 | Request sent 2026-02-18 |
| G3 | Program Manager sign-off | `⏳ AWAITING HUMAN` | `V2_PILOT_REVIEW.md` §3.1 | Blocked on calibration |
| G4 | DV Advocate sign-off | `⏳ AWAITING HUMAN` | `V2_PILOT_REVIEW.md` §3.2 | Blocked on DV testing |
| G5 | Calibration completed | `⏳ AWAITING HUMAN` | `V2_CALIBRATION_SESSION_STATUS.md` | Outreach sent |
| G6 | DV testing completed | `⏳ AWAITING HUMAN` | `V2_DV_TESTING_STATUS.md` | Kickoff sent |
| G7 | Scoring freeze maintained | `✅ PRE-VERIFIED` | `git log --oneline -- backend/src/intake_v2/scoring/` | No changes since pilot |
| G8 | No guardrail violations | `✅ PRE-VERIFIED` | Guardrails compliance in status reports | All green |

### Governance Gate Checklist

- [ ] G1: Technical Lead email reply = "Approved" → recorded in `V2_PILOT_REVIEW.md` §3.3
- [ ] G2: Data Privacy Officer email reply = "Approved" → recorded in `V2_PILOT_REVIEW.md` §3.4
- [ ] G3: Program Manager email reply = "Approved" → recorded in `V2_PILOT_REVIEW.md` §3.1
- [ ] G4: DV Advocate assessment = "Safe" or "Conditionally Safe" → recorded in `V2_PILOT_REVIEW.md` §3.2
- [ ] G5: Calibration session minutes filed + Clinical Director sign-off recorded
- [ ] G6: DV testing evidence folder complete + all 6 phases documented
- [ ] G7: `git log` shows no scoring file changes since pilot launch (commit `50e5380`)
- [ ] G8: Guardrails compliance table = all items green

### Verification Commands for G7 and G8

```bash
# G7: Verify scoring freeze
git log --oneline 50e5380..HEAD -- backend/src/intake_v2/scoring/
# Expected: empty (no changes)

# G8: Verify guardrails compliance
# Check: no V1 files modified, no new endpoints, no AI dependencies
git log --oneline 50e5380..HEAD -- backend/src/server.ts backend/src/routes/
# Expected: no route additions
```

**Status**: [ ] / 8 PASSED

---

## 4. Clinical Gate (5 required)

**Tag**: `CLINICAL` | **Gate Rule**: ALL 5 must pass

All items require the calibration session to complete first.

| # | Criterion | Tag | Evidence | Current Status |
|---|-----------|-----|----------|---------------|
| C1 | Scoring weights reviewed by clinicians | `⏳ AWAITING HUMAN` | Calibration session minutes | Awaiting session |
| C2 | Override rules validated | `⏳ AWAITING HUMAN` | Calibration sign-off | Awaiting session |
| C3 | Edge-case personas passed (5/5) | `⏳ AWAITING HUMAN` | 5/5 reviewed in session | Awaiting session |
| C4 | Fairness analysis reviewed | `⏳ AWAITING HUMAN` | No discriminatory patterns | Awaiting session |
| C5 | Version bump completed (if changes) | `⏳ AWAITING HUMAN` | POLICY_PACK_VERSION updated (or confirmed at v1.0.0) | Awaiting session |

### Clinical Gate Checklist

- [ ] C1: Session minutes document clinician review of 4 scoring dimensions
- [ ] C2: Session minutes document clinician validation of 5 override rules (DV, trafficking, veteran, chronic, minor)
- [ ] C3: All 5 persona cards reviewed: Maria (DV), James (stable), Robert (veteran), Youth, Moderate
- [ ] C4: Fairness analysis presented and reviewed — no discriminatory patterns identified (or documented with mitigations)
- [ ] C5: Scoring engine version = v1.0.0 confirmed OR version bumped + re-tested + signed off

### What to Prepare Before Session

| # | Artifact | File/Endpoint | Action |
|---|----------|--------------|--------|
| 1 | Weight table | `GET /api/v2/intake/version` → policyPack | Print |
| 2 | Persona cards | `docs/V2_CALIBRATION_SESSION_BRIEF.md` §4 | Print 5 cards |
| 3 | Calibration data | `GET /api/v2/intake/calibration` | Export to spreadsheet |
| 4 | Fairness report | `GET /api/v2/intake/audit/fairness` | Print |
| 5 | Sign-off form | Template in this doc §8 | Print |

**Status**: [ ] / 5 PASSED

---

## 5. DV Safety Gate (7 required)

**Tag**: `DV_SAFETY` | **Gate Rule**: ALL 7 must pass. "Not Safe" = automatic NO-GO.

All items require DV testing to complete first.

| # | Criterion | Tag | Evidence | Current Status |
|---|-----------|-----|----------|---------------|
| D1 | Browser matrix tested (9 browsers) | `⏳ AWAITING HUMAN` | `evidence/phase-b-browser/` | Awaiting testing |
| D2 | Shared device scenarios (3/3) | `⏳ AWAITING HUMAN` | `evidence/phase-c-shared-device/` | Awaiting testing |
| D3 | Screen readers tested (4) | `⏳ AWAITING HUMAN` | `evidence/phase-d-screen-reader/` | Awaiting testing |
| D4 | Panic button verified | `⏳ AWAITING HUMAN` | Screenshots + video | Awaiting testing |
| D5 | Data retention verified | `⏳ AWAITING HUMAN` | Pre/post panic comparison | Awaiting testing |
| D6 | Advocate safety assessment | `⏳ AWAITING HUMAN` | "Safe" or "Conditionally Safe" | Awaiting testing |
| D7 | Remediation items resolved | `⏳ AWAITING HUMAN` | All critical/high fixed | Awaiting testing |

### DV Safety Gate Checklist

- [ ] D1: All 9 browsers tested with 16 items each = 144 total test items documented
  - Chrome/Win, Firefox/Win, Edge/Win
  - Chrome/Mac, Firefox/Mac, Safari/Mac
  - Chrome/Android, Samsung Internet/Android, Safari/iOS
- [ ] D2: 3 shared device scenarios passed:
  - Library computer (public, shared access)
  - Home computer (shared household)
  - Abuser's device (adversarial scenario)
- [ ] D3: 4 screen readers tested:
  - NVDA (Windows)
  - VoiceOver (macOS)
  - VoiceOver (iOS)
  - TalkBack (Android)
- [ ] D4: Panic button clears ALL local data AND redirects to safe page (e.g., weather.com)
- [ ] D5: Forensic check post-panic: localStorage empty, sessionStorage empty, cookies cleared, IndexedDB empty, no cache entries with PII
- [ ] D6: DV advocate assessment = "Safe" or "Conditionally Safe" (NOT "Not Safe")
- [ ] D7: All critical and high-severity remediation items resolved (if any found)

### Evidence Folder Structure

```
dv-testing-evidence/
├── phase-b-browser/
│   ├── chrome-win/        (16 screenshots + log)
│   ├── firefox-win/       (16 screenshots + log)
│   ├── edge-win/          (16 screenshots + log)
│   ├── chrome-mac/        (16 screenshots + log)
│   ├── firefox-mac/       (16 screenshots + log)
│   ├── safari-mac/        (16 screenshots + log)
│   ├── chrome-android/    (16 screenshots + log)
│   ├── samsung-android/   (16 screenshots + log)
│   └── safari-ios/        (16 screenshots + log)
├── phase-c-shared-device/
│   ├── library/           (evidence)
│   ├── home/              (evidence)
│   └── abuser/            (evidence)
├── phase-d-screen-reader/
│   ├── nvda-win/          (audio recordings + notes)
│   ├── voiceover-mac/     (audio recordings + notes)
│   ├── voiceover-ios/     (audio recordings + notes)
│   └── talkback-android/  (audio recordings + notes)
├── phase-e-review/
│   ├── data-retention/    (pre/post panic screenshots)
│   └── audit-log/         (session audit log export)
└── sign-off/
    └── advocate-sign-off-form.pdf
```

**Status**: [ ] / 7 PASSED

---

## 6. Security Gate (8 required)

**Tag**: `SECURITY` | **Gate Rule**: ALL 8 must pass

All items were verified during Phase 4 env audit and Phase 6 deployment.
Must be re-verified on launch day.

| # | Criterion | Tag | Verification | Pre-Verified |
|---|-----------|-----|-------------|-------------|
| S1 | JWT auth on protected routes | `✅ PRE-VERIFIED` | POST without token → 401 | ✅ Phase 6 |
| S2 | No test/mock modes enabled | `✅ PRE-VERIFIED` | Env audit: `MOCK_*=false` | ✅ Phase 4 |
| S3 | Rate limiting active | `✅ PRE-VERIFIED` | `DISABLE_RATE_LIMITING=false` | ✅ Phase 4 |
| S4 | Sensitive data blocking | `✅ PRE-VERIFIED` | `BLOCK_SENSITIVE_DATA=true` | ✅ Phase 4 |
| S5 | Consent required | `✅ PRE-VERIFIED` | `REQUIRE_CONSENT=true` | ✅ Phase 4 |
| S6 | Speech redaction enabled | `✅ PRE-VERIFIED` | `SPEECH_REDACTION_ENABLED=true` | ✅ Phase 4 |
| S7 | `.env` not in git | `✅ PRE-VERIFIED` | `.gitignore` includes `.env` | ✅ Phase 1 |
| S8 | No credentials in codebase | `✅ PRE-VERIFIED` | `grep` audit clean | ✅ Phase 4 |

### Security Gate Checklist

- [ ] S1: `curl -X POST http://localhost:3001/api/v2/intake/session` → 401 Unauthorized
- [ ] S2: `grep -E "MOCK_|TEST_MODE" .env` → no `true` values found
- [ ] S3: `grep DISABLE_RATE_LIMITING .env` → `false`
- [ ] S4: `grep BLOCK_SENSITIVE_DATA .env` → `true`
- [ ] S5: `grep REQUIRE_CONSENT .env` → `true`
- [ ] S6: `grep SPEECH_REDACTION_ENABLED .env` → `true`
- [ ] S7: `git ls-files .env` → empty (not tracked)
- [ ] S8: `grep -rn "password\|secret\|api_key" backend/src/ --include="*.ts" | grep -v "process.env"` → clean

### Quick Security Verification Script

```bash
echo "=== S1: Auth Enforcement ==="
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/api/v2/intake/session)
echo "POST /session without auth: $HTTP_CODE (expect 401)"

echo "=== S2: No Mock Modes ==="
grep -E "MOCK_|TEST_MODE" .env | grep -i true || echo "CLEAN: No mock modes active"

echo "=== S3-S6: Security Env Vars ==="
grep DISABLE_RATE_LIMITING .env
grep BLOCK_SENSITIVE_DATA .env
grep REQUIRE_CONSENT .env
grep SPEECH_REDACTION_ENABLED .env

echo "=== S7: .env Not in Git ==="
git ls-files .env || echo "CLEAN: .env not tracked"

echo "=== S8: No Credentials in Code ==="
CRED_COUNT=$(grep -rn "password\|secret\|api_key" backend/src/ --include="*.ts" | grep -v "process.env" | grep -v "PASSWORD_HASH" | wc -l)
echo "Credential references (excluding env): $CRED_COUNT (expect 0)"
```

**Status**: [ ] / 8 PASSED

---

## 7. Aggregate Gate Status

### Scorecard

| Gate | Required | Passed | Status |
|------|----------|--------|--------|
| 1. Blockers | 6 | [ ] | ⬜ |
| 2. Infrastructure | 10 | [ ] | ⬜ |
| 3. Governance | 8 | [ ] | ⬜ |
| 4. Clinical | 5 | [ ] | ⬜ |
| 5. DV Safety | 7 | [ ] | ⬜ |
| 6. Security | 8 | [ ] | ⬜ |
| **TOTAL** | **44** | **[ ]** | ⬜ |

### Blocking Dependencies

```
TODAY (Feb 18):
  Engineering can verify: Infra (10) + Security (8) + Blockers B1 (1) = 19 items
  Awaiting user action: B2 (create PR), B3 (branch protection) = 2 items
  
AFTER CALIBRATION SESSION:
  Clinical gate unlocks: C1-C5 = 5 items
  Governance unlocks: G3 (PM), G5 = 2 items

AFTER DV TESTING:
  DV Safety gate unlocks: D1-D7 = 7 items
  Governance unlocks: G4 (DV), G6 = 2 items

AFTER ALL APPROVALS:
  Governance unlocks: G1-G4 = 4 items (if received)
  Blockers unlocks: B6 = 1 item

ALREADY PASSED (re-verify at launch):
  G7 (scoring freeze) + G8 (guardrails) = 2 items
```

---

## 8. GO / NO-GO Decision Record

### Final Tally (Fill on Decision Day)

| Gate | Passed | Required | GO? |
|------|--------|----------|-----|
| Blockers | ___/6 | 6 | [ ] |
| Infrastructure | ___/10 | 10 | [ ] |
| Governance | ___/8 | 8 | [ ] |
| Clinical | ___/5 | 5 | [ ] |
| DV Safety | ___/7 | 7 | [ ] |
| Security | ___/8 | 8 | [ ] |
| **TOTAL** | **___/44** | **44** | [ ] |

### Decision

- [ ] **GO** — All 44 criteria met. Proceed to General Availability.
- [ ] **CONDITIONAL GO** — All criteria met except: ________________
      Proceed with documented conditions and 14-day monitoring plan.
- [ ] **NO-GO** — Failed criteria: ________________
      Address issues and schedule re-evaluation on: ________________

### Signatures

| Role | Name | Decision | Date | Signature |
|------|------|----------|------|-----------|
| Technical Lead | ________________ | ________________ | ________ | ________________ |
| Data Privacy | ________________ | ________________ | ________ | ________________ |
| Program Manager | ________________ | ________________ | ________ | ________________ |
| DV Advocate | ________________ | ________________ | ________ | ________________ |
| Engineering Lead | ________________ | ________________ | ________ | ________________ |

---

*Phase 7 GA Gate Checklist — Workstream C1*
*44 binary criteria across 6 gates*
*Generated: 2026-02-18*
