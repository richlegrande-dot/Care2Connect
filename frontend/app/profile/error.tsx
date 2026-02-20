'use client';

import Link from 'next/link';

/**
 * Error boundary for all /profile/* routes.
 * Catches rendering errors and prevents white-screen crashes.
 */
export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-red-500 text-4xl mb-4" aria-hidden="true">⚠️</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error loading your profile. Please try again.
        </p>
        {process.env.NODE_ENV === 'development' && error?.message && (
          <pre className="text-left text-xs bg-red-50 p-3 rounded mb-4 overflow-auto max-h-32 text-red-800">
            {error.message}
          </pre>
        )}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Try Again
          </button>
          <Link
            href="/profile/session"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Find My Profile
          </Link>
          <Link
            href="/onboarding/v2"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Start New Assessment
          </Link>
        </div>
      </div>
    </div>
  );
}
