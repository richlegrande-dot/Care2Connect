/**
 * V2 Calibration Report Tests
 *
 * Tests for the clinical scoring calibration framework.
 * Validates that calibration reports are deterministic,
 * read-only, and produce correct aggregate statistics.
 */

import {
  generateCalibrationReport,
  computeMedian,
  computeMean,
  computeStdDev,
} from '../../src/intake/v2/calibration/generateCalibrationReport';
import type { CalibrationSession } from '../../src/intake/v2/calibration/calibrationTypes';

// ── Helper: Build a session with defaults ─────────────────────

function makeSession(overrides: Partial<CalibrationSession> = {}): CalibrationSession {
  return {
    totalScore: 50,
    stabilityLevel: 3,
    priorityTier: 'HIGH',
    dimensionScores: {
      housing: 15,
      safety: 10,
      vulnerability: 12,
      chronicity: 13,
    },
    overridesApplied: [],
    topContributors: [],
    ...overrides,
  };
}

// ── Helper Utility Tests ──────────────────────────────────────

describe('V2 Calibration Utilities', () => {
  describe('computeMedian', () => {
    it('returns 0 for empty array', () => {
      expect(computeMedian([])).toBe(0);
    });

    it('returns middle value for odd-length array', () => {
      expect(computeMedian([1, 3, 5])).toBe(3);
    });

    it('returns average of two middle values for even-length array', () => {
      expect(computeMedian([1, 3, 5, 7])).toBe(4);
    });

    it('handles single element', () => {
      expect(computeMedian([42])).toBe(42);
    });
  });

  describe('computeMean', () => {
    it('returns 0 for empty array', () => {
      expect(computeMean([])).toBe(0);
    });

    it('returns correct mean', () => {
      expect(computeMean([10, 20, 30])).toBe(20);
    });

    it('handles single element', () => {
      expect(computeMean([7])).toBe(7);
    });
  });

  describe('computeStdDev', () => {
    it('returns 0 for empty array', () => {
      expect(computeStdDev([], 0)).toBe(0);
    });

    it('returns 0 for uniform values', () => {
      expect(computeStdDev([5, 5, 5], 5)).toBe(0);
    });

    it('computes correct stddev', () => {
      // Values: 2, 4, 4, 4, 5, 5, 7, 9
      // Mean: 5, Variance: 4, StdDev: 2
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      const mean = 5;
      expect(computeStdDev(values, mean)).toBe(2);
    });
  });
});

// ── Empty Report Tests ────────────────────────────────────────

describe('V2 Calibration Report — Empty Input', () => {
  it('returns zeroed report for empty sessions', () => {
    const report = generateCalibrationReport([]);
    expect(report.totalSessions).toBe(0);
    expect(report.meanTotalScore).toBe(0);
    expect(report.medianTotalScore).toBe(0);
    expect(report.minTotalScore).toBe(0);
    expect(report.maxTotalScore).toBe(0);
    expect(report.stdDevTotalScore).toBe(0);
    expect(report.levelDistribution).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    expect(report.tierDistribution).toEqual({ CRITICAL: 0, HIGH: 0, MODERATE: 0, LOWER: 0 });
    expect(report.dimensionAverages).toHaveLength(4);
    expect(report.overrideFrequency).toEqual([]);
    expect(report.topContributorsByFrequency).toEqual([]);
    expect(report.tierVsLevelMatrix).toEqual([]);
  });

  it('includes version stamps even when empty', () => {
    const report = generateCalibrationReport([]);
    expect(report.policyPackVersion).toBeTruthy();
    expect(report.scoringEngineVersion).toBeTruthy();
    expect(report.generatedAt).toBeTruthy();
  });
});

// ── Single Session Tests ──────────────────────────────────────

describe('V2 Calibration Report — Single Session', () => {
  it('correctly reports a single session', () => {
    const session = makeSession({ totalScore: 75, stabilityLevel: 1, priorityTier: 'CRITICAL' });
    const report = generateCalibrationReport([session]);

    expect(report.totalSessions).toBe(1);
    expect(report.meanTotalScore).toBe(75);
    expect(report.medianTotalScore).toBe(75);
    expect(report.minTotalScore).toBe(75);
    expect(report.maxTotalScore).toBe(75);
    expect(report.levelDistribution[1]).toBe(1);
    expect(report.tierDistribution.CRITICAL).toBe(1);
  });
});

// ── Multi-Session Tests ───────────────────────────────────────

describe('V2 Calibration Report — Multiple Sessions', () => {
  const sessions: CalibrationSession[] = [
    makeSession({ totalScore: 80, stabilityLevel: 0, priorityTier: 'CRITICAL',
      dimensionScores: { housing: 22, safety: 20, vulnerability: 18, chronicity: 20 },
      overridesApplied: ['fleeing_dv_floor'], topContributors: ['unsheltered', 'fleeing_dv'] }),
    makeSession({ totalScore: 50, stabilityLevel: 3, priorityTier: 'HIGH',
      dimensionScores: { housing: 15, safety: 10, vulnerability: 12, chronicity: 13 },
      overridesApplied: [], topContributors: ['shelter', 'no_income'] }),
    makeSession({ totalScore: 20, stabilityLevel: 5, priorityTier: 'MODERATE',
      dimensionScores: { housing: 5, safety: 3, vulnerability: 7, chronicity: 5 },
      overridesApplied: [], topContributors: ['at_risk', 'no_id'] }),
    makeSession({ totalScore: 90, stabilityLevel: 0, priorityTier: 'CRITICAL',
      dimensionScores: { housing: 25, safety: 25, vulnerability: 20, chronicity: 20 },
      overridesApplied: ['fleeing_dv_floor', 'chronic_floor'], topContributors: ['unsheltered', 'fleeing_dv', 'chronic'] }),
    makeSession({ totalScore: 10, stabilityLevel: 5, priorityTier: 'LOWER',
      dimensionScores: { housing: 2, safety: 0, vulnerability: 5, chronicity: 3 },
      overridesApplied: [], topContributors: ['no_insurance'] }),
  ];

  let report: ReturnType<typeof generateCalibrationReport>;

  beforeAll(() => {
    report = generateCalibrationReport(sessions);
  });

  it('returns correct total sessions', () => {
    expect(report.totalSessions).toBe(5);
  });

  it('computes correct mean total score', () => {
    // (80 + 50 + 20 + 90 + 10) / 5 = 50
    expect(report.meanTotalScore).toBe(50);
  });

  it('computes correct median total score', () => {
    // Sorted: 10, 20, 50, 80, 90 → median = 50
    expect(report.medianTotalScore).toBe(50);
  });

  it('computes correct min and max', () => {
    expect(report.minTotalScore).toBe(10);
    expect(report.maxTotalScore).toBe(90);
  });

  it('computes correct level distribution', () => {
    expect(report.levelDistribution[0]).toBe(2);
    expect(report.levelDistribution[3]).toBe(1);
    expect(report.levelDistribution[5]).toBe(2);
    expect(report.levelDistribution[1]).toBe(0);
    expect(report.levelDistribution[2]).toBe(0);
    expect(report.levelDistribution[4]).toBe(0);
  });

  it('computes correct tier distribution', () => {
    expect(report.tierDistribution.CRITICAL).toBe(2);
    expect(report.tierDistribution.HIGH).toBe(1);
    expect(report.tierDistribution.MODERATE).toBe(1);
    expect(report.tierDistribution.LOWER).toBe(1);
  });

  it('computes dimension averages', () => {
    expect(report.dimensionAverages).toHaveLength(4);
    const housing = report.dimensionAverages.find(d => d.dimension === 'housing')!;
    // (22 + 15 + 5 + 25 + 2) / 5 = 13.8
    expect(housing.mean).toBeCloseTo(13.8, 1);
    expect(housing.min).toBe(2);
    expect(housing.max).toBe(25);
  });

  it('computes override frequency sorted by count', () => {
    expect(report.overrideFrequency.length).toBeGreaterThan(0);
    // fleeing_dv_floor appears in 2 sessions
    const dvFloor = report.overrideFrequency.find(o => o.override === 'fleeing_dv_floor');
    expect(dvFloor).toBeDefined();
    expect(dvFloor!.count).toBe(2);
    expect(dvFloor!.percentage).toBe(40);
    // chronic_floor appears in 1 session
    const chronicFloor = report.overrideFrequency.find(o => o.override === 'chronic_floor');
    expect(chronicFloor).toBeDefined();
    expect(chronicFloor!.count).toBe(1);
  });

  it('computes top contributors limited to 10', () => {
    expect(report.topContributorsByFrequency.length).toBeLessThanOrEqual(10);
    // 'unsheltered' appears in 2 sessions
    const unsheltered = report.topContributorsByFrequency.find(c => c.contributor === 'unsheltered');
    expect(unsheltered).toBeDefined();
    expect(unsheltered!.count).toBe(2);
  });

  it('sorts top contributors by count descending', () => {
    for (let i = 1; i < report.topContributorsByFrequency.length; i++) {
      expect(report.topContributorsByFrequency[i - 1].count)
        .toBeGreaterThanOrEqual(report.topContributorsByFrequency[i].count);
    }
  });

  it('computes tier vs level cross-matrix', () => {
    expect(report.tierVsLevelMatrix.length).toBeGreaterThan(0);
    // CRITICAL at Level 0 should be 2
    const critLvl0 = report.tierVsLevelMatrix.find(
      m => m.tier === 'CRITICAL' && m.level === 0
    );
    expect(critLvl0).toBeDefined();
    expect(critLvl0!.count).toBe(2);
    expect(critLvl0!.percentage).toBe(40);
  });

  it('only includes non-zero matrix cells', () => {
    for (const cell of report.tierVsLevelMatrix) {
      expect(cell.count).toBeGreaterThan(0);
    }
  });

  it('includes version stamps', () => {
    expect(report.policyPackVersion).toBeTruthy();
    expect(report.scoringEngineVersion).toBeTruthy();
    expect(report.generatedAt).toBeTruthy();
  });
});

// ── Determinism Tests ─────────────────────────────────────────

describe('V2 Calibration Report — Determinism', () => {
  it('same input produces same output (excluding timestamp)', () => {
    const sessions = [
      makeSession({ totalScore: 60, stabilityLevel: 2, priorityTier: 'HIGH' }),
      makeSession({ totalScore: 40, stabilityLevel: 4, priorityTier: 'MODERATE' }),
    ];
    const r1 = generateCalibrationReport(sessions);
    const r2 = generateCalibrationReport(sessions);

    expect(r1.totalSessions).toBe(r2.totalSessions);
    expect(r1.meanTotalScore).toBe(r2.meanTotalScore);
    expect(r1.medianTotalScore).toBe(r2.medianTotalScore);
    expect(r1.levelDistribution).toEqual(r2.levelDistribution);
    expect(r1.tierDistribution).toEqual(r2.tierDistribution);
    expect(r1.dimensionAverages).toEqual(r2.dimensionAverages);
    expect(r1.overrideFrequency).toEqual(r2.overrideFrequency);
    expect(r1.topContributorsByFrequency).toEqual(r2.topContributorsByFrequency);
    expect(r1.tierVsLevelMatrix).toEqual(r2.tierVsLevelMatrix);
  });
});

// ── No Mutation Tests ─────────────────────────────────────────

describe('V2 Calibration Report — No Mutation', () => {
  it('does not modify input sessions', () => {
    const sessions = [
      makeSession({ totalScore: 50, overridesApplied: ['fleeing_dv_floor'], topContributors: ['unsheltered'] }),
    ];
    const before = JSON.stringify(sessions);
    generateCalibrationReport(sessions);
    const after = JSON.stringify(sessions);
    expect(after).toBe(before);
  });
});
