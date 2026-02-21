/**
 * Transcript Editor Component
 * Manual transcript input with edit tracking for feedback loop
 */

"use client";

import React, { useState, useCallback } from "react";

interface TranscriptEditorProps {
  initialTranscript?: string;
  onTranscriptChange: (transcript: string) => void;
  onSave?: (transcript: string) => void;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
}

export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  initialTranscript = "",
  onTranscriptChange,
  onSave,
  placeholder = "Type or paste your story here...",
  minLength = 50,
  maxLength = 5000,
}) => {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newTranscript = e.target.value;
      setTranscript(newTranscript);

      // Update counts
      const words = newTranscript
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0);
      setWordCount(words.length);
      setCharCount(newTranscript.length);

      onTranscriptChange(newTranscript);
    },
    [onTranscriptChange],
  );

  const handleSave = useCallback(() => {
    if (onSave && transcript.length >= minLength) {
      onSave(transcript);
    }
  }, [transcript, minLength, onSave]);

  const handleClear = useCallback(() => {
    setTranscript("");
    setWordCount(0);
    setCharCount(0);
    onTranscriptChange("");
  }, [onTranscriptChange]);

  const isValidLength =
    transcript.length >= minLength && transcript.length <= maxLength;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manual Transcript</h3>
        <div className="text-sm text-gray-600">
          {wordCount} words · {charCount} / {maxLength} characters
        </div>
      </div>

      <textarea
        value={transcript}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        maxLength={maxLength}
      />

      {!isValidLength && transcript.length > 0 && (
        <div className="text-sm text-amber-600">
          {transcript.length < minLength && (
            <p>
              ⚠️ Transcript is too short. Please add at least{" "}
              {minLength - transcript.length} more characters.
            </p>
          )}
          {transcript.length > maxLength && (
            <p>
              ⚠️ Transcript exceeds maximum length. Please reduce by{" "}
              {transcript.length - maxLength} characters.
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {onSave && (
          <button
            onClick={handleSave}
            disabled={!isValidLength}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isValidLength
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Save & Continue
          </button>
        )}
        <button
          onClick={handleClear}
          className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>💡 Tips for better results:</strong>
        </p>
        <ul className="text-sm text-blue-800 list-disc list-inside mt-2 space-y-1">
          <li>Include your name, age, and location</li>
          <li>Describe your situation and why you need help</li>
          <li>State your fundraising goal amount</li>
          <li>Explain how the funds will be used</li>
          <li>Share any relevant background or context</li>
        </ul>
      </div>
    </div>
  );
};

export default TranscriptEditor;
