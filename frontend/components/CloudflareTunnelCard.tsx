"use client";

import { useEffect, useState } from "react";
import { Copy, Cloud, Link as LinkIcon, Server } from "lucide-react";

interface Props {
  token: string | null;
}

const LOCALSTORAGE_KEY = "careconnect.publicTunnelUrl";

export default function CloudflareTunnelCard({ token }: Props) {
  const [info, setInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string>("");
  const [valid, setValid] = useState(false);
  const [preflight, setPreflight] = useState<any | null>(null);

  useEffect(() => {
    const fromStorage = localStorage.getItem(LOCALSTORAGE_KEY);
    if (fromStorage) setPublicUrl(fromStorage);
  }, []);

  useEffect(() => {
    setValid(isValidTunnelUrl(publicUrl));
    if (publicUrl) localStorage.setItem(LOCALSTORAGE_KEY, publicUrl);
    else localStorage.removeItem(LOCALSTORAGE_KEY);
  }, [publicUrl]);

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/setup/tunnel/cloudflare`,
          { headers },
        );
        if (!res.ok) throw new Error("Failed to load tunnel guidance");
        setInfo(await res.json());
      } catch (err: any) {
        setError(String(err.message || err));
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [token]);

  function isValidTunnelUrl(u: string) {
    if (!u) return false;
    if (!u.startsWith("https://")) return false;
    try {
      new URL(u);
      return true;
    } catch {
      return false;
    }
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const handlePreflight = async () => {
    if (!token)
      return setPreflight({ allowed: false, reason: "Not authenticated" });
    setPreflight({ status: "pending" });
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/setup/tunnel/cloudflare/preflight`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setPreflight(data);
    } catch (err: any) {
      setPreflight({ allowed: false, reason: String(err) });
    }
  };

  const webhookPath = "/api/payments/stripe-webhook";

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Cloud className="text-blue-600" />
          <h3 className="text-lg font-semibold">
            Public Webhook URL (Cloudflare Tunnel)
          </h3>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-600">Loading tunnel guidance...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        info && (
          <div className="space-y-3">
            <div className="text-sm text-gray-700">
              Backend port:{" "}
              <span className="font-medium">{info.backendPort}</span>
            </div>
            <div className="text-sm text-gray-700">
              Local target:{" "}
              <span className="font-medium">{info.localTarget}</span>
            </div>
            <div className="text-sm text-gray-700">
              Webhook path: <span className="font-medium">{webhookPath}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copy(info.installUrl)}
                  className="px-3 py-1 bg-gray-100 rounded text-sm"
                >
                  Copy cloudflared install URL
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copy(info.quickTunnelCommand)}
                  className="px-3 py-1 bg-gray-100 rounded text-sm"
                >
                  Copy quick tunnel command
                </button>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-sm text-gray-700">Public tunnel URL</label>
              <div className="flex gap-2 mt-1">
                <input
                  aria-label="public-tunnel-url"
                  value={publicUrl}
                  onChange={(e) => setPublicUrl(e.target.value)}
                  placeholder="https://xxxx.trycloudflare.com"
                  className="flex-1 border rounded px-3 py-2"
                />
                <button
                  onClick={() => {
                    setPublicUrl("");
                    localStorage.removeItem(LOCALSTORAGE_KEY);
                  }}
                  className="px-3 py-2 bg-gray-100 rounded"
                >
                  Clear
                </button>
              </div>
              {!valid && publicUrl && (
                <div className="text-xs text-red-600 mt-1">
                  Invalid public tunnel URL — must start with https:// and be a
                  valid URL
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-700">
                Computed Stripe webhook endpoint
              </label>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 bg-gray-50 border rounded px-3 py-2 text-sm break-words">
                  {valid
                    ? `${publicUrl.replace(/\/$/, "")}${webhookPath}`
                    : "Paste a valid public tunnel URL to compute the Stripe endpoint."}
                </div>
                <button
                  onClick={() =>
                    valid &&
                    copy(`${publicUrl.replace(/\/$/, "")}${webhookPath}`)
                  }
                  className="px-3 py-2 bg-gray-100 rounded"
                >
                  Copy
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Paste this into Stripe Dashboard / Workbench as your webhook
                endpoint.
              </div>
            </div>

            <div className="pt-2">
              <div className="text-sm text-gray-700">
                Stripe CLI fallback command
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 bg-gray-50 border rounded px-3 py-2 text-sm">{`stripe listen --forward-to ${info.localTarget}${webhookPath}`}</div>
                <button
                  onClick={() =>
                    copy(
                      `stripe listen --forward-to ${info.localTarget}${webhookPath}`,
                    )
                  }
                  className="px-3 py-2 bg-gray-100 rounded"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="pt-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">Quick check</div>
                <button
                  onClick={handlePreflight}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Check cloudflared installation
                </button>
              </div>

              {preflight && (
                <div className="mt-2 text-sm">
                  {preflight.allowed === false && (
                    <div className="text-gray-600">
                      ALLOW_SYSTEM_COMMANDS is disabled. Install manually using
                      the link above.
                    </div>
                  )}
                  {preflight.cloudflaredInstalled === true && (
                    <div className="text-green-600">
                      cloudflared installed: {preflight.version}
                    </div>
                  )}
                  {preflight.cloudflaredInstalled === false && (
                    <div className="text-red-600">
                      cloudflared not found: {preflight.reason || "unknown"}
                    </div>
                  )}
                  {preflight.status === "pending" && (
                    <div className="text-gray-600">Checking...</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
