import React, { useState, useEffect } from "react";
import {
  Globe,
  Wifi,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Copy,
  ExternalLink,
} from "lucide-react";

interface DNSCheck {
  resolver: string;
  success: boolean;
  addresses?: string[];
  error?: string;
  timing?: number;
}

interface ConnectivityStatus {
  timestamp: string;
  backendPort: number;
  domain: string | null;
  publicUrl: string | null;
  dnsChecks: DNSCheck[];
  tlsStatus: {
    enabled: boolean;
    success?: boolean;
    error?: string;
    certificateInfo?: any;
  };
  tunnelStatus: {
    lastKnownUrl: string | null;
    responding?: boolean;
    error?: string;
  };
}

interface ConnectivityTestResult {
  timestamp: string;
  tests: {
    local: {
      success: boolean;
      url: string;
      status?: number;
      error?: string;
      timing?: number;
    };
    public: {
      success: boolean;
      url: string | null;
      status?: number;
      error?: string;
      timing?: number;
    };
    webhook: {
      success: boolean;
      url: string | null;
      status?: number;
      error?: string;
      timing?: number;
    };
  };
  recommendations: string[];
}

interface ConnectivityCardProps {
  token: string;
}

export default function ConnectivityCard({ token }: ConnectivityCardProps) {
  const [status, setStatus] = useState<ConnectivityStatus | null>(null);
  const [testResult, setTestResult] = useState<ConnectivityTestResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadConnectivityStatus();
    }
  }, [token]);

  const loadConnectivityStatus = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/setup/connectivity/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setStatus(await response.json());
      } else {
        console.error(
          "Failed to load connectivity status:",
          response.statusText,
        );
      }
    } catch (error) {
      console.error("Error loading connectivity status:", error);
    } finally {
      setLoading(false);
    }
  };

  const runConnectivityTest = async () => {
    if (!token) return;

    setTesting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/setup/connectivity/test`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        setTestResult(await response.json());
        // Refresh status after test
        await loadConnectivityStatus();
      } else {
        console.error("Failed to run connectivity test:", response.statusText);
      }
    } catch (error) {
      console.error("Error running connectivity test:", error);
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const getDNSStatus = () => {
    if (!status?.dnsChecks) return { success: false, message: "No DNS data" };

    const systemResolver = status.dnsChecks.find(
      (check) =>
        !check.resolver.includes("8.8.8.8") &&
        !check.resolver.includes("1.1.1.1"),
    );
    const googleDNS = status.dnsChecks.find((check) =>
      check.resolver.includes("8.8.8.8"),
    );
    const cloudflareDNS = status.dnsChecks.find((check) =>
      check.resolver.includes("1.1.1.1"),
    );

    if (systemResolver?.success) {
      return { success: true, message: "Local DNS resolved" };
    } else if (googleDNS?.success || cloudflareDNS?.success) {
      return {
        success: true,
        message: "Global DNS working (local cache pending)",
      };
    } else {
      return { success: false, message: "DNS resolution failed" };
    }
  };

  const getWebhookUrls = () => {
    const urls = [];
    if (status?.publicUrl) {
      urls.push({
        label: "Production Webhook URL",
        url: `${status.publicUrl}/api/payments/stripe-webhook`,
        type: "production" as const,
      });
    }
    if (status?.tunnelStatus.lastKnownUrl) {
      urls.push({
        label: "Temporary Tunnel URL",
        url: `${status.tunnelStatus.lastKnownUrl}/api/payments/stripe-webhook`,
        type: "temporary" as const,
      });
    }
    return urls;
  };

  const dnsStatus = getDNSStatus();
  const webhookUrls = getWebhookUrls();

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
                dnsStatus.success && status?.tlsStatus.success !== false
                  ? "bg-green-100 text-green-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              <Globe size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Connectivity
              </h3>
              <p className="text-sm text-gray-500">{dnsStatus.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                runConnectivityTest();
              }}
              disabled={testing || loading}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {testing ? (
                <RefreshCw className="animate-spin" size={14} />
              ) : (
                <Wifi size={14} />
              )}
              {testing ? "Testing..." : "Test"}
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
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Domain Configuration
                </h4>
                <div className="space-y-1 text-sm">
                  <div>
                    Domain:{" "}
                    <span className="font-mono">
                      {status?.domain || "Not configured"}
                    </span>
                  </div>
                  <div>
                    Backend Port:{" "}
                    <span className="font-mono">{status?.backendPort}</span>
                  </div>
                  <div>
                    Public URL:{" "}
                    <span className="font-mono">
                      {status?.publicUrl || "Not set"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  SSL/TLS Status
                </h4>
                <div className="flex items-center gap-2">
                  {status?.tlsStatus.enabled ? (
                    status.tlsStatus.success ? (
                      <>
                        <CheckCircle className="text-green-600" size={16} />{" "}
                        <span className="text-sm">Valid certificate</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-red-600" size={16} />{" "}
                        <span className="text-sm">Certificate error</span>
                      </>
                    )
                  ) : (
                    <>
                      <AlertTriangle className="text-yellow-600" size={16} />{" "}
                      <span className="text-sm">No HTTPS configured</span>
                    </>
                  )}
                </div>
                {status?.tlsStatus.error && (
                  <div className="text-xs text-red-600 mt-1">
                    {status.tlsStatus.error}
                  </div>
                )}
              </div>
            </div>

            {/* DNS Checks */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                DNS Resolution Status
              </h4>
              <div className="space-y-2">
                {status?.dnsChecks.map((check, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {check.success ? (
                        <CheckCircle className="text-green-600" size={14} />
                      ) : (
                        <XCircle className="text-red-600" size={14} />
                      )}
                      <span>{check.resolver}</span>
                    </div>
                    <div className="text-gray-600">
                      {check.success ? (
                        <span>
                          {check.addresses?.join(", ")} ({check.timing}ms)
                        </span>
                      ) : (
                        <span className="text-red-600">{check.error}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Webhook URLs */}
            {webhookUrls.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Stripe Webhook URLs
                </h4>
                <div className="space-y-2">
                  {webhookUrls.map((webhook, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {webhook.label}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              copyToClipboard(webhook.url, webhook.label)
                            }
                            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center gap-1"
                          >
                            <Copy size={12} />
                            {copied === webhook.label ? "Copied!" : "Copy"}
                          </button>
                          <button
                            onClick={() => window.open(webhook.url, "_blank")}
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded flex items-center gap-1"
                          >
                            <ExternalLink size={12} />
                            Test
                          </button>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-gray-600">
                        {webhook.url}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test Results */}
            {testResult && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Latest Test Results
                </h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div
                      className={`p-2 rounded text-sm ${
                        testResult.tests.local.success
                          ? "bg-green-50 text-green-800"
                          : "bg-red-50 text-red-800"
                      }`}
                    >
                      <div className="flex items-center gap-1 font-medium">
                        {testResult.tests.local.success ? (
                          <CheckCircle size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}
                        Local ({testResult.tests.local.status})
                      </div>
                      <div className="text-xs mt-1">
                        {testResult.tests.local.timing}ms
                      </div>
                    </div>

                    <div
                      className={`p-2 rounded text-sm ${
                        testResult.tests.public.success
                          ? "bg-green-50 text-green-800"
                          : "bg-red-50 text-red-800"
                      }`}
                    >
                      <div className="flex items-center gap-1 font-medium">
                        {testResult.tests.public.success ? (
                          <CheckCircle size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}
                        Public ({testResult.tests.public.status || "N/A"})
                      </div>
                      <div className="text-xs mt-1">
                        {testResult.tests.public.timing || 0}ms
                      </div>
                    </div>

                    <div
                      className={`p-2 rounded text-sm ${
                        testResult.tests.webhook.success
                          ? "bg-green-50 text-green-800"
                          : "bg-red-50 text-red-800"
                      }`}
                    >
                      <div className="flex items-center gap-1 font-medium">
                        {testResult.tests.webhook.success ? (
                          <CheckCircle size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}
                        Webhook ({testResult.tests.webhook.status || "N/A"})
                      </div>
                      <div className="text-xs mt-1">
                        {testResult.tests.webhook.timing || 0}ms
                      </div>
                    </div>
                  </div>

                  {testResult.recommendations.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <h5 className="text-sm font-medium text-blue-900 mb-1">
                        Recommendations
                      </h5>
                      <ul className="text-sm text-blue-800 space-y-1">
                        {testResult.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Refresh Button */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Last updated:{" "}
                {status
                  ? new Date(status.timestamp).toLocaleTimeString()
                  : "Never"}
              </span>
              <button
                onClick={loadConnectivityStatus}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <RefreshCw
                  className={loading ? "animate-spin" : ""}
                  size={14}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
