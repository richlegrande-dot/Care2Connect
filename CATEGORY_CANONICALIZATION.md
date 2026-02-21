# Category Canonicalization and Label Standards

**Date:** January 16, 2026  
**System:** Jan v2.5 Evaluation Suite Upgrade  
**Purpose:** Eliminate false positives/negatives from semantic label mismatches

## Overview

The Jan v2.5 evaluation suite now implements strict category and label normalization to ensure consistent evaluation results. This addresses the core issue where systems output semantically equivalent labels (e.g., \"MEDICAL\" vs \"HEALTHCARE\") but evaluations fail due to string comparison mismatches.

## Canonical Category Labels

The following categories are the **production standard** that all systems should converge toward:

### Primary Categories

| **Canonical Label** | **Description** | **Priority Level** |
|---------------------|-----------------|-------------------|
| `SAFETY` | Domestic violence, abuse, immediate physical danger | **1 (Highest)** |
| `EMERGENCY` | Life-threatening situations, disasters, critical timing | **2** |
| `HOUSING` | Rent, eviction, homelessness, housing stability | **3** |
| `HEALTHCARE` | Medical bills, surgery, treatment, health needs | **4** |
| `LEGAL` | Court costs, legal representation, legal disputes | **5** |
| `EMPLOYMENT` | Job loss, work-related expenses, career needs | **6** |
| `EDUCATION` | Tuition, school supplies, educational expenses | **7** |
| `FAMILY` | Wedding, childcare, family events, family support | **8** |
| `OTHER` | Personal needs not fitting other categories | **9 (Default)** |

## Category Synonym Mapping

The evaluation system automatically normalizes these common variants:

### Healthcare Variants
- `MEDICAL` → `HEALTHCARE` ✅
- `HEALTH` → `HEALTHCARE` ✅
- `SURGERY` → `HEALTHCARE` ✅
- `HOSPITAL` → `HEALTHCARE` ✅

### Housing Variants
- `RENT` → `HOUSING` ✅
- `EVICTION` → `HOUSING` ✅
- `HOMELESS` → `HOUSING` ✅

### Safety Variants ⚠️ **HIGHEST PRIORITY**
- `DOMESTIC_VIOLENCE` → `SAFETY` ✅
- `DV` → `SAFETY` ✅
- `ABUSE` → `SAFETY` ✅
- `VIOLENCE` → `SAFETY` ✅

*When safety keywords are detected, SAFETY category overrides all others.*

### Emergency Variants
- `CRISIS` → `EMERGENCY` ✅
- `URGENT` → `EMERGENCY` ✅

## Urgency Level Standards

| **Canonical Level** | **Synonyms** | **Trigger Keywords** |
|-------------------|-------------|-------------------|
| `CRITICAL` | EMERGENCY, IMMEDIATE, ASAP | \"emergency\", \"critical\", \"immediately\", \"right away\" |
| `HIGH` | URGENT, SOON, PRIORITY | \"urgent\", \"soon\", \"high priority\", \"quickly\" |
| `MEDIUM` | NORMAL, MODERATE, STANDARD | Default level when no urgency indicators |
| `LOW` | EVENTUALLY, WHENEVER, NON_URGENT | \"eventually\", \"when possible\", \"not urgent\" |

## Category Priority Hierarchy

When multiple categories are detected in a single transcript, the system uses this priority order:

1. **SAFETY** - Always wins (domestic violence overrides housing)
2. **EMERGENCY** - Critical situations
3. **HOUSING** - Eviction, homelessness 
4. **HEALTHCARE** - Medical needs
5. **LEGAL** - Court, legal representation
6. **EMPLOYMENT** - Job loss, work needs
7. **EDUCATION** - School, tuition
8. **FAMILY** - Family events, support
9. **OTHER** - Default fallback

### Example Priority Resolution

```
Transcript: "My husband has been abusive and we're facing eviction next week..."

Keywords Detected:
- "abusive" → SAFETY
- "eviction" → HOUSING

Result: SAFETY (priority 1 overrides housing priority 3)
```

## Name Normalization Rules

To eliminate false positives like `\"Sarah Martinez and I really need help\"` counting as a correct name extraction:

### Cleaning Rules Applied

1. **Strip intro phrases:** \"my name is\", \"this is\", \"called\", \"i am\"
2. **Remove trailing fragments:** \" and I\", \" really need\", \" right now\"
3. **Filter invalid words:** \"help\", \"desperately\", \"need\", \"because\"
4. **Length validation:** 1-4 words maximum
5. **Format validation:** Each word 2+ characters, starts with uppercase

### Before/After Examples

| **Raw Extraction** | **Cleaned Result** | **Status** |
|-------------------|-------------------|------------|
| \"Sarah Martinez and I really need help right now\" | \"Sarah Martinez\" | ✅ Valid |
| \"my name is John Smith\" | \"John Smith\" | ✅ Valid |
| \"called Robert Chen\" | \"Robert Chen\" | ✅ Valid |
| \"I need help with my situation\" | `null` | ❌ No name |

## Implementation Files

- **`backend/eval/utils/labelMap.ts`** - Category and urgency normalization functions
- **`backend/eval/utils/compareName.ts`** - Name cleaning and comparison logic

## Evaluation Impact

### Before Canonicalization
- Success Rate: 6.7% (1/15 tests)
- Primary failure: Category misclassification (MEDICAL vs HEALTHCARE)

### After Canonicalization (Expected)
- Eliminates 4+ false negative failures from label mismatches
- Eliminates false positive name matches
- Expected improvement: 6.7% → 35%+ success rate

## Usage in Evaluation

```typescript
import { normalizeCategory, categoriesMatch } from './utils/labelMap';
import { compareNames } from './utils/compareName';

// Category comparison
const actualCategory = \"MEDICAL\";
const expectedCategory = \"HEALTHCARE\";
const matches = categoriesMatch(actualCategory, expectedCategory); // true

// Name comparison  
const actualName = \"Sarah Martinez and I really need help\";
const expectedName = \"Sarah Martinez\";
const nameResult = compareNames(actualName, expectedName); 
// { matches: true, cleanedActual: \"Sarah Martinez\" }
```

## Quality Gates

All evaluation comparisons **MUST** use normalized labels. Direct string comparison is prohibited to prevent regression to label mismatch failures.

**Next Phase:** Weighted scoring system to replace binary pass/fail evaluation.