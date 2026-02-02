/**
 * Network Blocking Utilities for Evaluation Mode
 * Prevents any external network calls during evaluation runs
 */

import * as http from 'http';
import * as https from 'https';

interface BlockedRequest {
  url: string;
  method: string;
  timestamp: number;
  stack: string;
}

let networkBlockingEnabled = false;
let blockedRequests: BlockedRequest[] = [];
let originalHttpRequest: typeof http.request;
let originalHttpsRequest: typeof https.request;
let originalFetch: typeof global.fetch;

/**
 * Enables network blocking for evaluation mode
 * Throws errors on any attempted external HTTP/HTTPS calls
 */
export function enableNetworkBlocking(): void {
  if (networkBlockingEnabled) {
    return;
  }

  // Store original functions
  originalHttpRequest = http.request;
  originalHttpsRequest = https.request;
  originalFetch = global.fetch;

  // Block http.request
  http.request = function(options: any, callback?: any) {
    const error = createBlockedRequestError('http.request', options);
    logBlockedRequest('http.request', options);
    throw error;
  } as any;

  // Block https.request  
  https.request = function(options: any, callback?: any) {
    const error = createBlockedRequestError('https.request', options);
    logBlockedRequest('https.request', options);
    throw error;
  } as any;

  // Block fetch (if available)
  if (global.fetch) {
    global.fetch = function(input: any, init?: any) {
      const error = createBlockedRequestError('fetch', input);
      logBlockedRequest('fetch', input);
      throw error;
    } as any;
  }

  // Block axios if it's imported (monkey patch common HTTP clients)
  try {
    const axios = require('axios');
    if (axios && axios.request) {
      axios.request = function(config: any) {
        const error = createBlockedRequestError('axios.request', config);
        logBlockedRequest('axios.request', config);
        throw error;
      };
    }
  } catch (e) {
    // Axios not available, ignore
  }

  networkBlockingEnabled = true;
  console.log('🚫 Network blocking enabled for evaluation mode');
}

/**
 * Disables network blocking and restores original functions
 */
export function disableNetworkBlocking(): void {
  if (!networkBlockingEnabled) {
    return;
  }

  // Restore original functions
  if (originalHttpRequest) {
    http.request = originalHttpRequest;
  }
  if (originalHttpsRequest) {
    https.request = originalHttpsRequest;
  }
  if (originalFetch) {
    global.fetch = originalFetch;
  }

  networkBlockingEnabled = false;
  console.log('✅ Network blocking disabled');
}

/**
 * Creates a detailed error for blocked network requests
 */
function createBlockedRequestError(method: string, options: any): Error {
  const url = extractUrlFromOptions(options);
  const error = new Error(
    `EVAL_NETWORK_BLOCKED: ${method} call to ${url} blocked during evaluation mode. ` +
    `External network calls are not allowed during parsing evaluation runs.`
  );
  
  // Add custom properties for debugging
  (error as any).code = 'EVAL_NETWORK_BLOCKED';
  (error as any).method = method;
  (error as any).blockedUrl = url;
  
  return error;
}

/**
 * Logs blocked network requests for analysis
 */
function logBlockedRequest(method: string, options: any): void {
  const url = extractUrlFromOptions(options);
  const blocked: BlockedRequest = {
    url,
    method,
    timestamp: Date.now(),
    stack: new Error().stack || 'No stack trace available'
  };
  
  blockedRequests.push(blocked);
  console.warn(`🚫 Blocked ${method} call to: ${url}`);
}

/**
 * Extracts URL from various request option formats
 */
function extractUrlFromOptions(options: any): string {
  if (typeof options === 'string') {
    return options;
  }
  
  if (options && typeof options === 'object') {
    if (options.url) return options.url;
    if (options.href) return options.href;
    if (options.uri) return options.uri;
    
    // Reconstruct from host/port/path
    const protocol = options.protocol || (options.port === 443 ? 'https:' : 'http:');
    const hostname = options.hostname || options.host || 'unknown';
    const port = options.port ? `:${options.port}` : '';
    const path = options.path || options.pathname || '/';
    
    return `${protocol}//${hostname}${port}${path}`;
  }
  
  return 'unknown';
}

/**
 * Checks if a URL is allowed (localhost only)
 * Currently all external URLs are blocked
 */
function isAllowedUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    
    // Allow only localhost and 127.0.0.1
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname === '::1';
  } catch (e) {
    return false;
  }
}

/**
 * Returns list of blocked requests during evaluation
 */
export function getBlockedRequests(): BlockedRequest[] {
  return [...blockedRequests];
}

/**
 * Clears the blocked requests log
 */
export function clearBlockedRequests(): void {
  blockedRequests = [];
}

/**
 * Wrapper function to run code with network blocking enabled
 */
export async function withNetworkBlocking<T>(fn: () => Promise<T>): Promise<T> {
  const wasEnabled = networkBlockingEnabled;
  
  try {
    if (!wasEnabled) {
      enableNetworkBlocking();
    }
    
    const result = await fn();
    return result;
  } finally {
    if (!wasEnabled) {
      disableNetworkBlocking();
    }
  }
}

/**
 * Validates that network blocking is working properly
 */
export async function testNetworkBlocking(): Promise<{ working: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  enableNetworkBlocking();
  
  try {
    // Test http.request blocking
    try {
      http.request('http://example.com');
      errors.push('http.request not blocked');
    } catch (e) {
      if (!(e as any).code === 'EVAL_NETWORK_BLOCKED') {
        errors.push('http.request blocked with wrong error type');
      }
    }
    
    // Test https.request blocking
    try {
      https.request('https://example.com');
      errors.push('https.request not blocked');
    } catch (e) {
      if (!(e as any).code === 'EVAL_NETWORK_BLOCKED') {
        errors.push('https.request blocked with wrong error type');
      }
    }
    
    // Test fetch blocking (if available)
    if (global.fetch) {
      try {
        await global.fetch('https://example.com');
        errors.push('fetch not blocked');
      } catch (e) {
        if (!(e as any).code === 'EVAL_NETWORK_BLOCKED') {
          errors.push('fetch blocked with wrong error type');
        }
      }
    }
    
  } catch (e) {
    errors.push(`Test failed: ${(e as Error).message}`);
  } finally {
    disableNetworkBlocking();
  }
  
  return {
    working: errors.length === 0,
    errors
  };
}

/**
 * Environment variable to auto-enable network blocking
 */
if (process.env.EVAL_BLOCK_NETWORK === 'true') {
  enableNetworkBlocking();
}

/**
 * Process exit handler to ensure network blocking is disabled
 */
process.on('exit', () => {
  if (networkBlockingEnabled) {
    disableNetworkBlocking();
  }
});

process.on('SIGINT', () => {
  if (networkBlockingEnabled) {
    disableNetworkBlocking();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (networkBlockingEnabled) {
    disableNetworkBlocking();
  }
  process.exit(0);
});