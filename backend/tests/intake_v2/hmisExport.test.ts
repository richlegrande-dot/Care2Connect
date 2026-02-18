/**
 * HMIS Export — Unit Tests
 *
 * Tests buildHMISRecord(), buildHMISExport(), hmisToCSV() for:
 *   - Field mapping from V2 intake data to HMIS CSV 2024 format
 *   - DV-safe mode field nullification
 *   - CSV generation correctness
 *   - Edge cases (missing data, unknown enums)
 */

import {
  buildHMISRecord,
  buildHMISExport,
  hmisToCSV,
  type SessionData,
} from '../../src/intake/v2/exports/hmisExport';

function makeSession(overrides: Partial<SessionData> = {}): SessionData {
  return {
    id: 'session-001',
    modules: {
      demographics: {
        first_name: 'Jane',
        last_name: 'Doe',
        date_of_birth: '1990-05-15',
        gender: 'female',
        race_ethnicity: 'black_african_american',
        veteran_status: false,
      },
      housing: {
        current_living_situation: 'unsheltered',
      },
      safety: {
        fleeing_dv: true,
      },
      health: {
        chronic_conditions: ['diabetes', 'asthma'],
      },
    },
    dvSafeMode: false,
    totalScore: 72,
    priorityTier: 'CRITICAL',
    createdAt: new Date('2026-01-15T10:00:00Z'),
    completedAt: new Date('2026-01-15T10:30:00Z'),
    ...overrides,
  };
}

describe('HMIS Export', () => {
  describe('buildHMISRecord', () => {
    it('maps demographic fields correctly', () => {
      const record = buildHMISRecord(makeSession());
      expect(record.PersonalID).toBe('session-001');
      expect(record.FirstName).toBe('Jane');
      expect(record.LastName).toBe('Doe');
      expect(record.DOB).toBe('1990-05-15');
      expect(record.Gender).toBe(0); // female
      expect(record.RaceEthnicity).toBe(3); // black_african_american
      expect(record.VeteranStatus).toBe(0); // false → 0
    });

    it('maps housing and safety fields', () => {
      const record = buildHMISRecord(makeSession());
      expect(record.LivingSituation).toBe(116); // unsheltered
      expect(record.DomesticViolenceVictim).toBe(1); // true → 1
      expect(record.DisablingCondition).toBe(1); // has chronic conditions
    });

    it('maps score fields', () => {
      const record = buildHMISRecord(makeSession());
      expect(record.CEAssessmentScore).toBe(72);
      expect(record.PriorityTier).toBe('CRITICAL');
      expect(record.DateOfIntake).toBe('2026-01-15');
    });

    it('nullifies location and name in DV-safe mode', () => {
      const record = buildHMISRecord(makeSession({ dvSafeMode: true }));
      expect(record.FirstName).toBeNull();
      expect(record.LastName).toBeNull();
      expect(record.LivingSituation).toBeNull();
      // Non-location fields should still be present
      expect(record.DOB).toBe('1990-05-15');
      expect(record.Gender).toBe(0);
    });

    it('handles missing demographics gracefully', () => {
      const record = buildHMISRecord(makeSession({ modules: {} }));
      expect(record.FirstName).toBeNull();
      expect(record.LastName).toBeNull();
      expect(record.DOB).toBeNull();
      expect(record.Gender).toBeNull();
      expect(record.VeteranStatus).toBeNull();
      expect(record.LivingSituation).toBeNull();
    });

    it('maps veteran_status true → 1', () => {
      const session = makeSession();
      (session.modules.demographics as any).veteran_status = true;
      const record = buildHMISRecord(session);
      expect(record.VeteranStatus).toBe(1);
    });

    it('maps no DV status → 99', () => {
      const session = makeSession();
      delete (session.modules.safety as any).fleeing_dv;
      const record = buildHMISRecord(session);
      expect(record.DomesticViolenceVictim).toBe(99);
    });

    it('maps empty chronic_conditions → DisablingCondition 0', () => {
      const session = makeSession();
      (session.modules.health as any).chronic_conditions = [];
      const record = buildHMISRecord(session);
      expect(record.DisablingCondition).toBe(0);
    });

    it('maps shelter living situation → 101', () => {
      const session = makeSession();
      (session.modules.housing as any).current_living_situation = 'shelter';
      const record = buildHMISRecord(session);
      expect(record.LivingSituation).toBe(101);
    });

    it('maps unknown living situation → 99', () => {
      const session = makeSession();
      (session.modules.housing as any).current_living_situation = 'alien_spaceship';
      const record = buildHMISRecord(session);
      expect(record.LivingSituation).toBe(99);
    });
  });

  describe('buildHMISExport', () => {
    it('builds export with correct format', () => {
      const exp = buildHMISExport([makeSession()]);
      expect(exp.format).toBe('HMIS_CSV_2024');
      expect(exp.recordCount).toBe(1);
      expect(exp.dvSafeMode).toBe(false);
      expect(exp.records).toHaveLength(1);
      expect(typeof exp.generatedAt).toBe('string');
    });

    it('sets dvSafeMode true if any session is dv-safe', () => {
      const exp = buildHMISExport([
        makeSession({ id: 's1', dvSafeMode: false }),
        makeSession({ id: 's2', dvSafeMode: true }),
      ]);
      expect(exp.dvSafeMode).toBe(true);
      expect(exp.recordCount).toBe(2);
    });

    it('handles empty sessions array', () => {
      const exp = buildHMISExport([]);
      expect(exp.recordCount).toBe(0);
      expect(exp.records).toHaveLength(0);
    });
  });

  describe('hmisToCSV', () => {
    it('generates valid CSV with headers', () => {
      const exp = buildHMISExport([makeSession()]);
      const csv = hmisToCSV(exp);
      const lines = csv.split('\n');
      expect(lines[0]).toBe('PersonalID,FirstName,LastName,DOB,Gender,RaceEthnicity,VeteranStatus,LivingSituation,DomesticViolenceVictim,DisablingCondition,DateOfIntake,CEAssessmentScore,PriorityTier');
      expect(lines.length).toBe(2); // header + 1 record
      expect(lines[1]).toContain('session-001');
      expect(lines[1]).toContain('Jane');
    });

    it('handles null values as empty string in CSV', () => {
      const exp = buildHMISExport([makeSession({ dvSafeMode: true })]);
      const csv = hmisToCSV(exp);
      const lines = csv.split('\n');
      const fields = lines[1].split(',');
      // FirstName is null → should be empty
      expect(fields[1]).toBe('');
      // LastName is null → should be empty
      expect(fields[2]).toBe('');
    });

    it('escapes commas in values', () => {
      const session = makeSession();
      (session.modules.demographics as any).first_name = 'Jane,Marie';
      const exp = buildHMISExport([session]);
      const csv = hmisToCSV(exp);
      expect(csv).toContain('"Jane,Marie"');
    });
  });
});
