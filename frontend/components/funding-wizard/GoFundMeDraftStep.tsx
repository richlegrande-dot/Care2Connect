"use client";

import React, { useState, useEffect } from "react";
import { Copy, CheckCircle, Download, Edit3, FileText } from "lucide-react";

interface GoFundMeDraftStepProps {
  data: any;
  onComplete: (data: any) => void;
  onBack: () => void;
  onHelp: () => void;
  clientId: string;
}

export default function GoFundMeDraftStep({
  data,
  onComplete,
  onBack,
  onHelp,
  clientId,
}: GoFundMeDraftStepProps) {
  const [draftData, setDraftData] = useState({
    title: "",
    goal: "",
    category: "",
    location: "",
    beneficiary: "",
    story: "",
    summary: "",
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Generate draft from extracted fields
    generateDraft();
  }, [data]);

  const generateDraft = () => {
    const extracted = data.extractedFields || {};

    // Title generation
    const firstName = extracted.name?.value?.split(" ")[0] || "this campaign";
    const category = extracted.category?.value || "their goal";
    const title = `Help ${firstName} with ${category}`;

    // Story generation from transcript or extracted narrative
    const story =
      extracted.story?.value ||
      `My name is ${extracted.name?.value || "[Your Name]"}. ${extracted.age?.value ? `I am ${extracted.age.value} years old and ` : ""}I am reaching out for support with ${category}. 

I am located in ${extracted.location?.value || "[Your Location]"} and am working towards raising ${extracted.goalAmount?.value ? `$${extracted.goalAmount.value}` : "[Goal Amount]"} to help me get back on my feet.

${extracted.beneficiary?.value === "myself" ? "This fundraiser is for myself." : `This fundraiser is to help ${extracted.beneficiary?.value || "a loved one"}.`}

Every donation, no matter how small, will make a meaningful difference in my life. Thank you for your support and generosity.`;

    // Summary (first 150 chars of story)
    const summary = story.slice(0, 150) + "...";

    setDraftData({
      title,
      goal: extracted.goalAmount?.value || "5000",
      category: extracted.category?.value || "other",
      location: extracted.location?.value || "",
      beneficiary: extracted.beneficiary?.value || "myself",
      story,
      summary,
    });

    // Save to parent data
    data.gofundmeDraft = {
      title,
      goal: extracted.goalAmount?.value || "5000",
      category: extracted.category?.value || "other",
      location: extracted.location?.value || "",
      beneficiary: extracted.beneficiary?.value || "myself",
      story,
      summary,
    };
  };

  const handleCopy = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("[GoFundMeDraftStep] Error copying:", error);
    }
  };

  const handleEdit = (field: string, value: string) => {
    setDraftData((prev) => ({ ...prev, [field]: value }));
    // Update parent data
    if (data.gofundmeDraft) {
      data.gofundmeDraft[field as keyof typeof data.gofundmeDraft] = value;
    }
  };

  const handleDownloadWord = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/export/word/${clientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `gofundme-draft-${clientId}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("[GoFundMeDraftStep] Word export failed");
      }
    } catch (error) {
      console.error("[GoFundMeDraftStep] Error downloading Word doc:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNext = () => {
    onComplete({ gofundmeDraft: draftData });
  };

  const renderField = (
    label: string,
    field: keyof typeof draftData,
    multiline: boolean = false,
    placeholder: string = "",
  ) => {
    const value = draftData[field];
    const isCopied = copiedField === field;
    const isEditMode = isEditing === field;

    return (
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-900">{label}</label>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(isEditMode ? null : field)}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
              title="Edit"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              {isEditMode ? "Done" : "Edit"}
            </button>
            <button
              onClick={() => handleCopy(field, value)}
              className="text-green-600 hover:text-green-700 text-sm flex items-center"
              title="Copy"
            >
              {isCopied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
        {isEditMode ? (
          multiline ? (
            <textarea
              value={value}
              onChange={(e) => handleEdit(field, e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={10}
              placeholder={placeholder}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => handleEdit(field, e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={placeholder}
            />
          )
        ) : (
          <div
            className={`${multiline ? "whitespace-pre-wrap" : ""} text-gray-700 bg-gray-50 p-3 rounded`}
          >
            {value || <span className="text-gray-400">{placeholder}</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Prepare GoFundMe Draft
        </h2>
        <p className="text-gray-600">
          Review and edit the auto-generated content below. You can copy each
          field directly into GoFundMe's website.
        </p>
      </div>

      {/* Edit Anything Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Edit3 className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">You can edit anything!</p>
            <p>
              Click the "Edit" button next to any field to customize the text.
              Changes are saved automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Draft Fields */}
      <div className="space-y-4">
        {renderField(
          "Campaign Title",
          "title",
          false,
          "Help [Name] with [Category]",
        )}
        {renderField("Fundraising Goal ($)", "goal", false, "5000")}
        {renderField(
          "Category",
          "category",
          false,
          "medical, housing, emergency, etc.",
        )}
        {renderField("Location", "location", false, "City, State")}
        {renderField(
          "Beneficiary",
          "beneficiary",
          false,
          "myself or someone else",
        )}
        {renderField(
          "Short Summary (150 chars)",
          "summary",
          true,
          "Brief description for preview...",
        )}
        {renderField(
          "Full Story",
          "story",
          true,
          "Tell your story in detail...",
        )}
      </div>

      {/* Suggested Cover Media Checklist */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Suggested Cover Media Checklist (Optional)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          GoFundMe campaigns with photos or videos receive more donations.
          Consider adding:
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>A clear photo of yourself or the beneficiary</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Photos showing the situation or need</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>A short video (30-60 seconds) telling your story</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Documents or receipts (if relevant)</span>
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-4">
          Note: CareConnect does not generate photos or videos. You'll need to
          upload these directly to GoFundMe.
        </p>
      </div>

      {/* Download Word Document */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start">
            <FileText className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Download as Word Document (.docx)
              </h3>
              <p className="text-sm text-gray-600">
                Get a professionally formatted document with all your campaign
                details that you can print or edit offline.
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadWord}
            disabled={isDownloading}
            className="ml-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download .docx
              </>
            )}
          </button>
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-2">
              ⚠️ Important: CareConnect Does NOT Publish to GoFundMe
            </p>
            <p>
              This is a <strong>draft only</strong>. You must manually create
              your GoFundMe campaign by visiting
              <a
                href="https://www.gofundme.com/c/start"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-900 underline ml-1"
              >
                gofundme.com/c/start
              </a>{" "}
              and copying these fields into their form.
            </p>
            <p className="mt-2">
              The next step will guide you through the GoFundMe creation process
              step-by-step.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          type="button"
          onClick={onHelp}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Need help?
        </button>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
          >
            Next: GoFundMe Wizard
            <CheckCircle className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
