"use client";

import type { IntakeModule, ModuleId } from "../types";

interface WizardProgressProps {
  modules: IntakeModule[];
  currentStep: number;
  completedModules: ModuleId[];
  moduleLabels: Record<ModuleId, string>;
  onStepClick?: (stepIndex: number) => void;
}

export function WizardProgress({
  modules,
  currentStep,
  completedModules,
  moduleLabels,
  onStepClick,
}: WizardProgressProps) {
  const percentComplete = Math.round((currentStep / modules.length) * 100);

  return (
    <div className="mb-8" role="region" aria-label="Intake progress">
      {/* Screen reader live region for step changes */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Step {currentStep + 1} of {modules.length}:{" "}
        {modules[currentStep]
          ? moduleLabels[modules[currentStep].id]
          : "Complete"}
        .{percentComplete}% complete.
      </div>

      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep + 1} of {modules.length}
        </span>
        <span className="text-sm text-gray-500">
          {percentComplete}% complete
        </span>
      </div>
      <div
        className="w-full bg-gray-200 rounded-full h-2"
        role="progressbar"
        aria-valuenow={percentComplete}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Intake progress: ${percentComplete}% complete`}
      >
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / modules.length) * 100}%` }}
        />
      </div>

      {/* Step indicators */}
      <nav
        className="flex justify-between mt-4 overflow-x-auto"
        aria-label="Intake steps"
      >
        {modules.map((mod, index) => {
          const isCompleted = completedModules.includes(mod.id);
          const isCurrent = index === currentStep;
          const isPast = index < currentStep;
          const isClickable = onStepClick && (isCompleted || isPast);
          const stepLabel = `Step ${index + 1}: ${moduleLabels[mod.id]}${isCompleted ? " (completed)" : isCurrent ? " (current)" : ""}${!mod.required ? " (optional)" : ""}${isClickable ? " — click to edit" : ""}`;

          return (
            <div
              key={mod.id}
              className={`flex flex-col items-center flex-shrink-0 ${
                index < modules.length - 1 ? "mr-2" : ""
              }`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(index)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                      ? "bg-blue-600 text-white"
                      : isPast
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-200 text-gray-500"
                } ${isClickable ? "cursor-pointer hover:ring-2 hover:ring-blue-400 hover:scale-110" : "cursor-default"}`}
                aria-label={stepLabel}
              >
                {isCompleted ? "\u2713" : index + 1}
              </button>
              <span
                className={`text-xs mt-1 text-center max-w-[60px] leading-tight ${
                  isCurrent
                    ? "font-semibold text-blue-600"
                    : isClickable
                      ? "text-blue-500 cursor-pointer"
                      : "text-gray-500"
                }`}
                onClick={() => isClickable && onStepClick(index)}
              >
                {moduleLabels[mod.id]}
              </span>
              {!mod.required && (
                <span className="text-xs text-gray-400 italic">optional</span>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
