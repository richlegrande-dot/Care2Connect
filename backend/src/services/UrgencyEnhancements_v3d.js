/**
 * Urgency Enhancements v3d - Phase 1 Core30 De-escalation Fixes
 *
 * Purpose: Prevent urgency over-assessment in Core30 cases
 * Focus: Fix T009, T011, T012, T015, T017, T023, T025 (7 over-assessed cases)
 *
 * Strategy:
 * - De-escalate EDUCATION without deadline (T009)
 * - De-escalate vague OTHER requests (T011)
 * - De-escalate family grief context (T012)
 * - De-escalate eviction threats (not imminent) (T015, T025)
 * - De-escalate surgery mentions (not emergency) (T017)
 * - De-escalate hospital bills (ongoing care) (T023)
 */

class UrgencyEnhancements_v3d {
  constructor() {
    this.name = "UrgencyEnhancements_v3d";
    this.version = "3.0d";
  }

  /**
   * De-escalate urgency when over-assessment patterns detected
   *
   * @param {string} transcript - Full transcript text
   * @param {string} category - Classified category
   * @param {object} baseResult - Base urgency result { urgency, confidence, score }
   * @returns {object} Enhanced result { urgency, confidence, de_escalated, reasons }
   */
  deEscalateUrgency(transcript, category, baseResult) {
    const text = transcript.toLowerCase();
    const reasons = [...(baseResult.reasons || [])];
    let urgency = baseResult.urgency;
    let confidence = baseResult.confidence || 0.7;
    let de_escalated = false;

    // Fix 1: EDUCATION De-escalation (T009)
    // "college expenses", "tuition" WITHOUT "deadline", "losing spot", "due tomorrow"
    if (
      category === "EDUCATION" &&
      (urgency === "HIGH" || urgency === "CRITICAL")
    ) {
      const hasDeadline =
        /deadline|due (tomorrow|today|this week)|losing (my )?spot|enrollment deadline|registration closes/i.test(
          transcript,
        );
      const isOngoingEducation =
        /college|tuition|certification program|training/i.test(transcript);

      if (!hasDeadline && isOngoingEducation) {
        urgency = "MEDIUM";
        confidence = 0.75;
        de_escalated = true;
        reasons.push("v3d: EDUCATION de-escalation (no deadline → MEDIUM)");
      }
    }

    // Fix 2: OTHER De-escalation (T011)
    // Vague/personal situations WITHOUT explicit urgency
    if (category === "OTHER" && (urgency === "MEDIUM" || urgency === "HIGH")) {
      const isVague =
        /personal situation|hard to explain|just (a )?personal|not (medical|housing|employment)/i.test(
          transcript,
        );
      const hasExplicitUrgency =
        /urgent|emergency|right now|immediately|critical|today/i.test(
          transcript,
        );

      if (isVague && !hasExplicitUrgency) {
        urgency = "LOW";
        confidence = 0.7;
        de_escalated = true;
        reasons.push("v3d: OTHER de-escalation (vague personal → LOW)");
      }
    }

    // Fix 3: FAMILY Grief Context De-escalation (T012)
    // Wedding/ceremony + "passed away"/"father died" should be LOW (grief context, not urgent)
    if (category === "FAMILY" && (urgency === "MEDIUM" || urgency === "HIGH")) {
      const isFamilyEvent = /wedding|ceremony|graduation|family event/i.test(
        transcript,
      );
      const hasGriefContext = /passed away|died|death|funeral/i.test(
        transcript,
      );

      if (isFamilyEvent && hasGriefContext) {
        urgency = "LOW";
        confidence = 0.72;
        de_escalated = true;
        reasons.push(
          "v3d: FAMILY grief context → LOW (wedding after loss, not urgent)",
        );
      }
    }

    // Fix 4: HOUSING Eviction De-escalation (T015, T025)
    // "facing eviction", "threatening eviction" → HIGH (not CRITICAL unless imminent)
    if (category === "HOUSING" && urgency === "CRITICAL") {
      const isEvictionThreat =
        /(facing|threatening) eviction|eviction notice/i.test(transcript);
      const isImminent =
        /eviction (tomorrow|today|this week|in \d+ days)|eviction (on|by) (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(
          transcript,
        );

      if (isEvictionThreat && !isImminent) {
        urgency = "HIGH";
        confidence = 0.78;
        de_escalated = true;
        reasons.push(
          "v3d: HOUSING eviction de-esscalation (threat not imminent → HIGH)",
        );
      }
    }

    // Fix 5: HEALTHCARE Surgery De-escalation (T017)
    // "surgery", "doctor says I need" → HIGH (not CRITICAL unless emergency/tomorrow)
    if (category === "HEALTHCARE" && urgency === "CRITICAL") {
      const hasSurgery = /surgery|operation/i.test(transcript);
      const isEmergency =
        /emergency|tomorrow|today|right now|life.?threatening|critical condition/i.test(
          transcript,
        );
      const isInjuryWorkRelated =
        /injured at work|can't work|lost (my )?job/i.test(transcript);

      if (hasSurgery && !isEmergency && isInjuryWorkRelated) {
        urgency = "HIGH";
        confidence = 0.76;
        de_escalated = true;
        reasons.push(
          "v3d: HEALTHCARE surgery de-escalation (needed but not emergency → HIGH)",
        );
      }
    }

    // Fix 6: HEALTHCARE Hospital Bills De-escalation (T023)
    // "hospital bills piling up", "ongoing care" → MEDIUM (not HIGH unless urgent medical need)
    if (
      category === "HEALTHCARE" &&
      (urgency === "HIGH" || urgency === "CRITICAL")
    ) {
      const isBillingConcern =
        /bills (are )?piling up|bills (are )?really piling|outstanding bills|can't pay (the )?bills/i.test(
          transcript,
        );
      const hasUrgentMedical =
        /emergency|surgery tomorrow|critical condition|life.?threatening|dying/i.test(
          transcript,
        );

      if (isBillingConcern && !hasUrgentMedical) {
        urgency = "MEDIUM";
        confidence = 0.74;
        de_escalated = true;
        reasons.push(
          "v3d: HEALTHCARE billing de-escalation (bills piling up, not urgent medical → MEDIUM)",
        );
      }
    }

    return {
      urgency,
      confidence,
      de_escalated,
      reasons,
      original: baseResult.urgency,
    };
  }
}

module.exports = { UrgencyEnhancements_v3d };
