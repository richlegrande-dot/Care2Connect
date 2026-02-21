"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminPasswordGate } from "@/components/AdminPasswordGate";

interface AuditLog {
  id: string;
  createdAt: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeJson: any;
  afterJson: any;
  diffJson: any;
  reason: string | null;
  relatedEntity?: any;
}

export default function AuditLogDetailPage({
  params,
}: {
  params: { auditId: string };
}) {
  const router = useRouter();
  const [log, setLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLog();
  }, [params.auditId]);

  const fetchLog = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `/api/admin/knowledge/audit/${params.auditId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setLog(data);
      } else if (response.status === 404) {
        alert("Audit log not found");
        router.push("/admin/knowledge/audit");
      }
    } catch (error) {
      console.error("Error fetching audit log:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminPasswordGate>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading audit log...</p>
          </div>
        </div>
      </AdminPasswordGate>
    );
  }

  if (!log) {
    return (
      <AdminPasswordGate>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Audit log not found</p>
            <button
              onClick={() => router.push("/admin/knowledge/audit")}
              className="mt-4 text-blue-600 hover:text-blue-700 underline"
            >
              Back to Audit Logs
            </button>
          </div>
        </div>
      </AdminPasswordGate>
    );
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "text-green-600 bg-green-50 border-green-200";
      case "UPDATE":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "DELETE":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <AdminPasswordGate>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <button
              onClick={() => router.push("/admin/knowledge/audit")}
              className="text-sm text-blue-600 hover:text-blue-700 mb-2 flex items-center"
            >
              ← Back to Audit Logs
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Audit Log Detail
            </h1>
            <p className="mt-1 text-sm text-gray-500">{log.id}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary */}
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  Action
                </div>
                <div
                  className={`inline-block px-3 py-1 rounded-md border font-semibold ${getActionColor(
                    log.action,
                  )}`}
                >
                  {log.action}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  Entity Type
                </div>
                <div className="text-gray-900 font-medium">
                  {log.entityType.replace("_", " ")}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  Actor
                </div>
                <div className="text-gray-900 font-medium">{log.actor}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  Timestamp
                </div>
                <div className="text-gray-900 font-medium">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium text-gray-500 mb-1">
                Entity ID
              </div>
              <div className="text-gray-900 font-mono text-sm">
                {log.entityId}
              </div>
              {log.relatedEntity && (
                <button
                  onClick={() => {
                    if (log.entityType === "KNOWLEDGE_SOURCE") {
                      router.push(`/admin/knowledge/${log.entityId}`);
                    }
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
                >
                  View Entity
                </button>
              )}
            </div>

            {log.reason && (
              <div className="mt-6">
                <div className="text-sm font-medium text-gray-500 mb-1">
                  Reason
                </div>
                <div className="text-gray-900">{log.reason}</div>
              </div>
            )}
          </div>

          {/* Diff (if UPDATE) */}
          {log.action === "UPDATE" && log.diffJson && (
            <div className="bg-white rounded-lg shadow mb-6 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Changes
              </h2>
              <div className="space-y-4">
                {Object.entries(log.diffJson).map(
                  ([field, change]: [string, any]) => (
                    <div
                      key={field}
                      className="border-l-4 border-blue-500 pl-4"
                    >
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        {field}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Before
                          </div>
                          <pre className="bg-red-50 border border-red-200 rounded p-2 text-sm overflow-x-auto">
                            {JSON.stringify(change.before, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            After
                          </div>
                          <pre className="bg-green-50 border border-green-200 rounded p-2 text-sm overflow-x-auto">
                            {JSON.stringify(change.after, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Before State (if not CREATE) */}
          {log.action !== "CREATE" && log.beforeJson && (
            <div className="bg-white rounded-lg shadow mb-6 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Before State
              </h2>
              <pre className="bg-gray-50 border border-gray-200 rounded p-4 text-sm overflow-x-auto">
                {JSON.stringify(log.beforeJson, null, 2)}
              </pre>
            </div>
          )}

          {/* After State (if not DELETE) */}
          {log.action !== "DELETE" && log.afterJson && (
            <div className="bg-white rounded-lg shadow mb-6 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                After State
              </h2>
              <pre className="bg-gray-50 border border-gray-200 rounded p-4 text-sm overflow-x-auto">
                {JSON.stringify(log.afterJson, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </AdminPasswordGate>
  );
}
