"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import FollowUpQuestionModal from "../../../components/FollowUpQuestionModal";

interface ExtractionData {
  draft: any;
  transcription: any;
  success: boolean;
  confidence: number;
  errors: string[];
  warnings: string[];
}

export default function ExtractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [extractionData, setExtractionData] = useState<ExtractionData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");
  const [useManualMode, setUseManualMode] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Check if we should show manual mode (no OpenAI key)
  useEffect(() => {
    checkTranscriptionStatus();
  }, []);

  const checkTranscriptionStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transcription/status`,
      );
      const data = await response.json();

      if (data.success && data.data.fallbackMode) {
        setUseManualMode(true);
      }
    } catch (error) {
      console.error("Status check error:", error);
      setUseManualMode(true); // Default to manual mode if check fails
    }
  };

  const handleManualTranscript = async () => {
    if (!transcriptText.trim()) {
      toast.error("Please enter your story transcript");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transcription/text`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transcript: transcriptText.trim(),
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setExtractionData(data.data.extraction);

        // Check if we need follow-up questions
        if (data.data.extraction.draft?.followUpQuestions?.length > 0) {
          await startFollowUpSession(data.data.extraction.draft);
        } else {
          // No follow-up needed, proceed directly
          toast.success("Story processed successfully!");
        }
      } else {
        toast.error(data.error || "Failed to process transcript");
      }
    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Failed to process your story");
    } finally {
      setIsLoading(false);
    }
  };

  const startFollowUpSession = async (draft: any) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transcription/followup/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            draftId: `draft_${Date.now()}`,
            userId: "anonymous_user",
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setSessionId(data.data.sessionId);
        await getNextQuestion(data.data.sessionId, draft);
      }
    } catch (error) {
      console.error("Follow-up session error:", error);
      toast.error("Error starting follow-up questions");
    }
  };

  const getNextQuestion = async (sessionId: string, draft: any) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transcription/followup/${sessionId}/question?draft=${encodeURIComponent(JSON.stringify(draft))}`,
      );

      const data = await response.json();

      if (data.success) {
        if (data.data.completed) {
          setShowFollowUp(false);
          toast.success("All questions completed!");
        } else {
          setCurrentQuestion(data.data.question);
          setShowFollowUp(true);
        }
      }
    } catch (error) {
      console.error("Get question error:", error);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!sessionId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transcription/followup/${sessionId}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answer }),
        },
      );

      if (response.ok && extractionData) {
        // Get next question or complete
        await getNextQuestion(sessionId, extractionData.draft);
      }
    } catch (error) {
      console.error("Submit answer error:", error);
      toast.error("Failed to submit answer");
    }
  };

  const handleSkip = async () => {
    if (!sessionId || !extractionData) return;

    try {
      // Get next question
      await getNextQuestion(sessionId, extractionData.draft);
    } catch (error) {
      console.error("Skip error:", error);
    }
  };

  const proceedToStepper = () => {
    if (extractionData?.draft) {
      // Store the draft in localStorage for the stepper
      localStorage.setItem(
        "gfm_extracted_draft",
        JSON.stringify(extractionData.draft),
      );
      router.push("/gfm/review");
    }
  };

  const renderFieldPreview = (field: any, label: string) => {
    if (!field?.value) return null;

    const confidence = field.confidence || 0;
    const confidenceClass =
      confidence > 0.7
        ? "text-green-600"
        : confidence > 0.4
          ? "text-yellow-600"
          : "text-red-600";
    const confidenceIcon =
      confidence > 0.7 ? "✅" : confidence > 0.4 ? "⚠️" : "❓";

    return (
      <div className="border rounded-lg p-3 mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-700">{label}</span>
          <span className={`text-sm ${confidenceClass}`}>
            {confidenceIcon} {Math.round(confidence * 100)}%
          </span>
        </div>
        <div className="text-gray-900">
          {typeof field.value === "object"
            ? JSON.stringify(field.value)
            : String(field.value)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Story Analysis & GoFundMe Setup
          </h1>
          <p className="text-lg text-gray-600">
            AI will analyze your story and auto-fill GoFundMe campaign fields
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Story</h2>

            {useManualMode ? (
              <div>
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Manual Mode:</strong> Please paste your story
                    transcript below. Our AI will analyze it and help create
                    your GoFundMe campaign.
                  </p>
                </div>

                <textarea
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  className="w-full h-40 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Please type or paste your story here... Tell us about your situation, what help you need, and what you hope to achieve."
                />

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {transcriptText.length} characters
                  </span>

                  <button
                    onClick={handleManualTranscript}
                    disabled={!transcriptText.trim() || isLoading}
                    className="btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Processing..." : "Analyze Story"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Audio transcription will be processed here once uploaded from
                  the recording page.
                </p>
                <Link href="/tell-story" className="btn-primary">
                  Go to Recording
                </Link>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Extracted Information
            </h2>

            {extractionData ? (
              <div>
                {extractionData.warnings?.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-1">
                      Warnings:
                    </h4>
                    <ul className="text-sm text-yellow-700">
                      {extractionData.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  {renderFieldPreview(extractionData.draft.name, "Name")}
                  {renderFieldPreview(
                    extractionData.draft.title,
                    "Campaign Title",
                  )}
                  {renderFieldPreview(
                    extractionData.draft.category,
                    "Category",
                  )}
                  {renderFieldPreview(
                    extractionData.draft.goalAmount,
                    "Goal Amount",
                  )}
                  {renderFieldPreview(
                    extractionData.draft.location,
                    "Location",
                  )}
                  {renderFieldPreview(
                    extractionData.draft.shortSummary,
                    "Summary",
                  )}
                </div>

                {extractionData.draft.missingFields?.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-1">
                      Missing Information:
                    </h4>
                    <p className="text-sm text-red-700">
                      {extractionData.draft.missingFields.join(", ")} - We'll
                      ask follow-up questions for these.
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={proceedToStepper}
                    className="w-full btn-primary"
                  >
                    Continue to GoFundMe Stepper →
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Process your story to see extracted information here
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link href="/tell-story" className="btn-secondary">
            ← Back to Recording
          </Link>

          <Link href="/" className="btn-secondary">
            Cancel & Go Home
          </Link>
        </div>

        {/* Follow-up Modal */}
        {showFollowUp && currentQuestion && (
          <FollowUpQuestionModal
            question={currentQuestion}
            onAnswer={handleAnswer}
            onSkip={handleSkip}
            onClose={() => setShowFollowUp(false)}
          />
        )}
      </div>
    </div>
  );
}
