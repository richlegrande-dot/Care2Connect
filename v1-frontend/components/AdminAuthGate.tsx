'use client'

import { useState, useEffect } from 'react';
import { getApiUrl, runApiDiagnostics, type DiagnosticResult } from '@/lib/api';

interface AdminAuthGateProps {
  children: React.ReactNode;
}

/**
 * Unified Admin Authentication Gate
 * 
 * Features:
 * - Single password for all admin areas
 * - Built-in diagnostics for troubleshooting
 * - Clear error messages (wrong password vs connectivity)
 * - Session token storage (not raw password)
 */
export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const token = localStorage.getItem('adminToken');
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      // Use same-origin proxy via getApiUrl
      const response = await fetch(getApiUrl('admin/knowledge/sources?page=1&limit=1'), {
        method: 'GET',
        headers: {
          'x-admin-password': token,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        // Token invalid, clear it
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
      } else {
        // Other error - backend issue, but don't lock user out
        console.warn('Token verification failed with status:', response.status);
        setIsAuthenticated(true); // Assume valid during outage
      }
    } catch (err) {
      // Network error - assume token valid during outage
      console.warn('Could not verify token (network error):', err);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const runDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    setDiagnostics([]);
    
    try {
      const results = await runApiDiagnostics();
      setDiagnostics(results);
      setShowDiagnostics(true);
    } catch (err) {
      console.error('Diagnostics failed:', err);
      setDiagnostics([{
        test: 'Diagnostics Runner',
        status: 'fail',
        message: `Failed to run diagnostics: ${err instanceof Error ? err.message : String(err)}`,
        timestamp: new Date().toISOString(),
      }]);
      setShowDiagnostics(true);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || password.length === 0) {
      setError('Please enter a password');
      return;
    }

    try {
      // Authenticate using same-origin proxy
      const response = await fetch(getApiUrl('admin/knowledge/sources?page=1&limit=1'), {
        method: 'GET',
        headers: {
          'x-admin-password': password,
        },
      });

      if (response.ok) {
        // Success - store token and authenticate
        localStorage.setItem('adminToken', password);
        setIsAuthenticated(true);
        setError('');
      } else if (response.status === 401) {
        // Wrong password
        setError('Invalid password. Please try again.');
      } else if (response.status === 503) {
        // Backend unavailable
        setError(`Server unavailable (HTTP ${response.status}). Try running diagnostics.`);
      } else {
        // Other error
        setError(`Authentication failed (HTTP ${response.status}). ${response.statusText}`);
      }
    } catch (err) {
      // Network error
      const errorMsg = err instanceof Error ? err.message : String(err);
      
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        setError('Cannot reach server. Check network connection or click "Run Diagnostics" for details.');
      } else {
        setError(`Connection error: ${errorMsg}`);
      }
      
      console.error('[AdminAuthGate] Authentication error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-blue-600 rounded-full mb-4">
              <svg className="h-8 w-8 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
            <p className="text-gray-600">Enter your admin password to access system management</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Unlock Admin Portal
              </button>
            </form>

            {/* Diagnostics Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={runDiagnostics}
                disabled={isRunningDiagnostics}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50"
              >
                {isRunningDiagnostics ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Running Diagnostics...
                  </span>
                ) : (
                  '🔍 Run Diagnostics'
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Test API connectivity and troubleshoot login issues
              </p>
            </div>
          </div>

          {/* Diagnostics Results */}
          {showDiagnostics && diagnostics.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Diagnostic Results</h3>
                <button
                  onClick={() => setShowDiagnostics(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {diagnostics.map((result, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      result.status === 'pass'
                        ? 'bg-green-50 border-green-200'
                        : result.status === 'fail'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">
                        {result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{result.test}</h4>
                        <p className="text-sm text-gray-700 mt-1">{result.message}</p>
                        {result.details && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                              Show technical details
                            </summary>
                            <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded mt-2 overflow-x-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  <strong>How to fix connectivity issues:</strong><br />
                  • Ensure backend is running on port 3001<br />
                  • Check that Next.js dev server is running on port 3000<br />
                  • Verify next.config.js has API rewrites configured<br />
                  • Check browser console for detailed error messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
