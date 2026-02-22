"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProviderLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState(
    process.env.NEXT_PUBLIC_PROVIDER_DASHBOARD_TOKEN ?? ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already auth'd, skip login
  useEffect(() => {
    fetch("/papi/sessions?limit=1", { credentials: "include" })
      .then((r) => { if (r.ok) router.replace("/provider/dashboard"); })
      .catch(() => {});
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/papi/auth", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (r.ok) {
        router.replace("/provider/dashboard");
      } else {
        const body = await r.json().catch(() => ({}));
        setError(body.error ?? `Login failed (${r.status})`);
      }
    } catch (err) {
      setError("Network error — is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Provider Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">Enter your provider access token to continue.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter provider token"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
