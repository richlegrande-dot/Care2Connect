"use client";

import type { IntakeModule, ModuleId } from "../types";

interface WizardReviewProps {
  modules: IntakeModule[];
  moduleData: Partial<Record<ModuleId, Record<string, unknown>>>;
  moduleLabels: Record<ModuleId, string>;
  onEditStep: (stepIndex: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

/**
 * Post-intake review/edit screen.
 * Shows all entered data grouped by module with inline edit buttons.
 */
export function WizardReview({
  modules,
  moduleData,
  moduleLabels,
  onEditStep,
  onSubmit,
  isSubmitting,
}: WizardReviewProps) {
  return (
    <div
      className="min-h-screen bg-gray-50 py-8"
      role="main"
      aria-label="Review Your Responses"
    >
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Review Your Responses
          </h1>
          <p className="text-gray-600">
            Please review your answers below. Click <strong>Edit</strong> on any
            section to make changes, then submit when you're ready.
          </p>
        </div>

        {/* Module sections */}
        {modules.map((mod, index) => {
          const data = moduleData[mod.id];
          const hasData = data && Object.keys(data).length > 0;

          return (
            <div
              key={mod.id}
              className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
            >
              {/* Section header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <h2 className="font-semibold text-gray-900">
                    {moduleLabels[mod.id]}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onEditStep(index)}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition flex items-center gap-1"
                  aria-label={`Edit ${moduleLabels[mod.id]}`}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
              </div>

              {/* Section data */}
              <div className="px-6 py-4">
                {!hasData ? (
                  <p className="text-sm text-gray-400 italic">
                    {mod.required
                      ? "No data entered — please fill in this section."
                      : "Skipped (optional)"}
                  </p>
                ) : (
                  <dl className="space-y-3">
                    {Object.entries(data!).map(([fieldKey, fieldValue]) => {
                      const fieldSchema = mod.schema.properties[fieldKey];
                      const label =
                        fieldSchema?.title ||
                        fieldKey
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase());
                      const displayValue = formatFieldValue(
                        fieldValue,
                        fieldSchema,
                      );

                      // Don't display undefined/null values
                      if (fieldValue === undefined || fieldValue === null)
                        return null;

                      return (
                        <div
                          key={fieldKey}
                          className="flex flex-col sm:flex-row sm:gap-4"
                        >
                          <dt className="text-sm font-medium text-gray-500 sm:w-1/3 flex-shrink-0">
                            {label}
                          </dt>
                          <dd className="text-sm text-gray-900 mt-0.5 sm:mt-0">
                            {displayValue}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                )}
              </div>
            </div>
          );
        })}

        {/* Submit bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            When you're satisfied with your answers, click Submit to complete
            your intake.
          </p>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            aria-label="Submit intake assessment"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                Submit Assessment
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Format a field value for display, handling arrays, booleans, enums, etc.
 */
function formatFieldValue(
  value: unknown,
  schema?: { type?: string; enum?: string[] },
): string {
  if (value === undefined || value === null || value === "") return "—";

  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value
      .map((v) =>
        String(v)
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      )
      .join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    return String(value);
  }

  const strVal = String(value);
  // If it's an enum-style value with underscores, prettify it
  if (schema?.enum && schema.enum.includes(strVal)) {
    return strVal.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return strVal;
}
