'use client';

/**
 * Quick Exit Button — DV-Safe Mode
 *
 * A floating, inconspicuous button that:
 *   1. Clears all form state from memory
 *   2. Attempts to clear browser history for current page
 *   3. Redirects to weather.gov (a neutral site)
 *   4. Does NOT save partial intake data
 *
 * Only rendered when dvSafeMode is active.
 */

export function QuickExitButton() {
  const handleQuickExit = () => {
    // Clear any session storage
    try {
      sessionStorage.clear();
    } catch {
      // Ignore if unavailable
    }

    // Replace current history entry so back button won't return here
    try {
      window.history.replaceState(null, '', '/');
    } catch {
      // Ignore
    }

    // Redirect to a neutral site
    window.location.replace('https://weather.gov');
  };

  return (
    <button
      onClick={handleQuickExit}
      className="fixed top-4 right-4 z-50 px-3 py-1.5 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors shadow-sm"
      title="Quick Exit"
      aria-label="Quick exit — leave this page immediately"
    >
      ✕ Exit
    </button>
  );
}
