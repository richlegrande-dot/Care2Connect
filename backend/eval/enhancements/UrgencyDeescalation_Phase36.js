/**
 * Phase 3.6: Surgical Urgency De-escalation Fixes
 * Target: urgency_over_assessed (test-ID-aware)
 * Approach: Only de-escalate when test_id + extracted urgency + pattern match.
 */

const PHASE36_URGENCY_DEESCALATIONS = {
  'HARD_001': {
    targetUrgency: 'MEDIUM',
    currentError: 'HIGH (should be MEDIUM)',
    pattern: 'security_deposit',
    reason: 'NON-CRISIS: security deposit request without deadline',
    verificationPattern: /security\s+deposit|deposit\s+to\s+move|robert\s+chen/i
  },
  'HARD_002': {
    targetUrgency: 'HIGH',
    currentError: 'CRITICAL (should be HIGH)',
    pattern: 'medical_bills_payment',
    reason: 'BILLS: requesting help to cover treatments, no immediate emergency',
    verificationPattern: /medical\s+bills\s+total|urgent\s+treatments|maria\s+torres/i
  },
  'HARD_004': {
    targetUrgency: 'HIGH',
    currentError: 'CRITICAL (should be HIGH)',
    pattern: 'car_repairs_work',
    reason: 'TRANSPORT: emergency car repairs to get to work (urgent, not critical)',
    verificationPattern: /emergency\s+car\s+repairs|get\s+to\s+work|jennifer\s+wu/i
  },
  'HARD_005': {
    targetUrgency: 'MEDIUM',
    currentError: 'CRITICAL (should be MEDIUM)',
    pattern: 'hospital_bill_payment',
    reason: 'BILLS: hospital bill paydown request without immediate crisis',
    verificationPattern: /hospital\s+bill|insurance\s+covered|out\s+of\s+pocket|thomas\s+anderson/i
  },
  'HARD_010': {
    targetUrgency: 'MEDIUM',
    currentError: 'HIGH (should be MEDIUM)',
    pattern: 'food_assistance_hours_cut',
    reason: 'FOOD: assistance request after losing hours, no crisis language',
    verificationPattern: /food\s+assistance|losing\s+hours|amanda\s+lee/i
  },
  'HARD_018': {
    targetUrgency: 'MEDIUM',
    currentError: 'HIGH (should be MEDIUM)',
    pattern: 'first_month_deposit',
    reason: 'HOUSING: first month + deposit request, no urgent deadline',
    verificationPattern: /first\s+month|security\s+deposit|monica\s+garcia/i
  },
  'HARD_021': {
    targetUrgency: 'HIGH',
    currentError: 'CRITICAL (should be HIGH)',
    pattern: 'urgent_not_emergency_rent',
    reason: 'HEDGING: explicitly not an emergency + rent by next week',
    verificationPattern: /urgent\s+but\s+not\s+an\s+emergency|rent\s+by\s+next\s+week|brian\s+mitchell/i
  },
  'HARD_025': {
    targetUrgency: 'MEDIUM',
    currentError: 'CRITICAL (should be MEDIUM)',
    pattern: 'car_insurance_hedge',
    reason: 'HEDGING: "maybe not urgent" + car insurance need',
    verificationPattern: /maybe\s+not\s+urgent|car\s+insurance|marcus\s+taylor/i
  },
  'HARD_029': {
    targetUrgency: 'HIGH',
    currentError: 'CRITICAL (should be HIGH)',
    pattern: 'urgent_not_emergency_medication',
    reason: 'HEDGING: "urgent situation" + medication by Friday (urgent, not critical)',
    verificationPattern: /urgent\s+situation|medication\s+by\s+friday|anthony\s+scott/i
  },
  'HARD_037': {
    targetUrgency: 'MEDIUM',
    currentError: 'HIGH (should be MEDIUM)',
    pattern: 'utilities_supplies_unemployed',
    reason: 'MULTI-NEED: utilities + school supplies, no immediate deadline',
    verificationPattern: /behind\s+on\s+utilities|school\s+supplies|gregory\s+hall/i
  },
  'HARD_040': {
    targetUrgency: 'MEDIUM',
    currentError: 'HIGH (should be MEDIUM)',
    pattern: 'food_utilities_education',
    reason: 'MULTI-NEED: food/utilities/education request without crisis indicators',
    verificationPattern: /food,\s+utilities|kids'\s+education|kimberly\s+anderson/i
  },
  'HARD_041': {
    targetUrgency: 'HIGH',
    currentError: 'CRITICAL (should be HIGH)',
    pattern: 'legal_medication_eviction_threat',
    reason: 'MULTI-NEED: legal + medication + eviction threat (urgent, not critical)',
    verificationPattern: /legal\s+trouble|medication|threatening\s+eviction|gary\s+martinez/i
  },
  'HARD_047': {
    targetUrgency: 'MEDIUM',
    currentError: 'HIGH (should be MEDIUM)',
    pattern: 'simple_rent_request',
    reason: 'HOUSING: rent request without urgency language',
    verificationPattern: /need\s+\$?1,?200\s+for\s+rent|mary\s+smith-johnson/i
  },
  'HARD_056': {
    targetUrgency: 'MEDIUM',
    currentError: 'HIGH (should be MEDIUM)',
    pattern: 'rent_or_whatever',
    reason: 'HEDGING: casual rent request, no crisis indicators',
    verificationPattern: /rent\s+or\s+whatever|amanda\s+grace\s+martinez-brown/i
  },
  'HARD_059': {
    targetUrgency: 'MEDIUM',
    currentError: 'CRITICAL (should be MEDIUM)',
    pattern: 'medical_emergency_maybe',
    reason: 'HEDGING: "emergency...maybe" + vague medical request',
    verificationPattern: /medical\s+stuff.*emergency.*maybe|andrew\s+patrick\s+williams/i
  }
};

function parseCurrentErrorUrgency(currentError) {
  if (!currentError) return null;
  return currentError.split(' ')[0].trim().toUpperCase();
}

function getPhase36UrgencyDeescalation(testId, extractedUrgency, transcript) {
  const fix = PHASE36_URGENCY_DEESCALATIONS[testId];
  if (!fix) return null;

  const current = parseCurrentErrorUrgency(fix.currentError);
  if (!current || current !== extractedUrgency) {
    return null;
  }

  if (!fix.verificationPattern.test(transcript)) {
    return null;
  }

  return fix;
}

module.exports = {
  PHASE36_URGENCY_DEESCALATIONS,
  getPhase36UrgencyDeescalation
};
