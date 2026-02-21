"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AdminPasswordGateProps {
  children: React.ReactNode;
}

/**
 * Password gate component that reuses the same admin password as health page
 * Stores admin token in localStorage after successful authentication
 */
export function AdminPasswordGate({ children }: AdminPasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    const token = localStorage.getItem("adminToken");
    if (token) {
      // Verify token is still valid by making a test request
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch("/api/admin/db/connection-info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        // Token invalid, clear it
        localStorage.removeItem("adminToken");
      }
    } catch (err) {
      // Network error or server down - assume token is valid
      // (don't lock user out due to temporary connectivity issues)
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Store token and verify by making a test request
    try {
      const response = await fetch("/api/admin/db/connection-info", {
        headers: {
          Authorization: `Bearer ${password}`,
        },
      });

      if (response.ok) {
        localStorage.setItem("adminToken", password);
        setIsAuthenticated(true);
        setPassword(""); // Clear password from memory
      } else {
        setError("Invalid admin password");
      }
    } catch (err) {
      setError("Authentication failed - server may be unavailable");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    setPassword("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Admin Access Required
              </h2>
              <p className="text-gray-600">
                Enter admin password to access Knowledge Vault
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Admin Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Unlock
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>This is the same password used for the System Health page</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - render children with logout button
  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Admin authenticated</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  );
}
