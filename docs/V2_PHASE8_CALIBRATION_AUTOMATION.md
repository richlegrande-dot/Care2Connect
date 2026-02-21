# V2 Phase 8 — Calibration Evidence Automation

> **Created**: Phase 8F
> **Scripts**: `scripts/ga/score_persona_cards.ts`, `scripts/ga/run_calibration_snapshot.ts`

---

## Quick Start

```bash
# Score 5 representative personas through the V2 engine
npx tsx scripts/ga/score_persona_cards.ts

# Generate full calibration snapshot (JSON + Markdown)
npx tsx scripts/ga/run_calibration_snapshot.ts

# Output results to specific directory
npx tsx scripts/ga/score_persona_cards.ts --output outreach/generated/personas.json
npx tsx scripts/ga/run_calibration_snapshot.ts --output outreach/generated/calibration
```

---

## Persona Cards

| ID | Name | Expected Tier | Description |
|----|------|---------------|-------------|
| maria-dv | Maria — DV Survivor | CRITICAL | Fleeing DV, 2 children, unsheltered, protective order |
| james-stable | James — Stable | LOWER | Employed, housed supported, minimal needs |
| robert-veteran | Robert — Veteran | CRITICAL | Chronic homelessness (48mo), 6+ ER visits, 3+ conditions |
| youth-aging-out | Youth — Aging Out | HIGH | 19yo, foster care exit, couch surfing, no income |
| moderate-needs | Sandra — Moderate | MODERATE | Recently evicted, transitional, part-time income |

## Calibration Report Contents

The snapshot generates:

1. **calibration_report.json** — Full statistics:
   - Mean/median/stddev of total scores
   - Tier and level distributions
   - Per-dimension averages (housing, safety, vulnerability, chronicity)
   - Override frequency counts
   - Top scoring contributors by frequency
   - Tier vs Level cross-matrix

2. **calibration_summary.md** — Human-readable Markdown:
   - Tables for all distributions
   - Clinical review checklist
   - Population mix validation points

## Clinical Review Workflow

1. Run persona cards to verify expected tier assignments
2. Generate calibration snapshot
3. Review `calibration_summary.md` with clinical stakeholders
4. Document any scoring concerns in the calibration meeting
5. If adjustments needed, update `DEFAULT_POLICY_PACK` (requires clinical sign-off)

## Guardrails

- Scripts are **read-only** — they import but never modify scoring constants
- All scoring is deterministic — same personas always produce same scores
- No network calls, no database access, no API dependencies
- Output goes to `outreach/generated/` (gitignored)
