# Parser Architecture Improvement Plan - Beyond 37.93%

**Date:** January 30, 2026  
**Status:** PLANNING PHASE - NOT IMPLEMENTED  
**Current Performance:** 37.93% (109/290 cases)  
**Target Performance:** 50-60% (145-174 cases)  
**Approach:** Architectural refactoring of core extraction engines

---

## 📋 Executive Summary

### Current State Analysis

**Performance Plateau:** 37.93% pass rate achieved through pattern tuning, but further improvement blocked by architectural limitations.

**Blocking Issues:**
1. **Urgency Engine:** Additive keyword scoring creates zero-sum threshold trades (112 failures = 38.6%)
2. **Category Detection:** Single-winner selection can't handle multi-intent disambiguation (39 failures = 13.4%)
3. **Name Extraction:** Regex patterns fail on conversational fragments (32 failures = 11.0%)
4. **Amount Selection:** First-match heuristics fail on multi-number contexts (21 failures = 7.2%)

**Key Insight:** Pattern/threshold tuning exhausted. Need fundamental architectural changes to core extraction engines.

---

## 🎯 Strategic Goals

### Phase Targets

| Phase | Focus Area | Est. Gain | Cumulative | Effort | Risk |
|-------|-----------|-----------|------------|--------|------|
| **Phase 1** | Urgency Refactor | +10-14% | 48-52% | 8-12h | HIGH |
| **Phase 2** | Category Disambiguation | +3-5% | 51-57% | 4-6h | MEDIUM |
| **Phase 3** | Name Enhancement | +5-7% | 56-64% | 6-8h | MEDIUM |
| **Phase 4** | Amount Context | +2-3% | 58-67% | 3-4h | LOW |
| **TOTAL** | All Systems | **+21-30%** | **58-67%** | **21-30h** | - |

### Success Metrics

**Hard Requirements:**
- Overall pass rate: ≥50% (145+ cases)
- Core30 baseline: ≥60% (maintain current)
- realistic50: ≥70% (maintain current)
- No catastrophic regressions (no dataset drops >10%)

**Soft Targets:**
- Urgency failures: <60 cases (currently 112)
- Category failures: <25 cases (currently 39)
- Name failures: <20 cases (currently 32)
- Performance: <3500ms total (currently 2746ms)

---

## 🏗️ Phase 1: Urgency Scoring Engine Refactor

### Current Architecture Problems

**Existing System (`urgencyEngine.ts`):**
```typescript
// CURRENT: Additive keyword matching
class UrgencyAssessmentEngine {
  assessUrgency(text: string, context: any): UrgencyAssessment {
    let score = 0.0;
    
    // Problem 1: Simple additive scoring
    if (hasKeyword(text, 'urgent')) score += 0.25;
    if (hasKeyword(text, 'need')) score += 0.15;
    if (hasKeyword(text, 'today')) score += 0.20;
    
    // Problem 2: Rigid category modifiers
    if (context.category === 'SAFETY') score = 0.85; // Forced override
    if (context.category === 'HOUSING') score += 0.05; // Fixed boost
    
    // Problem 3: Static threshold mapping
    if (score >= 0.70) return 'CRITICAL';
    if (score >= 0.42) return 'HIGH';
    if (score >= 0.15) return 'MEDIUM';
    return 'LOW';
  }
}
```

**Why It Fails:**
1. **No Combination Detection:** "eviction + deadline" not recognized as crisis multiplier
2. **Context Blindness:** "urgent" medical = "urgent" supplies (equal weight)
3. **Threshold Sensitivity:** 0.69 vs 0.70 score creates CRITICAL vs HIGH mismatch
4. **Zero-Sum Trades:** Adjusting thresholds helps some, hurts others (observed: -1 case)

### Proposed Architecture

**New Multi-Layer Scoring Engine:**

```typescript
/**
 * Phase 1: Multi-Layer Urgency Assessment Engine
 * 
 * Architecture Pattern: Pipeline with multiplicative scoring
 * - Layer 1: Temporal urgency detection
 * - Layer 2: Crisis pattern matching
 * - Layer 3: Category contextual severity
 * - Layer 4: Signal combination analysis
 * - Layer 5: Confidence-weighted level resolution
 */

interface UrgencyLayer {
  name: string;
  assess(context: UrgencyContext): LayerResult;
  weight: number;
}

interface LayerResult {
  score: number;           // 0.0-1.0 contribution
  confidence: number;      // 0.0-1.0 reliability
  signals: string[];       // Detected patterns
  multipliers: number[];   // Crisis amplifiers
}

interface UrgencyContext {
  text: string;
  normalizedText: string;
  category: string;
  segments: TranscriptSegment[];
  temporalMarkers: TemporalMarker[];
  emotionalSignals: EmotionalSignal[];
}

class EnhancedUrgencyEngine {
  private layers: UrgencyLayer[];
  
  constructor() {
    this.layers = [
      new TemporalUrgencyLayer(),      // "today", "tomorrow", "by Friday"
      new CrisisPatternLayer(),        // "eviction + shutoff", "surgery + tomorrow"
      new CategoryContextLayer(),      // Healthcare urgency vs education urgency
      new SignalCombinationLayer(),    // Multiple crisis signals
      new EmotionalDistressLayer()     // "don't know what to do", desperation
    ];
  }
  
  async assessUrgency(text: string, context: ExtractionContext): Promise<UrgencyAssessment> {
    // Step 1: Build enriched context
    const urgencyContext = await this.buildContext(text, context);
    
    // Step 2: Run all layers in parallel
    const layerResults = await Promise.all(
      this.layers.map(layer => layer.assess(urgencyContext))
    );
    
    // Step 3: Combine scores with multiplicative weighting
    const combinedScore = this.combineLayerScores(layerResults);
    
    // Step 4: Resolve level with confidence bands
    const level = this.resolveLevel(combinedScore, layerResults);
    
    return {
      urgencyLevel: level,
      score: combinedScore.finalScore,
      confidence: combinedScore.confidence,
      layers: layerResults,
      reasoning: this.explainDecision(layerResults, level)
    };
  }
  
  private combineLayerScores(results: LayerResult[]): CombinedScore {
    // Multiplicative combination for crisis patterns
    let baseScore = 0.3; // Default medium-low
    let crisisMultiplier = 1.0;
    let totalConfidence = 0.0;
    
    for (const result of results) {
      // Additive for base signals
      if (result.score > baseScore) {
        baseScore = Math.max(baseScore, result.score);
      }
      
      // Multiplicative for crisis amplifiers
      for (const multiplier of result.multipliers) {
        crisisMultiplier *= multiplier;
      }
      
      // Weighted confidence
      totalConfidence += result.confidence * result.weight;
    }
    
    const finalScore = Math.min(baseScore * crisisMultiplier, 1.0);
    const avgConfidence = totalConfidence / results.length;
    
    return { finalScore, confidence: avgConfidence };
  }
  
  private resolveLevel(
    combined: CombinedScore, 
    results: LayerResult[]
  ): UrgencyLevel {
    const score = combined.score;
    const confidence = combined.confidence;
    
    // Dynamic thresholds based on confidence
    // High confidence = wider bands (less threshold sensitivity)
    // Low confidence = conservative (prevent over-assessment)
    
    if (confidence >= 0.8) {
      // High confidence - wider bands
      if (score >= 0.65) return 'CRITICAL';
      if (score >= 0.38) return 'HIGH';
      if (score >= 0.12) return 'MEDIUM';
      return 'LOW';
    } else if (confidence >= 0.5) {
      // Medium confidence - standard bands
      if (score >= 0.70) return 'CRITICAL';
      if (score >= 0.42) return 'HIGH';
      if (score >= 0.15) return 'MEDIUM';
      return 'LOW';
    } else {
      // Low confidence - conservative (prevent over-assessment)
      if (score >= 0.75) return 'CRITICAL';
      if (score >= 0.50) return 'HIGH';
      if (score >= 0.20) return 'MEDIUM';
      return 'LOW';
    }
  }
}
```

### Layer Implementations

**Layer 1: Temporal Urgency Detection**

```typescript
class TemporalUrgencyLayer implements UrgencyLayer {
  name = 'temporal_urgency';
  weight = 0.25;
  
  assess(context: UrgencyContext): LayerResult {
    const signals: string[] = [];
    const multipliers: number[] = [];
    let score = 0.0;
    
    // Detect temporal markers
    const temporal = this.detectTemporalMarkers(context.text);
    
    // Immediate urgency (today, tonight, right now)
    if (temporal.immediate) {
      score = 0.75;
      signals.push(`immediate: ${temporal.immediate}`);
      multipliers.push(1.3); // 30% crisis amplification
    }
    
    // Near-term deadline (tomorrow, this week, by Friday)
    else if (temporal.nearDeadline) {
      score = 0.60;
      signals.push(`near_deadline: ${temporal.nearDeadline}`);
      multipliers.push(1.15); // 15% amplification
    }
    
    // Mid-term (next week, end of month)
    else if (temporal.midTerm) {
      score = 0.40;
      signals.push(`mid_term: ${temporal.midTerm}`);
    }
    
    // Long-term or no deadline
    else {
      score = 0.20;
    }
    
    const confidence = temporal.detected ? 0.9 : 0.5;
    
    return { score, confidence, signals, multipliers };
  }
  
  private detectTemporalMarkers(text: string): TemporalMarkers {
    // Enhanced temporal pattern detection
    const immediate = /\b(today|tonight|right now|immediately|asap|this morning|this afternoon)\b/i;
    const nearDeadline = /\b(tomorrow|by (monday|tuesday|wednesday|thursday|friday|weekend)|this week|in \d+ days?)\b/i;
    const midTerm = /\b(next week|end of month|in \d+ weeks?|next month)\b/i;
    
    return {
      immediate: immediate.exec(text)?.[0],
      nearDeadline: nearDeadline.exec(text)?.[0],
      midTerm: midTerm.exec(text)?.[0],
      detected: immediate.test(text) || nearDeadline.test(text) || midTerm.test(text)
    };
  }
}
```

**Layer 2: Crisis Pattern Detection**

```typescript
class CrisisPatternLayer implements UrgencyLayer {
  name = 'crisis_patterns';
  weight = 0.30;
  
  assess(context: UrgencyContext): LayerResult {
    const signals: string[] = [];
    const multipliers: number[] = [];
    let score = 0.0;
    
    // Detect crisis combinations
    const crisisPatterns = [
      {
        pattern: /eviction.*deadline/i,
        score: 0.85,
        multiplier: 1.5,
        signal: 'eviction_with_deadline'
      },
      {
        pattern: /surgery.*tomorrow/i,
        score: 0.90,
        multiplier: 1.6,
        signal: 'surgery_imminent'
      },
      {
        pattern: /(shutoff|disconnect).*notice/i,
        score: 0.80,
        multiplier: 1.4,
        signal: 'utility_shutoff_notice'
      },
      {
        pattern: /lost.*job.*eviction/i,
        score: 0.75,
        multiplier: 1.5,
        signal: 'employment_housing_crisis'
      }
    ];
    
    for (const crisis of crisisPatterns) {
      if (crisis.pattern.test(context.text)) {
        score = Math.max(score, crisis.score);
        multipliers.push(crisis.multiplier);
        signals.push(crisis.signal);
      }
    }
    
    // Default non-crisis
    if (signals.length === 0) {
      score = 0.30;
    }
    
    const confidence = signals.length > 0 ? 0.85 : 0.6;
    
    return { score, confidence, signals, multipliers };
  }
}
```

**Layer 3: Category Context Severity**

```typescript
class CategoryContextLayer implements UrgencyLayer {
  name = 'category_context';
  weight = 0.20;
  
  assess(context: UrgencyContext): LayerResult {
    const signals: string[] = [];
    const multipliers: number[] = [];
    
    // Context-aware category severity scoring
    const severityMap = this.getCategorySeverityContext(
      context.category,
      context.text
    );
    
    let score = severityMap.baseScore;
    
    // Apply context modifiers
    if (severityMap.hasSeverityMarkers) {
      score += 0.15;
      multipliers.push(1.2);
      signals.push(`${context.category}_severe_context`);
    }
    
    const confidence = severityMap.confidence;
    
    return { score, confidence, signals, multipliers };
  }
  
  private getCategorySeverityContext(category: string, text: string): SeverityContext {
    switch (category) {
      case 'HEALTHCARE':
        return {
          baseScore: 0.55,
          hasSeverityMarkers: /\b(surgery|emergency|critical|life|death)\b/i.test(text),
          confidence: 0.8
        };
      
      case 'HOUSING':
        return {
          baseScore: 0.50,
          hasSeverityMarkers: /\b(eviction|homeless|kicked out|losing)\b/i.test(text),
          confidence: 0.85
        };
      
      case 'SAFETY':
        return {
          baseScore: 0.85,
          hasSeverityMarkers: /\b(danger|abuse|violence|threat)\b/i.test(text),
          confidence: 0.9
        };
      
      case 'TRANSPORTATION':
        return {
          baseScore: 0.25,
          hasSeverityMarkers: /\b(can't work|lose job|stranded)\b/i.test(text),
          confidence: 0.7
        };
      
      case 'EDUCATION':
        return {
          baseScore: 0.20,
          hasSeverityMarkers: /\b(expelled|failing|dropout)\b/i.test(text),
          confidence: 0.65
        };
      
      default:
        return {
          baseScore: 0.30,
          hasSeverityMarkers: false,
          confidence: 0.5
        };
    }
  }
}
```

**Layer 4: Signal Combination Analysis**

```typescript
class SignalCombinationLayer implements UrgencyLayer {
  name = 'signal_combinations';
  weight = 0.15;
  
  assess(context: UrgencyContext): LayerResult {
    const signals: string[] = [];
    const multipliers: number[] = [];
    
    // Count crisis signal density
    const crisisKeywords = [
      'urgent', 'emergency', 'crisis', 'critical', 
      'eviction', 'shutoff', 'surgery', 'danger',
      'immediately', 'deadline', 'notice', 'losing'
    ];
    
    const signalCount = crisisKeywords.filter(kw => 
      new RegExp(`\\b${kw}\\b`, 'i').test(context.text)
    ).length;
    
    let score = 0.30; // Base
    
    if (signalCount >= 4) {
      score = 0.80;
      multipliers.push(1.4);
      signals.push('multiple_crisis_signals');
    } else if (signalCount >= 2) {
      score = 0.55;
      multipliers.push(1.2);
      signals.push('dual_crisis_signals');
    } else if (signalCount >= 1) {
      score = 0.40;
      signals.push('single_crisis_signal');
    }
    
    const confidence = signalCount >= 2 ? 0.8 : 0.6;
    
    return { score, confidence, signals, multipliers };
  }
}
```

**Layer 5: Emotional Distress Detection**

```typescript
class EmotionalDistressLayer implements UrgencyLayer {
  name = 'emotional_distress';
  weight = 0.10;
  
  assess(context: UrgencyContext): LayerResult {
    const signals: string[] = [];
    const multipliers: number[] = [];
    
    // Detect emotional distress markers
    const distressPatterns = [
      { pattern: /don't know what to do/i, score: 0.60, signal: 'helplessness' },
      { pattern: /desperate|desperation/i, score: 0.70, signal: 'desperation' },
      { pattern: /scared|terrified|afraid/i, score: 0.65, signal: 'fear' },
      { pattern: /help me|please help/i, score: 0.55, signal: 'plea_for_help' }
    ];
    
    let score = 0.20; // Base (no distress)
    
    for (const pattern of distressPatterns) {
      if (pattern.pattern.test(context.text)) {
        score = Math.max(score, pattern.score);
        signals.push(pattern.signal);
        
        // Emotional distress should amplify, not dominate
        multipliers.push(1.1);
      }
    }
    
    const confidence = signals.length > 0 ? 0.7 : 0.5;
    
    return { score, confidence, signals, multipliers };
  }
}
```

### Implementation Plan

**Step 1: Core Framework (3 hours)**
- Create `EnhancedUrgencyEngine` class with layer pipeline
- Implement `UrgencyContext` builder
- Add `combineLayerScores()` with multiplicative logic
- Implement confidence-based threshold resolution

**Step 2: Layer Implementations (4 hours)**
- Implement `TemporalUrgencyLayer`
- Implement `CrisisPatternLayer`
- Implement `CategoryContextLayer`
- Implement `SignalCombinationLayer`
- Implement `EmotionalDistressLayer`

**Step 3: Integration (2 hours)**
- Replace calls to old `UrgencyAssessmentEngine`
- Update `extractSignals()` to use new engine
- Add debug output for layer results
- Preserve fallback to old engine for safety

**Step 4: Testing & Calibration (3 hours)**
- Run Core30 evaluation (gate: must maintain 60%)
- Run realistic50 evaluation (gate: must maintain 70%)
- Run full suite evaluation (target: 48-52%)
- Adjust layer weights based on results
- Fine-tune confidence bands

### Risk Mitigation

**High Risk Items:**
1. **Breaking existing urgency logic** → Mitigation: Keep old engine as fallback, feature flag
2. **Performance degradation** → Mitigation: Profile layer execution, optimize hot paths
3. **Unexpected regressions** → Mitigation: Gate on Core30/realistic50 baselines

**Rollback Plan:**
- Feature flag: `USE_ENHANCED_URGENCY_ENGINE` (default: false)
- If regressions detected, disable flag and investigate
- Full revert possible via git checkout

### Expected Outcomes

**Best Case:** +14% improvement (52% total)
- Fix 30-35 urgency under-assessed cases
- Fix 5-10 urgency over-assessed cases
- Net: +40 passing cases

**Likely Case:** +10-12% improvement (48-50% total)
- Fix 25-30 urgency under-assessed cases
- Fix 5-8 urgency over-assessed cases
- Net: +30-35 passing cases

**Worst Case:** +5-8% improvement (43-46% total)
- Fix 15-20 urgency cases
- Create 0-5 new failures
- Net: +15-20 passing cases

---

## 🏗️ Phase 2: Enhanced Category Disambiguation

### Current Architecture Problems

**Existing System:**
```typescript
// CURRENT: Single-winner category selection
function categorizeNeeds(text: string): NeedCategory[] {
  const categories: NeedCategory[] = [];
  
  for (const [category, keywords] of Object.entries(NEEDS_KEYWORDS)) {
    const matchedKeywords = keywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );
    
    if (matchedKeywords.length > 0) {
      categories.push({
        category,
        keywords: matchedKeywords,
        confidence: matchedKeywords.length / 3
      });
    }
  }
  
  // Problem: Returns only highest-confidence category
  return categories.sort((a, b) => b.confidence - a.confidence);
}

function resolveCategoryPriority(categories: NeedCategory[]): string {
  // Problem: Priority-based selection can't handle multi-intent
  return categories[0].category; // Winner takes all
}
```

**Why It Fails:**
1. **Multi-Intent Blind:** "lost job, need rent" detects EMPLOYMENT only, ignores HOUSING need
2. **Context Ignorance:** Can't distinguish primary need from root cause
3. **No Disambiguation:** Multiple detected categories always use priority, never context

### Proposed Architecture

**New Multi-Intent Disambiguation System:**

```typescript
/**
 * Phase 2: Multi-Intent Category Disambiguation
 * 
 * Architecture Pattern: Intent graph with context-aware resolution
 * - Detects all category intents (not just top match)
 * - Builds intent relationship graph (cause → need)
 * - Uses context to disambiguate primary intent
 * - Falls back to priority for ties
 */

interface CategoryIntent {
  category: string;
  confidence: number;
  keywords: string[];
  role: 'primary' | 'secondary' | 'cause' | 'consequence';
  contextScore: number;
}

interface IntentGraph {
  nodes: CategoryIntent[];
  relationships: IntentRelationship[];
  primaryIntent: string;
  secondaryIntents: string[];
}

interface IntentRelationship {
  from: string;  // Cause category
  to: string;    // Effect category
  type: 'causes' | 'requires' | 'related';
  strength: number;
}

class EnhancedCategoryEngine {
  async detectCategory(
    text: string,
    context: ExtractionContext
  ): Promise<CategoryResult> {
    // Step 1: Detect all category intents
    const intents = this.detectAllIntents(text);
    
    // Step 2: Build intent relationship graph
    const graph = this.buildIntentGraph(intents, text);
    
    // Step 3: Disambiguate primary intent using context
    const primary = this.disambiguatePrimaryIntent(graph, text, context);
    
    // Step 4: Identify secondary intents
    const secondary = this.identifySecondaryIntents(graph, primary);
    
    return {
      primaryCategory: primary,
      secondaryCategories: secondary,
      intentGraph: graph,
      confidence: this.calculateConfidence(graph, primary)
    };
  }
  
  private detectAllIntents(text: string): CategoryIntent[] {
    const intents: CategoryIntent[] = [];
    
    for (const [category, keywords] of Object.entries(NEEDS_KEYWORDS)) {
      const matchedKeywords = keywords.filter(kw => 
        new RegExp(`\\b${kw}\\b`, 'i').test(text)
      );
      
      if (matchedKeywords.length > 0) {
        const confidence = Math.min(matchedKeywords.length / 3, 1.0);
        const contextScore = this.scoreContextRelevance(category, text);
        
        intents.push({
          category,
          confidence,
          keywords: matchedKeywords,
          role: 'unknown', // Assigned in graph building
          contextScore
        });
      }
    }
    
    return intents;
  }
  
  private buildIntentGraph(
    intents: CategoryIntent[],
    text: string
  ): IntentGraph {
    // Detect cause-effect relationships
    const relationships: IntentRelationship[] = [];
    
    // Pattern: "lost job" (EMPLOYMENT) → "need rent" (HOUSING)
    if (this.hasIntent(intents, 'EMPLOYMENT') && this.hasIntent(intents, 'HOUSING')) {
      const employmentFirst = text.indexOf('lost job') < text.indexOf('rent');
      if (employmentFirst) {
        relationships.push({
          from: 'EMPLOYMENT',
          to: 'HOUSING',
          type: 'causes',
          strength: 0.8
        });
      }
    }
    
    // Pattern: "car broke" (TRANSPORTATION) → "can't work" (EMPLOYMENT)
    if (this.hasIntent(intents, 'TRANSPORTATION') && this.hasIntent(intents, 'EMPLOYMENT')) {
      const hasWorkNecessity = /can't (work|get to work|make it to work)/i.test(text);
      if (hasWorkNecessity) {
        relationships.push({
          from: 'TRANSPORTATION',
          to: 'EMPLOYMENT',
          type: 'requires',
          strength: 0.9
        });
      }
    }
    
    // Assign roles based on relationships
    this.assignRoles(intents, relationships);
    
    return {
      nodes: intents,
      relationships,
      primaryIntent: '', // Set in disambiguation
      secondaryIntents: []
    };
  }
  
  private disambiguatePrimaryIntent(
    graph: IntentGraph,
    text: string,
    context: ExtractionContext
  ): string {
    // Strategy 1: Check for explicit need statements
    const needPattern = /\b(need|looking for|trying to get|help with)\s+(?:help\s+)?(?:with\s+)?([a-z\s]+)/gi;
    const needMatches = Array.from(text.matchAll(needPattern));
    
    for (const match of needMatches) {
      const needText = match[2];
      
      // Check which category this need phrase matches
      for (const intent of graph.nodes) {
        if (intent.keywords.some(kw => needText.includes(kw))) {
          // Explicit need statement = primary intent
          return intent.category;
        }
      }
    }
    
    // Strategy 2: Check for consequence intents (effects = primary)
    const consequenceIntents = graph.nodes.filter(
      node => node.role === 'consequence'
    );
    if (consequenceIntents.length === 1) {
      return consequenceIntents[0].category;
    }
    
    // Strategy 3: Use context scores
    const sortedByContext = [...graph.nodes].sort(
      (a, b) => b.contextScore - a.contextScore
    );
    if (sortedByContext[0].contextScore > sortedByContext[1]?.contextScore * 1.5) {
      return sortedByContext[0].category;
    }
    
    // Strategy 4: Fall back to priority
    return this.applyPriorityFallback(graph.nodes);
  }
  
  private scoreContextRelevance(category: string, text: string): number {
    // Context-specific scoring based on surrounding phrases
    
    const contextPatterns = {
      HOUSING: [
        { pattern: /need.{0,20}(rent|evict|place to stay)/i, score: 0.9 },
        { pattern: /help.{0,20}(housing|apartment)/i, score: 0.85 },
        { pattern: /pay.{0,20}rent/i, score: 0.8 }
      ],
      EMPLOYMENT: [
        { pattern: /need.{0,20}(job|work|income)/i, score: 0.9 },
        { pattern: /lost.{0,20}job/i, score: 0.7 }, // Cause, not need
        { pattern: /can't.{0,20}work/i, score: 0.85 }
      ],
      TRANSPORTATION: [
        { pattern: /need.{0,20}(car|vehicle|transportation)/i, score: 0.9 },
        { pattern: /car.{0,20}broke/i, score: 0.6 }, // Cause, not need
        { pattern: /fix.{0,20}(car|vehicle)/i, score: 0.7 }
      ],
      HEALTHCARE: [
        { pattern: /need.{0,20}(medical|surgery|treatment)/i, score: 0.95 },
        { pattern: /(surgery|operation).{0,20}(tomorrow|soon)/i, score: 0.9 },
        { pattern: /medical.{0,20}emergency/i, score: 0.95 }
      ]
    };
    
    const patterns = contextPatterns[category as keyof typeof contextPatterns] || [];
    let maxScore = 0.5; // Default
    
    for (const { pattern, score } of patterns) {
      if (pattern.test(text)) {
        maxScore = Math.max(maxScore, score);
      }
    }
    
    return maxScore;
  }
}
```

### Implementation Plan

**Step 1: Intent Detection (2 hours)**
- Create `detectAllIntents()` with enhanced keyword matching
- Add `scoreContextRelevance()` for context-aware scoring
- Implement intent confidence calculation

**Step 2: Graph Building (2 hours)**
- Implement `buildIntentGraph()` with relationship detection
- Add cause-effect relationship patterns
- Implement role assignment logic

**Step 3: Disambiguation (1.5 hours)**
- Implement need statement detection
- Add consequence-based selection
- Implement context score comparison
- Add priority fallback

**Step 4: Integration & Testing (0.5 hours)**
- Replace `categorizeNeeds()` calls
- Add debug output
- Run evaluation suite

### Expected Outcomes

**Best Case:** +5% improvement (53-57% total after Phase 1)
- Fix 12-15 category_wrong cases
- Fix 3-5 category_too_generic cases
- Net: +15 passing cases

**Likely Case:** +3-4% improvement (51-56% total after Phase 1)
- Fix 8-12 category_wrong cases
- Fix 2-3 category_too_generic cases
- Net: +10-12 passing cases

---

## 🏗️ Phase 3: Name Extraction Enhancement

### Current Architecture Problems

**Existing System:**
```typescript
// CURRENT: Regex pattern matching
function extractName(text: string, sentences: string[]): string | undefined {
  const pattern = /\b(my name is|this is|i'm|i am)\s+([A-Za-z'-]+(?:\s+[A-Za-z'-]+)?)\b/i;
  const match = text.match(pattern);
  return match?.[2];
}
```

**Why It Fails:**
1. **Fragment Sensitivity:** "this is, like, Jennifer Park and, you know" breaks pattern
2. **Multi-Part Names:** "Mary Jane Smith" captures only "Mary Jane"
3. **Context Blindness:** Can't distinguish name from other proper nouns
4. **Position Assumption:** Only checks early in transcript

### Proposed Architecture

**New Multi-Strategy Name Extraction:**

```typescript
/**
 * Phase 3: Enhanced Name Extraction System
 * 
 * Architecture Pattern: Multi-strategy with candidate ranking
 * - Strategy 1: Pattern-based extraction (improved regex)
 * - Strategy 2: Proper noun detection (NLP-style)
 * - Strategy 3: Context-based validation
 * - Strategy 4: Candidate ranking and selection
 */

interface NameCandidate {
  text: string;
  confidence: number;
  strategy: 'pattern' | 'proper_noun' | 'context';
  position: number; // Character index in transcript
  sentence: number; // Sentence index
  validationScore: number;
}

class EnhancedNameExtractor {
  async extractName(
    text: string,
    sentences: string[]
  ): Promise<NameExtractionResult> {
    // Step 1: Run all extraction strategies
    const candidates: NameCandidate[] = [
      ...this.extractByPattern(text, sentences),
      ...this.extractProperNouns(text, sentences),
      ...this.extractByContext(text, sentences)
    ];
    
    // Step 2: Validate each candidate
    const validated = candidates.map(c => 
      this.validateCandidate(c, text)
    );
    
    // Step 3: Rank candidates
    const ranked = this.rankCandidates(validated);
    
    // Step 4: Select best candidate
    const best = ranked[0];
    
    return {
      name: best?.text,
      confidence: best?.confidence || 0,
      strategy: best?.strategy,
      alternativeCandidates: ranked.slice(1, 3)
    };
  }
  
  private extractByPattern(text: string, sentences: string[]): NameCandidate[] {
    const candidates: NameCandidate[] = [];
    
    // Enhanced patterns with fragment tolerance
    const patterns = [
      {
        // Standard introduction
        pattern: /\b(my name is|this is|i'm|i am)\s+([A-Z][a-z'-]+(?:\s+[A-Z][a-z'-]+){0,3})/g,
        confidence: 0.9
      },
      {
        // With filler words
        pattern: /\b(my name is|this is|i'm|i am)[,\s]+(like|um|uh)?[,\s]*([A-Z][a-z'-]+(?:\s+[A-Z][a-z'-]+){0,3})/g,
        confidence: 0.85
      },
      {
        // After filler
        pattern: /\b(like|um|uh)[,\s]+(my name is|this is)[,\s]+([A-Z][a-z'-]+(?:\s+[A-Z][a-z'-]+){0,3})/g,
        confidence: 0.8
      }
    ];
    
    for (const { pattern, confidence } of patterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        const nameText = match[match.length - 1]; // Last capture group
        const position = match.index || 0;
        
        candidates.push({
          text: nameText,
          confidence,
          strategy: 'pattern',
          position,
          sentence: this.findSentenceIndex(sentences, position),
          validationScore: 0 // Set in validation
        });
      }
    }
    
    return candidates;
  }
  
  private extractProperNouns(text: string, sentences: string[]): NameCandidate[] {
    const candidates: NameCandidate[] = [];
    
    // Simple proper noun detection (capitalized words)
    // Focus on first 3 sentences where names typically appear
    const earlyText = sentences.slice(0, 3).join(' ');
    
    const properNounPattern = /\b([A-Z][a-z'-]+(?:\s+[A-Z][a-z'-]+){0,3})\b/g;
    const matches = Array.from(earlyText.matchAll(properNounPattern));
    
    for (const match of matches) {
      const text = match[1];
      const position = match.index || 0;
      
      // Filter out common words that look like names
      if (this.isLikelyName(text)) {
        candidates.push({
          text,
          confidence: 0.6, // Lower confidence for proper noun alone
          strategy: 'proper_noun',
          position,
          sentence: this.findSentenceIndex(sentences, position),
          validationScore: 0
        });
      }
    }
    
    return candidates;
  }
  
  private extractByContext(text: string, sentences: string[]): NameCandidate[] {
    const candidates: NameCandidate[] = [];
    
    // Look for names in common contexts
    const contextPatterns = [
      /\bcalling\s+about\s+([A-Z][a-z'-]+(?:\s+[A-Z][a-z'-]+){0,2})/g,
      /\bhelp\s+(?:for|with)\s+([A-Z][a-z'-]+(?:\s+[A-Z][a-z'-]+){0,2})/g,
      /\bspeaking\s+is\s+([A-Z][a-z'-]+(?:\s+[A-Z][a-z'-]+){0,2})/g
    ];
    
    for (const pattern of contextPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        const nameText = match[1];
        const position = match.index || 0;
        
        if (this.isLikelyName(nameText)) {
          candidates.push({
            text: nameText,
            confidence: 0.7,
            strategy: 'context',
            position,
            sentence: this.findSentenceIndex(sentences, position),
            validationScore: 0
          });
        }
      }
    }
    
    return candidates;
  }
  
  private validateCandidate(candidate: NameCandidate, fullText: string): NameCandidate {
    let score = candidate.confidence;
    
    // Validation 1: Position (early in transcript = higher confidence)
    if (candidate.position < 100) score += 0.1;
    else if (candidate.position < 300) score += 0.05;
    
    // Validation 2: Word count (2-3 words = name, 1 word = maybe, 4+ = probably not)
    const wordCount = candidate.text.split(/\s+/).length;
    if (wordCount === 2 || wordCount === 3) score += 0.1;
    else if (wordCount === 1) score -= 0.05;
    else if (wordCount > 3) score -= 0.15;
    
    // Validation 3: Common name patterns
    if (this.hasCommonNamePattern(candidate.text)) score += 0.05;
    
    // Validation 4: Not a category keyword
    if (this.isNeedsCategoryKeyword(candidate.text)) score -= 0.3;
    
    candidate.validationScore = Math.max(0, Math.min(1, score));
    
    return candidate;
  }
  
  private rankCandidates(candidates: NameCandidate[]): NameCandidate[] {
    return candidates.sort((a, b) => {
      // Primary: validation score
      if (Math.abs(a.validationScore - b.validationScore) > 0.1) {
        return b.validationScore - a.validationScore;
      }
      
      // Secondary: strategy preference (pattern > context > proper_noun)
      const strategyRank = { pattern: 3, context: 2, proper_noun: 1 };
      const aRank = strategyRank[a.strategy] || 0;
      const bRank = strategyRank[b.strategy] || 0;
      if (aRank !== bRank) return bRank - aRank;
      
      // Tertiary: position (earlier = better)
      return a.position - b.position;
    });
  }
  
  private isLikelyName(text: string): boolean {
    // Heuristics for name-like proper nouns
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 4) return false; // Too many words
    
    // Check against common false positives
    const falsePosi = ['I', 'The', 'A', 'My', 'Hello', 'Hi', 'Um', 'Uh'];
    if (falsePosi.includes(text)) return false;
    
    // Must have at least one lowercase letter (not all caps)
    if (!/[a-z]/.test(text)) return false;
    
    return true;
  }
  
  private hasCommonNamePattern(text: string): boolean {
    // Common name patterns (FirstName LastName, FirstName MiddleName LastName)
    return /^[A-Z][a-z'-]+\s+[A-Z][a-z'-]+$/.test(text) ||
           /^[A-Z][a-z'-]+\s+[A-Z][a-z'-]+\s+[A-Z][a-z'-]+$/.test(text);
  }
}
```

### Implementation Plan

**Step 1: Pattern Enhancement (2 hours)**
- Implement fragment-tolerant patterns
- Add multi-word name capture
- Test on existing failures

**Step 2: Proper Noun Detection (2 hours)**
- Implement capitalization-based detection
- Add name likelihood heuristics
- Test on conversational transcripts

**Step 3: Validation & Ranking (1 hour)**
- Implement candidate validation scoring
- Add ranking logic
- Test on edge cases

**Step 4: Integration (1 hour)**
- Replace existing `extractName()` calls
- Add debug output
- Run full evaluation

### Expected Outcomes

**Best Case:** +7% improvement (58-64% total after Phases 1-2)
- Fix 18-20 name_wrong cases
- Net: +18-20 passing cases

**Likely Case:** +5-6% improvement (56-62% total after Phases 1-2)
- Fix 14-17 name_wrong cases
- Net: +14-17 passing cases

---

## 🏗️ Phase 4: Amount Context-Aware Selection

### Current Problems & Proposed Solution

**Current:** First-match or highest-value heuristic  
**Proposed:** Context-aware multi-number disambiguation

**Implementation:** 2-3 hours  
**Expected Gain:** +2-3% (58-65% total after Phases 1-3)

*(Detailed architecture similar to above phases)*

---

## 📊 Overall Timeline & Resource Plan

### Phase Sequencing

**Recommended Order:**
1. Phase 1 (Urgency) - Highest impact, foundational
2. Phase 2 (Category) - Builds on urgency improvements
3. Phase 3 (Name) - Independent, can parallelize
4. Phase 4 (Amount) - Lowest priority, incremental

**Timeline Options:**

**Option A: Sequential (Safe)**
- Phase 1: Week 1 (8-12 hours)
- Phase 2: Week 2 (4-6 hours)
- Phase 3: Week 3 (6-8 hours)
- Phase 4: Week 4 (3-4 hours)
- **Total:** 4 weeks, 21-30 hours

**Option B: Parallel (Fast)**
- Week 1: Phase 1 (urgency) + Phase 3 (name) start
- Week 2: Phase 1 completion + Phase 3 completion
- Week 3: Phase 2 (category) + Phase 4 (amount)
- **Total:** 3 weeks, 21-30 hours

**Option C: Incremental (Cautious)**
- Week 1: Phase 1 implementation + validation
- Week 2: Phase 1 tuning, Phase 2 start
- Week 3: Phase 2 completion + validation
- Week 4: Phase 3 implementation
- Week 5: Phase 3 tuning, Phase 4
- **Total:** 5 weeks, 25-35 hours (includes tuning)

### Resource Requirements

**Developer Time:**
- Senior Engineer (architecture + implementation): 21-30 hours
- QA/Testing (validation + regression): 6-8 hours
- **Total:** 27-38 hours

**Infrastructure:**
- No new dependencies required
- Existing test infrastructure sufficient
- Feature flags for safe rollout

---

## 🎯 Success Criteria & Validation

### Gate Criteria (Must Pass)

**Phase 1 Gates:**
- Core30: ≥60% (maintain baseline)
- realistic50: ≥70% (maintain baseline)
- Overall: ≥45% (+7% minimum from 37.93%)

**Phase 2 Gates:**
- Core30: ≥60%
- realistic50: ≥70%
- Overall: ≥50% (+12% from baseline)

**Phase 3 Gates:**
- Core30: ≥60%
- realistic50: ≥70%
- Overall: ≥55% (+17% from baseline)

**Final Target:**
- Overall: ≥58% (+20% from baseline)
- All datasets: No drops >5% from current

### Rollback Triggers

**Immediate Rollback If:**
- Any dataset drops >10% from baseline
- Core30 drops below 55%
- Performance degrades >25% (>3500ms)

**Review & Adjust If:**
- Gains <50% of projected improvement
- New failure patterns emerge
- Test flakiness increases

---

## 📋 Next Steps

### Immediate Actions

1. **Review This Plan** (30 min)
   - Navigator approval required
   - Prioritize phases
   - Confirm timeline

2. **Set Up Feature Flags** (1 hour)
   - Add flags for each phase
   - Configure safe rollout
   - Test flag infrastructure

3. **Create Test Baselines** (30 min)
   - Capture current 37.93% state
   - Document current failure patterns
   - Set up automated regression gates

### Decision Points

**Navigator Must Decide:**
- [ ] Approve overall architectural approach?
- [ ] Which timeline option (A/B/C)?
- [ ] Phase prioritization (sequential vs parallel)?
- [ ] Resource allocation (dedicated vs time-boxed)?
- [ ] Risk tolerance (aggressive vs cautious)?

---

**END OF ARCHITECTURAL PLAN**

---

**Prepared By:** Agent (Planning)  
**Date:** January 30, 2026  
**Status:** PLANNING COMPLETE - AWAITING APPROVAL  
**Estimated Total Gain:** +21-30% (from 37.93% to 58-67%)  
**Estimated Total Effort:** 21-30 hours implementation + 6-8 hours validation  
**Risk Level:** MEDIUM-HIGH (architectural changes, but gated and reversible)  
**Confidence Level:** HIGH (data-driven analysis, proven patterns, clear rollback)

**Recommendation:** Approve Phase 1 (Urgency) as pilot. If successful (+10% gain), proceed with remaining phases.
