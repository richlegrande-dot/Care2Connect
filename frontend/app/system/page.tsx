"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SystemAuthModal from "@/components/SystemAuthModal";
import SystemHealthGraph from "@/components/SystemHealthGraph";
import CloudflareTunnelCard from "@/components/CloudflareTunnelCard";
import ConnectivityCard from "@/components/ConnectivityCard";
import TunnelPreflightCard from "@/components/TunnelPreflightCard";
import OpsStatusPanel from "@/components/OpsStatusPanel";
import {
  Activity,
  Server,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  FileText,
} from "lucide-react";

interface HealthStatus {
  status: string;
  services: any;
  degradedReasons: string[];
}

interface UserError {
  id: string;
  timestamp: string;
  message: string;
  page: string;
  status: string;
  rootCause: {
    suspectedCause: string;
    recommendedFix: string;
    confidence: string;
    category: string;
  };
}

interface TestResult {
  ok: boolean;
  startedAt: string;
  finishedAt: string;
  results: Array<{
    name: string;
    ok: boolean;
    message?: string;
    duration?: number;
  }>;
}

export default function SystemPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [userErrors, setUserErrors] = useState<UserError[]>([]);
  const [selectedError, setSelectedError] = useState<UserError | null>(null);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [runningTests, setRunningTests] = useState(false);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState<any>(null);
  const [helperStatus, setHelperStatus] = useState<Record<string, any>>({});

  // Check for existing token
  useEffect(() => {
    const storedToken = sessionStorage.getItem("system-admin-token");
    const expires = sessionStorage.getItem("system-admin-expires");

    if (storedToken && expires && Date.now() < parseInt(expires)) {
      setToken(storedToken);
      setShowAuthModal(false);
    } else {
      setShowAuthModal(true);
      sessionStorage.removeItem("system-admin-token");
      sessionStorage.removeItem("system-admin-expires");
    }
  }, []);

  // Fetch data when token is available
  useEffect(() => {
    if (!token) return;

    const getApiUrl = () => {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "http://localhost:3001";
      return apiUrl.replace(/\/api$/, ""); // Remove /api suffix if present
    };

    const fetchData = async () => {
      try {
        const baseUrl = getApiUrl();

        // Fetch health status
        const healthRes = await fetch(`${baseUrl}/health/status`);
        if (healthRes.ok) {
          setHealthStatus(await healthRes.json());
        }

        // Fetch user errors
        const errorsRes = await fetch(`${baseUrl}/admin/user-errors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (errorsRes.ok) {
          const data = await errorsRes.json();
          setUserErrors(data.errors || []);
        }
      } catch (err) {
        console.error("Failed to fetch system data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Poll health status every 10 seconds
    const interval = setInterval(async () => {
      try {
        const baseUrl = getApiUrl();
        const healthRes = await fetch(`${baseUrl}/health/status`);
        if (healthRes.ok) {
          setHealthStatus(await healthRes.json());
        }
      } catch (err) {
        console.error("Health poll failed:", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [token]);

  const openCardDetails = (type: "status" | "database" | "storage") => {
    if (!healthStatus) return;
    const snapshot = healthStatus as any;
    let content: any = {};
    if (type === "status") {
      content = {
        title: "System Status",
        integrity: snapshot.integrity || null,
        blockingReasons: snapshot.integrity?.blockingReasons || [],
      };
    } else if (type === "database") {
      content = {
        title: "Database",
        ok: snapshot.services?.db?.ok,
        detail: snapshot.services?.db?.detail,
        connectedSince: snapshot.connectedSince?.db || "never",
      };
    } else if (type === "storage") {
      content = {
        title: "Storage",
        ok: snapshot.services?.storage?.ok,
        detail: snapshot.services?.storage?.detail,
        connectedSince: snapshot.connectedSince?.storage || "never",
      };
    }

    setDrawerContent(content);
    setDrawerOpen(true);
  };

  const callFixEndpoint = async (endpoint: string) => {
    if (!token)
      return setHelperStatus((prev) => ({
        ...prev,
        [endpoint]: { ok: false, message: "Not authenticated" },
      }));
    setHelperStatus((prev) => ({ ...prev, [endpoint]: { status: "pending" } }));
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "http://localhost:3001";
      const baseUrl = apiUrl.replace(/\/api$/, "");

      const res = await fetch(`${baseUrl}/admin/${endpoint}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHelperStatus((prev) => ({
        ...prev,
        [endpoint]: { status: res.ok ? "success" : "manual", data },
      }));
    } catch (err) {
      setHelperStatus((prev) => ({
        ...prev,
        [endpoint]: { status: "error", error: String(err) },
      }));
    }
  };

  const handleAuthenticated = (newToken: string) => {
    setToken(newToken);
    setShowAuthModal(false);
  };

  const handleRunTests = async () => {
    if (!token) return;

    setRunningTests(true);
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "http://localhost:3001";
      const baseUrl = apiUrl.replace(/\/api$/, "");

      const res = await fetch(`${baseUrl}/admin/run-tests`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setTestResults(data);
      }
    } catch (err) {
      console.error("Failed to run tests:", err);
    } finally {
      setRunningTests(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("system-admin-token");
    sessionStorage.removeItem("system-admin-expires");
    setToken(null);
    setShowAuthModal(true);
  };

  if (showAuthModal) {
    return (
      <SystemAuthModal
        onAuthenticated={handleAuthenticated}
        onCancel={() => router.push("/")}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading system data...</div>
      </div>
    );
  }

  const statusColor =
    healthStatus?.status === "ready"
      ? "green"
      : healthStatus?.status === "degraded"
        ? "yellow"
        : "red";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Server className="text-blue-600" size={28} />
              <h1 className="text-2xl font-bold text-gray-900">
                System Diagnostics Console
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Portal
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div
            role="button"
            onClick={() => openCardDetails("status")}
            className="bg-white rounded-lg shadow p-6 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p
                  className={`text-2xl font-bold capitalize text-${statusColor}-600`}
                >
                  {healthStatus?.status || "Unknown"}
                </p>
              </div>
              {statusColor === "green" && (
                <CheckCircle className="text-green-500" size={32} />
              )}
              {statusColor === "yellow" && (
                <AlertCircle className="text-yellow-500" size={32} />
              )}
              {statusColor === "red" && (
                <XCircle className="text-red-500" size={32} />
              )}
            </div>
          </div>

          <div
            role="button"
            onClick={() => openCardDetails("database")}
            className="bg-white rounded-lg shadow p-6 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Database</p>
                <p
                  className={`text-2xl font-bold ${healthStatus?.services?.db?.ok ? "text-green-600" : "text-red-600"}`}
                >
                  {healthStatus?.services?.db?.ok
                    ? "Connected"
                    : "Disconnected"}
                </p>
              </div>
              <Activity
                className={
                  healthStatus?.services?.db?.ok
                    ? "text-green-500"
                    : "text-red-500"
                }
                size={32}
              />
            </div>
          </div>

          <div
            role="button"
            onClick={() => openCardDetails("storage")}
            className="bg-white rounded-lg shadow p-6 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Storage</p>
                <p
                  className={`text-2xl font-bold ${healthStatus?.services?.storage?.ok ? "text-green-600" : "text-red-600"}`}
                >
                  {healthStatus?.services?.storage?.ok
                    ? "Connected"
                    : "Disconnected"}
                </p>
              </div>
              <FileText
                className={
                  healthStatus?.services?.storage?.ok
                    ? "text-green-500"
                    : "text-red-500"
                }
                size={32}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">User Errors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userErrors.length}
                </p>
              </div>
              <AlertCircle className="text-orange-500" size={32} />
            </div>
          </div>
        </div>

        {/* Setup Helpers */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Setup Helpers
            </h3>
            <p className="text-sm text-gray-500">
              One-click helpers (demo/dev only)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <button
                onClick={() => callFixEndpoint("fix/db")}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded"
              >
                Start Demo Database
              </button>
              <div className="text-sm text-gray-600">
                {helperStatus["fix/db"]?.status === "pending"
                  ? "Starting..."
                  : helperStatus["fix/db"]?.data?.command ||
                    (helperStatus["fix/db"]?.status === "success"
                      ? "Started"
                      : "")}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => callFixEndpoint("fix/email-inbox")}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded"
              >
                Start Local Email Inbox
              </button>
              <div className="text-sm text-gray-600">
                {helperStatus["fix/email-inbox"]?.data?.inboxUrl ||
                  helperStatus["fix/email-inbox"]?.data?.command ||
                  ""}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => callFixEndpoint("fix/install-evts")}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded"
              >
                Install EVTS Model
              </button>
              <div className="text-sm text-gray-600">
                {helperStatus["fix/install-evts"]?.data?.command ||
                  helperStatus["fix/install-evts"]?.data?.message ||
                  ""}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => callFixEndpoint("fix/stripe-webhook")}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded"
              >
                Stripe Webhook Helper
              </button>
              <div className="text-sm text-gray-600">
                {helperStatus["fix/stripe-webhook"]?.data?.command ||
                  helperStatus["fix/stripe-webhook"]?.data?.message ||
                  ""}
              </div>
            </div>
          </div>
        </div>

        {/* Connectivity Card */}
        {token && (
          <div className="mt-8">
            <ConnectivityCard token={token} />
          </div>
        )}

        {/* Tunnel Preflight Card */}
        {token && (
          <div className="mt-8">
            <TunnelPreflightCard token={token} />
          </div>
        )}

        {/* Cloudflare Tunnel Card */}
        {token && (
          <div className="mt-8">
            <CloudflareTunnelCard token={token} />
          </div>
        )}

        {/* Degraded Reasons */}
        {healthStatus?.degradedReasons &&
          healthStatus.degradedReasons.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                Degraded Reasons:
              </h3>
              <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                {healthStatus.degradedReasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

        {/* Details Drawer */}
        {drawerOpen && drawerContent && (
          <div className="fixed inset-0 bg-black/40 z-40 flex items-end md:items-center justify-center p-4">
            <div className="bg-white rounded-t-lg md:rounded-lg shadow-2xl w-full md:w-3/4 max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{drawerContent.title}</h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm text-gray-800">
                {drawerContent.integrity && (
                  <div>
                    <p className="font-medium">
                      Integrity Mode:{" "}
                      <span className="font-semibold">
                        {drawerContent.integrity.mode}
                      </span>
                    </p>
                    <p className="mt-2">Blocking Reasons:</p>
                    <ul className="list-disc list-inside">
                      {drawerContent.blockingReasons.map(
                        (b: string, i: number) => (
                          <li key={i}>{b}</li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

                {typeof drawerContent.ok !== "undefined" && (
                  <div>
                    <p className="font-medium">
                      State:{" "}
                      <span
                        className={`font-semibold ${drawerContent.ok ? "text-green-600" : "text-red-600"}`}
                      >
                        {drawerContent.ok ? "Connected" : "Disconnected"}
                      </span>
                    </p>
                    <p className="mt-2">Detail: {drawerContent.detail}</p>
                    <p className="mt-2">
                      Connected since: {drawerContent.connectedSince}
                    </p>
                    <div className="mt-4">
                      <p className="font-medium">Fix Steps</p>
                      <pre className="bg-gray-50 p-3 rounded text-xs mt-2">
                        {drawerContent.ok
                          ? "No action required"
                          : "docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres"}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Health Graph */}
        {token && <SystemHealthGraph token={token} />}

        {/* Test Runner */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              System Tests
            </h3>
            <button
              onClick={handleRunTests}
              disabled={runningTests}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {runningTests ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Running...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Run Tests
                </>
              )}
            </button>
          </div>

          {testResults && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Started:{" "}
                  {new Date(testResults.startedAt).toLocaleTimeString()}
                </span>
                <span className="text-gray-600">
                  Finished:{" "}
                  {new Date(testResults.finishedAt).toLocaleTimeString()}
                </span>
              </div>

              {testResults.results.map((result) => (
                <div
                  key={result.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <span className="font-medium text-gray-900">
                    {result.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {result.duration && (
                      <span className="text-xs text-gray-500">
                        {result.duration}ms
                      </span>
                    )}
                    {result.ok ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <XCircle className="text-red-500" size={20} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Errors Console */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Reported Errors
          </h3>

          {userErrors.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No user errors reported
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Page
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Suspected Cause
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Confidence
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userErrors.slice(0, 10).map((error) => (
                    <tr
                      key={error.id}
                      onClick={() => setSelectedError(error)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(error.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {error.rootCause.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {error.page || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {error.rootCause.suspectedCause}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            error.rootCause.confidence === "high"
                              ? "bg-green-100 text-green-800"
                              : error.rootCause.confidence === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {error.rootCause.confidence}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                        {error.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Error Detail Modal */}
        {selectedError && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Error Details
                  </h3>
                  <button
                    onClick={() => setSelectedError(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Timestamp
                    </p>
                    <p className="text-gray-900">
                      {new Date(selectedError.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Message</p>
                    <p className="text-gray-900">{selectedError.message}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Page</p>
                    <p className="text-gray-900">
                      {selectedError.page || "Unknown"}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Root Cause Analysis
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                      <div>
                        <p className="text-xs font-medium text-blue-900">
                          Category
                        </p>
                        <p className="text-blue-800">
                          {selectedError.rootCause.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-900">
                          Suspected Cause
                        </p>
                        <p className="text-blue-800">
                          {selectedError.rootCause.suspectedCause}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-900">
                          Recommended Fix
                        </p>
                        <p className="text-blue-800">
                          {selectedError.rootCause.recommendedFix}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-900">
                          Confidence
                        </p>
                        <p className="text-blue-800 capitalize">
                          {selectedError.rootCause.confidence}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
