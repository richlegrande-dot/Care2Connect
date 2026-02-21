"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminPasswordGate } from "@/components/AdminPasswordGate";

interface KnowledgeChunk {
  id: string;
  text: string;
  metadata: {
    tags?: string[];
    symptoms?: string[];
    actions?: Array<{ type: string; description: string }>;
  };
  source: {
    id: string;
    title: string;
    sourceType: string;
  };
}

interface KnowledgeBinding {
  id: string;
  knowledgeChunkId: string;
  score: number | null;
  reason: string | null;
  chunk: KnowledgeChunk;
}

interface PipelineIncident {
  id: string;
  createdAt: string;
  updatedAt: string;
  ticketId: string | null;
  stage: string;
  severity: string;
  errorCode: string | null;
  errorMessage: string;
  contextJson: any;
  recommendationsJson: any;
  status: string;
  resolvedAt: string | null;
  ticket: {
    id: string;
    displayName: string | null;
    contactType: string;
    status: string;
  } | null;
  knowledgeBindings: KnowledgeBinding[];
}

const SEVERITY_COLORS = {
  INFO: "bg-blue-100 text-blue-800",
  WARN: "bg-yellow-100 text-yellow-800",
  ERROR: "bg-red-100 text-red-800",
  CRITICAL: "bg-purple-100 text-purple-800",
};

const STATUS_COLORS = {
  OPEN: "bg-orange-100 text-orange-800",
  RESOLVED: "bg-green-100 text-green-800",
  AUTO_RESOLVED: "bg-teal-100 text-teal-800",
};

export default function IncidentDetailPage({
  params,
}: {
  params: { incidentId: string };
}) {
  const router = useRouter();
  const [incident, setIncident] = useState<PipelineIncident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<
    "investigate" | "selfHeal" | "notes" | null
  >(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    context: false,
    knowledge: true,
    recommendations: true,
  });

  useEffect(() => {
    fetchIncident();
  }, [params.incidentId]);

  const fetchIncident = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No admin token found");
      }

      const response = await fetch(
        `http://localhost:3005/admin/incidents/${params.incidentId}`,
        {
          headers: {
            "x-admin-password": token,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch incident: ${response.statusText}`);
      }

      const data = await response.json();
      setIncident(data.incident);
    } catch (err) {
      console.error("Error fetching incident:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleInvestigate = async () => {
    if (!incident) return;

    try {
      setActionLoading(true);
      setActionResult(null);

      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No admin token found");
      }

      const response = await fetch(
        `http://localhost:3005/admin/incidents/${incident.id}/investigate`,
        {
          method: "POST",
          headers: {
            "x-admin-password": token,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Investigation failed: ${response.statusText}`);
      }

      const data = await response.json();
      setActionResult({ type: "investigate", data });
      setIncident(data.incident);
      setActiveAction(null);
    } catch (err) {
      console.error("Error investigating:", err);
      alert(err instanceof Error ? err.message : "Investigation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelfHeal = async () => {
    if (!incident) return;

    if (
      !confirm(
        "⚠️ Self-heal will attempt automated recovery. This may modify ticket data. Continue?",
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setActionResult(null);

      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No admin token found");
      }

      const response = await fetch(
        `http://localhost:3005/admin/incidents/${incident.id}/self-heal`,
        {
          method: "POST",
          headers: {
            "x-admin-password": token,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Self-heal failed: ${response.statusText}`);
      }

      const data = await response.json();
      setActionResult({ type: "selfHeal", data });
      setActiveAction(null);
      await fetchIncident(); // Refresh to see changes
    } catch (err) {
      console.error("Error self-healing:", err);
      alert(err instanceof Error ? err.message : "Self-heal failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!incident) return;

    try {
      setActionLoading(true);

      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No admin token found");
      }

      const response = await fetch(
        `http://localhost:3005/admin/incidents/${incident.id}`,
        {
          method: "PATCH",
          headers: {
            "x-admin-password": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }

      await fetchIncident();
    } catch (err) {
      console.error("Error updating status:", err);
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNotes = async () => {
    if (!incident || !notes.trim()) return;

    try {
      setActionLoading(true);

      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No admin token found");
      }

      const response = await fetch(
        `http://localhost:3005/admin/incidents/${incident.id}`,
        {
          method: "PATCH",
          headers: {
            "x-admin-password": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes: notes.trim() }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to add notes: ${response.statusText}`);
      }

      setNotes("");
      setActiveAction(null);
      await fetchIncident();
    } catch (err) {
      console.error("Error adding notes:", err);
      alert(err instanceof Error ? err.message : "Failed to add notes");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <AdminPasswordGate>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </AdminPasswordGate>
    );
  }

  if (error || !incident) {
    return (
      <AdminPasswordGate>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
              <p className="text-gray-700">{error || "Incident not found"}</p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </AdminPasswordGate>
    );
  }

  return (
    <AdminPasswordGate>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <span className="mr-2">←</span> Back to Incidents
            </button>
            <div className="text-sm text-gray-500">
              ID: {incident.id.substring(0, 12)}...
            </div>
          </div>

          {/* Action Result Banner */}
          {actionResult && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    {actionResult.type === "investigate"
                      ? "🔍 Investigation Complete"
                      : "🔧 Self-Heal Complete"}
                  </h3>
                  {actionResult.type === "investigate" && (
                    <p className="text-sm text-blue-800">
                      Diagnostics updated. Check the Context section for new
                      findings.
                    </p>
                  )}
                  {actionResult.type === "selfHeal" && (
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">
                        {actionResult.data.success ? "✅ Success" : "❌ Failed"}
                      </p>
                      <p className="mb-2">{actionResult.data.message}</p>
                      {actionResult.data.details &&
                        actionResult.data.details.length > 0 && (
                          <ul className="list-disc list-inside space-y-1">
                            {actionResult.data.details.map(
                              (detail: string, idx: number) => (
                                <li key={idx}>{detail}</li>
                              ),
                            )}
                          </ul>
                        )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setActionResult(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Main Incident Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded ${
                        SEVERITY_COLORS[
                          incident.severity as keyof typeof SEVERITY_COLORS
                        ]
                      }`}
                    >
                      {incident.severity}
                    </span>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded ${
                        STATUS_COLORS[
                          incident.status as keyof typeof STATUS_COLORS
                        ]
                      }`}
                    >
                      {incident.status}
                    </span>
                    <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded">
                      {incident.stage}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {incident.errorMessage}
                  </h1>
                  {incident.errorCode && (
                    <p className="text-sm text-gray-600">
                      Error Code: {incident.errorCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>{" "}
                  <span className="font-medium">
                    {new Date(incident.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Updated:</span>{" "}
                  <span className="font-medium">
                    {new Date(incident.updatedAt).toLocaleString()}
                  </span>
                </div>
                {incident.resolvedAt && (
                  <div>
                    <span className="text-gray-500">Resolved:</span>{" "}
                    <span className="font-medium">
                      {new Date(incident.resolvedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {incident.ticket && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Related Ticket
                  </h3>
                  <div className="text-sm">
                    <p>
                      <span className="text-gray-600">Name:</span>{" "}
                      <span className="font-medium">
                        {incident.ticket.displayName || "Unnamed"}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600">Contact Type:</span>{" "}
                      <span className="font-medium">
                        {incident.ticket.contactType}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600">Status:</span>{" "}
                      <span className="font-medium">
                        {incident.ticket.status}
                      </span>
                    </p>
                    <p className="mt-2">
                      <a
                        href={`/admin/tickets/${incident.ticketId}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View Ticket →
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-wrap gap-3">
                {incident.status === "OPEN" && (
                  <>
                    <button
                      onClick={handleInvestigate}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? "Investigating..." : "🔍 Investigate"}
                    </button>
                    <button
                      onClick={handleSelfHeal}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? "Healing..." : "🔧 Self-Heal"}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus("RESOLVED")}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✓ Mark Resolved
                    </button>
                  </>
                )}
                {incident.status !== "OPEN" && (
                  <button
                    onClick={() => handleUpdateStatus("OPEN")}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reopen
                  </button>
                )}
                <button
                  onClick={() => setActiveAction("notes")}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  📝 Add Notes
                </button>
              </div>

              {/* Notes Input */}
              {activeAction === "notes" && (
                <div className="mt-4 p-4 bg-white rounded-md border border-gray-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter your notes here..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={handleAddNotes}
                      disabled={actionLoading || !notes.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save Notes
                    </button>
                    <button
                      onClick={() => {
                        setActiveAction(null);
                        setNotes("");
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Knowledge Matches Section */}
          <div className="bg-white rounded-lg shadow mb-6">
            <button
              onClick={() => toggleSection("knowledge")}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                📚 Knowledge Vault Matches ({incident.knowledgeBindings.length})
              </h2>
              <span className="text-gray-400">
                {expandedSections.knowledge ? "▼" : "▶"}
              </span>
            </button>

            {expandedSections.knowledge && (
              <div className="px-6 pb-6">
                {incident.knowledgeBindings.length === 0 ? (
                  <p className="text-gray-500 italic">
                    No knowledge matches found for this incident.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {incident.knowledgeBindings.map((binding) => (
                      <div
                        key={binding.id}
                        className="border border-gray-200 rounded-md p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {binding.chunk.source.title}
                          </h3>
                          {binding.score !== null && (
                            <span className="text-sm text-gray-600">
                              Score: {(binding.score * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>

                        {binding.reason && (
                          <p className="text-sm text-blue-600 mb-2 italic">
                            {binding.reason}
                          </p>
                        )}

                        <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">
                          {binding.chunk.text}
                        </p>

                        {binding.chunk.metadata.tags &&
                          binding.chunk.metadata.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {binding.chunk.metadata.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                        {binding.chunk.metadata.actions &&
                          binding.chunk.metadata.actions.length > 0 && (
                            <div className="mt-3 bg-gray-50 rounded p-3">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                Suggested Actions:
                              </h4>
                              <ul className="space-y-1">
                                {binding.chunk.metadata.actions.map(
                                  (action, idx) => (
                                    <li
                                      key={idx}
                                      className="text-sm text-gray-700"
                                    >
                                      <span className="font-medium">
                                        {action.type}:
                                      </span>{" "}
                                      {action.description}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}

                        <a
                          href={`/admin/knowledge/${binding.chunk.source.id}`}
                          className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          View Source →
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recommendations Section */}
          {incident.recommendationsJson && (
            <div className="bg-white rounded-lg shadow mb-6">
              <button
                onClick={() => toggleSection("recommendations")}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  💡 Recommendations
                </h2>
                <span className="text-gray-400">
                  {expandedSections.recommendations ? "▼" : "▶"}
                </span>
              </button>

              {expandedSections.recommendations && (
                <div className="px-6 pb-6">
                  <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(incident.recommendationsJson, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Context Section */}
          <div className="bg-white rounded-lg shadow">
            <button
              onClick={() => toggleSection("context")}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                🔍 Context & Diagnostics
              </h2>
              <span className="text-gray-400">
                {expandedSections.context ? "▼" : "▶"}
              </span>
            </button>

            {expandedSections.context && (
              <div className="px-6 pb-6">
                <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto max-h-96 overflow-y-auto">
                  {JSON.stringify(incident.contextJson, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminPasswordGate>
  );
}
