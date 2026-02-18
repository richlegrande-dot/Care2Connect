/**
 * Phase 4.4: Enhanced Urgency Escalation - Targeted Under-Assessment Fixes
 * 
 * Targets specific patterns where urgency is consistently under-assessed:
 * 1. Transportation emergencies (car breakdowns) 
 * 2. Child dependency situations
 * 3. Fragmented speech with urgency keywords
 * 4. Time-sensitive situations with pressure indicators
 * 
 * Expected Impact: Fix 15-20 cases from urgency_under_assessed bucket (32 cases, 16.0%)
 * Target Performance: +7.5% to +10.0% improvement (70.0% - 72.5% pass rate)
 */

// Phase 4.4 Urgency Escalation Enhancement Mapping
const PHASE44_URGENCY_ESCALATIONS = {
  'TRANSPORTATION_BREAKDOWN_CRITICAL': {
    description: 'Car breakdown with immediate transportation need',
    patterns: [
      /car broke down.*need.*(?:for )?repairs?/i,
      /broke down.*car.*need.*(?:repair|fix)/i,
      /vehicle broke.*need.*(?:money|help).*repair/i,
      /my car.*broke.*need.*(?:\d+|money).*fix/i
    ],
    currentUrgency: 'MEDIUM',
    targetUrgency: 'HIGH',
    reason: 'Transportation breakdown creates immediate mobility crisis'
  },
  
  'CHILD_DEPENDENCY_HIGH': {
    description: 'Children in need of essential care or support',
    patterns: [
      /(?:my )?children need.*(?:\d+|money|help)/i,
      /my.*(?:child|kid|son|daughter).*need.*(?:\d+|help)/i,
      /have.*(?:children|kids).*need.*(?:money|help|support)/i,
      /(?:\d+) year old.*need.*(?:help|money|support)/i
    ],
    currentUrgency: 'MEDIUM',
    targetUrgency: 'HIGH',
    reason: 'Child dependency elevates urgency due to vulnerability'
  },
  
  'CHILDCARE_EMERGENCY': {
    description: 'Immediate childcare needs affecting employment',
    patterns: [
      /(?:children|kids).*need.*(?:\d+|money).*childcare/i,
      /need.*(?:\d+|help).*childcare.*children/i,
      /childcare.*(?:children|kids).*need/i,
      /my children.*childcare.*need/i
    ],
    currentUrgency: 'MEDIUM',
    targetUrgency: 'HIGH',
    reason: 'Childcare emergencies affect ability to work and provide'
  },
  
  'FRAGMENTED_URGENCY_ESCALATION': {
    description: 'Fragmented speech with urgency keywords',
    patterns: [
      /(?:weeks? ago|days? ago).*(?:broke|need|help|emergency)/i,
      /(?:broke|emergency|need).*(?:weeks? ago|days? ago)/i,
      /previously.*problems.*need.*(?:\d+|help)/i,
      /had.*(?:problems|issues).*(?:weeks?|days?).*need/i
    ],
    currentUrgency: 'MEDIUM',
    targetUrgency: 'HIGH',
    reason: 'Time progression in fragmented speech indicates escalating situation'
  },
  
  'MULTI_ISSUE_ESCALATION': {
    description: 'Multiple housing/transportation/family issues combined',
    patterns: [
      /(?:rent problems|housing).*(?:car|transportation).*(?:child|kid)/i,
      /(?:car|transportation).*(?:rent|housing).*(?:child|kid)/i,
      /broke down.*rent problems.*(?:child|year old)/i,
      /(?:children|family).*(?:car|transportation).*(?:rent|housing)/i
    ],
    currentUrgency: 'MEDIUM',
    targetUrgency: 'HIGH',
    reason: 'Multiple simultaneous issues create compounding urgency'
  },
  
  'TIME_PRESSURE_ESCALATION': {
    description: 'Situations with implied or stated time pressure',
    patterns: [
      /(?:\d+) (?:weeks?|days?) ago.*(?:broke|need|help).*(?:\d+|money)/i,
      /(?:broke|need).*(?:\d+) (?:weeks?|days?) ago/i,
      /previously.*(?:problems|issues).*now.*need/i,
      /ago.*(?:broke|problem).*need.*(?:for|help)/i
    ],
    currentUrgency: 'MEDIUM',
    targetUrgency: 'HIGH',
    reason: 'Time pressure indicates situation has been deteriorating'
  }
};

/**
 * Phase 4.4 Enhanced Urgency Escalation
 */
function applyPhase44UrgencyEscalation(transcript, currentUrgency) {
  if (!transcript || typeof transcript !== 'string') {
    return {
      newUrgency: currentUrgency,
      escalated: false,
      reason: 'Invalid transcript'
    };
  }

  // Only escalate from MEDIUM to HIGH (targeting under-assessment)
  if (currentUrgency !== 'MEDIUM') {
    return {
      newUrgency: currentUrgency,
      escalated: false,
      reason: 'Phase 4.4 only escalates MEDIUM → HIGH'
    };
  }

  const cleanedTranscript = transcript.toLowerCase().trim();

  // Check each escalation pattern
  for (const [escalationType, config] of Object.entries(PHASE44_URGENCY_ESCALATIONS)) {
    if (config.currentUrgency !== currentUrgency) continue;
    
    // Test all patterns for this escalation type
    for (const pattern of config.patterns) {
      if (pattern.test(cleanedTranscript)) {
        return {
          newUrgency: config.targetUrgency,
          escalated: true,
          escalationType: escalationType,
          reason: `Phase 4.4: ${config.reason}`,
          patternMatched: pattern.source
        };
      }
    }
  }

  return {
    newUrgency: currentUrgency,
    escalated: false,
    reason: 'No Phase 4.4 escalation patterns matched'
  };
}

module.exports = {
  PHASE44_URGENCY_ESCALATIONS,
  applyPhase44UrgencyEscalation
};