# Golden Datasets

This directory contains golden standard datasets for evaluating parsing helper performance.

## Dataset Format

Each dataset is stored as a JSONL (JSON Lines) file where each line contains one test case.

### Required Fields

- `id`: Unique test case identifier (e.g., "T001")
- `description`: Human-readable description of the test scenario
- `transcriptText`: Full transcript text for parsing
- `segments`: Array of transcript segments with timing information
- `expected`: Expected parsing outputs for comparison

### Expected Output Fields

- `name`: Expected person's name
- `category`: Expected story category (HOUSING, EMPLOYMENT, etc.)
- `urgencyLevel`: Expected urgency level (LOW, MEDIUM, HIGH, CRITICAL)
- `goalAmount`: Expected goal amount in dollars
- `missingFields`: Array of fields expected to be marked as missing
- `beneficiaryRelationship`: Expected beneficiary relationship

### Evaluation Options

- `allowFuzzyName`: Allow fuzzy name matching (default: false)
- `amountTolerance`: Dollar amount tolerance for goal amount comparison (default: 0)
- `keyPointsMin`: Minimum number of key points required (default: 1)

## Privacy Requirements

**IMPORTANT:** Raw transcript text is allowed in dataset files for testing purposes, but:

1. **NO REAL PII**: All test cases must use fictional names, locations, and contact information
2. **NO REAL STORIES**: Create realistic but fictional scenarios
3. **ANONYMIZE PATTERNS**: Base scenarios on real patterns but anonymize all personal details

## Adding New Test Cases

1. Create realistic but fictional transcript scenarios
2. Ensure all personal information is fictional
3. Provide accurate expected outputs
4. Include edge cases and challenging patterns
5. Test with different urgency levels and categories
6. Validate JSON format before committing

## Current Datasets

- `transcripts_golden_v1.jsonl`: Primary evaluation dataset with diverse test cases

## Example Test Case

```json
{
  "id": "T001",
  "description": "Housing eviction with clear goal amount",
  "transcriptText": "Hi my name is Sarah Johnson and I need help with my rent. I'm about to be evicted and need fifteen hundred dollars to stay in my apartment.",
  "segments": [
    { "startMs": 0, "endMs": 3000, "text": "Hi my name is Sarah Johnson" },
    { "startMs": 3000, "endMs": 8000, "text": "and I need help with my rent" },
    { "startMs": 8000, "endMs": 15000, "text": "I'm about to be evicted and need fifteen hundred dollars to stay in my apartment" }
  ],
  "expected": {
    "name": "Sarah Johnson",
    "category": "HOUSING",
    "urgencyLevel": "HIGH",
    "goalAmount": 1500,
    "missingFields": [],
    "beneficiaryRelationship": "myself"
  },
  "expectations": {
    "allowFuzzyName": false,
    "amountTolerance": 0,
    "keyPointsMin": 1
  }
}
```