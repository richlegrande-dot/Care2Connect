'use client';

/**
 * V2 Intake Wizard — Multi-Step Form Page
 *
 * Feature-gated by NEXT_PUBLIC_ENABLE_V2_INTAKE.
 * Uses the backend /api/v2/intake/* endpoints.
 *
 * Flow:
 *   1. Fetch module schemas from backend
 *   2. Walk user through each module step
 *   3. On completion, POST to /complete → get scores, explanation, action plan
 *   4. Show results page
 */

import { useState, useEffect, useCallback } from 'react';
import { redirect } from 'next/navigation';
import { WizardProgress } from './components/WizardProgress';
import { WizardModule } from './components/WizardModule';
import { WizardResults } from './components/WizardResults';
import { QuickExitButton } from './components/QuickExitButton';
import type { ModuleId, IntakeModule, WizardState, ExplainabilityCard } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const MODULE_LABELS: Record<ModuleId, string> = {
  consent: 'Welcome & Consent',
  demographics: 'About You',
  housing: 'Housing Situation',
  safety: 'Safety & Crisis',
  health: 'Health & Wellbeing',
  history: 'Homelessness History',
  income: 'Income & Benefits',
  goals: 'Goals & Preferences',
};

export default function IntakeWizardPage() {
  // Feature gate
  const v2Enabled = process.env.NEXT_PUBLIC_ENABLE_V2_INTAKE === 'true';

  const [modules, setModules] = useState<IntakeModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<{
    score: { totalScore: number; stabilityLevel: number; priorityTier: string };
    explainability: ExplainabilityCard;
    actionPlan: { immediateTasks: number; shortTermTasks: number; mediumTermTasks: number };
  } | null>(null);

  const [state, setState] = useState<WizardState>({
    sessionId: null,
    currentStep: 0,
    completedModules: [],
    moduleData: {},
    dvSafeMode: false,
    status: 'idle',
    error: null,
  });

  // Redirect if feature is disabled
  if (!v2Enabled) {
    redirect('/');
  }

  // Fetch module schemas on mount
  useEffect(() => {
    async function fetchSchemas() {
      try {
        const res = await fetch(`${API_BASE}/api/v2/intake/schema`);
        if (!res.ok) throw new Error('Failed to load intake schema');
        const data = await res.json();
        setModules(data.modules);
      } catch (err) {
        setState(prev => ({ ...prev, error: 'Failed to load intake form. Please try again.', status: 'error' }));
      } finally {
        setLoading(false);
      }
    }
    fetchSchemas();
  }, []);

  // Start session on first interaction
  const startSession = useCallback(async () => {
    if (state.sessionId) return;
    try {
      const res = await fetch(`${API_BASE}/api/v2/intake/session`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start session');
      const data = await res.json();
      setState(prev => ({ ...prev, sessionId: data.sessionId, status: 'in_progress' }));
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to start intake session.', status: 'error' }));
    }
  }, [state.sessionId]);

  // Save module data to backend
  const saveModule = useCallback(async (moduleId: ModuleId, data: Record<string, unknown>) => {
    if (!state.sessionId) return;
    try {
      const res = await fetch(`${API_BASE}/api/v2/intake/session/${state.sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, data }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }
      const result = await res.json();

      setState(prev => ({
        ...prev,
        completedModules: result.completedModules,
        moduleData: { ...prev.moduleData, [moduleId]: data },
        dvSafeMode: result.dvSafeMode,
      }));

      return result;
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
      return null;
    }
  }, [state.sessionId]);

  // Complete intake and compute scores
  const completeIntake = useCallback(async () => {
    if (!state.sessionId) return;
    setState(prev => ({ ...prev, status: 'submitting' }));
    try {
      const res = await fetch(`${API_BASE}/api/v2/intake/session/${state.sessionId}/complete`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to complete intake');
      }
      const data = await res.json();
      setState(prev => ({ ...prev, status: 'completed' }));
      setResults({
        score: data.score,
        explainability: data.explainability,
        actionPlan: data.actionPlan,
      });
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, status: 'error' }));
    }
  }, [state.sessionId]);

  // Handle next step
  const handleNext = useCallback(async (moduleId: ModuleId, data: Record<string, unknown>) => {
    // Start session on first submit if needed
    if (!state.sessionId) {
      await startSession();
    }

    const result = await saveModule(moduleId, data);
    if (!result) return;

    const nextStep = state.currentStep + 1;
    if (nextStep >= modules.length) {
      // All modules done — complete
      await completeIntake();
    } else {
      setState(prev => ({ ...prev, currentStep: nextStep }));
    }
  }, [state.sessionId, state.currentStep, modules.length, startSession, saveModule, completeIntake]);

  // Handle back
  const handleBack = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
      error: null,
    }));
  }, []);

  // Handle skip (for optional modules)
  const handleSkip = useCallback(() => {
    const nextStep = state.currentStep + 1;
    if (nextStep >= modules.length) {
      completeIntake();
    } else {
      setState(prev => ({ ...prev, currentStep: nextStep }));
    }
  }, [state.currentStep, modules.length, completeIntake]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading intake form...</p>
        </div>
      </div>
    );
  }

  if (state.status === 'completed' && results) {
    return <WizardResults results={results} />;
  }

  const currentModule = modules[state.currentStep];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {state.dvSafeMode && <QuickExitButton />}

      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Care2Connect Intake</h1>
          <p className="mt-2 text-gray-600">
            This assessment helps us understand your situation and connect you with the right resources.
            Your information is kept confidential.
          </p>
        </div>

        <WizardProgress
          modules={modules}
          currentStep={state.currentStep}
          completedModules={state.completedModules}
          moduleLabels={MODULE_LABELS}
        />

        {state.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{state.error}</p>
          </div>
        )}

        {currentModule && (
          <WizardModule
            module={currentModule}
            label={MODULE_LABELS[currentModule.id]}
            savedData={state.moduleData[currentModule.id]}
            isFirst={state.currentStep === 0}
            isLast={state.currentStep === modules.length - 1}
            isSubmitting={state.status === 'submitting'}
            onNext={(data) => handleNext(currentModule.id, data)}
            onBack={handleBack}
            onSkip={!currentModule.required ? handleSkip : undefined}
          />
        )}
      </div>
    </div>
  );
}
