import React, { useState, useEffect } from "react";
import {
  Cloud,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Download,
} from "lucide-react";

interface TunnelPreflightResult {
  timestamp: string;
  cloudflared: {
    installed: boolean;
    version?: string;
    path?: string;
    error?: string;
  };
  versionCheck: {
    current?: string;
    recommendedMin: string;
    isOutdated: boolean;
    upgradeCommand?: string;
  };
  systemCheck: {
    os: string;
    arch: string;
    node: string;
  };
  warnings: string[];
  recommendations: string[];
}

interface TunnelPreflightCardProps {
  token: string;
}

export default function TunnelPreflightCard({
  token,
}: TunnelPreflightCardProps) {
  const [result, setResult] = useState<TunnelPreflightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (token) {
      loadPreflightData();
    }
  }, [token]);

  const loadPreflightData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/setup/tunnel/cloudflare/preflight`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setResult(await response.json());
      } else {
        console.error(
          "Failed to load tunnel preflight data:",
          response.statusText,
        );
      }
    } catch (error) {
      console.error("Error loading tunnel preflight data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!result) return "gray";

    if (!result.cloudflared.installed) return "red";
    if (result.versionCheck.isOutdated || result.warnings.length > 0)
      return "yellow";
    return "green";
  };

  const getStatusMessage = () => {
    if (!result) return "Loading...";

    if (!result.cloudflared.installed) return "Cloudflared not installed";
    if (result.versionCheck.isOutdated)
      return `Version ${result.versionCheck.current} is outdated`;
    if (result.warnings.length > 0)
      return `${result.warnings.length} warnings found`;
    return "Cloudflared ready";
  };

  const statusColor = getStatusColor();
  const statusMessage = getStatusMessage();

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                statusColor === "green"
                  ? "bg-green-100 text-green-600"
                  : statusColor === "yellow"
                    ? "bg-yellow-100 text-yellow-600"
                    : statusColor === "red"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
              }`}
            >
              <Cloud size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Cloudflare Tunnel Status
              </h3>
              <p className="text-sm text-gray-500">{statusMessage}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                loadPreflightData();
              }}
              disabled={loading}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={14} />
              ) : (
                <RefreshCw size={14} />
              )}
              {loading ? "Checking..." : "Check"}
            </button>
            <span className="text-gray-400 text-sm">
              {expanded ? "▼" : "▶"}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="space-y-6">
            {/* Installation Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Installation Status
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {result?.cloudflared.installed ? (
                      <CheckCircle className="text-green-600" size={16} />
                    ) : (
                      <XCircle className="text-red-600" size={16} />
                    )}
                    <span className="text-sm">
                      {result?.cloudflared.installed
                        ? "Installed"
                        : "Not installed"}
                    </span>
                  </div>

                  {result?.cloudflared.version && (
                    <div className="text-sm text-gray-600">
                      Current version:{" "}
                      <span className="font-mono">
                        {result.cloudflared.version}
                      </span>
                    </div>
                  )}

                  {result?.cloudflared.path && (
                    <div className="text-sm text-gray-600">
                      Path:{" "}
                      <span className="font-mono text-xs">
                        {result.cloudflared.path}
                      </span>
                    </div>
                  )}

                  {result?.cloudflared.error && (
                    <div className="text-sm text-red-600">
                      {result.cloudflared.error}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Version Status
                </h4>
                <div className="space-y-2">
                  <div className="text-sm">
                    Recommended:{" "}
                    <span className="font-mono">
                      {result?.versionCheck.recommendedMin}+
                    </span>
                  </div>

                  {result?.versionCheck.isOutdated && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="text-yellow-600" size={16} />
                      <span className="text-sm text-yellow-800">
                        Version outdated
                      </span>
                    </div>
                  )}

                  {result?.versionCheck.upgradeCommand && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 mb-1">
                        Upgrade command:
                      </div>
                      <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                        {result.versionCheck.upgradeCommand}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* System Information */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                System Information
              </h4>
              <div className="bg-gray-50 p-3 rounded">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">OS:</span>
                    <span className="ml-2 font-mono">
                      {result?.systemCheck.os}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Arch:</span>
                    <span className="ml-2 font-mono">
                      {result?.systemCheck.arch}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Node:</span>
                    <span className="ml-2 font-mono">
                      {result?.systemCheck.node}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {result && result.warnings.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Warnings</h4>
                <div className="space-y-2">
                  {result.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 bg-yellow-50 rounded"
                    >
                      <AlertTriangle
                        className="text-yellow-600 mt-0.5"
                        size={14}
                      />
                      <span className="text-sm text-yellow-800">{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result && result.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Recommendations
                </h4>
                <div className="space-y-2">
                  {result.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 bg-blue-50 rounded"
                    >
                      <div className="text-blue-600 mt-0.5">•</div>
                      <span className="text-sm text-blue-800">
                        {recommendation}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
              {!result?.cloudflared.installed && (
                <button
                  onClick={() =>
                    window.open(
                      "https://github.com/cloudflare/cloudflared/releases",
                      "_blank",
                    )
                  }
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                >
                  <Download size={14} />
                  Download Cloudflared
                </button>
              )}

              <button
                onClick={() =>
                  window.open(
                    "https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/",
                    "_blank",
                  )
                }
                className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 flex items-center gap-1"
              >
                <ExternalLink size={14} />
                Installation Guide
              </button>

              {result?.versionCheck.isOutdated && (
                <button
                  onClick={() =>
                    window.open(
                      "https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/#windows",
                      "_blank",
                    )
                  }
                  className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200 flex items-center gap-1"
                >
                  <ExternalLink size={14} />
                  Upgrade Guide
                </button>
              )}
            </div>

            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              Last checked:{" "}
              {result
                ? new Date(result.timestamp).toLocaleTimeString()
                : "Never"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
