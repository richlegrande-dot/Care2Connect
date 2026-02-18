'use client';

import type { IntakeModule, ModuleId } from '../types';

interface WizardProgressProps {
  modules: IntakeModule[];
  currentStep: number;
  completedModules: ModuleId[];
  moduleLabels: Record<ModuleId, string>;
}

export function WizardProgress({ modules, currentStep, completedModules, moduleLabels }: WizardProgressProps) {
  return (
    <div className="mb-8">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep + 1} of {modules.length}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round(((currentStep) / modules.length) * 100)}% complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / modules.length) * 100}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between mt-4 overflow-x-auto">
        {modules.map((mod, index) => {
          const isCompleted = completedModules.includes(mod.id);
          const isCurrent = index === currentStep;
          const isPast = index < currentStep;

          return (
            <div
              key={mod.id}
              className={`flex flex-col items-center flex-shrink-0 ${
                index < modules.length - 1 ? 'mr-2' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white'
                    : isPast
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={`text-xs mt-1 text-center max-w-[60px] leading-tight ${
                  isCurrent ? 'font-semibold text-blue-600' : 'text-gray-500'
                }`}
              >
                {moduleLabels[mod.id]}
              </span>
              {!mod.required && (
                <span className="text-xs text-gray-400 italic">optional</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
