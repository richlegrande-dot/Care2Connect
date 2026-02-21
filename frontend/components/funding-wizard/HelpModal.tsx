"use client";

import React, { useState } from "react";
import { X, Send, CheckCircle, AlertCircle } from "lucide-react";

interface HelpModalProps {
  context: string;
  onClose: () => void;
  clientId: string;
}

const ISSUE_TYPES = [
  { value: "gofundme_blocked", label: "GoFundMe Account Issues" },
  { value: "qr_problem", label: "QR Code Not Working" },
  { value: "transcription_problem", label: "Transcription Issues" },
  { value: "missing_fields", label: "Missing or Incorrect Information" },
  { value: "download_problem", label: "Download or Print Issues" },
  { value: "other", label: "Other Issue" },
];

const CONTEXT_TITLES: Record<string, string> = {
  confirm_details: "Help with Confirming Details",
  qr_code: "Help with QR Code Generation",
  gofundme_draft: "Help with GoFundMe Draft",
  gofundme_wizard: "Help with GoFundMe Setup",
  general: "Get Help",
};

export default function HelpModal({
  context,
  onClose,
  clientId,
}: HelpModalProps) {
  const [formData, setFormData] = useState({
    issueType: context === "gofundme_wizard" ? "gofundme_blocked" : "other",
    description: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error" | "fallback"
  >("idle");
  // mailto fallback removed; support tickets are persisted server-side

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          context,
          clientId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Success: ticket persisted to server support log
        setSubmitStatus("success");
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("[HelpModal] Error submitting ticket:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (submitStatus === "success") {
      return (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Message Received!
          </h3>
          <p className="text-gray-600 mb-6">
            Thank you for reaching out. We've received your support request and
            will respond as soon as possible.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            You should receive a confirmation email at{" "}
            <strong>workflown8n@gmail.com</strong>
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Close
          </button>
        </div>
      );
    }

    if (submitStatus === "fallback") {
      return null; // mailto fallback removed
    }

    if (submitStatus === "error") {
      return (
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Submission Error
          </h3>
          <p className="text-gray-600 mb-6">
            We encountered an error submitting your support request. Please try
            again or visit the admin health page to view support logs.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              Visit the admin health page to view support logs.
            </p>
            <button
              onClick={() => setSubmitStatus("idle")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // Default form
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What do you need help with? <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.issueType}
            onChange={(e) => handleChange("issueType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {ISSUE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Please describe your issue <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={6}
            placeholder="Tell us what's happening and we'll do our best to help..."
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Be as specific as possible so we can assist you quickly
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email (Optional)
          </label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => handleChange("contactEmail", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your.email@example.com"
          />
          <p className="mt-1 text-xs text-gray-500">
            If you'd like us to respond directly to you
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Phone (Optional)
          </label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => handleChange("contactPhone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Your message will be sent to:</strong> workflown8n@gmail.com
          </p>
          <p className="text-xs text-blue-700 mt-1">
            We typically respond within 24-48 hours
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.description.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {CONTEXT_TITLES[context] || "Get Help"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="px-6 py-6">{renderContent()}</div>
      </div>
    </div>
  );
}
