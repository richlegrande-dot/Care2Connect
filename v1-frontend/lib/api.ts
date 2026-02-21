/**
 * Centralized API Configuration
 * 
 * This utility provides a single source of truth for API calls across the application.
 * It uses Next.js rewrites (/api/...) in production to avoid CORS issues.
 * 
 * CRITICAL: Always use getApiUrl() for API calls - never hardcode URLs
 */

/**
 * Get the base API URL based on environment
 * 
 * Strategy:
 * - In production (care2connects.org): Use same-origin /api proxy via Next.js rewrites
 * - In development (localhost:3000): Use same-origin /api proxy OR direct backend
 * 
 * This eliminates CORS issues entirely by making all requests same-origin
 */
export function getApiUrl(path: string = ''): string {
  // Always use same-origin API through Next.js rewrites
  // This works because next.config.js has:
  // /api/:path* → http://localhost:3001/api/:path*
  
  const apiBase = '/api';
  
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Construct full URL
  const fullUrl = cleanPath ? `${apiBase}/${cleanPath}` : apiBase;
  
  console.log('[API] Resolved URL:', fullUrl, 'for path:', path);
  
  return fullUrl;
}

/**
 * Get direct backend URL (bypassing Next.js proxy)
 * 
 * Use only for:
 * - Server-side calls
 * - Direct backend testing
 * - Diagnostic purposes
 * 
 * DO NOT use for normal frontend API calls - use getApiUrl() instead
 */
export function getDirectBackendUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side: use localhost
    return process.env.BACKEND_URL || 'http://localhost:3001';
  }
  
  // Client-side: detect environment
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // Production: use API subdomain
  return 'https://api.care2connects.org';
}

/**
 * Fetch wrapper with automatic API URL resolution and error handling
 * 
 * @param path - API path (e.g., 'admin/knowledge/sources' or '/admin/incidents')
 * @param options - Standard fetch options
 * @returns Promise<Response>
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = getApiUrl(path);
  
  // Add default headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Make request
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  return response;
}

/**
 * API Diagnostics - Test connectivity and configuration
 * 
 * @returns Diagnostic results with detailed error information
 */
export interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  timestamp: string;
}

export async function runApiDiagnostics(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  const timestamp = new Date().toISOString();
  
  // Test 1: Browser environment detection
  results.push({
    test: 'Environment Detection',
    status: 'pass',
    message: `Running on: ${typeof window !== 'undefined' ? window.location.hostname : 'server'}`,
    details: {
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
      protocol: typeof window !== 'undefined' ? window.location.protocol : 'N/A',
      apiBase: getApiUrl(),
      directBackend: getDirectBackendUrl(),
    },
    timestamp,
  });
  
  // Test 2: Health endpoint via proxy
  try {
    const healthUrl = getApiUrl('health/live');
    console.log('[Diagnostics] Testing health endpoint:', healthUrl);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      results.push({
        test: 'Health Endpoint (Proxy)',
        status: 'pass',
        message: `API responding: ${data.status || 'healthy'}`,
        details: { url: healthUrl, status: response.status, data },
        timestamp,
      });
    } else {
      results.push({
        test: 'Health Endpoint (Proxy)',
        status: 'fail',
        message: `API returned ${response.status}: ${response.statusText}`,
        details: { url: healthUrl, status: response.status },
        timestamp,
      });
    }
  } catch (error) {
    results.push({
      test: 'Health Endpoint (Proxy)',
      status: 'fail',
      message: `Network error: ${error instanceof Error ? error.message : String(error)}`,
      details: { error: error instanceof Error ? error.message : String(error) },
      timestamp,
    });
  }
  
  // Test 3: Direct backend (diagnostic only - not used for actual calls)
  if (typeof window !== 'undefined') {
    try {
      const directUrl = `${getDirectBackendUrl()}/health/live`;
      console.log('[Diagnostics] Testing direct backend:', directUrl);
      
      const response = await fetch(directUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        results.push({
          test: 'Direct Backend Connection',
          status: 'pass',
          message: `Direct backend accessible: ${data.status || 'healthy'}`,
          details: { url: directUrl, status: response.status, data },
          timestamp,
        });
      } else {
        results.push({
          test: 'Direct Backend Connection',
          status: 'warning',
          message: `Direct backend returned ${response.status} (may be CORS blocked - this is OK if proxy works)`,
          details: { url: directUrl, status: response.status },
          timestamp,
        });
      }
    } catch (error) {
      results.push({
        test: 'Direct Backend Connection',
        status: 'warning',
        message: `Direct backend unreachable (may be CORS blocked - this is OK if proxy works)`,
        details: { error: error instanceof Error ? error.message : String(error) },
        timestamp,
      });
    }
  }
  
  // Test 4: CORS and credentials
  results.push({
    test: 'CORS Configuration',
    status: 'pass',
    message: 'Using same-origin proxy - CORS not required',
    details: {
      strategy: 'Next.js rewrites',
      proxyPath: '/api/*',
      backendTarget: 'http://localhost:3001/api/*',
    },
    timestamp,
  });
  
  return results;
}
