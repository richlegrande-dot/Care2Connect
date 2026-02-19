'use client';

import type { ExplainabilityCard } from '../types';

interface WizardResultsProps {
  results: {
    score: {
      totalScore: number;
      stabilityLevel: number;
      priorityTier: string;
      dimensions?: {
        housing_stability: number;
        safety_crisis: number;
        vulnerability_health: number;
        chronicity_system: number;
      };
    };
    explainability: ExplainabilityCard;
    actionPlan: {
      immediateTasks: number;
      shortTermTasks: number;
      mediumTermTasks: number;
      tasks?: {
        immediateTasks: Array<{ title: string; description: string; priority: string; category: string }>;
        shortTermTasks: Array<{ title: string; description: string; priority: string; category: string }>;
        mediumTermTasks: Array<{ title: string; description: string; priority: string; category: string }>;
      };
    };
  };
}

const TIER_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  MODERATE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  LOWER: 'bg-green-100 text-green-800 border-green-300',
};

const LEVEL_DESCRIPTIONS: Record<number, string> = {
  0: 'Immediate crisis intervention needed. You will be connected with emergency services.',
  1: 'Emergency shelter and stabilization services are the priority.',
  2: 'Transitional support services will help build stability.',
  3: 'You have some stability — services will focus on strengthening your situation.',
  4: 'You are housed with support needs. Ongoing services will be coordinated.',
  5: 'You are in a stable situation. Monitoring and light-touch support available.',
};

export function WizardResults({ results }: WizardResultsProps) {
  const { score, explainability, actionPlan } = results;
  const tierClass = TIER_COLORS[score.priorityTier] || TIER_COLORS.LOWER;

  return (
    <div className="min-h-screen bg-gray-50 py-8" role="main" aria-label="Assessment Results">
      <div className="max-w-2xl mx-auto px-4">
        {/* Screen reader announcement */}
        <div aria-live="polite" className="sr-only">
          Assessment complete. Your stability level is {score.stabilityLevel}, priority tier is {score.priorityTier}.
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Assessment Results</h1>
          <p className="text-gray-600">
            Based on your responses, here is your personalized assessment and recommended next steps.
          </p>
        </div>

        {/* Stability Level Card */}
        <div className={`rounded-lg border-2 p-6 mb-6 ${tierClass}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">
              Level {score.stabilityLevel}: {explainability.levelLabel}
            </h2>
            <span className="px-3 py-1 rounded-full text-sm font-semibold border">
              {score.priorityTier}
            </span>
          </div>
          <p className="text-sm">
            {LEVEL_DESCRIPTIONS[score.stabilityLevel] || 'Assessment complete.'}
          </p>
        </div>

        {/* Top Factors */}
        {explainability.topFactors.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Key Factors</h3>
            <ul className="space-y-2">
              {explainability.topFactors.map((factor, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span className="text-sm text-gray-700">{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Score Breakdown */}
        {score.dimensions && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Score Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Housing Stability', value: score.dimensions.housing_stability },
                { label: 'Safety & Crisis Risk', value: score.dimensions.safety_crisis },
                { label: 'Vulnerability & Health', value: score.dimensions.vulnerability_health },
                { label: 'Chronicity & System Use', value: score.dimensions.chronicity_system },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium">{value}/25</span>
                  </div>
                  <div
                    className="w-full bg-gray-200 rounded-full h-2"
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={25}
                    aria-label={`${label}: ${value} out of 25`}
                  >
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(value / 25) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t mt-3">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-900">Total Priority Score</span>
                  <span className="font-bold text-lg">{score.totalScore}/100</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Plan Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Recommended Next Steps</h3>

          {actionPlan.immediateTasks > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-red-700 mb-2">
                Immediate (0–24 hours) — {actionPlan.immediateTasks} task(s)
              </h4>
              {actionPlan.tasks?.immediateTasks.map((task, i) => (
                <div key={i} className="ml-4 mb-2 p-3 bg-red-50 rounded border border-red-100">
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                </div>
              ))}
            </div>
          )}

          {actionPlan.shortTermTasks > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-orange-700 mb-2">
                Short-Term (1–7 days) — {actionPlan.shortTermTasks} task(s)
              </h4>
              {actionPlan.tasks?.shortTermTasks.map((task, i) => (
                <div key={i} className="ml-4 mb-2 p-3 bg-orange-50 rounded border border-orange-100">
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                </div>
              ))}
            </div>
          )}

          {actionPlan.mediumTermTasks > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-blue-700 mb-2">
                Medium-Term (30–90 days) — {actionPlan.mediumTermTasks} task(s)
              </h4>
              {actionPlan.tasks?.mediumTermTasks.map((task, i) => (
                <div key={i} className="ml-4 mb-2 p-3 bg-blue-50 rounded border border-blue-100">
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                </div>
              ))}
            </div>
          )}

          {actionPlan.immediateTasks === 0 && actionPlan.shortTermTasks === 0 && actionPlan.mediumTermTasks === 0 && (
            <p className="text-sm text-gray-500">No specific action items generated based on your responses.</p>
          )}
        </div>

        {/* What Happens Next */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">What Happens Next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• A case coordinator will review your assessment</li>
            <li>• You may be contacted to schedule a follow-up conversation</li>
            <li>• Resource referrals will be sent based on your priorities</li>
            <li>• You can return to update your information at any time</li>
          </ul>
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Assessment generated at {explainability?.generatedAt ?? 'N/A'} | Policy Pack {explainability?.policyPackVersion ?? 'v1.0.0'}
        </p>
      </div>
    </div>
  );
}
