"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ServerIcon,
  CircleStackIcon,
  CreditCardIcon,
  CloudIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

interface ServiceStatus {
  ok: boolean;
  message?: string;
  latency?: number;
  [key: string]: any;
}

interface HealthData {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  services: {
    db?: ServiceStatus;
    database?: ServiceStatus;
    storage?: ServiceStatus;
    stripe?: ServiceStatus;
    openai?: ServiceStatus;
    [key: string]: ServiceStatus | undefined;
  };
  metrics?: {
    totalRequests: number;
    errorRate: number;
    avgResponseTime: number;
  };
}

interface SupportTicket {
  id: string;
  type: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  source: string;
  profileTicketId?: string;
  createdAt: string;
  updatedAt: string;
}

// Support Ticket Admin Panel Component
function SupportTicketPanel() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "open" | "in_progress" | "closed"
  >("open");

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const url =
        filter === "all"
          ? `${backendUrl}/admin/support/tickets`
          : `${backendUrl}/admin/support/tickets?status=${filter.toUpperCase()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const response = await fetch(
        `${backendUrl}/admin/support/tickets/${ticketId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        fetchTickets();
      }
    } catch (error) {
      console.error("Failed to update ticket:", error);
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading tickets...</div>;
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(["all", "open", "in_progress", "closed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {f === "in_progress"
              ? "In Progress"
              : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {tickets.length === 0 ? (
        <div className="text-gray-500 italic">
          No {filter !== "all" ? filter : ""} tickets found
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border border-gray-300 rounded p-3 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        ticket.priority === "HIGH"
                          ? "bg-red-100 text-red-700"
                          : ticket.priority === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                    <span className="text-xs text-gray-500">{ticket.type}</span>
                    <span className="text-xs text-gray-400">
                      #{ticket.id.slice(0, 8)}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900">
                    {ticket.subject}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {ticket.description}
                  </p>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(ticket.createdAt).toLocaleString()} • Source:{" "}
                    {ticket.source}
                  </div>
                </div>
                <div className="ml-4">
                  <select
                    value={ticket.status}
                    onChange={(e) =>
                      updateTicketStatus(ticket.id, e.target.value)
                    }
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Health Graphs Component
function HealthGraphs({ history }: { history: any[] }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-gray-500 italic">
        No historical data available yet
      </div>
    );
  }

  // Calculate status counts over time
  const statusData = history.map((h) => ({
    timestamp: new Date(h.timestamp).toLocaleTimeString(),
    healthy: h.status === "healthy" ? 1 : 0,
    degraded: h.status === "degraded" ? 1 : 0,
    unhealthy: h.status === "unhealthy" ? 1 : 0,
  }));

  // Calculate average service latencies
  const serviceData = history.map((h) => ({
    timestamp: new Date(h.timestamp).toLocaleTimeString(),
    db: h.services?.db?.latency || 0,
    stripe: h.services?.stripe?.latency || 0,
    openai: h.services?.openai?.latency || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Status Distribution */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">
          System Status History
        </h4>
        <div className="bg-gray-50 p-4 rounded">
          <div className="flex items-end gap-1 h-32">
            {statusData.slice(-20).map((d, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-1">
                {d.healthy > 0 && (
                  <div className="bg-green-500" style={{ height: "100%" }} />
                )}
                {d.degraded > 0 && (
                  <div className="bg-yellow-500" style={{ height: "100%" }} />
                )}
                {d.unhealthy > 0 && (
                  <div className="bg-red-500" style={{ height: "100%" }} />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Healthy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Degraded</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Unhealthy</span>
            </div>
          </div>
        </div>
      </div>

      {/* API Dependencies Latency */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">
          API Dependencies (Latency ms)
        </h4>
        <div className="bg-gray-50 p-4 rounded">
          <div className="flex items-end gap-1 h-32">
            {serviceData.slice(-20).map((d, i) => {
              const maxLatency = Math.max(d.db, d.stripe, d.openai, 100);
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col justify-end gap-0.5"
                >
                  {d.db > 0 && (
                    <div
                      className="bg-blue-500"
                      style={{ height: `${(d.db / maxLatency) * 100}%` }}
                      title={`DB: ${d.db}ms`}
                    />
                  )}
                  {d.stripe > 0 && (
                    <div
                      className="bg-purple-500"
                      style={{ height: `${(d.stripe / maxLatency) * 100}%` }}
                      title={`Stripe: ${d.stripe}ms`}
                    />
                  )}
                  {d.openai > 0 && (
                    <div
                      className="bg-indigo-500"
                      style={{ height: `${(d.openai / maxLatency) * 100}%` }}
                      title={`OpenAI: ${d.openai}ms`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Database</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Stripe</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-indigo-500 rounded"></div>
              <span>OpenAI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [connectivityTests, setConnectivityTests] = useState<{
    frontend: { ok: boolean; latency: number; error?: string } | null;
    backend: { ok: boolean; latency: number; error?: string } | null;
    database: {
      ok: boolean;
      latency: number;
      error?: string;
      detail?: string;
    } | null;
    proxy: { ok: boolean; latency: number; error?: string } | null;
  }>({
    frontend: null,
    backend: null,
    database: null,
    proxy: null,
  });
  const [healthHistory, setHealthHistory] = useState<any[]>([]);
  const [isHealing, setIsHealing] = useState(false);
  const [healingLog, setHealingLog] = useState<string[]>([]);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3003";
      const response = await fetch(`${backendUrl}/health/ready`);

      // Accept both 200 (healthy) and 503 (degraded but responding)
      if (!response.ok && response.status !== 503) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      setHealth(data);
      setLastChecked(new Date());
    } catch (err) {
      console.error("Health check error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch health status",
      );
    } finally {
      setLoading(false);
    }
  };

  const runConnectivityTests = async () => {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3003";

    // Test Backend
    const backendStart = Date.now();
    try {
      const response = await fetch(`${backendUrl}/health/live`, {
        method: "GET",
        cache: "no-store",
      });
      const backendLatency = Date.now() - backendStart;
      setConnectivityTests((prev) => ({
        ...prev,
        backend: { ok: response.ok, latency: backendLatency },
      }));
    } catch (err) {
      setConnectivityTests((prev) => ({
        ...prev,
        backend: {
          ok: false,
          latency: Date.now() - backendStart,
          error: err instanceof Error ? err.message : "Failed",
        },
      }));
    }

    // Test Database - NEW
    const dbStart = Date.now();
    try {
      const response = await fetch(`${backendUrl}/health/ready`, {
        method: "GET",
        cache: "no-store",
      });
      const dbLatency = Date.now() - dbStart;
      if (response.ok) {
        const data = await response.json();
        const dbOk =
          data.services?.db?.ok || data.services?.database?.ok || false;
        const dbMessage =
          data.services?.db?.message || data.services?.database?.message || "";
        const detail = dbMessage.includes("FileStore")
          ? "FileStore mode (no database)"
          : "Database connected";
        setConnectivityTests((prev) => ({
          ...prev,
          database: { ok: dbOk, latency: dbLatency, detail },
        }));
      } else {
        setConnectivityTests((prev) => ({
          ...prev,
          database: {
            ok: false,
            latency: dbLatency,
            error: "Health check failed",
          },
        }));
      }
    } catch (err) {
      setConnectivityTests((prev) => ({
        ...prev,
        database: {
          ok: false,
          latency: Date.now() - dbStart,
          error: err instanceof Error ? err.message : "Failed",
        },
      }));
    }

    // Test Frontend (self-test)
    const frontendStart = Date.now();
    try {
      const response = await fetch("/api/health", {
        method: "HEAD",
        cache: "no-store",
      });
      const frontendLatency = Date.now() - frontendStart;
      setConnectivityTests((prev) => ({
        ...prev,
        frontend: { ok: true, latency: frontendLatency },
      }));
    } catch (err) {
      setConnectivityTests((prev) => ({
        ...prev,
        frontend: {
          ok: false,
          latency: Date.now() - frontendStart,
          error: err instanceof Error ? err.message : "Failed",
        },
      }));
    }

    // Test Reverse Proxy (if accessible)
    const proxyStart = Date.now();
    try {
      const response = await fetch("http://localhost:8080", {
        method: "HEAD",
        cache: "no-store",
        headers: { Host: "care2connects.org" },
      });
      const proxyLatency = Date.now() - proxyStart;
      setConnectivityTests((prev) => ({
        ...prev,
        proxy: { ok: response.ok, latency: proxyLatency },
      }));
    } catch (err) {
      setConnectivityTests((prev) => ({
        ...prev,
        proxy: {
          ok: false,
          latency: Date.now() - proxyStart,
          error: err instanceof Error ? err.message : "Failed",
        },
      }));
    }
  };

  const fetchHealthHistory = async () => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3003";
      const response = await fetch(`${backendUrl}/health/history?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setHealthHistory(data.history || []);
      }
    } catch (err) {
      console.error("Failed to fetch health history:", err);
    }
  };

  const triggerSelfHealing = async () => {
    setIsHealing(true);
    setHealingLog(["Starting self-healing process..."]);

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3003";

      // Call backend self-heal endpoint
      setHealingLog((prev) => [...prev, "Calling backend self-heal API..."]);

      const response = await fetch(`${backendUrl}/admin/self-heal/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
        },
      });

      if (response.ok) {
        const healResult = await response.json();

        setHealingLog((prev) => [
          ...prev,
          `Self-healing completed in ${healResult.duration}ms`,
          `Status: ${healResult.success ? "SUCCESS" : "PARTIAL FAILURE"}`,
          `Actions performed: ${healResult.actions.length}`,
        ]);

        // Log each action
        healResult.actions.forEach((action: any) => {
          const status = action.success ? "✓" : "✗";
          const msg = `${status} ${action.component}: ${action.action}`;
          setHealingLog((prev) => [...prev, msg]);
          if (action.error) {
            setHealingLog((prev) => [...prev, `  Error: ${action.error}`]);
          }
        });

        // Re-run connectivity tests
        setHealingLog((prev) => [...prev, "Running connectivity tests..."]);
        await runConnectivityTests();

        // Refresh health status
        setHealingLog((prev) => [...prev, "Refreshing system status..."]);
        await fetchHealth();
        await fetchHealthHistory();

        setHealingLog((prev) => [...prev, "Self-healing complete!"]);
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        setHealingLog((prev) => [
          ...prev,
          `Self-heal API failed: ${errorData.error || response.statusText}`,
        ]);
      }
    } catch (err) {
      setHealingLog((prev) => [
        ...prev,
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      ]);
    } finally {
      setIsHealing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    runConnectivityTests();
    fetchHealthHistory();

    // Auto-refresh every 30 seconds if enabled
    let healthInterval: NodeJS.Timeout | null = null;
    let connectivityInterval: NodeJS.Timeout | null = null;

    if (autoRefreshEnabled) {
      healthInterval = setInterval(() => {
        fetchHealth();
        fetchHealthHistory();
      }, 30000);

      connectivityInterval = setInterval(() => {
        runConnectivityTests();
      }, 15000); // Test connectivity more frequently
    }

    return () => {
      if (healthInterval) clearInterval(healthInterval);
      if (connectivityInterval) clearInterval(connectivityInterval);
    };
  }, [autoRefreshEnabled]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const getStatusColor = (status?: "healthy" | "degraded" | "unhealthy") => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "unhealthy":
        return "text-red-600";
      default:
        return "text-gray-400";
    }
  };

  const getStatusBg = (status?: "healthy" | "degraded" | "unhealthy") => {
    switch (status) {
      case "healthy":
        return "bg-green-50 border-green-200";
      case "degraded":
        return "bg-yellow-50 border-yellow-200";
      case "unhealthy":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const ServiceCard = ({
    name,
    icon: Icon,
    status,
  }: {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    status?: ServiceStatus;
  }) => (
    <div
      className={`p-6 rounded-lg border-2 ${status?.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Icon className="w-8 h-8 text-gray-700" />
          <div>
            <h3 className="font-bold text-lg text-gray-900">{name}</h3>
            {status?.message && (
              <p className="text-sm text-gray-600 mt-1">{status.message}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {status?.ok ? (
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          ) : (
            <XCircleIcon className="w-8 h-8 text-red-600" />
          )}
          {status?.latency && (
            <span className="text-xs text-gray-500">{status.latency}ms</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ShieldCheckIcon className="w-8 h-8" />
              </Link>
              <div>
                <h1 className="text-3xl font-black text-gray-900">
                  System Health
                </h1>
                <p className="text-gray-600">
                  Real-time system status and monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/knowledge/incidents"
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-semibold transition-colors"
              >
                <ExclamationTriangleIcon className="w-5 h-5" />
                Incidents
              </Link>
              <Link
                href="/admin/knowledge"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg font-semibold transition-colors"
              >
                <ChartBarIcon className="w-5 h-5" />
                Knowledge
              </Link>
              <button
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  autoRefreshEnabled
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <BoltIcon className="w-5 h-5" />
                Auto-Refresh {autoRefreshEnabled ? "ON" : "OFF"}
              </button>
              <button
                onClick={fetchHealth}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
              >
                <ArrowPathIcon
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                onClick={triggerSelfHealing}
                disabled={isHealing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
              >
                <WrenchScrewdriverIcon
                  className={`w-5 h-5 ${isHealing ? "animate-spin" : ""}`}
                />
                Self-Heal
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overall Status Banner */}
        {health && (
          <div
            className={`p-6 rounded-xl border-2 mb-8 ${getStatusBg(health.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {health.status === "healthy" ? (
                  <CheckCircleIcon className="w-12 h-12 text-green-600" />
                ) : health.status === "degraded" ? (
                  <ClockIcon className="w-12 h-12 text-yellow-600" />
                ) : (
                  <XCircleIcon className="w-12 h-12 text-red-600" />
                )}
                <div>
                  <h2
                    className={`text-2xl font-bold ${getStatusColor(health.status)}`}
                  >
                    {health.status === "healthy" && "All Systems Operational"}
                    {health.status === "degraded" &&
                      "Partial Service Degradation"}
                    {health.status === "unhealthy" && "Service Outage"}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Uptime: {formatUptime(health.uptime)} • Last checked:{" "}
                    {lastChecked.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              {health.metrics && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Requests</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {health.metrics.totalRequests.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <XCircleIcon className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="font-bold text-red-900">
                  Unable to fetch system health
                </h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !health && (
          <div className="flex items-center justify-center py-20">
            <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Service Status Grid */}
        {health && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Service Status
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <ServiceCard
                name="Database"
                icon={CircleStackIcon}
                status={health.services.db}
              />
              <ServiceCard
                name="File Storage"
                icon={CloudIcon}
                status={health.services.storage}
              />
              <ServiceCard
                name="Payment Processing"
                icon={CreditCardIcon}
                status={health.services.stripe}
              />
              {/* Connectivity Tests */}
              <div className="mt-8 bg-white p-6 rounded-lg border-2 border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <WrenchScrewdriverIcon className="w-6 h-6 text-purple-600" />
                    <h3 className="font-bold text-lg text-gray-900">
                      Connectivity Tests
                    </h3>
                  </div>
                  <button
                    onClick={runConnectivityTests}
                    className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                  >
                    Run Tests
                  </button>
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                  <div
                    className={`p-4 rounded-lg border-2 ${connectivityTests.backend?.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                  >
                    <div className="font-semibold text-gray-900 mb-2">
                      Backend API
                    </div>
                    {connectivityTests.backend ? (
                      <>
                        <div
                          className={`text-sm ${connectivityTests.backend.ok ? "text-green-700" : "text-red-700"}`}
                        >
                          {connectivityTests.backend.ok
                            ? "Connected"
                            : "Failed"}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {connectivityTests.backend.latency}ms latency
                        </div>
                        {connectivityTests.backend.error && (
                          <div className="text-xs text-red-600 mt-1">
                            {connectivityTests.backend.error}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">Testing...</div>
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 ${connectivityTests.database?.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                  >
                    <div className="font-semibold text-gray-900 mb-2">
                      Database
                    </div>
                    {connectivityTests.database ? (
                      <>
                        <div
                          className={`text-sm ${connectivityTests.database.ok ? "text-green-700" : "text-red-700"}`}
                        >
                          {connectivityTests.database.ok
                            ? "Connected"
                            : "Failed"}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {connectivityTests.database.latency}ms latency
                        </div>
                        {connectivityTests.database.detail && (
                          <div className="text-xs text-gray-600 mt-1">
                            {connectivityTests.database.detail}
                          </div>
                        )}
                        {connectivityTests.database.error && (
                          <div className="text-xs text-red-600 mt-1">
                            {connectivityTests.database.error}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">Testing...</div>
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 ${connectivityTests.frontend?.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                  >
                    <div className="font-semibold text-gray-900 mb-2">
                      Frontend App
                    </div>
                    {connectivityTests.frontend ? (
                      <>
                        <div
                          className={`text-sm ${connectivityTests.frontend.ok ? "text-green-700" : "text-red-700"}`}
                        >
                          {connectivityTests.frontend.ok ? "Running" : "Failed"}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {connectivityTests.frontend.latency}ms response
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">Testing...</div>
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 ${connectivityTests.proxy?.ok ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}
                  >
                    <div className="font-semibold text-gray-900 mb-2">
                      Reverse Proxy
                    </div>
                    {connectivityTests.proxy ? (
                      <>
                        <div
                          className={`text-sm ${connectivityTests.proxy.ok ? "text-green-700" : "text-yellow-700"}`}
                        >
                          {connectivityTests.proxy.ok
                            ? "Active"
                            : "Unreachable"}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {connectivityTests.proxy.latency}ms latency
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">Testing...</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Self-Healing Log */}
              {healingLog.length > 0 && (
                <div className="mt-8 bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <WrenchScrewdriverIcon className="w-6 h-6 text-purple-600" />
                    <h3 className="font-bold text-lg text-gray-900">
                      Self-Healing Log
                    </h3>
                  </div>
                  <div className="bg-white rounded border border-purple-200 p-4 max-h-60 overflow-y-auto">
                    {healingLog.map((log, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-gray-700 font-mono py-1"
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Health History */}
              {healthHistory.length > 0 && (
                <div className="mt-8 bg-white p-6 rounded-lg border-2 border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">
                    Recent Health Checks
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Time</th>
                          <th className="text-left py-2">Status</th>
                          <th className="text-left py-2">DB</th>
                          <th className="text-left py-2">Storage</th>
                          <th className="text-left py-2">Stripe</th>
                        </tr>
                      </thead>
                      <tbody>
                        {healthHistory.slice(0, 5).map((record, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="py-2 text-gray-600">
                              {new Date(record.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="py-2">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                  record.status === "healthy"
                                    ? "bg-green-100 text-green-800"
                                    : record.status === "degraded"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {record.status}
                              </span>
                            </td>
                            <td className="py-2">
                              {record.services?.db?.ok ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircleIcon className="w-5 h-5 text-red-600" />
                              )}
                            </td>
                            <td className="py-2">
                              {record.services?.storage?.ok ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircleIcon className="w-5 h-5 text-red-600" />
                              )}
                            </td>
                            <td className="py-2">
                              {record.services?.stripe?.ok ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircleIcon className="w-5 h-5 text-red-600" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <ServiceCard
                name="AI Description"
                icon={ServerIcon}
                status={health.services.openai}
              />
            </div>

            {/* Performance Metrics */}
            {health.metrics && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-12">
                  Performance Metrics
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                    <ChartBarIcon className="w-8 h-8 text-blue-600 mb-3" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {health.metrics.totalRequests.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Requests</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                    <ChartBarIcon className="w-8 h-8 text-green-600 mb-3" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {health.metrics.avgResponseTime}ms
                    </div>
                    <div className="text-sm text-gray-600">
                      Avg Response Time
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                    <ChartBarIcon
                      className={`w-8 h-8 mb-3 ${health.metrics.errorRate > 5 ? "text-red-600" : "text-yellow-600"}`}
                    />
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {health.metrics.errorRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Error Rate</div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Support Ticket Admin UI */}
        <div className="mt-8 bg-white p-6 rounded-lg border-2 border-yellow-200">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
            Support Tickets
          </h3>
          <SupportTicketPanel />
        </div>

        {/* Health Check Graphs */}
        <div className="mt-8 bg-white p-6 rounded-lg border-2 border-blue-200">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-blue-600" />
            Health Trends
          </h3>
          <HealthGraphs history={healthHistory} />
        </div>

        {/* Quick Links */}
        <div className="mt-12 bg-white p-6 rounded-lg border-2 border-blue-200">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Quick Links</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/tell-story"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
            >
              <span>→</span> Tell Your Story (Recording)
            </Link>
            <Link
              href="/donate"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
            >
              <span>→</span> Donation System
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
            >
              <span>→</span> Home
            </Link>
            <a
              href={`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/health/live`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
            >
              <span>→</span> API Health (JSON)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
