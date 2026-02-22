"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Session {
  sessionId: string;
  status: string;
  completedAt: string | null;
  totalScore: number | null;
  stabilityLevel: number | null;
  priorityTier: string | null;
  dvSafeMode: boolean;
  policyPackVersion: string | null;
}

const TIER_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
  HIGH:     "bg-orange-100 text-orange-800 border-orange-200",
  MODERATE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  LOWER:    "bg-green-100 text-green-800 border-green-200",
};

const LEVEL_LABELS: Record<number, string> = {
  0: "Crisis / Street",
  1: "Emergency Shelter",
  2: "Transitional",
  3: "Stabilizing",
  4: "Housed w/ Support",
  5: "Self-Sufficient",
};

function TierBadge({ tier }: { tier: string | null }) {
  if (!tier) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border ${TIER_STYLES[tier] ?? "bg-gray-100 text-gray-700"}`}>
      {tier}
    </span>
  );
}

export default function ProviderDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const load = useCallback(async (offset: number) => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/papi/sessions?limit=${limit}&offset=${offset}`, {
        credentials: "include",
      });
      if (r.status === 401) {
        router.replace("/provider/login");
        return;
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setSessions(data.sessions ?? []);
      setTotal(data.total ?? 0);
    } catch (err: any) {
      setError(err.message ?? "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(page * limit); }, [load, page]);

  async function handleLogout() {
    await fetch("/papi/logout", { method: "POST", credentials: "include" }).catch(() => {});
    router.replace("/provider/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Intake sessions · V2 scoring</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{total} total sessions</span>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800 underline">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Priority summary strip */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {["CRITICAL","HIGH","MODERATE","LOWER"].map(tier => {
              const count = sessions.filter(s => s.priorityTier === tier).length;
              return (
                <div key={tier} className={`rounded-xl border px-4 py-3 ${TIER_STYLES[tier]}`}>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs font-medium mt-0.5 opacity-75">{tier}</div>
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading sessions…</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium mb-2">No sessions yet</p>
            <p className="text-sm">Complete an intake at <a href="/onboarding/v2" className="text-blue-600 underline">/onboarding/v2</a></p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Tier</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Score</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Stability Level</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Completed</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Session ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, i) => (
                    <tr key={s.sessionId} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                      <td className="px-4 py-3"><TierBadge tier={s.priorityTier} /></td>
                      <td className="px-4 py-3 font-mono font-bold text-gray-800">
                        {s.totalScore !== null ? s.totalScore : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {s.stabilityLevel !== null
                          ? `${s.stabilityLevel} — ${LEVEL_LABELS[s.stabilityLevel] ?? "Unknown"}`
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {s.completedAt
                          ? new Date(s.completedAt).toLocaleString()
                          : <span className="text-gray-400">Incomplete</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{s.sessionId.slice(-12)}</td>
                      <td className="px-4 py-3">
                        {s.dvSafeMode && (
                          <span className="text-xs bg-purple-100 text-purple-700 border border-purple-200 rounded px-1.5 py-0.5">DV-Safe</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > limit && (
              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span>Page {page + 1} of {Math.ceil(total / limit)}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={(page + 1) * limit >= total}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
