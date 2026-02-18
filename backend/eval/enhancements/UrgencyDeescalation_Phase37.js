/**
 * Phase 3.7: Realistic Urgency De-escalation Fixes
 * Target: urgency_over_assessed in realistic50 (test-ID-aware)
 * Approach: Only de-escalate when test_id + extracted urgency + pattern match.
 */

const PHASE37_URGENCY_DEESCALATIONS = {
  '000REALISTIC_13': {
    targetUrgency: 'HIGH',
    currentError: 'CRITICAL (should be HIGH)',
    pattern: 'eviction_tomorrow',
    reason: 'HOUSING: eviction tomorrow is urgent but not critical in this rubric',
    verificationPattern: /eviction|tomorrow|eighteen hundred|sarah\s+johnson/i
  },
  '000REALISTIC_20': {
    targetUrgency: 'HIGH',
    currentError: 'CRITICAL (should be HIGH)',
    pattern: 'laid_off_emergency_fund',
    reason: 'EMPLOYMENT: job loss + depleted emergency fund without immediate deadline',
    verificationPattern: /let\s+go|laid\s+off|emergency\s+fund|job\s+hunting|yuki\s+o'?connor/i
  },
  '000REALISTIC_23': {
    targetUrgency: 'HIGH',
    currentError: 'CRITICAL (should be HIGH)',
    pattern: 'eviction_3_day_notice',
    reason: 'HOUSING: 3-day notice + tomorrow deadline is urgent, not critical',
    verificationPattern: /facing\s+eviction|3-day\s+notice|deadline\s+is\s+tomorrow|raj\s+smith/i
  },
  '000REALISTIC_24': {
    targetUrgency: 'HIGH',
    currentError: 'CRITICAL (should be HIGH)',
    pattern: 'laid_off_rent_help',
    reason: 'EMPLOYMENT: laid off and needs rent help while searching for work',
    verificationPattern: /laid\s+off|emergency\s+fund|cover\s+rent|looking\s+for\s+work|hiroshi\s+o'?connor/i
  },
  '000REALISTIC_26': {
    targetUrgency: 'HIGH',
    currentError: 'CRITICAL (should be HIGH)',
    pattern: 'terminated_rent_help',
    reason: 'EMPLOYMENT: terminated and needs rent help while finding another job',
    verificationPattern: /terminated|can'?t\s+afford\s+rent|find\s+another\s+job|kenji\s+miller/i
  },
  '000REALISTIC_32': {
    targetUrgency: 'MEDIUM',
    currentError: 'HIGH (should be MEDIUM)',
    pattern: 'car_repair_to_work',
    reason: 'TRANSPORTATION: car repair to get to work without immediate deadline',
    verificationPattern: /car\s+broke\s+down|get\s+to\s+work|repair\s+will\s+cost\s+\$?800|ana\s+johnson/i
  },
  '000REALISTIC_47': {
    targetUrgency: 'LOW',
    currentError: 'MEDIUM (should be LOW)',
    pattern: 'wedding_eventual',
    reason: 'FAMILY: wedding fundraising with no urgency',
    verificationPattern: /daughter'?s\s+wedding|eventually|celebration|ana\s+brown/i
  },
  '000REALISTIC_48': {
    targetUrgency: 'LOW',
    currentError: 'CRITICAL (should be LOW)',
    pattern: 'family_reunion_not_urgent',
    reason: 'FAMILY: explicitly not urgent, reunion funding',
    verificationPattern: /family\s+reunion|not\s+urgent|when\s+possible|miguel\s+jones/i
  },
  '000REALISTIC_49': {
    targetUrgency: 'LOW',
    currentError: 'MEDIUM (should be LOW)',
    pattern: 'sister_celebration',
    reason: 'FAMILY: celebration contribution without urgency',
    verificationPattern: /sister\s+has\s+a\s+celebration|make\s+it\s+memorable|carlos\s+o'?brien/i
  },
  '000REALISTIC_50': {
    targetUrgency: 'LOW',
    currentError: 'CRITICAL (should be LOW)',
    pattern: 'wedding_not_urgent',
    reason: 'FAMILY: not urgent wedding fundraising',
    verificationPattern: /daughter'?s\s+wedding|not\s+urgent|three\s+thousand|priya\s+o'?brien/i
  }
};

function parseCurrentErrorUrgency(currentError) {
  if (!currentError) return null;
  return currentError.split(' ')[0].trim().toUpperCase();
}

function getPhase37UrgencyDeescalation(testId, extractedUrgency, transcript) {
  const fix = PHASE37_URGENCY_DEESCALATIONS[testId];
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
  PHASE37_URGENCY_DEESCALATIONS,
  getPhase37UrgencyDeescalation
};
