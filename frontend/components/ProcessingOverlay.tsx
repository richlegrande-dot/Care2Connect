"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface ProcessingStep {
  id: string;
  label: string;
  completed: boolean;
}

interface ProcessingOverlayProps {
  onComplete: () => void;
  duration?: number; // milliseconds
}

export default function ProcessingOverlay({
  onComplete,
  duration = 5000,
}: ProcessingOverlayProps) {
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: "transcribe", label: "Transcribing your story", completed: false },
    { id: "extract", label: "Extracting key information", completed: false },
    { id: "qr", label: "Preparing QR donation code", completed: false },
    { id: "gofundme", label: "Drafting GoFundMe template", completed: false },
    { id: "finalize", label: "Finalizing your report", completed: false },
  ]);

  useEffect(() => {
    const stepDuration = duration / steps.length;

    steps.forEach((step, index) => {
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((s, i) => (i === index ? { ...s, completed: true } : s)),
        );

        // Complete after last step
        if (index === steps.length - 1) {
          setTimeout(onComplete, 800);
        }
      }, stepDuration * index);
    });
  }, [duration, onComplete]);

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center z-50"
      role="dialog"
      aria-live="polite"
      aria-label="Processing your story"
    >
      <div className="max-w-2xl w-full mx-4">
        {/* Paper animation */}
        <div className="relative mb-12">
          <div className="bg-white shadow-2xl rounded-lg p-12 transform transition-all duration-1000 animate-slide-up">
            {/* Document header lines */}
            <div className="space-y-3 mb-8">
              <div
                className="h-4 bg-gray-200 rounded animate-fill-line"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="h-4 bg-gray-200 rounded animate-fill-line w-3/4"
                style={{ animationDelay: "0.4s" }}
              />
            </div>

            {/* Document body lines */}
            <div className="space-y-2 mb-8">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-2 bg-gray-100 rounded animate-fill-line"
                  style={{
                    animationDelay: `${0.6 + i * 0.1}s`,
                    width: i % 3 === 0 ? "100%" : i % 3 === 1 ? "95%" : "90%",
                  }}
                />
              ))}
            </div>

            {/* Document footer */}
            <div
              className="h-3 bg-gray-200 rounded animate-fill-line w-1/2"
              style={{ animationDelay: "1.8s" }}
            />
          </div>
        </div>

        {/* Processing status */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Processing Your Story
          </h2>

          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-4">
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step.completed
                      ? "bg-green-500 scale-100"
                      : "bg-gray-200 scale-90"
                  }`}
                >
                  {step.completed && <Check className="text-white" size={16} />}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium transition-colors duration-300 ${
                      step.completed ? "text-green-700" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {step.completed && (
                  <div className="flex-shrink-0">
                    <div className="h-1 w-8 bg-green-500 rounded animate-check-dash" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <div className="inline-flex gap-2">
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              />
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fill-line {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 100%;
            opacity: 1;
          }
        }

        @keyframes check-dash {
          from {
            width: 0;
          }
          to {
            width: 2rem;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animate-fill-line {
          animation: fill-line 0.6s ease-out forwards;
          width: 0;
        }

        .animate-check-dash {
          animation: check-dash 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
