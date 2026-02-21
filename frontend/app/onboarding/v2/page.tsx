"use client";

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
 *
 * P2#12: Offline draft saving (localStorage), session recovery, retry logic
 * P2#13: Skeleton loaders, save confirmations, improved loading states
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { WizardProgress } from "./components/WizardProgress";
import { WizardModule } from "./components/WizardModule";
import { WizardResults } from "./components/WizardResults";
import { WizardReview } from "./components/WizardReview";
import { QuickExitButton } from "./components/QuickExitButton";
import type {
  ModuleId,
  IntakeModule,
  WizardState,
  ExplainabilityCard,
} from "./types";

const DRAFT_STORAGE_KEY = "v2-intake-draft";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const MODULE_LABELS: Record<ModuleId, string> = {
  consent: "Welcome & Consent",
  demographics: "About You",
  housing: "Housing Situation",
  safety: "Safety & Crisis",
  health: "Health & Wellbeing",
  history: "Homelessness History",
  income: "Income & Benefits",
  goals: "Goals & Preferences",
};

// ── SSR-safe storage helpers ────────────────────────────────────

const canUseStorage = () =>
  typeof window !== "undefined" && !!window.localStorage;

function safeGet(key: string): string | null {
  try {
    return canUseStorage() ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}
function safeSet(key: string, val: string): void {
  try {
    if (canUseStorage()) localStorage.setItem(key, val);
  } catch {
    /* noop */
  }
}
function safeRemove(key: string): void {
  try {
    if (canUseStorage()) localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

// ── Offline Draft Helpers ──────────────────────────────────────

interface DraftData {
  sessionId: string | null;
  currentStep: number;
  moduleData: Partial<Record<ModuleId, Record<string, unknown>>>;
  dvSafeMode: boolean;
  savedAt: string;
}

function saveDraft(state: WizardState): void {
  // Don't save drafts in DV-safe mode for safety
  if (state.dvSafeMode) return;
  try {
    const draft: DraftData = {
      sessionId: state.sessionId,
      currentStep: state.currentStep,
      moduleData: state.moduleData,
      dvSafeMode: state.dvSafeMode,
      savedAt: new Date().toISOString(),
    };
    safeSet(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // localStorage may be unavailable
  }
}

function loadDraft(): DraftData | null {
  try {
    const raw = safeGet(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as DraftData;
    // Expire drafts older than 24 hours
    const savedAt = new Date(draft.savedAt);
    const ageMs = Date.now() - savedAt.getTime();
    if (ageMs > 24 * 60 * 60 * 1000) {
      safeRemove(DRAFT_STORAGE_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

function clearDraft(): void {
  safeRemove(DRAFT_STORAGE_KEY);
}

// ── Retry Helper ───────────────────────────────────────────────

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES,
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || res.status < 500) return res; // Don't retry client errors
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
      }
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
    }
  }
  throw new Error("Request failed after retries");
}

// ── Skeleton Loader Component ──────────────────────────────────

function SkeletonLoader() {
  return (
    <div
      className="min-h-screen bg-gray-50 py-8"
      aria-busy="true"
      aria-label="Loading intake form"
    >
      <div className="max-w-2xl mx-auto px-4">
        {/* Header skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
        </div>

        {/* Progress bar skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="flex justify-between mb-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
          <div className="h-2 bg-gray-200 rounded-full" />
          <div className="flex justify-between mt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="h-3 bg-gray-200 rounded w-12 mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Form skeleton */}
        <div className="bg-white shadow-sm rounded-lg p-6 mt-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Save Confirmation Toast ────────────────────────────────────

function SaveToast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 transition-opacity z-40"
      role="status"
      aria-live="polite"
    >
      <svg
        className="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      Progress saved
    </div>
  );
}

// ── Draft Recovery Banner ──────────────────────────────────────

function DraftRecoveryBanner({
  onRestore,
  onDiscard,
}: {
  onRestore: () => void;
  onDiscard: () => void;
}) {
  return (
    <div
      className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between"
      role="alert"
    >
      <div>
        <p className="text-sm font-medium text-blue-800">
          You have an unfinished intake
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Would you like to continue where you left off?
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onRestore}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
          aria-label="Continue previous intake"
        >
          Continue
        </button>
        <button
          onClick={onDiscard}
          className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
          aria-label="Start a new intake"
        >
          Start New
        </button>
      </div>
    </div>
  );
}

export default function IntakeWizardPage() {
  // Feature gate — client-safe redirect via useRouter (not redirect())
  const router = useRouter();
  const v2Enabled = process.env.NEXT_PUBLIC_ENABLE_V2_INTAKE === "true";

  const [modules, setModules] = useState<IntakeModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<DraftData | null>(null);
  const [results, setResults] = useState<{
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
      tasks?: any;
    };
    sessionId?: string;
    rank?: { position: number; of: number } | null;
  } | null>(null);

  const [state, setState] = useState<WizardState>({
    sessionId: null,
    currentStep: 0,
    completedModules: [],
    moduleData: {},
    dvSafeMode: false,
    status: "idle",
    error: null,
  });

  const saveToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if feature is disabled (client-safe, inside useEffect)
  useEffect(() => {
    if (!v2Enabled) router.replace("/");
  }, [v2Enabled, router]);

  // If feature is disabled, render nothing (prevents the rest of the tree from running)
  if (!v2Enabled) return null;

  // Check for saved draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.currentStep > 0) {
      setPendingDraft(draft);
    }
  }, []);

  // Auto-save draft when state changes (debounced)
  useEffect(() => {
    if (state.status === "in_progress" && state.currentStep > 0) {
      saveDraft(state);
    }
  }, [state.moduleData, state.currentStep, state.status, state.dvSafeMode]);

  // Best-effort: log REVIEW_ENTERED audit event when entering review
  useEffect(() => {
    if (state.status === "review" && state.sessionId) {
      fetch(`/api/v2/intake/session/${state.sessionId}/review-entered`, {
        method: "POST",
      }).catch(() => {
        /* best-effort — ignore errors */
      });
    }
  }, [state.status, state.sessionId]);

  // Fetch module schemas on mount
  useEffect(() => {
    async function fetchSchemas() {
      try {
        const res = await fetchWithRetry("/api/v2/intake/schema", {});
        if (!res.ok) throw new Error("Failed to load intake schema");
        const data = await res.json();
        setModules(data.modules);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: "Failed to load intake form. Please try again.",
          status: "error",
        }));
      } finally {
        setLoading(false);
      }
    }
    fetchSchemas();
  }, []);

  // Show save toast temporarily
  const flashSaveToast = useCallback(() => {
    setShowSaveToast(true);
    if (saveToastTimeoutRef.current) clearTimeout(saveToastTimeoutRef.current);
    saveToastTimeoutRef.current = setTimeout(
      () => setShowSaveToast(false),
      2000,
    );
  }, []);

  // Restore draft
  const handleRestoreDraft = useCallback(() => {
    if (!pendingDraft) return;
    setState((prev) => ({
      ...prev,
      sessionId: pendingDraft.sessionId,
      currentStep: pendingDraft.currentStep,
      moduleData: pendingDraft.moduleData,
      dvSafeMode: pendingDraft.dvSafeMode,
      status: pendingDraft.sessionId ? "in_progress" : "idle",
    }));
    setPendingDraft(null);
  }, [pendingDraft]);

  // Discard draft
  const handleDiscardDraft = useCallback(() => {
    clearDraft();
    setPendingDraft(null);
  }, []);

  // Start session on first interaction
  const startSession = useCallback(async () => {
    if (state.sessionId) return;
    try {
      const res = await fetchWithRetry("/api/v2/intake/session", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to start session");
      const data = await res.json();
      setState((prev) => ({
        ...prev,
        sessionId: data.sessionId,
        status: "in_progress",
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          "Failed to start intake session. Please check your connection and try again.",
        status: "error",
      }));
    }
  }, [state.sessionId]);

  // Save module data to backend
  const saveModule = useCallback(
    async (moduleId: ModuleId, data: Record<string, unknown>) => {
      if (!state.sessionId) return;
      try {
        const res = await fetchWithRetry(
          `/api/v2/intake/session/${state.sessionId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleId, data }),
          },
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to save");
        }
        const result = await res.json();

        setState((prev) => ({
          ...prev,
          completedModules: result.completedModules,
          moduleData: { ...prev.moduleData, [moduleId]: data },
          dvSafeMode: result.dvSafeMode,
        }));

        flashSaveToast();
        return result;
      } catch (err: any) {
        setState((prev) => ({ ...prev, error: err.message }));
        return null;
      }
    },
    [state.sessionId, flashSaveToast],
  );

  // Complete intake and compute scores
  const completeIntake = useCallback(async () => {
    if (!state.sessionId) return;
    setState((prev) => ({ ...prev, status: "submitting" }));
    try {
      const res = await fetchWithRetry(
        `/api/v2/intake/session/${state.sessionId}/complete`,
        {
          method: "POST",
        },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to complete intake");
      }
      const data = await res.json();
      setState((prev) => ({ ...prev, status: "completed" }));

      // Best-effort fetch rank from profile endpoint
      let rank: { position: number; of: number } | null = null;
      try {
        const profileRes = await fetchWithRetry(
          `/api/v2/intake/session/${state.sessionId}/profile`,
          {},
        );
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          rank = profileData.rank ?? null;
        }
      } catch {
        /* non-blocking — rank is optional */
      }

      setResults({
        score: data.score,
        explainability: data.explainability,
        actionPlan: data.actionPlan,
        sessionId: state.sessionId ?? undefined,
        rank,
      });
      // Clear the draft on successful completion
      clearDraft();
    } catch (err: any) {
      setState((prev) => ({ ...prev, error: err.message, status: "error" }));
    }
  }, [state.sessionId]);

  // Handle next step
  const handleNext = useCallback(
    async (moduleId: ModuleId, data: Record<string, unknown>) => {
      // Start session on first submit if needed
      if (!state.sessionId) {
        await startSession();
      }

      const result = await saveModule(moduleId, data);
      if (!result) return;

      const nextStep = state.currentStep + 1;
      if (nextStep >= modules.length) {
        // All modules done — go to review screen instead of completing immediately
        setState((prev) => ({ ...prev, status: "review" }));
      } else {
        setState((prev) => ({ ...prev, currentStep: nextStep }));
      }
    },
    [
      state.sessionId,
      state.currentStep,
      modules.length,
      startSession,
      saveModule,
    ],
  );

  // Handle back
  const handleBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
      error: null,
    }));
  }, []);

  // Handle skip (for optional modules)
  const handleSkip = useCallback(() => {
    const nextStep = state.currentStep + 1;
    if (nextStep >= modules.length) {
      setState((prev) => ({ ...prev, status: "review" }));
    } else {
      setState((prev) => ({ ...prev, currentStep: nextStep }));
    }
  }, [state.currentStep, modules.length]);

  // Handle clicking a step indicator to jump to that step
  const handleStepClick = useCallback((stepIndex: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: stepIndex,
      status: "in_progress",
      error: null,
    }));
  }, []);

  // Handle edit from review screen — jump back to the selected step
  const handleEditFromReview = useCallback((stepIndex: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: stepIndex,
      status: "in_progress",
      error: null,
    }));
  }, []);

  // Handle submit from review screen
  const handleReviewSubmit = useCallback(() => {
    completeIntake();
  }, [completeIntake]);

  if (loading) {
    return <SkeletonLoader />;
  }

  if (state.status === "completed" && results) {
    return <WizardResults results={results} />;
  }

  if (state.status === "review" || state.status === "submitting") {
    return (
      <WizardReview
        modules={modules}
        moduleData={state.moduleData}
        moduleLabels={MODULE_LABELS}
        onEditStep={handleEditFromReview}
        onSubmit={handleReviewSubmit}
        isSubmitting={state.status === "submitting"}
      />
    );
  }

  const currentModule = modules[state.currentStep];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {state.dvSafeMode && <QuickExitButton />}
      <SaveToast show={showSaveToast} />

      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Care2Connect Intake
          </h1>
          <p className="mt-2 text-gray-600">
            This assessment helps us understand your situation and connect you
            with the right resources. Your information is kept confidential.
          </p>
        </div>

        {/* Draft recovery banner */}
        {pendingDraft && (
          <DraftRecoveryBanner
            onRestore={handleRestoreDraft}
            onDiscard={handleDiscardDraft}
          />
        )}

        <WizardProgress
          modules={modules}
          currentStep={state.currentStep}
          completedModules={state.completedModules}
          moduleLabels={MODULE_LABELS}
          onStepClick={handleStepClick}
        />

        {state.error && (
          <div
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
            role="alert"
          >
            <p className="text-red-800 text-sm">{state.error}</p>
            <button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  error: null,
                  status: prev.sessionId ? "in_progress" : "idle",
                }))
              }
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              aria-label="Dismiss error and try again"
            >
              Dismiss
            </button>
          </div>
        )}

        {currentModule && (
          <WizardModule
            module={currentModule}
            label={MODULE_LABELS[currentModule.id]}
            savedData={state.moduleData[currentModule.id]}
            isFirst={state.currentStep === 0}
            isLast={state.currentStep === modules.length - 1}
            isSubmitting={false}
            onNext={(data) => handleNext(currentModule.id, data)}
            onBack={handleBack}
            onSkip={!currentModule.required ? handleSkip : undefined}
          />
        )}
      </div>
    </div>
  );
}
