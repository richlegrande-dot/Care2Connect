"use client";

/**
 * Operations Status Panel
 * Shows system health, incidents, and monitoring controls
 * SECURITY: Only shows sanitized data, no secrets
 */

import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface ServiceStatus {
  service: string;
  healthy: boolean;
  latency: number;
  lastCheck: string;
  error?: string;
}

interface HealthStatus {
  ok: boolean;
  status: string;
  overall: boolean;
  services: ServiceStatus[];
  lastRun: string;
  schedulerRunning: boolean;
}

interface Incident {
  id: string;
  service: string;
  severity: "info" | "warn" | "critical";
  status: "open" | "investigating" | "resolved";
  firstSeenAt: string;
  lastSeenAt: string;
  resolvedAt?: string;
  summary: string;
  details: string;
  recommendation: string;
}

interface OpsStatusPanelProps {
  token: string;
}

export default function OpsStatusPanel({ token }: OpsStatusPanelProps) {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getApiUrl = () => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:3001";
    return apiUrl.replace(/\/api$/, "");
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/admin/ops/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setHealthStatus(data);
    } catch (err: any) {
      setError(`Failed to fetch status: ${err.message}`);
    }
  };

  const fetchIncidents = async () => {
    try {
      const response = await fetch(
        `${getApiUrl()}/admin/ops/incidents?status=open`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setIncidents(data.incidents || []);
    } catch (err: any) {
      setError(`Failed to fetch incidents: ${err.message}`);
    }
  };

  const runManualCheck = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/admin/ops/run-checks`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await fetchStatus();
        await fetchIncidents();
      }
    } catch (err: any) {
      setError(`Manual check failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resolveIncident = async (incidentId: string) => {
    try {
      const response = await fetch(
        `${getApiUrl()}/admin/ops/incidents/${incidentId}/resolve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        await fetchIncidents();
      }
    } catch (err: any) {
      setError(`Failed to resolve incident: ${err.message}`);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStatus(), fetchIncidents()]);
      setLoading(false);
    };

    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "warn":
        return "text-yellow-600 bg-yellow-50";
      case "info":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getServiceIcon = (healthy: boolean) => {
    return healthy ? (
      <CheckCircleIcon className="w-5 h-5 text-green-600" />
    ) : (
      <XCircleIcon className="w-5 h-5 text-red-600" />
    );
  };

  if (loading && !healthStatus) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Operations Status
          </h2>
          <button
            onClick={runManualCheck}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Run Checks
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {healthStatus && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  healthStatus.overall
                    ? "text-green-700 bg-green-100"
                    : "text-red-700 bg-red-100"
                }`}
              >
                {healthStatus.overall ? (
                  <CheckCircleIcon className="w-4 h-4" />
                ) : (
                  <ExclamationTriangleIcon className="w-4 h-4" />
                )}
                {healthStatus.status.toUpperCase()}
              </div>
              <p className="text-sm text-gray-600 mt-1">Overall Status</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {healthStatus.services?.filter((s) => s.healthy).length || 0}
                <span className="text-gray-400">
                  /{healthStatus.services?.length || 0}
                </span>
              </div>
              <p className="text-sm text-gray-600">Services Healthy</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {healthStatus.lastRun
                    ? new Date(healthStatus.lastRun).toLocaleTimeString()
                    : "Never"}
                </span>
              </div>
              <p className="text-sm text-gray-600">Last Check</p>
            </div>
          </div>
        )}
      </div>

      {/* Service Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Service Health
        </h3>

        {healthStatus?.services && healthStatus.services.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthStatus.services.map((service) => (
              <div key={service.service} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getServiceIcon(service.healthy)}
                    <span className="font-medium capitalize">
                      {service.service}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {service.latency}ms
                  </span>
                </div>

                {service.error && (
                  <p className="text-sm text-red-600 mb-2">{service.error}</p>
                )}

                <p className="text-xs text-gray-500">
                  Last: {new Date(service.lastCheck).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No service data available
          </p>
        )}
      </div>

      {/* Active Incidents */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Open Incidents ({incidents.length})
        </h3>

        {incidents.length > 0 ? (
          <div className="space-y-3">
            {incidents.map((incident) => (
              <div key={incident.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}
                      >
                        {incident.severity.toUpperCase()}
                      </span>
                      <span className="font-medium capitalize">
                        {incident.service}
                      </span>
                    </div>

                    <h4 className="font-medium text-gray-900 mb-1">
                      {incident.summary}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {incident.details}
                    </p>
                    <p className="text-sm text-blue-600">
                      {incident.recommendation}
                    </p>

                    <div className="flex gap-4 text-xs text-gray-500 mt-2">
                      <span>
                        First: {new Date(incident.firstSeenAt).toLocaleString()}
                      </span>
                      <span>
                        Last: {new Date(incident.lastSeenAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => resolveIncident(incident.id)}
                    className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-500">No open incidents</p>
          </div>
        )}
      </div>
    </div>
  );
}
