"use client";

import { useState, FormEvent } from "react";
import { X } from "lucide-react";

interface SystemAuthModalProps {
  onAuthenticated: (token: string) => void;
  onCancel: () => void;
}

export default function SystemAuthModal({
  onAuthenticated,
  onCancel,
}: SystemAuthModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (locked) {
      setError("Too many failed attempts. Please wait 5 minutes.");
      return;
    }

    if (!password) {
      setError("Password required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Use API URL for consistent endpoint access
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "http://localhost:3001";
      const baseUrl = apiUrl.replace(/\/api$/, ""); // Remove /api suffix if present

      const res = await fetch(`${baseUrl}/admin/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        if (res.status === 503) {
          setError("API unavailable. Server may be starting up.");
        } else if (res.status === 404) {
          setError("API endpoint not found. Check server configuration.");
        } else {
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);

          if (newAttempts >= 5) {
            setLocked(true);
            setError("Too many failed attempts. Locked for 5 minutes.");
            setTimeout(
              () => {
                setLocked(false);
                setAttempts(0);
              },
              5 * 60 * 1000,
            );
          } else {
            setError(`Invalid password (${newAttempts}/5 attempts)`);
          }
        }
        return;
      }

      const data = await res.json();

      if (data.ok && data.token) {
        // Store token in sessionStorage
        sessionStorage.setItem("system-admin-token", data.token);
        sessionStorage.setItem(
          "system-admin-expires",
          String(Date.now() + data.expiresIn * 1000),
        );
        onAuthenticated(data.token);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 5) {
          setLocked(true);
          setError("Too many failed attempts. Locked for 5 minutes.");
          setTimeout(
            () => {
              setLocked(false);
              setAttempts(0);
            },
            5 * 60 * 1000,
          );
        } else {
          setError(`Invalid password (${newAttempts}/5 attempts)`);
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(
        `Connection failed: ${err instanceof Error ? err.message : "Network error"}. Check server connection.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">System Access</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          This area is password-protected. Enter the system password to
          continue.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={locked || loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter password"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={locked || loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {loading ? "Authenticating..." : "Access System"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-md font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
            >
              Cancel
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Session expires after 30 minutes of inactivity
        </p>
      </div>
    </div>
  );
}
