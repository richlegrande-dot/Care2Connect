/**
 * Manual Draft Editor Component
 *
 * Fallback UI when automated pipeline fails
 * Route: /story/[recordingId]/manual-draft
 */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface ManualDraftEditorProps {
  ticketId: string;
  failureReason?: string;
  userMessage?: string;
  partialData?: {
    transcript?: string;
    extractedFields?: {
      title?: string;
      story?: string;
      goalAmount?: number;
    };
  };
}

export default function ManualDraftEditor({
  ticketId,
  failureReason,
  userMessage,
  partialData,
}: ManualDraftEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(partialData?.extractedFields?.title || "");
  const [story, setStory] = useState(partialData?.extractedFields?.story || "");
  const [goalAmount, setGoalAmount] = useState(
    partialData?.extractedFields?.goalAmount || 1500,
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    // Reset states
    setError("");
    setSaving(true);
    setSaved(false);

    // Validate
    if (!title.trim()) {
      setError("Campaign title is required");
      setSaving(false);
      return;
    }

    if (!story.trim()) {
      setError("Campaign story is required");
      setSaving(false);
      return;
    }

    if (goalAmount <= 0) {
      setError("Goal amount must be greater than zero");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/donations/manual-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          title: title.trim(),
          story: story.trim(),
          goalAmount,
          currency: "USD",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to save draft");
      }

      setSaved(true);
      console.log("Draft saved successfully:", data.draft);
    } catch (err: any) {
      console.error("Save failed:", err);
      setError(err.message || "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!saved) {
      await handleSave();
    }

    // Navigate to QR generation
    router.push(`/story/${ticketId}/qr-code`);
  };

  return (
    <div className="manual-draft-editor">
      <div className="fallback-notice">
        <div className="notice-icon">⚠️</div>
        <div className="notice-content">
          <h3>Continue Manually</h3>
          <p>
            {userMessage ||
              "We couldn't finish generating this automatically. You can continue manually below."}
          </p>
          {failureReason && (
            <span className="debug-info">Reason: {failureReason}</span>
          )}
        </div>
      </div>

      <div className="editor-form">
        <h2>Your Fundraising Campaign</h2>

        <div className="form-group">
          <label htmlFor="title">
            Campaign Title <span className="required">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Help John Get Back on His Feet"
            maxLength={90}
            className="form-input"
          />
          <span className="char-count">{title.length}/90</span>
        </div>

        <div className="form-group">
          <label htmlFor="goalAmount">
            Goal Amount ($) <span className="required">*</span>
          </label>
          <input
            id="goalAmount"
            type="number"
            value={goalAmount}
            onChange={(e) => setGoalAmount(Number(e.target.value))}
            min="1"
            max="999999"
            className="form-input"
          />
          <span className="help-text">Minimum $1, Maximum $999,999</span>
        </div>

        <div className="form-group">
          <label htmlFor="story">
            Campaign Story <span className="required">*</span>
          </label>
          <textarea
            id="story"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Tell your story. What happened? What do you need help with? How will the funds be used?"
            rows={12}
            className="form-textarea"
          />
          <span className="char-count">{story.length} characters</span>
        </div>

        {partialData?.transcript && (
          <div className="partial-data-notice">
            <details>
              <summary>View Original Recording Transcript</summary>
              <div className="transcript-text">{partialData.transcript}</div>
            </details>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {saved && (
          <div className="success-message">✓ Draft saved successfully!</div>
        )}

        <div className="button-group">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? "Saving..." : saved ? "Update Draft" : "Save Draft"}
          </button>

          <button
            onClick={handleGenerateQR}
            disabled={saving}
            className="btn btn-success"
          >
            Generate QR Code
          </button>
        </div>

        <div className="help-section">
          <h4>Need Help?</h4>
          <ul>
            <li>Be specific about your situation and needs</li>
            <li>Explain how the funds will be used</li>
            <li>Include any urgent deadlines or time-sensitive needs</li>
            <li>You can always edit this later</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .manual-draft-editor {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .fallback-notice {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .notice-icon {
          font-size: 2rem;
        }

        .notice-content h3 {
          margin: 0 0 0.5rem 0;
          color: #856404;
        }

        .notice-content p {
          margin: 0;
          color: #856404;
        }

        .debug-info {
          font-size: 0.85rem;
          color: #6c757d;
          display: block;
          margin-top: 0.5rem;
        }

        .editor-form h2 {
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .required {
          color: #dc3545;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #dee2e6;
          border-radius: 4px;
          font-size: 1rem;
          font-family: inherit;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #0d6efd;
        }

        .char-count,
        .help-text {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.875rem;
          color: #6c757d;
        }

        .partial-data-notice {
          margin: 1.5rem 0;
          padding: 1rem;
          background: #e7f3ff;
          border-radius: 4px;
        }

        .transcript-text {
          margin-top: 0.5rem;
          padding: 1rem;
          background: white;
          border-radius: 4px;
          max-height: 200px;
          overflow-y: auto;
          font-size: 0.9rem;
        }

        .error-message {
          padding: 1rem;
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .success-message {
          padding: 1rem;
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          margin: 2rem 0;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #0d6efd;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0b5ed7;
        }

        .btn-success {
          background: #198754;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background: #157347;
        }

        .help-section {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .help-section h4 {
          margin-top: 0;
        }

        .help-section ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .help-section li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}
