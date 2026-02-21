/**
 * Fairness & Audit Monitoring — Unit Tests
 *
 * Tests:
 *   - Audit event recording and filtering
 *   - Fairness analysis — group distribution computation
 *   - Bias detection threshold
 *   - Edge cases (empty data, single group, unknown demographics)
 */

import {
  recordAuditEvent,
  getAuditEvents,
  clearAuditLog,
  analyzeFairness,
  runFullFairnessAnalysis,
  type CompletedSessionSummary,
} from '../../src/intake/v2/audit/fairnessMonitor';

describe('Audit Trail', () => {
  beforeEach(() => {
    clearAuditLog();
  });

  it('records an audit event', () => {
    const event = recordAuditEvent('INTAKE_STARTED', 'sess-1', { modulesLoaded: 8 });
    expect(event.eventType).toBe('INTAKE_STARTED');
    expect(event.sessionId).toBe('sess-1');
    expect(event.data.modulesLoaded).toBe(8);
    expect(typeof event.timestamp).toBe('string');
  });

  it('retrieves all events', () => {
    recordAuditEvent('INTAKE_STARTED', 'sess-1');
    recordAuditEvent('MODULE_COMPLETED', 'sess-1', { moduleId: 'consent' });
    recordAuditEvent('SCORE_COMPUTED', 'sess-1', { totalScore: 55 });

    const events = getAuditEvents();
    expect(events).toHaveLength(3);
  });

  it('filters by event type', () => {
    recordAuditEvent('INTAKE_STARTED', 'sess-1');
    recordAuditEvent('MODULE_COMPLETED', 'sess-1');
    recordAuditEvent('INTAKE_STARTED', 'sess-2');

    const started = getAuditEvents({ eventType: 'INTAKE_STARTED' });
    expect(started).toHaveLength(2);
  });

  it('filters by session ID', () => {
    recordAuditEvent('INTAKE_STARTED', 'sess-1');
    recordAuditEvent('INTAKE_STARTED', 'sess-2');
    recordAuditEvent('MODULE_COMPLETED', 'sess-1');

    const sess1Events = getAuditEvents({ sessionId: 'sess-1' });
    expect(sess1Events).toHaveLength(2);
  });

  it('clearAuditLog removes all events', () => {
    recordAuditEvent('INTAKE_STARTED', 'sess-1');
    recordAuditEvent('INTAKE_STARTED', 'sess-2');
    clearAuditLog();
    expect(getAuditEvents()).toHaveLength(0);
  });
});

describe('Fairness Analysis', () => {
  const baseSessions: CompletedSessionSummary[] = [
    { demographics: { race_ethnicity: 'white', gender: 'male', veteran_status: false }, totalScore: 40, priorityTier: 'MODERATE' },
    { demographics: { race_ethnicity: 'white', gender: 'female', veteran_status: false }, totalScore: 45, priorityTier: 'HIGH' },
    { demographics: { race_ethnicity: 'black_african_american', gender: 'male', veteran_status: true }, totalScore: 50, priorityTier: 'HIGH' },
    { demographics: { race_ethnicity: 'black_african_american', gender: 'female', veteran_status: false }, totalScore: 55, priorityTier: 'HIGH' },
    { demographics: { race_ethnicity: 'hispanic_latinx', gender: 'female', veteran_status: false }, totalScore: 42, priorityTier: 'MODERATE' },
    { demographics: { race_ethnicity: 'hispanic_latinx', gender: 'male', veteran_status: true }, totalScore: 48, priorityTier: 'HIGH' },
  ];

  describe('analyzeFairness', () => {
    it('computes group distributions by race_ethnicity', () => {
      const report = analyzeFairness(baseSessions, 'race_ethnicity');
      expect(report.dimension).toBe('race_ethnicity');
      expect(report.totalSessions).toBe(6);
      expect(report.groups.length).toBe(3); // white, black, hispanic
    });

    it('computes correct mean scores per group', () => {
      const report = analyzeFairness(baseSessions, 'race_ethnicity');
      const whiteGroup = report.groups.find(g => g.groupValue === 'white');
      expect(whiteGroup).toBeDefined();
      expect(whiteGroup!.meanScore).toBe(42.5); // (40+45)/2
      expect(whiteGroup!.count).toBe(2);
    });

    it('computes overall mean score', () => {
      const report = analyzeFairness(baseSessions, 'race_ethnicity');
      // (40+45+50+55+42+48)/6 = 280/6 ≈ 46.67
      expect(report.overallMeanScore).toBeCloseTo(46.67, 1);
    });

    it('does not flag bias when scores are similar', () => {
      const report = analyzeFairness(baseSessions, 'race_ethnicity');
      expect(report.potentialBiasDetected).toBe(false);
    });

    it('flags bias when one group deviates > 10 points', () => {
      const biasedSessions: CompletedSessionSummary[] = [
        { demographics: { race_ethnicity: 'group_a' }, totalScore: 30, priorityTier: 'MODERATE' },
        { demographics: { race_ethnicity: 'group_a' }, totalScore: 32, priorityTier: 'MODERATE' },
        { demographics: { race_ethnicity: 'group_b' }, totalScore: 70, priorityTier: 'CRITICAL' },
        { demographics: { race_ethnicity: 'group_b' }, totalScore: 68, priorityTier: 'CRITICAL' },
      ];
      const report = analyzeFairness(biasedSessions, 'race_ethnicity');
      expect(report.potentialBiasDetected).toBe(true);
      expect(report.maxGroupDeviation).toBeGreaterThan(10);
    });

    it('computes tier distributions', () => {
      const report = analyzeFairness(baseSessions, 'race_ethnicity');
      const whiteGroup = report.groups.find(g => g.groupValue === 'white');
      expect(whiteGroup!.tierDistribution).toEqual({ MODERATE: 1, HIGH: 1 });
    });

    it('handles dimension with missing values → "unknown" group', () => {
      const sessions: CompletedSessionSummary[] = [
        { demographics: { gender: 'male' }, totalScore: 50, priorityTier: 'HIGH' },
        { demographics: {}, totalScore: 40, priorityTier: 'MODERATE' },
      ];
      const report = analyzeFairness(sessions, 'gender');
      const unknown = report.groups.find(g => g.groupValue === 'unknown');
      expect(unknown).toBeDefined();
      expect(unknown!.count).toBe(1);
    });

    it('handles empty sessions array', () => {
      const report = analyzeFairness([], 'race_ethnicity');
      expect(report.totalSessions).toBe(0);
      expect(report.groups).toHaveLength(0);
      expect(report.overallMeanScore).toBe(0);
      expect(report.potentialBiasDetected).toBe(false);
    });

    it('computes median correctly for odd count', () => {
      const sessions: CompletedSessionSummary[] = [
        { demographics: { gender: 'female' }, totalScore: 10, priorityTier: 'LOWER' },
        { demographics: { gender: 'female' }, totalScore: 30, priorityTier: 'MODERATE' },
        { demographics: { gender: 'female' }, totalScore: 50, priorityTier: 'HIGH' },
      ];
      const report = analyzeFairness(sessions, 'gender');
      expect(report.groups[0].medianScore).toBe(30);
    });

    it('computes median correctly for even count', () => {
      const sessions: CompletedSessionSummary[] = [
        { demographics: { gender: 'male' }, totalScore: 20, priorityTier: 'MODERATE' },
        { demographics: { gender: 'male' }, totalScore: 40, priorityTier: 'MODERATE' },
      ];
      const report = analyzeFairness(sessions, 'gender');
      expect(report.groups[0].medianScore).toBe(30);
    });
  });

  describe('runFullFairnessAnalysis', () => {
    it('returns reports for all 3 dimensions', () => {
      const reports = runFullFairnessAnalysis(baseSessions);
      expect(reports).toHaveLength(3);
      expect(reports.map(r => r.dimension)).toEqual(['race_ethnicity', 'gender', 'veteran_status']);
    });

    it('each report has correct session count', () => {
      const reports = runFullFairnessAnalysis(baseSessions);
      for (const report of reports) {
        expect(report.totalSessions).toBe(6);
      }
    });
  });
});
