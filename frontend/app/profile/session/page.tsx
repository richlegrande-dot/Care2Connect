"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FindMyProfilePage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clean and validate session ID input
  const cleanSessionId = (input: string): string => {
    return input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  };

  // Basic session ID validation
  const validateSessionId = (id: string): boolean => {
    // Prisma cuid format: 25 characters, alphanumeric
    const cleaned = cleanSessionId(id);
    return (
      cleaned.length >= 20 &&
      cleaned.length <= 30 &&
      /^[a-z0-9]+$/.test(cleaned)
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSessionId(value);

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    const cleaned = cleanSessionId(sessionId);

    if (!cleaned) {
      setError("Please enter a session ID.");
      return;
    }

    if (!validateSessionId(cleaned)) {
      setError(
        "Session ID should be 20-30 characters long and contain only letters and numbers.",
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Navigate to the profile page — router.push() doesn't throw,
    // so we set a timeout fallback to reset isSubmitting
    router.push(`/profile/session/${cleaned}`);
    // Reset after a reasonable navigation timeout
    setTimeout(() => setIsSubmitting(false), 5000);
  };

  const handleClearInput = () => {
    setSessionId("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-blue-600 text-4xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Find My Profile
          </h1>
          <p className="text-gray-600 text-sm">
            Enter your session ID to access your stability profile and
            personalized roadmap.
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <span className="text-amber-600 text-lg">🔒</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-amber-800 font-medium mb-1">
                Session ID Privacy
              </p>
              <p className="text-xs text-amber-700">
                Your session ID is your private key to your profile. Keep it
                safe — anyone with this ID can view your results. Do not share
                it publicly.
              </p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="sessionId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Session ID
            </label>
            <div className="relative">
              <input
                id="sessionId"
                type="text"
                value={sessionId}
                onChange={handleInputChange}
                placeholder="Enter your session ID..."
                aria-describedby={
                  error
                    ? "sessionId-error sessionId-helper"
                    : "sessionId-helper"
                }
                aria-invalid={!!error}
                className={`w-full px-4 py-3 border rounded-lg text-sm font-mono bg-white transition-colors ${
                  error
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } focus:outline-none focus:ring-2`}
                disabled={isSubmitting}
                autoComplete="off"
                spellCheck={false}
              />
              {sessionId && (
                <button
                  type="button"
                  onClick={handleClearInput}
                  aria-label="Clear input"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <p
                id="sessionId-error"
                className="text-red-600 text-xs mt-2 flex items-center gap-1"
                role="alert"
              >
                <span aria-hidden="true">⚠️</span>
                {error}
              </p>
            )}

            {/* Helper Text */}
            <p id="sessionId-helper" className="text-gray-500 text-xs mt-2">
              Example: cmlsc9p9p0000z8zc9ol574mg
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!sessionId.trim() || isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
              !sessionId.trim() || isSubmitting
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
            } focus:outline-none`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Loading Profile...
              </span>
            ) : (
              "View My Profile →"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-xs text-gray-500 bg-white">OR</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Start New Assessment */}
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-3">
            Don't have a session ID yet?
          </p>
          <Link
            href="/onboarding/v2"
            className="inline-block px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold text-sm transition-colors"
          >
            Start New Assessment
          </Link>
        </div>

        {/* Tips Section */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Tips:</h3>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• Session IDs are case-insensitive</li>
            <li>• Extra spaces will be automatically removed</li>
            <li>• Only letters and numbers are allowed</li>
            <li>
              • Your session ID is sent to you after completing the assessment
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>
            Need help? Contact{" "}
            <a
              href="mailto:support@care2connects.org"
              className="text-blue-500 hover:text-blue-700"
            >
              support@care2connects.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
