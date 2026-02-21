import Link from 'next/link';

/**
 * Custom 404 page for /profile/* routes.
 * Shown when a profile route segment doesn't exist.
 */
export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4" aria-hidden="true">🔍</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
        <p className="text-gray-600 mb-6">
          We couldn&apos;t find the profile you&apos;re looking for. The session ID may be incorrect or expired.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/profile/session"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
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
