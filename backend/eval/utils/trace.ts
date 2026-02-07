/**
 * Tracing utilities for debugging parser behavior
 * Provides detailed execution traces for evaluation purposes
 */

export interface TraceStep {
  step: string;
  timestamp: number;
  input?: any;
  output?: any;
  metadata?: Record<string, any>;
  confidence?: number;
  duration?: number;
}

export interface ParsingTrace {
  sessionId: string;
  timestamp: string;
  totalDuration: number;
  steps: TraceStep[];
  summary: TraceSummary;
}

export interface TraceSummary {
  totalSteps: number;
  slowestStep: string;
  slowestDuration: number;
  confidenceRange: { min: number; max: number; avg: number };
  fallbacksUsed: string[];
  patternsMatched: string[];
  keywordHits: Record<string, number>;
}

export interface TraceContext {
  enabled: boolean;
  sessionId: string;
  startTime: number;
  steps: TraceStep[];
  metadata: Record<string, any>;
}

/**
 * Creates a new tracing context
 */
export function createTraceContext(sessionId?: string): TraceContext {
  return {
    enabled: process.env.TRACE_PARSING === 'true',
    sessionId: sessionId || generateSessionId(),
    startTime: Date.now(),
    steps: [],
    metadata: {}
  };
}

/**
 * Adds a trace step to the context
 */
export function traceStep(
  context: TraceContext,
  step: string,
  input?: any,
  output?: any,
  metadata?: Record<string, any>
): void {
  if (!context.enabled) return;

  const stepStart = Date.now();
  const traceStep: TraceStep = {
    step,
    timestamp: stepStart - context.startTime,
    input: sanitizeTraceData(input),
    output: sanitizeTraceData(output),
    metadata: metadata || {},
    duration: 0
  };

  // Add confidence if available
  if (output && typeof output === 'object' && 'confidence' in output) {
    traceStep.confidence = output.confidence;
  }

  context.steps.push(traceStep);
}

/**
 * Marks the end of a trace step (for duration calculation)
 */
export function traceStepEnd(context: TraceContext, stepIndex?: number): void {
  if (!context.enabled) return;

  const endTime = Date.now();
  const targetIndex = stepIndex !== undefined ? stepIndex : context.steps.length - 1;
  
  if (targetIndex >= 0 && targetIndex < context.steps.length) {
    const step = context.steps[targetIndex];
    step.duration = endTime - (context.startTime + step.timestamp);
  }
}

/**
 * Finalizes a trace and generates summary
 */
export function finalizeTrace(context: TraceContext): ParsingTrace | null {
  if (!context.enabled || context.steps.length === 0) return null;

  const totalDuration = Date.now() - context.startTime;
  const summary = generateTraceSummary(context.steps);

  return {
    sessionId: context.sessionId,
    timestamp: new Date(context.startTime).toISOString(),
    totalDuration,
    steps: context.steps,
    summary
  };
}

/**
 * Generates trace summary statistics
 */
function generateTraceSummary(steps: TraceStep[]): TraceSummary {
  const confidenceValues = steps
    .map(s => s.confidence)
    .filter(c => c !== undefined) as number[];

  const confidenceRange = confidenceValues.length > 0 
    ? {
        min: Math.min(...confidenceValues),
        max: Math.max(...confidenceValues),
        avg: confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
      }
    : { min: 0, max: 0, avg: 0 };

  // Find slowest step
  let slowestStep = 'unknown';
  let slowestDuration = 0;
  
  steps.forEach(step => {
    if (step.duration && step.duration > slowestDuration) {
      slowestDuration = step.duration;
      slowestStep = step.step;
    }
  });

  // Extract fallbacks and patterns
  const fallbacksUsed = steps
    .filter(s => s.metadata?.fallbackTier)
    .map(s => `${s.step}:${s.metadata?.fallbackTier}`)
    .filter((value, index, array) => array.indexOf(value) === index);

  const patternsMatched = steps
    .filter(s => s.metadata?.patternMatched)
    .map(s => s.metadata?.patternMatched)
    .filter((value, index, array) => array.indexOf(value) === index);

  const keywordHits: Record<string, number> = {};
  steps.forEach(step => {
    if (step.metadata?.keywordHits) {
      Object.entries(step.metadata.keywordHits).forEach(([keyword, count]) => {
        keywordHits[keyword] = (keywordHits[keyword] || 0) + (count as number);
      });
    }
  });

  return {
    totalSteps: steps.length,
    slowestStep,
    slowestDuration,
    confidenceRange,
    fallbacksUsed,
    patternsMatched,
    keywordHits
  };
}

/**
 * Sanitizes trace data to remove PII and large objects
 */
function sanitizeTraceData(data: any): any {
  if (data === null || data === undefined) return data;
  
  if (typeof data === 'string') {
    // Truncate long strings and redact potential PII
    const truncated = data.length > 100 ? data.substring(0, 100) + '...' : data;
    return truncated.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
                   .replace(/(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g, '[PHONE]');
  }
  
  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      // Limit array size in traces
      return data.length > 10 ? [...data.slice(0, 10), `... ${data.length - 10} more items`] : data;
    }
    
    // Sanitize object properties
    const sanitized: any = {};
    Object.entries(data).forEach(([key, value]) => {
      // Skip potentially large or sensitive properties
      if (['transcriptText', 'segments', 'rawInput', 'fullTranscript'].includes(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string' && value.length > 50) {
        sanitized[key] = value.substring(0, 50) + '...';
      } else {
        sanitized[key] = value;
      }
    });
    
    return sanitized;
  }
  
  return data;
}

/**
 * Generates a unique session ID for tracing
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `trace_${timestamp}_${random}`;
}

/**
 * Wrapper function to add tracing to any parsing function
 */
export function withTracing<T extends (...args: any[]) => any>(
  fn: T,
  stepName: string,
  context: TraceContext
): T {
  return ((...args: any[]) => {
    if (!context.enabled) {
      return fn(...args);
    }

    const stepIndex = context.steps.length;
    traceStep(context, stepName, { args: args.slice(0, 3) }); // Only trace first 3 args

    try {
      const result = fn(...args);
      
      // Handle promises
      if (result && typeof result.then === 'function') {
        return result.then((resolvedResult: any) => {
          traceStep(context, `${stepName}_result`, undefined, resolvedResult);
          traceStepEnd(context, stepIndex);
          return resolvedResult;
        }).catch((error: any) => {
          traceStep(context, `${stepName}_error`, undefined, { error: error.message });
          traceStepEnd(context, stepIndex);
          throw error;
        });
      }
      
      // Handle synchronous results
      traceStep(context, `${stepName}_result`, undefined, result);
      traceStepEnd(context, stepIndex);
      return result;
      
    } catch (error) {
      traceStep(context, `${stepName}_error`, undefined, { error: (error as Error).message });
      traceStepEnd(context, stepIndex);
      throw error;
    }
  }) as T;
}

/**
 * Checks if tracing should be exported based on environment
 */
export function shouldExportTrace(): boolean {
  return process.env.TRACE_EXPORT === 'true';
}

/**
 * Creates a minimal trace summary for error logging
 */
export function createErrorTraceContext(trace: ParsingTrace | null): any {
  if (!trace) return undefined;

  return {
    sessionId: trace.sessionId,
    totalDuration: trace.totalDuration,
    totalSteps: trace.summary.totalSteps,
    slowestStep: trace.summary.slowestStep,
    fallbacksUsed: trace.summary.fallbacksUsed,
    patternsMatched: trace.summary.patternsMatched,
    confidenceAvg: trace.summary.confidenceRange.avg
  };
}
