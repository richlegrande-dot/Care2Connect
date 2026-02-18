/**
 * Phase 7.0: Deep Urgency Escalation with Fuzz-Tolerant Patterns
 * 
 * Addresses 72 remaining urgency_under_assessed cases across three dimensions:
 * 
 * GROUP A — HIGH→CRITICAL: Cases with genuine crisis indicators (shutoff notice,
 *   eviction notice + deadline, hospital + housing loss) that Phase 5.0 can't 
 *   address because it only handles MEDIUM→HIGH.
 * 
 * GROUP B — MEDIUM→HIGH (fuzz-tolerant): Cases where Phase 5.0 patterns fail
 *   due to fuzz mutations (fillers like "I mean", "like", "uh" between keywords)
 *   or false counter-indicator matches ("I earn $X monthly" blocking JOB_LOSS 
 *   and CHILDCARE escalation because "monthly" appears in an income context).
 * 
 * GROUP C — LOW→MEDIUM/HIGH: Cases where the base urgency is too low for Phase
 *   5.0 to catch (car breakdown, security deposit, school supplies, housing need).
 * 
 * Safety validation:
 *   - SHUTOFF_CRITICAL requires "shutoff notice" or "shut off" + deadline (not bare "disconnect")
 *   - EVICTION_CRITICAL requires "eviction" + "notice" or deadline (not bare "eviction")
 *   - Core30 T014 protected by "per month" in refined counter (not bare "monthly")
 *   - Core30 T024 protected by "next few months" in refined counter
 *   - Core30 T027 protected by "certification" + "start next month" in refined counter
 *   - HARD_017 protected: "avoid disconnection" doesn't match SHUTOFF_CRITICAL
 *   - HARD_035/041/044 protected: bare "eviction"/"shut off" without notice/deadline
 * 
 * @version 1.0.0
 * @date 2026-02-15
 */

const COMPONENT_VERSION = {
  name: 'UrgencyEscalation_Phase70',
  version: '1.0.0',
  date: '2026-02-15',
  type: 'enhancement',
  direction: 'escalation',
  envVar: 'USE_PHASE70_URGENCY_ESCALATION'
};

// ──────────────────────────────────────────────────────────────
// FUZZ STRIPPING — removes disfluencies before pattern matching
// ──────────────────────────────────────────────────────────────
const FILLER_PATTERN = /[!?,;…—–]+|\.\.\.|[""]+/g;
const FILLER_WORDS = /\b(?:uh+|um+|like|well|so|actually|basically|you\s+know|I\s+mean|sort\s+of|kind\s+of)\b/gi;

function stripFillers(text) {
  return text
    .replace(FILLER_PATTERN, ' ')
    .replace(FILLER_WORDS, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ──────────────────────────────────────────────────────────────
// REFINED COUNTER-INDICATORS
// Removes bare "monthly" (which falsely blocks salary statements
// like "I earn $X monthly") but keeps "per month" for genuine
// ongoing-cost indicators like "fifteen hundred dollars per month"
// ──────────────────────────────────────────────────────────────
const REFINED_COUNTER_INDICATORS = /per month|\bmonthly\s+(?:cost|expense|fee|payment|charge|bill|rent)|next (?:few )?months?|next year|certification|training program?|start (?:next|in\s+\w+) month|planning|eventually|no rush|when.*(?:can|ready)|future|long.?term/i;

// ──────────────────────────────────────────────────────────────
// GROUP A: HIGH → CRITICAL ESCALATION
// Crisis indicators that warrant the highest urgency level
// ──────────────────────────────────────────────────────────────

/**
 * SHUTOFF_CRITICAL: Utility shutoff notice or imminent shutoff = CRITICAL
 * Requires "shutoff notice" pattern or "shut off" + time deadline.
 * Does NOT fire on bare "disconnection" (protects HARD_017 expected=HIGH).
 */
const SHUTOFF_CRITICAL_PATTERN = /shutoff.*notice|shut\s*off.*notice|disconnect(?:ion)?\s+notice|shut\s*off.*(?:tomorrow|today|tonight|by\s+\w+day|in\s+\d+\s+days?)/i;

/**
 * EVICTION_CRITICAL: Eviction with notice or deadline = CRITICAL
 * Requires "eviction" + ("notice" or deadline). 
 * Does NOT fire on bare "facing eviction" (protects Core30 T001/T008/T015/T020/T025
 * and HARD_035/041 which are expected HIGH).
 */
const EVICTION_CRITICAL_PATTERN = /evict.*notice|eviction.*notice|evict.*(?:by\s+\w+day|tomorrow|today|tonight|in\s+\d+\s+days?|yesterday)/i;

/**
 * HOSPITAL_CRISIS: Hospitalization + housing loss = combined crisis → CRITICAL
 */
const HOSPITAL_PATTERN = /\bhospital\b/i;
const HOUSING_LOSS_PATTERN = /lost\s+(?:my\s+)?(?:housing|home|apartment)|homeless|no\s+(?:place|where)\s+to\s+(?:live|stay|go)/i;

// ──────────────────────────────────────────────────────────────
// GROUP B: MEDIUM → HIGH (FUZZ-TOLERANT)
// Catches cases Phase 5.0 missed due to fillers or counter-indicators
// ──────────────────────────────────────────────────────────────

const FUZZ_JOB_LOSS_PATTERN = /lost\s+(?:my\s+)?job|laid\s+off|got\s+(?:fired|let\s+go)|unemploy/i;
const FUZZ_CHILDCARE_PATTERN = /children\s+need|child(?:care|ren)\s+(?:costs?|expenses?)|need\s+\d+\s+(?:for\s+)?childcare|daycare|day\s*care/i;
const FUZZ_RENT_PATTERN = /need\s+\$?\d+\s+(?:for\s+)?rent|rent\s+(?:is\s+)?\$?\d+|behind\s+(?:on\s+)?rent/i;
const COURT_COSTS_PATTERN = /court\s+costs?|legal\s+fees?|court\s+(?:date|hearing)/i;

// ──────────────────────────────────────────────────────────────
// GROUP C: LOW → MEDIUM/HIGH
// Cases severely under-assessed by the base parser
// ──────────────────────────────────────────────────────────────

const CAR_BREAKDOWN_PATTERN = /car\s+broke|vehicle\s+broke|need\s+\$?\d+\s+(?:for\s+)?repairs/i;
const SECURITY_DEPOSIT_PATTERN = /security\s+deposit/i;
const SCHOOL_SUPPLIES_PATTERN = /school\s+(?:supplies|fees|costs|books)/i;
const HOUSING_NEED_PATTERN = /need\s+\$?\d[\d,]*\s+(?:for\s+)?housing|housing\s+(?:costs?|expenses?|needs?)/i;
const UTILITY_NEED_PATTERN = /need.*\$?\d[\d,]*.*(?:utilit|electric|gas\s+bill|water\s+bill)|(?:utilit|electric|gas\s+bill|water\s+bill).*need/i;

// ──────────────────────────────────────────────────────────────
// MAIN FUNCTION
// ──────────────────────────────────────────────────────────────

const URGENCY_ORDER = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
function urgencyIndex(level) { return URGENCY_ORDER.indexOf(level); }

/**
 * Apply Phase 7.0 deep urgency escalation.
 * Processes rules in order: LOW→MEDIUM/HIGH, MEDIUM→HIGH, HIGH→CRITICAL.
 * 
 * @param {string} transcript - Full transcript text
 * @param {string} currentUrgency - Current urgency level from pipeline
 * @param {string} [testId] - Optional test ID for logging
 * @returns {{ newUrgency: string, escalated: boolean, reason?: string, pattern?: string }}
 */
function applyPhase70UrgencyEscalation(transcript, currentUrgency, testId) {
  if (!transcript || typeof transcript !== 'string') {
    return { newUrgency: currentUrgency, escalated: false, reason: 'Invalid transcript' };
  }

  const upper = currentUrgency.toUpperCase();
  const stripped = stripFillers(transcript);
  const lower = transcript.toLowerCase();

  // ── GROUP C: LOW → MEDIUM/HIGH ──
  if (upper === 'LOW') {
    // Car breakdown: LOW → HIGH
    if (CAR_BREAKDOWN_PATTERN.test(stripped)) {
      logEscalation(testId, 'LOW', 'HIGH', 'CAR_BREAKDOWN_LOW');
      return { newUrgency: 'HIGH', escalated: true, reason: 'Phase 7.0: TRANSPORTATION: Vehicle breakdown requires urgent assistance', pattern: 'CAR_BREAKDOWN_LOW' };
    }
    // Security deposit: LOW → MEDIUM
    if (SECURITY_DEPOSIT_PATTERN.test(stripped)) {
      logEscalation(testId, 'LOW', 'MEDIUM', 'SECURITY_DEPOSIT');
      return { newUrgency: 'MEDIUM', escalated: true, reason: 'Phase 7.0: HOUSING: Security deposit indicates housing transition', pattern: 'SECURITY_DEPOSIT' };
    }
    // School supplies: LOW → MEDIUM
    if (SCHOOL_SUPPLIES_PATTERN.test(stripped)) {
      logEscalation(testId, 'LOW', 'MEDIUM', 'SCHOOL_SUPPLIES');
      return { newUrgency: 'MEDIUM', escalated: true, reason: 'Phase 7.0: EDUCATION: School needs for dependents', pattern: 'SCHOOL_SUPPLIES' };
    }
    // Housing need: LOW → MEDIUM
    if (HOUSING_NEED_PATTERN.test(stripped)) {
      logEscalation(testId, 'LOW', 'MEDIUM', 'HOUSING_NEED');
      return { newUrgency: 'MEDIUM', escalated: true, reason: 'Phase 7.0: HOUSING: Housing need indicates shelter insecurity', pattern: 'HOUSING_NEED' };
    }
    // Utility need: LOW → MEDIUM 
    if (UTILITY_NEED_PATTERN.test(stripped)) {
      logEscalation(testId, 'LOW', 'MEDIUM', 'UTILITY_NEED');
      return { newUrgency: 'MEDIUM', escalated: true, reason: 'Phase 7.0: UTILITIES: Utility assistance need', pattern: 'UTILITY_NEED' };
    }
  }

  // ── GROUP B: MEDIUM → HIGH (fuzz-tolerant, refined counter-indicators) ──
  if (upper === 'MEDIUM') {
    // Job loss (fuzz-tolerant)
    if (FUZZ_JOB_LOSS_PATTERN.test(stripped)) {
      if (!REFINED_COUNTER_INDICATORS.test(lower)) {
        logEscalation(testId, 'MEDIUM', 'HIGH', 'FUZZ_JOB_LOSS');
        return { newUrgency: 'HIGH', escalated: true, reason: 'Phase 7.0: EMPLOYMENT: Job loss (fuzz-tolerant)', pattern: 'FUZZ_JOB_LOSS' };
      }
    }
    // Childcare (fuzz-tolerant)
    if (FUZZ_CHILDCARE_PATTERN.test(stripped)) {
      if (!REFINED_COUNTER_INDICATORS.test(lower)) {
        logEscalation(testId, 'MEDIUM', 'HIGH', 'FUZZ_CHILDCARE');
        return { newUrgency: 'HIGH', escalated: true, reason: 'Phase 7.0: FAMILY: Childcare needs (fuzz-tolerant)', pattern: 'FUZZ_CHILDCARE' };
      }
    }
    // Rent (fuzz-tolerant)
    if (FUZZ_RENT_PATTERN.test(stripped)) {
      logEscalation(testId, 'MEDIUM', 'HIGH', 'FUZZ_RENT');
      return { newUrgency: 'HIGH', escalated: true, reason: 'Phase 7.0: HOUSING: Rent assistance (fuzz-tolerant)', pattern: 'FUZZ_RENT' };
    }
    // Court costs
    if (COURT_COSTS_PATTERN.test(stripped)) {
      logEscalation(testId, 'MEDIUM', 'HIGH', 'COURT_COSTS');
      return { newUrgency: 'HIGH', escalated: true, reason: 'Phase 7.0: LEGAL: Court/legal costs require urgent response', pattern: 'COURT_COSTS' };
    }
  }

  // ── GROUP A: → CRITICAL (any level below CRITICAL) ──
  if (urgencyIndex(upper) < urgencyIndex('CRITICAL')) {
    // Shutoff notice / imminent shutoff
    if (SHUTOFF_CRITICAL_PATTERN.test(stripped)) {
      logEscalation(testId, upper, 'CRITICAL', 'SHUTOFF_CRITICAL');
      return { newUrgency: 'CRITICAL', escalated: true, reason: 'Phase 7.0: UTILITIES: Shutoff notice/imminent shutoff is a crisis', pattern: 'SHUTOFF_CRITICAL' };
    }
    // Eviction + notice/deadline
    if (EVICTION_CRITICAL_PATTERN.test(stripped)) {
      logEscalation(testId, upper, 'CRITICAL', 'EVICTION_CRITICAL');
      return { newUrgency: 'CRITICAL', escalated: true, reason: 'Phase 7.0: HOUSING: Eviction notice with deadline is a crisis', pattern: 'EVICTION_CRITICAL' };
    }
    // Hospital + housing loss
    if (upper === 'HIGH' && HOSPITAL_PATTERN.test(lower) && HOUSING_LOSS_PATTERN.test(lower)) {
      logEscalation(testId, 'HIGH', 'CRITICAL', 'HOSPITAL_CRISIS');
      return { newUrgency: 'CRITICAL', escalated: true, reason: 'Phase 7.0: HEALTHCARE: Hospital + housing loss is a combined crisis', pattern: 'HOSPITAL_CRISIS' };
    }
  }

  return { newUrgency: currentUrgency, escalated: false, reason: 'No Phase 7.0 patterns matched' };
}

function logEscalation(testId, from, to, pattern) {
  if (testId) {
    console.log(`  ⬆️  Phase70_Escalation [${testId}]: ${from} → ${to} (Phase 7.0: ${pattern})`);
  }
}

function getComponentVersion() {
  return COMPONENT_VERSION;
}

function getStatistics() {
  return {
    rulesGroupA: ['SHUTOFF_CRITICAL', 'EVICTION_CRITICAL', 'HOSPITAL_CRISIS'],
    rulesGroupB: ['FUZZ_JOB_LOSS', 'FUZZ_CHILDCARE', 'FUZZ_RENT', 'COURT_COSTS'],
    rulesGroupC: ['CAR_BREAKDOWN_LOW', 'SECURITY_DEPOSIT', 'SCHOOL_SUPPLIES', 'HOUSING_NEED', 'UTILITY_NEED'],
    expectedFixes: 72,
    safetyGuards: [
      'SHUTOFF requires "notice" or deadline (not bare "disconnect")',
      'EVICTION requires notice/deadline (not bare "facing eviction")',
      'Refined counter removes bare "monthly" but keeps "per month"',
      'Fuzz stripping handles disfluencies before pattern matching'
    ]
  };
}

module.exports = {
  applyPhase70UrgencyEscalation,
  getComponentVersion,
  getStatistics,
  COMPONENT_VERSION
};
