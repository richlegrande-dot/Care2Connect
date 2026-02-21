"use client";

import { useEffect, useState } from "react";

interface BackendHealth {
  ok: boolean;
  timestamp: string;
  uptimeSec: number;
  mode: string;
  build: {
    commit: string;
    node: string;
    tsTranspileOnly: boolean;
  };
  services: {
    db: { ok: boolean; detail: string };
    storage: { ok: boolean; detail: string };
    speech: {
      nvtAvailable: boolean;
      evtsAvailable: boolean;
      modelInstalled: boolean;
      detail: string;
    };
    stripe: { configured: boolean; detail: string };
  };
  degraded: {
    enabled: boolean;
    reasons: string[];
  };
}

export default function SystemStatus() {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
        const response = await fetch(`${backendUrl}/health/status`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setHealth(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setHealth(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return null; // Only show in dev mode
  }

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md">
        <h3 className="font-bold mb-2">System Status</h3>
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-900 text-white p-4 rounded-lg shadow-lg max-w-md">
        <h3 className="font-bold mb-2 flex items-center">
          <span className="mr-2">❌</span> Backend Unreachable
        </h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!health) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md text-sm">
      <h3 className="font-bold mb-3 flex items-center">
        <span className="mr-2">{health.ok ? "✅" : "⚠️"}</span>
        System Status
      </h3>

      <div className="space-y-2">
        {/* Overall Status */}
        <div className="flex justify-between">
          <span className="text-gray-400">Status:</span>
          <span className={health.ok ? "text-green-400" : "text-yellow-400"}>
            {health.ok ? "Healthy" : "Degraded"}
          </span>
        </div>

        {/* Uptime */}
        <div className="flex justify-between">
          <span className="text-gray-400">Uptime:</span>
          <span>
            {Math.floor(health.uptimeSec / 60)}m {health.uptimeSec % 60}s
          </span>
        </div>

        {/* Mode */}
        <div className="flex justify-between">
          <span className="text-gray-400">Mode:</span>
          <span>{health.mode}</span>
        </div>

        {/* TypeScript Transpile-Only Warning */}
        {health.build.tsTranspileOnly && (
          <div className="bg-yellow-900 p-2 rounded mt-2">
            <p className="text-xs text-yellow-200">
              ⚠️ Running in transpile-only mode
            </p>
          </div>
        )}

        {/* Services */}
        <div className="border-t border-gray-700 pt-2 mt-2">
          <p className="text-gray-400 mb-1">Services:</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center">
              <span className="mr-2">
                {health.services.db.ok ? "✅" : "❌"}
              </span>
              <span>Database</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">
                {health.services.storage.ok ? "✅" : "❌"}
              </span>
              <span>Storage</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">
                {health.services.speech.evtsAvailable ? "✅" : "⚠️"}
              </span>
              <span>
                Speech (EVTS:{" "}
                {health.services.speech.evtsAvailable ? "Yes" : "No"})
              </span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">
                {health.services.stripe.configured ? "✅" : "⚠️"}
              </span>
              <span>Stripe</span>
            </div>
            {/* SMTP removed; support tickets are stored in the admin health logs */}
          </div>
        </div>

        {/* Degraded Reasons */}
        {health.degraded.enabled && health.degraded.reasons.length > 0 && (
          <div className="border-t border-gray-700 pt-2 mt-2">
            <p className="text-yellow-400 mb-1">Degraded Mode:</p>
            <ul className="space-y-1 text-xs text-yellow-200">
              {health.degraded.reasons.map((reason, idx) => (
                <li key={idx}>• {reason.replace(/_/g, " ")}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Last updated: {new Date(health.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
