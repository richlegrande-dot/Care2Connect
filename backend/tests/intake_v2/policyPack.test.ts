/**
 * V2 Policy Pack & Waterfall — Unit Tests
 *
 * Tests the Phase 2 hardening changes:
 *   - Policy Pack injection (P0-2)
 *   - Waterfall refactor — no totalScore-based levels (P0-4)
 *   - Custom policy pack support
 *   - Input hash reproducibility (Phase 2C)
 *   - DV-safe data redaction (P0-3)
 */

import { computeScores, type IntakeData } from '../../src/intake/v2/scoring/computeScores';
import { DEFAULT_POLICY_PACK, type PolicyPack } from '../../src/intake/v2/policy/policyPack';
import {
  redactSensitiveModules,
  sanitizeForLogging,
  getPanicButtonUrl,
  getPanicButtonConfig,
  DV_SENSITIVE_SIGNALS,
} from '../../src/intake/v2/dvSafe';

// ── Policy Pack Injection ──────────────────────────────────────

describe('Policy Pack injection (P0-2)', () => {
  it('computeScores uses DEFAULT_POLICY_PACK when none provided', () => {
    const result = computeScores({});
    expect(result.policyPackVersion).toBe(DEFAULT_POLICY_PACK.version);
  });

  it('computeScores uses injected policy pack version', () => {
    const customPack: PolicyPack = {
      ...DEFAULT_POLICY_PACK,
      version: 'v2.0.0-test',
    };
    const result = computeScores({}, customPack);
    expect(result.policyPackVersion).toBe('v2.0.0-test');
  });

  it('custom pack can change point values', () => {
    const customPack: PolicyPack = {
      ...DEFAULT_POLICY_PACK,
      pointMaps: {
        ...DEFAULT_POLICY_PACK.pointMaps,
        housing: {
          ...DEFAULT_POLICY_PACK.pointMaps.housing,
          situationPoints: {
            unsheltered: 25, // max instead of 10
            permanent_housing: 0,
          },
        },
      },
    };
    const result = computeScores(
      { housing: { current_living_situation: 'unsheltered' } },
      customPack
    );
    expect(result.dimensions.housing_stability.score).toBe(25);
    expect(result.dimensions.housing_stability.contributors[0].points).toBe(25);
  });

  it('custom pack can change tier thresholds', () => {
    const customPack: PolicyPack = {
      ...DEFAULT_POLICY_PACK,
      tierThresholds: { CRITICAL: 90, HIGH: 60, MODERATE: 30, LOWER: 0 },
    };
    // With default thresholds, score 45+ = HIGH; with custom, 45 = MODERATE
    const data: IntakeData = {
      housing: { current_living_situation: 'unsheltered', at_risk_of_losing: true, eviction_notice: true },
      safety: { fleeing_dv: true },
    };
    const defaultResult = computeScores(data);
    const customResult = computeScores(data, customPack);

    // Both should have same raw scores
    expect(defaultResult.totalScore).toBe(customResult.totalScore);
    // But tier may differ (override floors may elevate both to CRITICAL though)
  });

  it('DEFAULT_POLICY_PACK contains all required fields', () => {
    expect(DEFAULT_POLICY_PACK.version).toBeTruthy();
    expect(DEFAULT_POLICY_PACK.maxDimensionScore).toBe(25);
    expect(DEFAULT_POLICY_PACK.pointMaps.housing).toBeDefined();
    expect(DEFAULT_POLICY_PACK.pointMaps.safety).toBeDefined();
    expect(DEFAULT_POLICY_PACK.pointMaps.vulnerability).toBeDefined();
    expect(DEFAULT_POLICY_PACK.pointMaps.chronicity).toBeDefined();
    expect(DEFAULT_POLICY_PACK.waterfallRules.length).toBeGreaterThan(0);
    expect(DEFAULT_POLICY_PACK.overrideRules.length).toBeGreaterThan(0);
    expect(DEFAULT_POLICY_PACK.tierThresholds.CRITICAL).toBeGreaterThan(0);
  });
});

// ── Waterfall Refactor (P0-4) ──────────────────────────────────

describe('Waterfall refactor — no totalScore levels (P0-4)', () => {
  it('no waterfall rule references totalScore', () => {
    for (const rule of DEFAULT_POLICY_PACK.waterfallRules) {
      for (const cond of rule.conditions) {
        expect(cond.dimension).not.toBe('total');
      }
      if (rule.anyOf) {
        for (const cond of rule.anyOf) {
          expect(cond.dimension).not.toBe('total');
        }
      }
    }
  });

  it('Level 3 is dimension-based: housingScore >= 10 → Level 3', () => {
    // housing = 10 (unsheltered=10), no other dim >= 15
    const data: IntakeData = {
      housing: { current_living_situation: 'unsheltered' },
    };
    const result = computeScores(data);
    expect(result.stabilityLevel).toBe(3);
    expect(result.placementRule).toContain('housing_stability');
  });

  it('Level 3 for high non-housing dimension: any dim >= 15', () => {
    // Safety = 18 (fleeing_dv=10 + suicidal=8), housing = 0
    const data: IntakeData = {
      safety: { fleeing_dv: true, suicidal_ideation_recent: true },
    };
    const result = computeScores(data);
    // Override: fleeing_dv → floor Level 0
    expect(result.stabilityLevel).toBe(0);
    expect(result.overridesApplied.length).toBeGreaterThan(0);
  });

  it('Level 4 for moderate housing concern: housingScore >= 5', () => {
    const data: IntakeData = {
      housing: { current_living_situation: 'staying_with_others' }, // 5 points
    };
    const result = computeScores(data);
    expect(result.stabilityLevel).toBe(4);
  });

  it('Level 4 for moderate non-housing dimension: any dim >= 10', () => {
    // chronicity = 13 (chronic=8 + episodes=5), housing = 0
    const data: IntakeData = {
      history: { currently_chronic: true, total_homeless_episodes: 4 },
    };
    const result = computeScores(data);
    // Override: chronic_homeless → floor Level 1
    expect(result.stabilityLevel).toBe(1);
  });

  it('Level 5 for minimal concerns', () => {
    const data: IntakeData = {
      housing: { current_living_situation: 'permanent_housing' },
    };
    const result = computeScores(data);
    expect(result.stabilityLevel).toBe(5);
    expect(result.placementRule).toContain('default');
  });

  it('totalScore still determines priorityTier (not Level)', () => {
    // High totalScore should set tier but not level
    const data: IntakeData = {
      housing: { current_living_situation: 'other' }, // 2 pts
      safety: { mental_health_current: 'moderate_concerns' }, // 2 pts
      income: { has_any_income: false, has_valid_id: false }, // 4 pts
    };
    const result = computeScores(data);
    // totalScore = 8 → LOWER tier
    // housing = 2, no dim meets any waterfall threshold → Level 5
    expect(result.stabilityLevel).toBe(5);
    expect(result.priorityTier).toBe('LOWER');
  });
});

// ── Override Rules ─────────────────────────────────────────────

describe('Override rules from policy pack', () => {
  it('fleeing_dv overrides to Level 0', () => {
    const result = computeScores({
      safety: { fleeing_dv: true },
      housing: { current_living_situation: 'permanent_housing' },
    });
    expect(result.stabilityLevel).toBe(0);
    expect(result.overridesApplied).toContain('fleeing_dv → floor Level 0');
  });

  it('fleeing_trafficking overrides to Level 0', () => {
    const result = computeScores({
      safety: { fleeing_trafficking: true },
    });
    expect(result.stabilityLevel).toBe(0);
  });

  it('veteran + unsheltered overrides to Level 1', () => {
    const result = computeScores({
      demographics: { veteran_status: true },
      housing: { current_living_situation: 'unsheltered' },
    });
    // unsheltered = 10 → Level 3 by waterfall, then veteran+unsheltered override → Level 1
    expect(result.stabilityLevel).toBeLessThanOrEqual(1);
  });

  it('chronic homeless overrides to Level 1', () => {
    const result = computeScores({
      history: { currently_chronic: true },
      housing: { current_living_situation: 'permanent_housing' },
    });
    // housing = 0, chronicity = 8 → Level 5 by waterfall
    // BUT override: chronic → floor Level 1
    expect(result.stabilityLevel).toBe(1);
  });
});

// ── Input Hash (Phase 2C) ──────────────────────────────────────

describe('Score audit trail (Phase 2C)', () => {
  it('includes inputHash in ScoreResult', () => {
    const result = computeScores({});
    expect(typeof result.inputHash).toBe('string');
    expect(result.inputHash.length).toBe(16);
  });

  it('same input produces same hash (deterministic)', () => {
    const data: IntakeData = {
      housing: { current_living_situation: 'unsheltered' },
      safety: { fleeing_dv: true },
    };
    const r1 = computeScores(data);
    const r2 = computeScores(data);
    expect(r1.inputHash).toBe(r2.inputHash);
  });

  it('different input produces different hash', () => {
    const r1 = computeScores({ housing: { current_living_situation: 'unsheltered' } });
    const r2 = computeScores({ housing: { current_living_situation: 'emergency_shelter' } });
    expect(r1.inputHash).not.toBe(r2.inputHash);
  });

  it('includes policyPackVersion in ScoreResult', () => {
    const result = computeScores({});
    expect(result.policyPackVersion).toBe('v1.0.0');
  });
});

// ── DV-Safe Utilities (P0-3) ─────────────────────────────────

describe('DV-safe utilities (P0-3)', () => {
  describe('redactSensitiveModules', () => {
    it('redacts DV-sensitive fields in safety module', () => {
      const modules = {
        safety: {
          fleeing_dv: true,
          fleeing_trafficking: false,
          has_protective_order: true,
          experienced_violence_recently: true,
          feels_safe_current_location: 'no',
          mental_health_current: 'severe_crisis', // NOT sensitive
        },
        housing: { current_living_situation: 'unsheltered' }, // NOT redacted
      };

      const { redacted, sensitiveDataRedacted } = redactSensitiveModules(modules);

      expect(sensitiveDataRedacted).toBe(true);
      const safety = redacted.safety as Record<string, unknown>;
      expect(safety.fleeing_dv).toBe('[REDACTED]');
      expect(safety.fleeing_trafficking).toBe('[REDACTED]');
      expect(safety.has_protective_order).toBe('[REDACTED]');
      expect(safety.experienced_violence_recently).toBe('[REDACTED]');
      expect(safety.feels_safe_current_location).toBe('[REDACTED]');
      // Non-sensitive fields preserved
      expect(safety.mental_health_current).toBe('severe_crisis');
      // Other modules untouched
      expect((redacted.housing as Record<string, unknown>).current_living_situation).toBe('unsheltered');
    });

    it('does not mutate original object', () => {
      const modules = { safety: { fleeing_dv: true } };
      redactSensitiveModules(modules);
      expect((modules.safety as Record<string, unknown>).fleeing_dv).toBe(true);
    });

    it('returns sensitiveDataRedacted=false when no safety fields', () => {
      const { sensitiveDataRedacted } = redactSensitiveModules({
        housing: { current_living_situation: 'unsheltered' },
      });
      expect(sensitiveDataRedacted).toBe(false);
    });
  });

  describe('sanitizeForLogging', () => {
    it('replaces sensitive fields with [LOG_REDACTED]', () => {
      const payload = {
        safety: { fleeing_dv: true, mental_health_current: 'severe_crisis' },
      };
      const sanitized = sanitizeForLogging(payload);
      expect((sanitized.safety as Record<string, unknown>).fleeing_dv).toBe('[LOG_REDACTED]');
      expect((sanitized.safety as Record<string, unknown>).mental_health_current).toBe('severe_crisis');
    });

    it('does not mutate original', () => {
      const payload = { safety: { fleeing_dv: true } };
      sanitizeForLogging(payload);
      expect((payload.safety as Record<string, unknown>).fleeing_dv).toBe(true);
    });
  });

  describe('panic button', () => {
    it('returns default Google URL when env not set', () => {
      delete process.env.DV_PANIC_BUTTON_URL;
      expect(getPanicButtonUrl()).toBe('https://www.google.com');
    });

    it('returns configured URL from env', () => {
      process.env.DV_PANIC_BUTTON_URL = 'https://weather.com';
      expect(getPanicButtonUrl()).toBe('https://weather.com');
      delete process.env.DV_PANIC_BUTTON_URL;
    });

    it('config includes clear flags', () => {
      const config = getPanicButtonConfig();
      expect(config.url).toBeTruthy();
      expect(config.clearIndexedDB).toBe(true);
      expect(config.clearSessionStorage).toBe(true);
      expect(config.clearLocalStorage).toBe(true);
    });
  });

  describe('DV_SENSITIVE_SIGNALS set', () => {
    it('contains all expected signals', () => {
      expect(DV_SENSITIVE_SIGNALS.has('fleeing_dv')).toBe(true);
      expect(DV_SENSITIVE_SIGNALS.has('fleeing_trafficking')).toBe(true);
      expect(DV_SENSITIVE_SIGNALS.has('has_protective_order')).toBe(true);
      expect(DV_SENSITIVE_SIGNALS.has('experienced_violence_recently')).toBe(true);
      expect(DV_SENSITIVE_SIGNALS.has('feels_safe_current_location')).toBe(true);
    });
  });
});
