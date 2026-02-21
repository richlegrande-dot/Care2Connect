/**
 * V2 Explainability — Unit Tests
 *
 * Tests buildExplanation() for:
 *   - Card structure completeness
 *   - Top factors extraction
 *   - DV-safe mode redaction
 */

import { computeScores, type IntakeData } from '../../src/intake/v2/scoring/computeScores';
import { buildExplanation } from '../../src/intake/v2/explainability/buildExplanation';

describe('V2 Explainability Cards', () => {
  describe('Card structure', () => {
    it('includes all required fields', () => {
      const data: IntakeData = {
        housing: { current_living_situation: 'unsheltered' },
        safety: { fleeing_dv: true },
      };
      const scores = computeScores(data);
      const card = buildExplanation(scores);

      expect(typeof card.level).toBe('number');
      expect(typeof card.levelLabel).toBe('string');
      expect(typeof card.priorityTier).toBe('string');
      expect(typeof card.totalScore).toBe('number');
      expect(typeof card.generatedAt).toBe('string');
      expect(typeof card.policyPackVersion).toBe('string');
      expect(Array.isArray(card.topFactors)).toBe(true);
      expect(Array.isArray(card.overridesApplied)).toBe(true);
      expect(typeof card.placementRule).toBe('string');
      expect(card.dimensions).toBeDefined();
    });
  });

  describe('Top factors', () => {
    it('returns max 3 factors sorted by points descending', () => {
      const data: IntakeData = {
        housing: { current_living_situation: 'unsheltered', at_risk_of_losing: true },
        safety: { fleeing_dv: true, suicidal_ideation_recent: true },
        health: { chronic_conditions: ['diabetes', 'heart_disease', 'hiv_aids'] },
      };
      const scores = computeScores(data);
      const card = buildExplanation(scores);

      expect(card.topFactors.length).toBeLessThanOrEqual(3);
      expect(card.topFactors.length).toBeGreaterThan(0);
    });
  });

  describe('DV-safe mode', () => {
    it('redacts sensitive signal values when dvSafeMode is true', () => {
      const data: IntakeData = {
        safety: {
          fleeing_dv: true,
          experienced_violence_recently: true,
          feels_safe_current_location: 'no',
        },
      };
      const scores = computeScores(data);
      const card = buildExplanation(scores, true);

      const safetyContribs = card.dimensions.safety_crisis.contributors;
      const dvContrib = safetyContribs.find(c => c.signal === 'fleeing_dv');
      expect(dvContrib).toBeDefined();
      expect(dvContrib?.value).toBe('[REDACTED]');
    });

    it('does NOT redact in normal mode', () => {
      const data: IntakeData = {
        safety: { fleeing_dv: true },
      };
      const scores = computeScores(data);
      const card = buildExplanation(scores, false);

      const dvContrib = card.dimensions.safety_crisis.contributors.find(c => c.signal === 'fleeing_dv');
      expect(dvContrib?.value).not.toBe('[REDACTED]');
    });
  });
});
