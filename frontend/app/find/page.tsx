"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  CalendarIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { api, RecordingTicket } from "@/lib/api";

type SearchMode = "id" | "email" | "phone";

export default function FindPage() {
  const [searchMode, setSearchMode] = useState<SearchMode>("id");
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RecordingTicket[]>([]);
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const validateUUID = (value: string): boolean => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError("");
    setSearchResults([]);
    setHasSearched(true);

    try {
      if (!searchValue.trim()) {
        throw new Error("Please enter a search value");
      }

      if (searchMode === "id") {
        // Validate UUID format
        if (!validateUUID(searchValue.trim())) {
          throw new Error(
            "Invalid ticket ID format. Please enter a valid UUID.",
          );
        }

        // Direct ticket lookup
        try {
          const ticket = await api.get<RecordingTicket>(
            `/tickets/${searchValue.trim()}`,
          );
          setSearchResults([ticket]);
        } catch (error: any) {
          if (error.status === 404) {
            throw new Error("No ticket found with this ID");
          }
          throw error;
        }
      } else {
        // Search by contact (email or phone)
        const results = await api.get<RecordingTicket[]>("/profiles/search", {
          contact: searchValue.trim(),
          type: searchMode,
        });
        setSearchResults(results);
      }
    } catch (error: any) {
      setSearchError(error.message || "Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-yellow-100 text-yellow-800 border-yellow-300",
      PUBLISHED: "bg-green-100 text-green-800 border-green-300",
      PENDING: "bg-blue-100 text-blue-800 border-blue-300",
      CLOSED: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <MagnifyingGlassIcon className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              Find a Profile
            </h1>
            <p className="text-xl text-gray-600">
              Search for profiles to view or support
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-indigo-100"
        >
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Mode Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Search By
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "id", label: "Ticket ID", icon: "🎫" },
                  { value: "email", label: "Email", icon: "✉️" },
                  { value: "phone", label: "Phone", icon: "📱" },
                ].map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => {
                      setSearchMode(mode.value as SearchMode);
                      setSearchValue("");
                      setSearchResults([]);
                      setSearchError("");
                      setHasSearched(false);
                    }}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      searchMode === mode.value
                        ? "bg-indigo-600 text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span className="mr-2">{mode.icon}</span>
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div>
              <label
                htmlFor="searchValue"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                {searchMode === "id"
                  ? "Ticket ID"
                  : searchMode === "email"
                    ? "Email Address"
                    : "Phone Number"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="searchValue"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={
                    searchMode === "id"
                      ? "e.g., 123e4567-e89b-12d3-a456-426614174000"
                      : searchMode === "email"
                        ? "e.g., person@example.com"
                        : "e.g., +1234567890"
                  }
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                  required
                />
                <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {searchMode === "id" && (
                <p className="text-xs text-gray-500 mt-1">
                  Ticket ID is a UUID format (e.g.,
                  xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
                </p>
              )}
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={isSearching}
              className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-bold text-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
            >
              {isSearching ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Searching...
                </span>
              ) : (
                "Search"
              )}
            </button>
          </form>
        </motion.div>

        {/* Error Message */}
        {searchError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4"
          >
            <p className="text-red-800 font-semibold">{searchError}</p>
          </motion.div>
        )}

        {/* Search Results */}
        {hasSearched &&
          !isSearching &&
          searchResults.length === 0 &&
          !searchError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-xl shadow-md border-2 border-gray-200"
            >
              <UserCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Results Found
              </h3>
              <p className="text-gray-600 mb-4">
                No profiles match your search criteria
              </p>
              <p className="text-sm text-gray-500">
                Try searching with a different{" "}
                {searchMode === "id" ? "ticket ID" : searchMode}
              </p>
            </motion.div>
          )}

        {/* Results List */}
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {searchResults.length}{" "}
              {searchResults.length === 1 ? "Profile" : "Profiles"} Found
            </h2>

            {searchResults.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <UserCircleIcon className="w-8 h-8 text-indigo-600" />
                      <h3 className="text-xl font-bold text-gray-900">
                        {ticket.displayName || "Anonymous"}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}
                      >
                        {ticket.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Created {formatDate(ticket.createdAt)}</span>
                      </div>
                      <div className="font-mono text-xs text-gray-500">
                        ID: {ticket.id.slice(0, 8)}...
                      </div>
                    </div>

                    <Link
                      href={`/profile/${ticket.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      View Profile
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-blue-200"
        >
          <h3 className="font-bold text-gray-900 mb-4 text-center text-xl">
            Need Help Finding Someone?
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2">
                Search by Ticket ID
              </h4>
              <p className="text-gray-600">
                If you have the exact ticket ID (UUID format), you can search
                directly for that profile
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-gray-900 mb-2">
                Search by Contact
              </h4>
              <p className="text-gray-600">
                Search by email or phone number to find profiles associated with
                that contact information
              </p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/support"
              className="text-indigo-600 hover:underline font-semibold"
            >
              Still can't find who you're looking for? Contact support
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
