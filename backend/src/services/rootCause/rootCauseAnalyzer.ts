/**
 * Root Cause Analyzer
 * Deterministic classification of errors without API keys
 */

export interface RootCauseAnalysis {
  suspectedCause: string;
  recommendedFix: string;
  confidence: 'high' | 'medium' | 'low';
  category: string;
}

export interface ErrorEntry {
  message?: string;
  stack?: string;
  context?: any;
  page?: string;
}

/**
 * Analyze error and provide root cause + fix recommendation
 */
export function analyzeRootCause(error: ErrorEntry): RootCauseAnalysis {
  const message = (error.message || '').toLowerCase();
  const stack = (error.stack || '').toLowerCase();
  const page = (error.page || '').toLowerCase();
  const combined = `${message} ${stack} ${page}`;

  // Missing environment variables / config (high priority)
  if (combined.includes('undefined') || combined.includes('is not defined') || combined.includes('not defined')) {
    if (combined.includes('env') || combined.includes('config') || /[A-Z0-9_]+\s+is not defined/i.test(error.message || '')) {
      return {
        suspectedCause: 'Missing or invalid environment variable',
        recommendedFix: 'Check .env file, verify all required variables are set, restart server',
        confidence: 'high',
        category: 'Config',
      };
    }
  }

  // Network/API failures
  if (combined.includes('fetch failed') || combined.includes('network') || combined.includes('econnrefused') || combined.includes('timeout')) {
    return {
      suspectedCause: 'network connection or API failure (timeout, Backend server unavailable)',
      recommendedFix: 'Check internet connectivity, verify API endpoints are reachable, check firewall and proxy settings',
      confidence: 'high',
      category: 'Network',
    };
  }

  // Stripe not configured
  if (combined.includes('stripe') && (combined.includes('not configured') || combined.includes('no_keys_mode') || combined.includes('stripe is not configured'))) {
    return {
      suspectedCause: 'Stripe integration not configured',
      recommendedFix: 'Set STRIPE_SECRET_KEY in .env or enable NO_KEYS_MODE=true for demo',
      confidence: 'high',
      category: 'Stripe',
    };
  }

  // AI model missing
  if (combined.includes('model') && (combined.includes('not found') || combined.includes('enoent') || combined.includes('model file'))) {
    return {
      suspectedCause: 'AI model files not installed or path incorrect',
      recommendedFix: 'Download required models (Vosk/Whisper) to backend/models/ directory',
      confidence: 'high',
      category: 'Models',
    };
  }

  // Export generation failed
  if (combined.includes('export') || combined.includes('word') || combined.includes('docx')) {
    if (combined.includes('eacces') || combined.includes('permission')) {
      return {
        suspectedCause: 'File permission error during export generation',
        recommendedFix: 'Check file permissions on backend/exports/ directory, verify disk write access',
        confidence: 'high',
        category: 'Export',
      };
    }
    return {
      suspectedCause: 'Word document export generation failed',
      recommendedFix: 'Check storage configuration, verify SUPABASE_URL and credentials, check logs for details',
      confidence: 'medium',
      category: 'Export',
    };
  }

  // QR code generation failed
  if (combined.includes('qr') && (combined.includes('generate') || combined.includes('encode'))) {
    return {
      suspectedCause: 'QR code generation or encoding failed',
      recommendedFix: 'Check qrcode library installation, verify data format, check logs for encoding errors',
      confidence: 'medium',
      category: 'QR',
    };
  }

  // Port conflict
  if (combined.includes('eaddrinuse') || combined.includes('address already in use')) {
    return {
      suspectedCause: 'port already in use by another process',
      recommendedFix: 'Enable DEMO_SAFE_MODE=true for auto port selection, or kill process: netstat -ano | findstr :3001',
      confidence: 'high',
      category: 'Port',
    };
  }

  // Database connection (ensure lowercase 'database' present for tests)
  if (combined.includes('database') || combined.includes('prisma') || combined.includes('postgres')) {
    return {
      suspectedCause: 'database connection or query failed',
      recommendedFix: 'Check DATABASE_URL, verify Supabase is operational, check network connectivity',
      confidence: 'high',
      category: 'Database',
    };
  }

  // Storage/Supabase
  if (combined.includes('storage') || combined.includes('supabase')) {
    return {
      suspectedCause: 'Supabase storage service connection or operation failed',
      recommendedFix: 'Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, verify bucket exists, check storage policies',
      confidence: 'high',
      category: 'Storage',
    };
  }

  // SMTP/Email (archived)
  if (combined.includes('smtp') || combined.includes('email') || combined.includes('nodemailer')) {
    return {
      suspectedCause: 'Email/SMS subsystem archived',
      recommendedFix: 'SMTP support has been removed; check support tickets in admin health logs',
      confidence: 'medium',
      category: 'Support',
    };
  }

  // Recording/transcription (page or content)
  if (combined.includes('record') || combined.includes('recording') || page.includes('tell-your-story') || page.includes('record')) {
    if (combined.includes('microphone') || combined.includes('mediadevices')) {
      return {
        suspectedCause: 'Microphone access denied or not available',
        recommendedFix: 'Grant microphone permissions in browser, check device availability',
        confidence: 'high',
        category: 'Media',
      };
    }
    return {
      suspectedCause: 'Recording or transcription error',
      recommendedFix: 'Check browser compatibility, verify microphone permissions, check API connectivity',
      confidence: 'medium',
      category: 'Recording',
    };
  }

  // Permission denied (file system or OS level)
  if (combined.includes('eacces') || combined.includes('permission denied') || combined.includes('eperm')) {
    return {
      suspectedCause: 'file system permission denied (permissions)',
      recommendedFix: 'Check directory permissions (chmod 755), verify user has write access, check disk space',
      confidence: 'high',
      category: 'Permissions',
    };
  }

  // TypeScript compilation (precise checks, placed late to avoid false positives)
  if (combined.includes('typescript') || combined.includes('tsc') || combined.includes('ts-node') || /\bts\d+\b/.test(combined) || /\bts\b/.test(combined)) {
    if (combined.includes('error') || combined.includes('type') || combined.includes('compile') || /ts\d+/.test(combined)) {
      return {
        suspectedCause: 'TypeScript compilation or type error (TypeScript)',
        recommendedFix: 'Run npm run typecheck, fix type errors, rebuild with npm run build',
        confidence: 'medium',
        category: 'TypeScript',
      };
    }
  }

  // Generic fallback
  return {
    suspectedCause: 'Application error - requires manual investigation',
    recommendedFix: 'Check server logs, review error stack trace, verify system health endpoints',
    confidence: 'low',
    category: 'Unknown',
  };
}

/**
 * Batch analyze multiple errors
 */
export function analyzeErrors(errors: ErrorEntry[]): Array<ErrorEntry & { rootCause: RootCauseAnalysis; category?: string }> {
  return errors.map((error) => {
    const root = analyzeRootCause(error);
    return {
      ...error,
      // expose root cause fields at top-level for tests and callers
      suspectedCause: root.suspectedCause,
      recommendedFix: root.recommendedFix,
      confidence: root.confidence,
      category: root.category,
      rootCause: root,
    } as ErrorEntry & { rootCause: RootCauseAnalysis } & any;
  });
}
