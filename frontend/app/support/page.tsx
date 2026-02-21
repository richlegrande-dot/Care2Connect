"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LifebuoyIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { api } from "@/lib/api";

interface FormData {
  reporterName: string;
  isGuest: boolean;
  message: string;
  recordingTicketId: string;
  contactValue: string;
  contactType: "EMAIL" | "PHONE" | "";
  pageUrl: string;
}

export default function SupportPage() {
  const [formData, setFormData] = useState<FormData>({
    reporterName: "",
    isGuest: false,
    message: "",
    recordingTicketId: "",
    contactValue: "",
    contactType: "",
    pageUrl: typeof window !== "undefined" ? window.location.href : "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
    ticketId?: string;
  }>({ type: null, message: "" });
  const [dbStatus, setDbStatus] = useState<
    "checking" | "healthy" | "unhealthy"
  >("checking");

  // Check DB health on mount
  React.useEffect(() => {
    api
      .checkDbHealth()
      .then(() => setDbStatus("healthy"))
      .catch(() => setDbStatus("unhealthy"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // Validate
      if (!formData.message.trim()) {
        throw new Error("Please describe your issue");
      }
      if (!formData.isGuest && !formData.reporterName.trim()) {
        throw new Error('Please enter your name or select "I am a guest"');
      }

      const payload = {
        reporterName: formData.isGuest ? "Guest" : formData.reporterName,
        isGuest: formData.isGuest,
        message: formData.message,
        recordingTicketId: formData.recordingTicketId || null,
        contactValue: formData.contactValue || null,
        contactType: formData.contactType || null,
        pageUrl: formData.pageUrl || null,
      };

      const result = await api.post<{ id: string; createdAt: string }>(
        "/support/tickets",
        payload,
      );

      setSubmitStatus({
        type: "success",
        message: "Support ticket submitted successfully!",
        ticketId: result.id,
      });

      // Reset form
      setFormData({
        reporterName: "",
        isGuest: false,
        message: "",
        recordingTicketId: "",
        contactValue: "",
        contactType: "",
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
      });
    } catch (error: any) {
      let errorMessage = "Failed to submit support ticket";

      if (error.status === 503) {
        errorMessage =
          "System unavailable due to database connectivity. Please try again later.";
      } else if (error.status === 400) {
        errorMessage = error.message || "Invalid ticket data";
      } else if (error.status === 404 && formData.recordingTicketId) {
        errorMessage =
          "Recording ticket not found. Please check the ticket ID.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSubmitStatus({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <LifebuoyIcon className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              Get Support
            </h1>
            <p className="text-xl text-gray-600">
              We're here to help. Submit a support ticket and we'll get back to
              you.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* DB Status Warning */}
        {dbStatus === "unhealthy" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3"
          >
            <XCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 mb-1">System Offline</h3>
              <p className="text-sm text-red-800">
                The system is currently unavailable due to database connectivity
                issues. Support ticket submission is temporarily disabled.
              </p>
            </div>
          </motion.div>
        )}

        {/* Success Message */}
        {submitStatus.type === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-green-50 border-2 border-green-300 rounded-lg p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-green-900 text-lg mb-1">
                  {submitStatus.message}
                </h3>
                <p className="text-green-800">
                  Ticket ID:{" "}
                  <span className="font-mono font-semibold">
                    {submitStatus.ticketId}
                  </span>
                </p>
                <p className="text-sm text-green-700 mt-2">
                  We'll review your ticket and get back to you as soon as
                  possible.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSubmitStatus({ type: null, message: "" })}
              className="text-green-700 hover:text-green-900 font-semibold text-sm underline"
            >
              Submit another ticket
            </button>
          </motion.div>
        )}

        {/* Error Message */}
        {submitStatus.type === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3"
          >
            <ExclamationCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 mb-1">Error</h3>
              <p className="text-sm text-red-800">{submitStatus.message}</p>
            </div>
          </motion.div>
        )}

        {/* Support Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 border-2 border-purple-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Guest Toggle */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="isGuest"
                checked={formData.isGuest}
                onChange={(e) =>
                  setFormData({ ...formData, isGuest: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label
                htmlFor="isGuest"
                className="text-sm font-semibold text-gray-900 cursor-pointer"
              >
                I am a guest (anonymous submission)
              </label>
            </div>

            {/* Name Field */}
            {!formData.isGuest && (
              <div>
                <label
                  htmlFor="reporterName"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="reporterName"
                  value={formData.reporterName}
                  onChange={(e) =>
                    setFormData({ ...formData, reporterName: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                  placeholder="Enter your name"
                  required={!formData.isGuest}
                />
              </div>
            )}

            {/* Message Field */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Describe Your Issue <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors resize-none"
                placeholder="Tell us what you need help with..."
                required
              />
            </div>

            {/* Optional: Link to Recording Ticket */}
            <div className="border-t-2 border-gray-100 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Optional: Link to Recording Profile
              </h3>

              <div>
                <label
                  htmlFor="recordingTicketId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Recording Ticket ID
                </label>
                <input
                  type="text"
                  id="recordingTicketId"
                  value={formData.recordingTicketId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recordingTicketId: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                  placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If your issue is related to a recording profile, enter the
                  ticket ID
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || dbStatus === "unhealthy"}
                className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
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
                    Submitting...
                  </span>
                ) : (
                  "Submit Support Ticket"
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-gray-600"
        >
          <p className="mb-4">
            Need to check on a profile or donate?{" "}
            <Link
              href="/find"
              className="text-purple-600 hover:underline font-semibold"
            >
              Find a profile
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            For urgent issues, please contact emergency services (911)
          </p>
        </motion.div>
      </div>
    </div>
  );
}
