/**
 * V2 Scoring Engine — Unit Tests
 *
 * Tests computeScores() for deterministic correctness:
 *   - Dimension scoring rules
 *   - Level placement waterfall
 *   - Override floors (DV, veteran, chronic, minor)
 *   - Edge cases (empty input, max scores, boundary values)
 */

import { computeScores, type IntakeData } from '../../src/intake/v2/scoring/computeScores';

describe('V2 Scoring Engine', () => {
  describe('Empty / minimal input', () => {
    it('returns Level 5 (Self-Sufficient) with total score 0', () => {
      const result = computeScores({});
      expect(result.stabilityLevel).toBe(5);
      expect(result.priorityTier).toBe('LOWER');
      expect(result.totalScore).toBe(0);
    });
  });

  describe('Housing dimension', () => {
    it('scores unsheltered with full risk factors as 20', () => {
      const data: IntakeData = {
        housing: {
          current_living_situation: 'unsheltered',
          at_risk_of_losing: true,
          can_return_to_previous: false,
          how_long_current: 'over_1_year',
        },
      };
      const result = computeScores(data);
      // 10 (unsheltered) + 5 (at risk) + 2 (can't return) + 3 (>1yr) = 20
      expect(result.dimensions.housing_stability.score).toBe(20);
      expect(result.stabilityLevel).toBeLessThanOrEqual(1);
    });
  });

  describe('Override floors', () => {
    it('fleeing DV → Level 0 + CRITICAL tier', () => {
      const data: IntakeData = {
        housing: { current_living_situation: 'permanent_housing' },
        safety: { fleeing_dv: true },
      };
      const result = computeScores(data);
      expect(result.stabilityLevel).toBe(0);
      expect(result.overridesApplied.some(o => o.includes('fleeing_dv'))).toBe(true);
      expect(result.priorityTier).toBe('CRITICAL');
    });

    it('fleeing trafficking → Level 0', () => {
      const result = computeScores({ safety: { fleeing_trafficking: true } });
      expect(result.stabilityLevel).toBe(0);
    });

    it('chronic homeless → floor Level 1', () => {
      const data: IntakeData = {
        housing: { current_living_situation: 'permanent_housing' },
        history: { currently_chronic: true },
      };
      const result = computeScores(data);
      expect(result.stabilityLevel).toBeLessThanOrEqual(1);
    });

    it('veteran + unsheltered → floor Level 1', () => {
      const data: IntakeData = {
        demographics: { veteran_status: true },
        housing: { current_living_situation: 'unsheltered' },
      };
      const result = computeScores(data);
      expect(result.stabilityLevel).toBeLessThanOrEqual(1);
    });
  });

  describe('Waterfall placement', () => {
    it('safety score ≥ 20 → Level 0', () => {
      const data: IntakeData = {
        safety: {
          fleeing_dv: true,                     // 10
          suicidal_ideation_recent: true,        // 8
          experienced_violence_recently: true,   // 5
        },
      };
      const result = computeScores(data);
      expect(result.stabilityLevel).toBe(0);
      expect(result.dimensions.safety_crisis.score).toBeGreaterThanOrEqual(20);
    });

    it('moderate situation → Level 3 or 4', () => {
      const data: IntakeData = {
        housing: {
          current_living_situation: 'staying_with_others',  // 5
          at_risk_of_losing: true,                          // 5
        },
        safety: {
          substance_use_current: 'regular',     // 3
          mental_health_current: 'moderate_concerns', // 2
        },
        health: {
          chronic_conditions: ['diabetes'],      // 3
          has_health_insurance: false,            // 2
        },
        history: { total_homeless_episodes: 2 }, // 3
        income: { has_any_income: false, has_valid_id: false }, // 4
      };
      const result = computeScores(data);
      expect(result.stabilityLevel).toBeGreaterThanOrEqual(3);
      expect(result.stabilityLevel).toBeLessThanOrEqual(4);
    });
  });

  describe('Dimension caps', () => {
    it('caps all dimensions at 25 and total at 100', () => {
      const data: IntakeData = {
        housing: {
          current_living_situation: 'unsheltered',
          at_risk_of_losing: true,
          eviction_notice: true,
          how_long_current: 'over_1_year',
          can_return_to_previous: false,
        },
        safety: {
          fleeing_dv: true,
          fleeing_trafficking: true,
          suicidal_ideation_recent: true,
          experienced_violence_recently: true,
          feels_safe_current_location: 'no',
          mental_health_current: 'severe_crisis',
          substance_use_current: 'regular',
          has_protective_order: true,
        },
        health: {
          chronic_conditions: ['diabetes', 'heart_disease', 'hiv_aids'],
          currently_pregnant: true,
          needs_immediate_medical: true,
          needs_medication: true,
          has_access_to_medication: false,
          self_care_difficulty: 'unable_without_help',
          has_health_insurance: false,
          last_medical_visit: 'never',
        },
        demographics: {
          has_dependents: true,
          dependent_ages: [5, 8],
          date_of_birth: '2005-01-01',
        },
        history: {
          currently_chronic: true,
          total_homeless_episodes: 6,
          total_homeless_months: 36,
          emergency_services_use: '6_plus_times',
          incarceration_recent: true,
          institutional_history: ['foster_care', 'jail_prison', 'psychiatric_facility'],
        },
        income: { has_any_income: false, has_valid_id: false },
      };
      const result = computeScores(data);
      expect(result.dimensions.housing_stability.score).toBe(25);
      expect(result.dimensions.safety_crisis.score).toBe(25);
      expect(result.dimensions.vulnerability_health.score).toBe(25);
      expect(result.dimensions.chronicity_system.score).toBe(25);
      expect(result.totalScore).toBe(100);
      expect(result.stabilityLevel).toBe(0);
      expect(result.priorityTier).toBe('CRITICAL');
    });
  });

  describe('Determinism', () => {
    it('same input always produces same output', () => {
      const data: IntakeData = {
        housing: { current_living_situation: 'emergency_shelter', at_risk_of_losing: true },
        safety: { mental_health_current: 'moderate_concerns' },
        health: { has_health_insurance: false },
        income: { has_any_income: false },
      };
      const r1 = computeScores(data);
      const r2 = computeScores(data);
      expect(r1.totalScore).toBe(r2.totalScore);
      expect(r1.stabilityLevel).toBe(r2.stabilityLevel);
      expect(r1.priorityTier).toBe(r2.priorityTier);
    });
  });

  describe('Contributor traceability', () => {
    it('tracks individual signal contributions', () => {
      const result = computeScores({ housing: { current_living_situation: 'unsheltered' } });
      const contribs = result.dimensions.housing_stability.contributors;
      expect(contribs.length).toBeGreaterThan(0);
      const livingSituation = contribs.find(c => c.signal === 'current_living_situation');
      expect(livingSituation).toBeDefined();
      expect(livingSituation!.points).toBe(10);
    });
  });

  describe('Priority tier thresholds', () => {
    it('score 0 → LOWER tier', () => {
      expect(computeScores({}).priorityTier).toBe('LOWER');
    });
  });
});
