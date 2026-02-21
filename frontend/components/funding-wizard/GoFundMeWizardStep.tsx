"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Copy,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";

interface GoFundMeWizardStepProps {
  data: any;
  onComplete: (data: any) => void;
  onBack: () => void;
  onHelp: () => void;
}

interface WizardStep {
  id: number;
  title: string;
  description: string;
  screenshot?: string;
  instructions: string[];
  copyFields?: { label: string; value: string }[];
  troubleshooting?: string[];
}

export default function GoFundMeWizardStep({
  data,
  onComplete,
  onBack,
  onHelp,
}: GoFundMeWizardStepProps) {
  const [expandedStep, setExpandedStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const gofundmeSteps: WizardStep[] = [
    {
      id: 1,
      title: "Start Your Fundraiser",
      description: "Visit GoFundMe and begin the creation process",
      screenshot: "/gofundme-steps/step1-start.png",
      instructions: [
        "Go to https://www.gofundme.com/c/start",
        'Click the green "Start a GoFundMe" button',
        "If you have an account, sign in. Otherwise, continue as guest (you'll create an account later)",
      ],
      troubleshooting: [
        "If the button doesn't work, try refreshing the page or using a different browser",
        "Make sure you're using the main GoFundMe site (not a third-party platform)",
      ],
    },
    {
      id: 2,
      title: "Choose Who You're Fundraising For",
      description: "Select the beneficiary of your campaign",
      screenshot: "/gofundme-steps/step2-beneficiary.png",
      instructions: [
        'Select "Myself" if you are the beneficiary',
        'Select "Someone else" if raising funds for another person',
        'Select "Charity" if raising funds for a registered nonprofit',
      ],
      copyFields: [
        {
          label: "Beneficiary",
          value: data.gofundmeDraft?.beneficiary || "myself",
        },
      ],
      troubleshooting: [
        "If fundraising for someone else, you'll need their permission and details",
        "Charity fundraisers have different verification requirements",
      ],
    },
    {
      id: 3,
      title: "Select a Category",
      description: "Choose the category that best describes your fundraiser",
      screenshot: "/gofundme-steps/step3-category.png",
      instructions: [
        "Choose from: Medical, Emergency, Education, Animals, Community, Funeral, Events, Sports, etc.",
        "Select the category that most closely matches your situation",
        "This helps donors find your campaign",
      ],
      copyFields: [
        { label: "Category", value: data.gofundmeDraft?.category || "other" },
      ],
      troubleshooting: [
        'If unsure, choose "Other" and explain in your story',
        "You can change the category later if needed",
      ],
    },
    {
      id: 4,
      title: "Set Your Fundraising Goal",
      description: "Enter your target amount",
      screenshot: "/gofundme-steps/step4-goal.png",
      instructions: [
        "Enter the total amount you need to raise",
        "Be realistic and specific about your goal",
        "You can adjust this amount later if needed",
      ],
      copyFields: [
        {
          label: "Goal Amount",
          value: `$${data.gofundmeDraft?.goal || "5000"}`,
        },
      ],
      troubleshooting: [
        "Break down your goal in your story to show donors how funds will be used",
        'Don\'t worry about setting a "perfect" amount—you can always adjust',
      ],
    },
    {
      id: 5,
      title: "Add Your Location",
      description: "Provide your city and state/province",
      screenshot: "/gofundme-steps/step5-location.png",
      instructions: [
        "Enter your city name in the location field",
        "Select your state/province from the dropdown",
        "This helps with local discovery and builds trust with donors",
      ],
      copyFields: [
        { label: "Location", value: data.gofundmeDraft?.location || "" },
      ],
      troubleshooting: [
        "If your location doesn't appear, try entering just the city name",
        "You can use the beneficiary's location if fundraising for someone else",
      ],
    },
    {
      id: 6,
      title: "Add Your Fundraiser Title",
      description: "Create a clear, compelling title",
      screenshot: "/gofundme-steps/step6-title.png",
      instructions: [
        "Keep it short, clear, and descriptive (50-80 characters)",
        "Include the beneficiary's name and the reason",
        'Example: "Help John Smith Recover from Surgery"',
      ],
      copyFields: [
        { label: "Campaign Title", value: data.gofundmeDraft?.title || "" },
      ],
      troubleshooting: [
        "Avoid ALL CAPS or excessive punctuation",
        "Make it specific enough to stand out but not too long",
      ],
    },
    {
      id: 7,
      title: "Tell Your Story",
      description: "Write your campaign narrative",
      screenshot: "/gofundme-steps/step7-story.png",
      instructions: [
        "Paste your story from CareConnect into the text editor",
        "Format with paragraphs, headings, and line breaks",
        "Add bullet points if listing expenses",
        "Be honest, specific, and personal",
        "Explain how funds will be used",
      ],
      copyFields: [
        { label: "Full Story", value: data.gofundmeDraft?.story || "" },
      ],
      troubleshooting: [
        "If text doesn't paste correctly, try pasting as plain text (Ctrl+Shift+V)",
        "Use the editor toolbar to add formatting",
        "Keep paragraphs short for easier reading",
      ],
    },
    {
      id: 8,
      title: "Add Cover Photo or Video",
      description: "Upload visual media to your campaign",
      screenshot: "/gofundme-steps/step8-media.png",
      instructions: [
        'Click "Add photo" or "Add video"',
        "Upload a clear, high-quality image of yourself or the beneficiary",
        "Recommended: 1200x900 pixels or larger",
        "Videos should be 30-90 seconds and tell your story",
        "You can add multiple photos",
      ],
      troubleshooting: [
        "Campaigns with photos receive 3x more donations",
        "If upload fails, try reducing image size",
        "Accepted formats: JPG, PNG, GIF (photos), MP4 (videos)",
        "CareConnect does not generate photos—you must provide your own",
      ],
    },
    {
      id: 9,
      title: "Review Your Campaign",
      description: "Check all details before publishing",
      screenshot: "/gofundme-steps/step9-review.png",
      instructions: [
        "Review all information for accuracy",
        "Check spelling and grammar",
        "Verify goal amount and category",
        "Preview how your campaign will look to donors",
        "Make any final edits",
      ],
      troubleshooting: [
        "Take your time—first impressions matter",
        "Ask a friend to review before publishing",
        "You can edit most fields after publishing",
      ],
    },
    {
      id: 10,
      title: "Create Account & Publish",
      description: "Set up your GoFundMe account and go live",
      screenshot: "/gofundme-steps/step10-publish.png",
      instructions: [
        "Create a GoFundMe account (if you haven't already)",
        "Verify your email address",
        "Agree to GoFundMe's terms of service",
        'Click "Publish" to make your campaign live',
        "Your campaign is now public and accepting donations!",
      ],
      troubleshooting: [
        "Check your email for verification link",
        "If verification email doesn't arrive, check spam folder",
        "You must verify your identity to withdraw funds",
      ],
    },
    {
      id: 11,
      title: "Connect Bank Account",
      description: "Set up withdrawals (required to receive funds)",
      screenshot: "/gofundme-steps/step11-bank.png",
      instructions: [
        "Go to your campaign dashboard",
        'Click "Withdraw funds" or "Set up withdrawals"',
        "Choose your bank from the list (or enter manually)",
        "Provide your routing number and account number",
        "Verify your identity (photo ID may be required)",
        "Processing takes 2-5 business days for first withdrawal",
      ],
      troubleshooting: [
        "Bank account must be in the beneficiary's name",
        "You cannot withdraw funds without identity verification",
        "GoFundMe uses secure, encrypted connections for banking info",
        "If verification fails, contact GoFundMe support",
      ],
    },
    {
      id: 12,
      title: "Share Your Campaign",
      description: "Spread the word to reach your goal",
      screenshot: "/gofundme-steps/step12-share.png",
      instructions: [
        "Use the CareConnect QR code for offline sharing",
        "Share on Facebook, Twitter, Instagram, and other social media",
        "Send direct messages or emails to friends and family",
        "Post updates regularly to keep donors engaged",
        "Thank donors publicly and privately",
      ],
      copyFields: [
        { label: "Donation Page URL", value: data.donationPageUrl || "" },
      ],
      troubleshooting: [
        "Share multiple times—not everyone sees your first post",
        "Personalize your sharing messages",
        "Post updates at least weekly",
        "Use your CareConnect QR code for in-person sharing",
      ],
    },
  ];

  const handleToggleStep = (stepId: number) => {
    setExpandedStep(expandedStep === stepId ? 0 : stepId);
  };

  const handleMarkComplete = (stepId: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const handleCopyField = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("[GoFundMeWizard] Error copying:", error);
    }
  };

  const renderStep = (step: WizardStep) => {
    const isExpanded = expandedStep === step.id;
    const isCompleted = completedSteps.has(step.id);

    return (
      <div
        key={step.id}
        className="border border-gray-300 rounded-lg overflow-hidden"
      >
        <button
          onClick={() => handleToggleStep(step.id)}
          className={`
            w-full flex items-center justify-between p-4 text-left transition-colors
            ${isCompleted ? "bg-green-50 hover:bg-green-100" : "bg-white hover:bg-gray-50"}
          `}
        >
          <div className="flex items-center flex-1">
            <span
              className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3
              ${isCompleted ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}
            `}
            >
              {isCompleted ? <CheckCircle className="w-5 h-5" /> : step.id}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="text-xs text-gray-600 mt-1">{step.description}</p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
          )}
        </button>

        {isExpanded && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Screenshot */}
              <div className="bg-white border border-gray-300 rounded-lg p-4 flex items-center justify-center">
                {step.screenshot ? (
                  <img
                    src={step.screenshot}
                    alt={`Screenshot: ${step.title}`}
                    className="max-w-full h-auto rounded"
                    onError={(e) => {
                      // Fallback if screenshot doesn't exist
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="text-center text-gray-400 py-12">
                          <div class="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                          </div>
                          <p class="text-sm">Screenshot placeholder</p>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-sm">Screenshot placeholder</p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    What to do:
                  </h4>
                  <ul className="space-y-2">
                    {step.instructions.map((instruction, index) => (
                      <li
                        key={index}
                        className="flex items-start text-sm text-gray-700"
                      >
                        <span className="mr-2 text-blue-600 font-bold">
                          {index + 1}.
                        </span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Copy Fields */}
                {step.copyFields && step.copyFields.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Copy from CareConnect:
                    </h4>
                    <div className="space-y-2">
                      {step.copyFields.map((field, index) => (
                        <div key={index} className="bg-white rounded p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-600">
                              {field.label}
                            </span>
                            <button
                              onClick={() =>
                                handleCopyField(field.value, field.label)
                              }
                              className="text-blue-600 hover:text-blue-700 text-xs flex items-center"
                            >
                              {copiedField === field.label ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                          <div className="text-sm text-gray-900 break-words">
                            {field.value.length > 100
                              ? field.value.slice(0, 100) + "..."
                              : field.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Troubleshooting */}
                {step.troubleshooting && step.troubleshooting.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Common problems:
                    </h4>
                    <ul className="space-y-1">
                      {step.troubleshooting.map((tip, index) => (
                        <li
                          key={index}
                          className="flex items-start text-xs text-gray-700"
                        >
                          <span className="mr-2">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mark Complete Button */}
                <button
                  onClick={() => handleMarkComplete(step.id)}
                  className={`
                    w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors
                    ${
                      isCompleted
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }
                  `}
                >
                  {isCompleted ? "✓ Completed" : "Mark as Complete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const completedCount = completedSteps.size;
  const totalSteps = gofundmeSteps.length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Finalize GoFundMe Manually
        </h2>
        <p className="text-gray-600">
          Follow these step-by-step instructions to create your campaign on
          GoFundMe's website.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {completedCount} of {totalSteps} steps
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Official Guide Link */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <ExternalLink className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Official GoFundMe Guide
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              For the most up-to-date instructions, visit GoFundMe's official
              documentation:
            </p>
            <a
              href="https://support.gofundme.com/hc/en-us/articles/360001992627-Creating-a-GoFundMe-from-start-to-finish"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Creating a GoFundMe from start to finish →
            </a>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {gofundmeSteps.map((step) => renderStep(step))}
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
            onClick={() => onComplete({})}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
          >
            Next: Download Print Kit
            <CheckCircle className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
