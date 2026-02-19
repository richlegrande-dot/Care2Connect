'use client';

import { useEffect } from 'react';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function V2WizardError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log to console so Playwright debug script can capture it
    console.error('[V2 Wizard Error Boundary]', error.message, error.stack);
  }, [error]);

  return (
    <div
      id="v2-error-boundary"
      className="min-h-screen bg-gray-50 flex items-center justify-center p-8"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-xl font-bold text-red-700 mb-4">V2 Wizard crashed</h1>

        <p className="text-gray-800 text-sm mb-4">
          <strong>Error:</strong> {error.message || 'Unknown error'}
        </p>

        {error.stack && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Show stack trace
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto whitespace-pre-wrap text-gray-600 max-h-64 overflow-y-auto">
              {error.stack}
            </pre>
          </details>
        )}

        {error.digest && (
          <p className="text-xs text-gray-400 mb-4">Digest: {error.digest}</p>
        )}

        <button
          onClick={reset}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
