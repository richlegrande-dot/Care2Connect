/**
 * Streaming loading fallback for /profile/* routes.
 * Shown by Next.js App Router while server components load.
 */
export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="text-center" role="status" aria-label="Loading profile">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
          aria-hidden="true"
        />
        <p className="text-gray-600">Loading your profile…</p>
      </div>
    </div>
  );
}
