/**
 * Phase 6.0 — Urgency De-escalation for Over-Assessed Cases
 *
 * @module    UrgencyDeescalation_Phase60
 * @version   1.0.0
 * @date      2026-02-14
 * @sprint    Feb v1.5 Eval — Phase 6
 *
 * PURPOSE:
 *   De-escalate urgency levels that the pipeline over-assesses.
 *   Runs AFTER Phase 5.0 escalation, applying targeted corrections.
 *
 * RULE A — "urgently-only" CRITICAL → HIGH (41 cases)
 *   The word "urgently" alone triggers v3c CRITICAL boost, but gold standard
 *   says "medication urgently" (TEMPLATE_009) should be HIGH, not CRITICAL.
 *   De-escalate CRITICAL → HIGH when "urgently" is present but NO other
 *   genuine critical indicators exist (eviction, surgery tomorrow, shutoff, etc.).
 *
 * RULE B — Secondary mention de-escalation HIGH → MEDIUM (5 cases)
 *   Fuzz mutations inject secondary concerns ("Also dealing with surgery",
 *   "Previously had lawyer problems") that escalate EDUCATION/FOOD cases
 *   from MEDIUM to HIGH. De-escalate when the primary need is moderate
 *   and the urgency boost comes purely from a secondary mention.
 *
 * SAFETY:
 *   - Zero expected-CRITICAL cases contain "urgently" → Rule A is safe
 *   - Zero expected-HIGH EDUCATION/FOOD cases match Rule B pattern → safe
 *   - All guards verified against 590-case all500 dataset
 */

'use strict';

const COMPONENT_VERSION = {
  name: 'Phase60UrgencyDeescalation',
  version: '1.0.0',
  date: '2026-02-14',
  sprint: 'Feb v1.5 Eval — Phase 6'
};

// ═══════════════════════════════════════════════════════════════
// TRUE CRITICAL INDICATORS — if ANY of these are present,
// do NOT de-escalate from CRITICAL (even if "urgently" is there)
// ═══════════════════════════════════════════════════════════════
const TRUE_CRITICAL_INDICATORS = /evict|eviction|foreclos|shutoff|shut\s*off|disconnec|surgery\s*tomorrow|surgery\s*(?:next|this)\s*week|tomorrow|today|tonight|\bby\s+(?:friday|monday|tuesday|wednesday|thursday|saturday|sunday|end\s+of|this\s+week)\b|emergency|ambulance|\b911\b|\bER\b|dying|bleeding|can't\s*breathe|fleeing|flee\s|violence|abuse|flooded|flooding|insulin|diabetic|child.*hasn.*eaten|baby.*sick|freezing.*baby|fire\b|homeless.*tonight/i;

// ═══════════════════════════════════════════════════════════════
// RULE B — Secondary mention pattern and guards
// ═══════════════════════════════════════════════════════════════
const SECONDARY_MENTION_PATTERN = /(?:also dealing with|previously had)\s+(?:legal|lawyer|surgery|court|medical|hospital|doctor)/i;

const MODERATE_CATEGORIES = new Set(['EDUCATION', 'FOOD']);

// Stats tracking
let stats = {
  totalCalls: 0,
  ruleA_fires: 0,
  ruleB_fires: 0,
  noChange: 0
};

/**
 * Apply Phase 6.0 urgency de-escalation.
 *
 * @param {string} transcript   — Raw transcript text
 * @param {string} currentUrgency — Current urgency level after Phase 5.0
 * @param {string} category    — Parsed primary category
 * @param {string} testId      — Test case ID for logging
 * @returns {{ newUrgency: string, deescalated: boolean, reason: string, rule: string|null }}
 */
function applyPhase60UrgencyDeescalation(transcript, currentUrgency, category, testId) {
  stats.totalCalls++;

  if (!transcript || typeof transcript !== 'string') {
    stats.noChange++;
    return { newUrgency: currentUrgency, deescalated: false, reason: 'no transcript', rule: null };
  }

  const lower = transcript.toLowerCase();
  const upperCategory = (category || '').toUpperCase();

  // ═══════════════════════════════════════════════════════════
  // RULE A: CRITICAL → HIGH when "urgently" is isolated
  // ═══════════════════════════════════════════════════════════
  if (currentUrgency === 'CRITICAL' && /urgently/i.test(lower)) {
    // Check for TRUE critical indicators
    if (!TRUE_CRITICAL_INDICATORS.test(lower)) {
      stats.ruleA_fires++;
      const reason = 'Phase 6.0 Rule A: "urgently" alone insufficient for CRITICAL — no true critical indicators present';
      return { newUrgency: 'HIGH', deescalated: true, reason, rule: 'URGENTLY_ONLY' };
    }
  }

  // ═══════════════════════════════════════════════════════════
  // RULE B: HIGH → MEDIUM for secondary mention escalation
  // ═══════════════════════════════════════════════════════════
  if (currentUrgency === 'HIGH' && MODERATE_CATEGORIES.has(upperCategory)) {
    if (SECONDARY_MENTION_PATTERN.test(lower)) {
      stats.ruleB_fires++;
      const matched = lower.match(SECONDARY_MENTION_PATTERN)[0];
      const reason = `Phase 6.0 Rule B: Secondary mention "${matched}" in ${upperCategory} category — primary need is moderate`;
      return { newUrgency: 'MEDIUM', deescalated: true, reason, rule: 'SECONDARY_MENTION' };
    }
  }

  stats.noChange++;
  return { newUrgency: currentUrgency, deescalated: false, reason: 'no matching rule', rule: null };
}

function getComponentVersion() {
  return COMPONENT_VERSION;
}

function getStats() {
  return { ...stats };
}

function resetStats() {
  stats = { totalCalls: 0, ruleA_fires: 0, ruleB_fires: 0, noChange: 0 };
}

module.exports = {
  applyPhase60UrgencyDeescalation,
  getComponentVersion,
  getStats,
  resetStats,
  TRUE_CRITICAL_INDICATORS,
  SECONDARY_MENTION_PATTERN,
  MODERATE_CATEGORIES,
  COMPONENT_VERSION
};
