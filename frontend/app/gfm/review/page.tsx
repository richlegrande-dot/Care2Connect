"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  PencilIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

interface FieldData {
  value: any;
  confidence: number;
  source?: "extracted" | "manual" | "followup";
}

interface GoFundMeDraft {
  name: FieldData;
  dateOfBirth: FieldData;
  location: FieldData;
  beneficiary: FieldData;
  category: FieldData;
  goalAmount: FieldData;
  title: FieldData;
  storyBody: FieldData;
  shortSummary: FieldData;
  contact: FieldData;
  consentToPublish: boolean;
  transcript?: string;
  missingFields: string[];
  followUpQuestions: any[];
}

export default function ReviewPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<GoFundMeDraft | null>(null);
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  const [editValues, setEditValues] = useState<{ [key: string]: string }>({});
  const [consentGiven, setConsentGiven] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    // Load extracted draft from localStorage
    const savedDraft = localStorage.getItem("gfm_extracted_draft");
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setDraft(parsedDraft);
        setConsentGiven(parsedDraft.consentToPublish || false);
      } catch (error) {
        console.error("Error parsing draft:", error);
        toast.error("Error loading draft data");
      }
    } else {
      toast.error("No draft data found. Please start from the beginning.");
      router.push("/gfm/extract");
    }
  }, [router]);

  const getConfidenceIcon = (confidence: number) => {
    if (confidence > 0.7)
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    if (confidence > 0.4)
      return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    return <QuestionMarkCircleIcon className="w-5 h-5 text-red-500" />;
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence > 0.7) return "High confidence";
    if (confidence > 0.4) return "Medium confidence";
    return "Low confidence - please review";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.7) return "text-green-600 bg-green-50";
    if (confidence > 0.4) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const startEditing = (field: string, currentValue: any) => {
    setIsEditing({ ...isEditing, [field]: true });
    setEditValues({ ...editValues, [field]: String(currentValue || "") });
  };

  const saveEdit = (field: string) => {
    if (!draft) return;

    const updatedDraft = { ...draft };
    const fieldData = updatedDraft[field as keyof GoFundMeDraft] as FieldData;

    // Handle special field types
    let newValue: any = editValues[field];

    if (field === "goalAmount") {
      newValue = parseFloat(editValues[field].replace(/[^\d.]/g, ""));
      if (isNaN(newValue)) {
        toast.error("Please enter a valid number for goal amount");
        return;
      }
    }

    if (fieldData && typeof fieldData === "object" && "value" in fieldData) {
      fieldData.value = newValue;
      fieldData.confidence = 1.0; // Manual edits have high confidence
      fieldData.source = "manual";
    }

    setDraft(updatedDraft);
    setIsEditing({ ...isEditing, [field]: false });

    // Update localStorage
    localStorage.setItem("gfm_extracted_draft", JSON.stringify(updatedDraft));

    toast.success("Field updated successfully");
  };

  const cancelEdit = (field: string) => {
    setIsEditing({ ...isEditing, [field]: false });
    const newEditValues = { ...editValues };
    delete newEditValues[field];
    setEditValues(newEditValues);
  };

  const renderField = (
    fieldKey: string,
    label: string,
    fieldData: FieldData,
    type: "text" | "textarea" | "select" | "number" = "text",
    options?: string[],
  ) => {
    const isCurrentlyEditing = isEditing[fieldKey];
    const displayValue = fieldData?.value || "Not specified";

    return (
      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-900">{label}</h4>
          <div className="flex items-center space-x-2">
            {fieldData && (
              <div
                className={`px-2 py-1 rounded text-xs ${getConfidenceColor(fieldData.confidence)}`}
              >
                {getConfidenceIcon(fieldData.confidence)}
                <span className="ml-1">
                  {Math.round(fieldData.confidence * 100)}%
                </span>
              </div>
            )}
            {!isCurrentlyEditing && (
              <button
                onClick={() => startEditing(fieldKey, displayValue)}
                className="text-blue-600 hover:text-blue-700 transition-colors"
                aria-label={`Edit ${label}`}
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isCurrentlyEditing ? (
          <div>
            {type === "textarea" ? (
              <textarea
                value={editValues[fieldKey] || ""}
                onChange={(e) =>
                  setEditValues({ ...editValues, [fieldKey]: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label={label}
                placeholder={label}
                rows={4}
              />
            ) : type === "select" && options ? (
              <select
                value={editValues[fieldKey] || ""}
                onChange={(e) =>
                  setEditValues({ ...editValues, [fieldKey]: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label={label}
              >
                <option value="">Please select...</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type === "number" ? "number" : "text"}
                value={editValues[fieldKey] || ""}
                onChange={(e) =>
                  setEditValues({ ...editValues, [fieldKey]: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            )}

            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => saveEdit(fieldKey)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => cancelEdit(fieldKey)}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-800">
              {fieldKey === "goalAmount" && fieldData?.value
                ? `$${Number(fieldData.value).toLocaleString()}`
                : String(displayValue)}
            </p>
            {fieldData && fieldData.confidence < 0.7 && (
              <p className="text-sm text-gray-500 mt-1">
                {getConfidenceText(fieldData.confidence)} - Consider reviewing
                this field
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const generateQRCode = async () => {
    if (!draft?.name?.value) {
      toast.error("Please provide a name for the campaign first");
      return;
    }

    try {
      // Generate a public slug from the name
      const publicSlug = draft.name.value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/qr/donation-page`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicSlug,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setQrCodeUrl(data.data.qrCodeUrl);
        toast.success("QR code generated successfully!");
      } else {
        toast.error("Failed to generate QR code");
      }
    } catch (error) {
      console.error("QR generation error:", error);
      toast.error("Failed to generate QR code");
    }
  };

  const downloadWordDoc = async () => {
    if (!draft) return;

    setIsGeneratingDoc(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exports/gofundme-docx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            draft,
            filename: `GoFundMe_Draft_${draft.name?.value || "Untitled"}.docx`,
          }),
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `GoFundMe_Draft_${draft.name?.value || "Untitled"}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success("Document downloaded successfully!");
      } else {
        toast.error("Failed to generate document");
      }
    } catch (error) {
      console.error("Document generation error:", error);
      toast.error("Failed to generate document");
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  if (!draft) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading draft data...</p>
        </div>
      </div>
    );
  }

  const categoryOptions = [
    "Medical",
    "Emergency",
    "Memorial",
    "Education",
    "Nonprofit",
    "Housing",
    "Animal",
    "Environment",
    "Community",
    "Sports",
    "Creative",
    "Travel",
    "Family",
    "Business",
    "Dreams",
    "Faith",
    "Competitions",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Review Your GoFundMe Campaign
          </h1>
          <p className="text-lg text-gray-600">
            Review and edit the auto-filled information. Fields with low
            confidence should be checked carefully.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Campaign Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>

              <div className="space-y-4">
                {renderField("title", "Campaign Title", draft.title, "text")}
                {renderField(
                  "category",
                  "Category",
                  draft.category,
                  "select",
                  categoryOptions,
                )}
                {renderField(
                  "goalAmount",
                  "Goal Amount ($)",
                  draft.goalAmount,
                  "number",
                )}
                {renderField("name", "Your Name", draft.name, "text")}
                {renderField(
                  "dateOfBirth",
                  "Date of Birth (MM/DD/YYYY)",
                  draft.dateOfBirth,
                  "text",
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Story Content</h2>

              <div className="space-y-4">
                {renderField(
                  "storyBody",
                  "Campaign Story",
                  draft.storyBody,
                  "textarea",
                )}
                {renderField(
                  "shortSummary",
                  "Short Summary",
                  draft.shortSummary,
                  "textarea",
                )}
              </div>
            </div>
          </div>

          {/* Actions & Tools */}
          <div className="space-y-6">
            {/* Consent */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Consent & Privacy</h2>

              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    I consent to publish this campaign information and
                    understand that it will be publicly visible. I confirm that
                    all information provided is accurate to the best of my
                    knowledge.
                  </span>
                </label>
              </div>
            </div>

            {/* QR Code Generation */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                QR Code for Donations
              </h2>

              {qrCodeUrl ? (
                <div className="text-center">
                  <img
                    src={qrCodeUrl}
                    alt="Donation QR Code"
                    className="mx-auto mb-4 border rounded"
                  />
                  <p className="text-sm text-gray-600 mb-4">
                    People can scan this QR code to donate directly via
                    debit/credit card
                  </p>
                  <button
                    onClick={generateQRCode}
                    className="btn-secondary text-sm"
                  >
                    Regenerate QR Code
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Generate a QR code that links to your donation page
                  </p>
                  <button
                    onClick={generateQRCode}
                    disabled={!consentGiven}
                    className="btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Generate QR Code
                  </button>
                </div>
              )}
            </div>

            {/* Word Document Export */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                GoFundMe Draft Package
              </h2>

              <p className="text-gray-600 mb-4">
                Download a Word document with your complete campaign details and
                step-by-step GoFundMe setup instructions.
              </p>

              <button
                onClick={downloadWordDoc}
                disabled={!consentGiven || isGeneratingDoc}
                className="btn-primary w-full disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                <span>
                  {isGeneratingDoc ? "Generating..." : "Download Word Document"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link href="/gfm/extract" className="btn-secondary">
            ← Back to Extraction
          </Link>

          <Link href="/" className="btn-secondary">
            Complete & Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
