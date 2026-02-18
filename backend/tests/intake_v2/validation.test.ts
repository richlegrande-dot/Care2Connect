/**
 * V2 Intake — Form Validation Hardening Tests
 *
 * Tests comprehensive JSON Schema-style validation:
 *   - Required field enforcement
 *   - Type checking
 *   - Enum constraints (string + array items)
 *   - String length bounds (minLength, maxLength)
 *   - String pattern + format validation
 *   - Numeric range validation
 *   - Array maxItems enforcement
 *   - x-show-if conditional visibility
 *   - Unknown field detection
 */

import { validateModuleData } from '@/intake/v2/forms/default-intake-form';

describe('V2 Form Validation Hardening', () => {
  // ── Required Fields ────────────────────────────────────────────

  describe('Required Fields', () => {
    it('rejects consent with missing required fields', () => {
      const result = validateModuleData('consent', {});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: consent_data_collection');
      expect(result.errors).toContain('Missing required field: consent_age_confirmation');
    });

    it('accepts consent with all required fields', () => {
      const result = validateModuleData('consent', {
        consent_data_collection: true,
        consent_age_confirmation: true,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects housing with missing current_living_situation', () => {
      const result = validateModuleData('housing', {});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: current_living_situation');
    });

    it('rejects demographics with missing first_name', () => {
      const result = validateModuleData('demographics', {});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: first_name');
    });

    it('accepts optional modules (safety, health, etc.) with empty data', () => {
      expect(validateModuleData('safety', {}).valid).toBe(true);
      expect(validateModuleData('health', {}).valid).toBe(true);
      expect(validateModuleData('history', {}).valid).toBe(true);
      expect(validateModuleData('income', {}).valid).toBe(true);
      expect(validateModuleData('goals', {}).valid).toBe(true);
    });
  });

  // ── Type Checking ──────────────────────────────────────────────

  describe('Type Checking', () => {
    it('rejects boolean fields with string values', () => {
      const result = validateModuleData('consent', {
        consent_data_collection: 'yes',
        consent_age_confirmation: true,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('Invalid type for consent_data_collection')])
      );
    });

    it('rejects string fields with numeric values', () => {
      const result = validateModuleData('demographics', {
        first_name: 123 as unknown as string,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('Invalid type for first_name')])
      );
    });

    it('rejects integer fields with string values', () => {
      const result = validateModuleData('demographics', {
        first_name: 'Jane',
        household_size: 'three' as unknown as number,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('Invalid type for household_size')])
      );
    });

    it('rejects array fields with string values', () => {
      const result = validateModuleData('demographics', {
        first_name: 'Jane',
        race_ethnicity: 'white' as unknown as string[],
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('Invalid type for race_ethnicity')])
      );
    });
  });

  // ── String Enum Constraints ────────────────────────────────────

  describe('String Enum Constraints', () => {
    it('rejects invalid enum value for housing situation', () => {
      const result = validateModuleData('housing', {
        current_living_situation: 'mansion',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('Invalid value for current_living_situation')])
      );
    });

    it('accepts valid enum values', () => {
      const result = validateModuleData('housing', {
        current_living_situation: 'unsheltered',
      });
      expect(result.valid).toBe(true);
    });

    it('rejects invalid safety enum values', () => {
      const result = validateModuleData('safety', {
        feels_safe_current_location: 'maybe',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('Invalid value for feels_safe_current_location')])
      );
    });
  });

  // ── String Length Bounds ────────────────────────────────────────

  describe('String Length Bounds', () => {
    it('rejects first_name shorter than minLength', () => {
      const result = validateModuleData('demographics', {
        first_name: '',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('at least 1 character')])
      );
    });

    it('rejects first_name longer than maxLength', () => {
      const result = validateModuleData('demographics', {
        first_name: 'A'.repeat(101),
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('at most 100 characters')])
      );
    });

    it('rejects goals notes exceeding maxLength', () => {
      const result = validateModuleData('goals', {
        additional_notes: 'X'.repeat(2001),
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('at most 2000 characters')])
      );
    });
  });

  // ── Pattern Validation ─────────────────────────────────────────

  describe('Pattern Validation', () => {
    it('rejects invalid phone pattern', () => {
      const result = validateModuleData('demographics', {
        first_name: 'Jane',
        contact_phone: 'not-a-phone',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('contact_phone does not match required pattern')])
      );
    });

    it('accepts valid phone patterns', () => {
      const result = validateModuleData('demographics', {
        first_name: 'Jane',
        contact_phone: '555-123-4567',
      });
      expect(result.valid).toBe(true);
    });

    it('rejects invalid zip code pattern', () => {
      const result = validateModuleData('housing', {
        current_living_situation: 'unsheltered',
        location_zip: 'ABCDE',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('location_zip does not match required pattern')])
      );
    });

    it('accepts valid zip codes', () => {
      const r1 = validateModuleData('housing', {
        current_living_situation: 'unsheltered',
        location_zip: '90210',
      });
      expect(r1.valid).toBe(true);

      const r2 = validateModuleData('housing', {
        current_living_situation: 'unsheltered',
        location_zip: '90210-1234',
      });
      expect(r2.valid).toBe(true);
    });
  });

  // ── Format Validation ──────────────────────────────────────────

  describe('Format Validation', () => {
    it('rejects invalid date format', () => {
      const result = validateModuleData('demographics', {
        first_name: 'Jane',
        date_of_birth: '13/01/1990',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('valid date')])
      );
    });

    it('accepts valid date format', () => {
      const result = validateModuleData('demographics', {
        first_name: 'Jane',
        date_of_birth: '1990-01-13',
      });
      expect(result.valid).toBe(true);
    });

    it('rejects invalid email format', () => {
      const result = validateModuleData('demographics', {
        first_name: 'Jane',
        contact_email: 'not-an-email',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('valid email')])
      );
    });

    it('accepts valid email format', () => {
      const result = validateModuleData('demographics', {
        first_name: 'Jane',
        contact_email: 'jane@example.com',
      });
      expect(result.valid).toBe(true);
    });
  });

  // ── Numeric Range Validation ───────────────────────────────────

  describe('Numeric Range Validation', () => {
    it('rejects household_size below minimum', () => {
      const result = validateModuleData('demographics', {
        first_name: 'Jane',
        household_size: 0,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('household_size must be >= 1')])
      );
    });

    it('rejects household_size above maximum', () => {
      const result = validateModuleData('demographics', {
        first_name: 'Jane',
        household_size: 21,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('household_size must be <= 20')])
      );
    });

    it('accepts household_size within range', () => {
      const result = validateModuleData('demographics', {
        first_name: 'Jane',
        household_size: 4,
      });
      expect(result.valid).toBe(true);
    });

    it('rejects negative homeless episodes', () => {
      const result = validateModuleData('history', {
        total_homeless_episodes: -1,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('total_homeless_episodes must be >= 0')])
      );
    });
  });

  // ── Array Constraints ──────────────────────────────────────────

  describe('Array Constraints', () => {
    it('rejects array items with invalid enum values', () => {
      const result = validateModuleData('health', {
        chronic_conditions: ['diabetes', 'flying', 'laser_eyes'],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.filter(e => e.includes('chronic_conditions'))).toHaveLength(2);
    });

    it('accepts valid array enum items', () => {
      const result = validateModuleData('health', {
        chronic_conditions: ['diabetes', 'heart_disease'],
      });
      expect(result.valid).toBe(true);
    });

    it('rejects top_priorities exceeding maxItems(3)', () => {
      const result = validateModuleData('goals', {
        top_priorities: ['housing', 'food', 'employment', 'healthcare'],
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('at most 3 items')])
      );
    });

    it('rejects dependent_ages with out-of-range values', () => {
      const result = validateModuleData('demographics', {
        first_name: 'Jane',
        dependent_ages: [5, 18],
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('dependent_ages[1] must be <= 17')])
      );
    });
  });

  // ── x-show-if Conditional Visibility ───────────────────────────

  describe('x-show-if Conditional Visibility', () => {
    it('skips validation for insurance_type when has_health_insurance is false', () => {
      // insurance_type has x-show-if: { has_health_insurance: true }
      // When has_health_insurance is false, insurance_type should be ignored
      const result = validateModuleData('health', {
        has_health_insurance: false,
        insurance_type: 'INVALID_VALUE',
      });
      // Should pass because the field is hidden
      expect(result.valid).toBe(true);
    });

    it('validates insurance_type when has_health_insurance is true', () => {
      const result = validateModuleData('health', {
        has_health_insurance: true,
        insurance_type: 'INVALID_VALUE',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('Invalid value for insurance_type')])
      );
    });

    it('accepts valid insurance_type when shown', () => {
      const result = validateModuleData('health', {
        has_health_insurance: true,
        insurance_type: 'medicaid',
      });
      expect(result.valid).toBe(true);
    });

    it('skips unsheltered_location_type when not unsheltered', () => {
      const result = validateModuleData('housing', {
        current_living_situation: 'emergency_shelter',
        unsheltered_location_type: 'BOGUS',
      });
      expect(result.valid).toBe(true);
    });

    it('validates unsheltered_location_type when unsheltered', () => {
      const result = validateModuleData('housing', {
        current_living_situation: 'unsheltered',
        unsheltered_location_type: 'BOGUS',
      });
      expect(result.valid).toBe(false);
    });
  });

  // ── Unknown Fields ─────────────────────────────────────────────

  describe('Unknown Fields', () => {
    it('detects unknown fields', () => {
      const result = validateModuleData('consent', {
        consent_data_collection: true,
        consent_age_confirmation: true,
        hacker_field: 'malicious',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('Unknown field: hacker_field')])
      );
    });
  });

  // ── Combined Validation ────────────────────────────────────────

  describe('Combined - realistic payloads', () => {
    it('validates a complete valid demographics submission', () => {
      const result = validateModuleData('demographics', {
        first_name: 'Maria',
        last_name: 'Garcia',
        date_of_birth: '1985-06-15',
        gender: 'female',
        race_ethnicity: ['hispanic_latino'],
        veteran_status: false,
        household_size: 3,
        has_dependents: true,
        dependent_ages: [7, 12],
        contact_phone: '555-123-4567',
        contact_email: 'maria@example.com',
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('catches multiple errors in one submission', () => {
      const result = validateModuleData('demographics', {
        first_name: '', // too short
        household_size: 50, // exceeds max
        gender: 'not_valid', // bad enum
        contact_email: 'bad', // bad email
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
    });
  });
});
