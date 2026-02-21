# Transcript Fixtures

This directory contains standardized transcript fixtures for testing the parsing helper system.

## Fixture Format

Each fixture is a JSON file with the following structure:

```json
{
  "id": "unique_fixture_id",
  "description": "Brief description of the scenario",
  "transcriptText": "Full transcript content...",
  "segments": [
    { "startMs": 0, "endMs": 1200, "text": "First segment..." }
  ],
  "expected": {
    "needsCategories": ["HOUSING", "EMERGENCY"],
    "urgencyLevel": "HIGH",
    "goalAmount": 1500,
    "missingFields": [],
    "confidenceMin": 0.6,
    "shouldNotContain": {
      "piiInTelemetry": true
    }
  }
}
```

## Available Fixtures

### Core Need Categories
- `01_housing_eviction.json` - Housing crisis with eviction notice
- `02_medical_emergency.json` - Medical emergency requiring immediate funds
- `03_food_insecurity.json` - Food assistance needs
- `04_safety_dv.json` - Safety concerns, domestic violence situation
- `05_legal_issue.json` - Legal assistance needs
- `06_transportation.json` - Transportation/vehicle needs
- `07_childcare.json` - Childcare assistance requirements
- `08_employment.json` - Employment-related assistance
- `09_business_equipment.json` - Small business equipment needs

### Edge Cases
- `10_dry_empty.json` - Minimal content, tests fallbacks
- `11_noisy_filler.json` - Lots of filler words, unclear speech
- `12_mixed_language.json` - Some non-English words mixed in
- `13_ambiguous_numbers.json` - Multiple numbers, unclear which is goal
- `14_range_amount.json` - Amount specified as range
- `15_long_transcript.json` - Very long transcript for performance testing

## Usage in Tests

```typescript
import { loadFixture, makeTranscript } from '../helpers/makeTranscript';

// Load fixture data
const fixture = loadFixture('01_housing_eviction');

// Convert to transcript input format
const input = makeTranscript('01_housing_eviction');

// Use in tests
const result = extractSignals(input);
expect(result.urgencyLevel).toBe(fixture.expected.urgencyLevel);
```

## Adding New Fixtures

1. Create new JSON file following the standard format
2. Ensure `id` matches filename (without .json extension)
3. Set realistic `expected` values based on transcript content
4. Test the fixture with existing tests to verify it works
5. Use placeholder emails/phones if needed (test@example.com, 555-0123)

## Guidelines

- Keep transcript content realistic but avoid real PII
- Set `confidenceMin` based on how clear the transcript is
- Use `missingFields` to test fallback scenarios
- Set `shouldNotContain.piiInTelemetry: true` for all fixtures
- Include segments for more complex transcripts (optional)