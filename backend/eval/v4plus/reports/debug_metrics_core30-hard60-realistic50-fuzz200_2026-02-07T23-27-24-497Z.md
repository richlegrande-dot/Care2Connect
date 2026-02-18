# Debug Metrics Report (core30, hard60, realistic50, fuzz200)

Timestamp: 2026-02-07T23:27:24.501Z

## Totals
- Cases: 340
- Category wrong: 37
- Urgency over: 21
- Urgency under: 44
- Name wrong: 12
- Amount missing: 13
- Amount wrong selection: 12
- Amount outside tolerance: 7
- Amount unexpected: 1

## By Dataset
- core30: category 0, urgencyOver 0, urgencyUnder 0, name 0, amountMissing 0, amountWrongSel 0, amountOutsideTol 2
- hard60: category 14, urgencyOver 0, urgencyUnder 1, name 7, amountMissing 1, amountWrongSel 10, amountOutsideTol 1
- realistic50: category 9, urgencyOver 0, urgencyUnder 0, name 0, amountMissing 2, amountWrongSel 0, amountOutsideTol 0
- fuzz200: category 14, urgencyOver 21, urgencyUnder 43, name 5, amountMissing 10, amountWrongSel 2, amountOutsideTol 4

## Top Cases (Sample)

### Category Wrong
- HARD_004 (hard60): EMPLOYMENT → TRANSPORTATION
- HARD_010 (hard60): HOUSING → FOOD
- HARD_021 (hard60): EMERGENCY → HOUSING
- HARD_027 (hard60): SAFETY → HOUSING
- HARD_030 (hard60): FAMILY → FOOD
- HARD_035 (hard60): TRANSPORTATION → HOUSING
- HARD_037 (hard60): HOUSING → EMPLOYMENT
- HARD_038 (hard60): HEALTHCARE → LEGAL
- HARD_040 (hard60): HOUSING → FOOD
- HARD_041 (hard60): HOUSING → HEALTHCARE

### Urgency Over
- FUZZ_009 (fuzz200): CRITICAL → HIGH (gap 1)
- FUZZ_021 (fuzz200): CRITICAL → HIGH (gap 1)
- FUZZ_033 (fuzz200): CRITICAL → HIGH (gap 1)
- FUZZ_034 (fuzz200): CRITICAL → HIGH (gap 1)
- FUZZ_045 (fuzz200): CRITICAL → HIGH (gap 1)
- FUZZ_055 (fuzz200): HIGH → MEDIUM (gap 1)
- FUZZ_057 (fuzz200): CRITICAL → HIGH (gap 1)
- FUZZ_069 (fuzz200): CRITICAL → HIGH (gap 1)
- FUZZ_070 (fuzz200): CRITICAL → HIGH (gap 1)
- FUZZ_081 (fuzz200): CRITICAL → HIGH (gap 1)

### Urgency Under
- HARD_043 (hard60): MEDIUM → HIGH (gap 1)
- FUZZ_003 (fuzz200): MEDIUM → HIGH (gap 1)
- FUZZ_006 (fuzz200): MEDIUM → HIGH (gap 1)
- FUZZ_011 (fuzz200): MEDIUM → HIGH (gap 1)
- FUZZ_018 (fuzz200): MEDIUM → HIGH (gap 1)
- FUZZ_023 (fuzz200): MEDIUM → HIGH (gap 1)
- FUZZ_030 (fuzz200): MEDIUM → HIGH (gap 1)
- FUZZ_035 (fuzz200): MEDIUM → HIGH (gap 1)
- FUZZ_042 (fuzz200): MEDIUM → HIGH (gap 1)
- FUZZ_047 (fuzz200): MEDIUM → HIGH (gap 1)

### Amount Wrong Selection
- HARD_001 (hard60): 3200 → 900
- HARD_003 (hard60): 150 → 2900
- HARD_006 (hard60): 1650 → 7400
- HARD_008 (hard60): 4200 → 1500
- HARD_010 (hard60): 950 → 450
- HARD_011 (hard60): 2000 → 3000
- HARD_013 (hard60): 2400 → 1600
- HARD_014 (hard60): 750 → 450
- HARD_020 (hard60): 2250 → 900
- HARD_024 (hard60): 2 → 450