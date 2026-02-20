'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SpectrumStepper from './components/SpectrumStepper';

/* ─────────────────────────────────────────────────────────────
   Session Profile Page — /profile/session/[sessionId]

   Shows the completed session's stability assessment results:
     • 6-step stability spectrum (SpectrumStepper)
     • Profile summary (score, level, tier, rank)
     • "How to Advance" roadmap with stored action plan tasks
     • Chat placeholder button (D5 — non-functional, Coming Soon)
   
   No PII. No auth required (anonymous session ID acts as key).
   Relative API paths — works behind Caddy/Cloudflare.
   ───────────────────────────────────────────────────────────── */

// ── Types ──────────────────────────────────────────────────────

interface ProfileData {
  sessionId: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  profile: {
    totalScore: number | null;
    stabilityLevel: number | null;
    priorityTier: string | null;
    policyPackVersion: string | null;
  };
  topFactors: string[];
  rank: {
    position: number;
    of: number;
    global: { position: number; of: number };
    level: { position: number; of: number; level: number };
    sortKey: string;
    excludesTestSessions: boolean;
    fromSnapshot: boolean;
  } | null;
  audit: { count: number; lastEventType: string | null };
  roadmap?: {
    currentLevel: number;
    nextLevel: number | null;
    actionPlan: {
      immediateTasks: ActionTask[];
      shortTermTasks: ActionTask[];
      mediumTermTasks: ActionTask[];
    };
  };
}

interface ActionTask {
  title: string;
  description: string;
  priority: string;
  category: string;
}

// ── Constants ──────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  CRITICAL:  'bg-red-100 border-red-300 text-red-800',
  HIGH:      'bg-orange-100 border-orange-300 text-orange-800',
  MODERATE:  'bg-yellow-100 border-yellow-300 text-yellow-800',
  LOW:       'bg-green-100 border-green-300 text-green-800',
  STABLE:    'bg-emerald-100 border-emerald-300 text-emerald-800',
};

const LEVEL_DESCRIPTIONS: Record<number, string> = {
  0: 'Immediate crisis — unsheltered or in danger tonight.',
  1: 'Severe risk — at imminent risk of losing housing within days.',
  2: 'High risk — significant barriers to stability, needs active support.',
  3: 'Moderate risk — some instability, could benefit from targeted resources.',
  4: 'Low risk — mostly stable with minor concerns.',
  5: 'Stable — housing secure, minimal ongoing needs.',
};

const LEVEL_LABELS: Record<number, string> = {
  0: 'Crisis',
  1: 'Severe Risk',
  2: 'High Risk',
  3: 'Moderate Risk',
  4: 'Low Risk',
  5: 'Stable',
};

/** Static fallback advancement guidance per level */
const ADVANCEMENT_GUIDANCE: Record<number, { heading: string; steps: string[] }> = {
  0: {
    heading: 'Moving from Crisis → Severe Risk',
    steps: [
      'Connect with emergency shelter or safe housing tonight',
      'Reach out to a local crisis hotline or drop-in center',
      'Work with a case coordinator to secure temporary placement',
    ],
  },
  1: {
    heading: 'Moving from Severe Risk → High Risk',
    steps: [
      'Stabilize your current living situation for at least 7 days',
      'Apply for emergency rental assistance or rapid re-housing programs',
      'Connect with healthcare or mental health services if needed',
    ],
  },
  2: {
    heading: 'Moving from High Risk → Moderate Risk',
    steps: [
      'Establish a consistent income source or benefits enrollment',
      'Work with a housing navigator on permanent housing options',
      'Address outstanding legal or documentation barriers',
    ],
  },
  3: {
    heading: 'Moving from Moderate Risk → Low Risk',
    steps: [
      'Build up an emergency savings fund (even small amounts help)',
      'Strengthen community connections and support networks',
      'Follow up on healthcare and wellness appointments',
    ],
  },
  4: {
    heading: 'Moving from Low Risk → Stable',
    steps: [
      'Maintain consistent rent payments and lease compliance',
      'Continue building financial literacy and budgeting habits',
      'Explore peer mentoring or volunteering opportunities',
    ],
  },
  5: {
    heading: 'Maintaining Stability',
    steps: [
      'Continue your current stability practices',
      'Consider mentoring others navigating housing challenges',
      'Stay connected with community resources for ongoing support',
    ],
  },
};

// ── Component ──────────────────────────────────────────────────

export default function SessionProfilePage() {
  const params = useParams();
  const sessionId = (params?.sessionId as string) || '';

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [chatToastVisible, setChatToastVisible] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!sessionId) {
      setError('No session ID provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use relative path — proxied by Next.js rewrites or Caddy in production
      const res = await fetch(`/api/v2/intake/session/${sessionId}/profile?include=roadmap`, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' },
      });

      if (res.status === 404) {
        setError('Session not found. Please check your session ID.');
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError(`Failed to load profile (HTTP ${res.status}).`);
        setLoading(false);
        return;
      }

      const data: ProfileData = await res.json();

      if (data.status !== 'COMPLETED') {
        setError('This assessment is still in progress. Please complete it first to view your profile.');
        setLoading(false);
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error('[SessionProfile] Fetch failed:', err);
      setError('Unable to load your profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
    }
  };

  const handleChatClick = () => {
    setChatToastVisible(true);
    setTimeout(() => setChatToastVisible(false), 3000);
  };

  // ── Loading State ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile…</p>
        </div>
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Profile Unavailable</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/onboarding/v2"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start New Assessment
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // Derived values
  const level = profile.profile.stabilityLevel ?? 0;
  const tier = profile.profile.priorityTier ?? 'MODERATE';
  const tierClass = TIER_COLORS[tier] || TIER_COLORS.MODERATE;
  const roadmap = profile.roadmap;
  const guidance = ADVANCEMENT_GUIDANCE[level] ?? ADVANCEMENT_GUIDANCE[5];

  // Action plan tasks from roadmap (if available)
  const hasActionPlan = roadmap?.actionPlan && (
    roadmap.actionPlan.immediateTasks.length > 0 ||
    roadmap.actionPlan.shortTermTasks.length > 0 ||
    roadmap.actionPlan.mediumTermTasks.length > 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/onboarding/v2"
            className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 mb-4"
          >
            ← Back to Assessment
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Stability Profile</h1>
          <p className="text-gray-500 text-sm">
            A snapshot of your housing stability assessment and personalized roadmap.
          </p>
        </div>

        {/* Session ID + Privacy Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <span className="text-amber-600 text-lg">🔒</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-amber-800 font-medium mb-1">Your Session ID</p>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="font-mono text-xs bg-amber-100 px-2 py-1 rounded break-all">{sessionId}</code>
                <button
                  onClick={handleCopyId}
                  className="text-xs px-2 py-1 bg-amber-200 hover:bg-amber-300 rounded transition-colors"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-amber-700 mt-2">
                This ID is your private key to this profile. Keep it safe — anyone with this ID can view your results.
                Do not share it publicly.
              </p>
            </div>
          </div>
        </div>

        {/* Stability Level Card */}
        <div className={`rounded-xl border-2 p-6 mb-6 ${tierClass}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">
              Level {level}: {LEVEL_LABELS[level] ?? 'Unknown'}
            </h2>
            <span className="px-3 py-1 rounded-full text-sm font-semibold border">
              {tier}
            </span>
          </div>
          <p className="text-sm">
            {LEVEL_DESCRIPTIONS[level] || 'Assessment complete.'}
          </p>
          {profile.profile.totalScore !== null && (
            <p className="text-xs mt-2 opacity-80">
              Priority Score: {profile.profile.totalScore}/100
            </p>
          )}
        </div>

        {/* Rank Badge */}
        {profile.rank && (
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Priority Rank</p>
              <p className="text-xs text-gray-500">Among all completed assessments</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-600">#{profile.rank.position}</span>
              <span className="text-sm text-gray-400 ml-1">of {profile.rank.of}</span>
              {profile.rank.level && (
                <p className="text-xs text-gray-500 mt-1">
                  Level {profile.rank.level.level}: #{profile.rank.level.position} of {profile.rank.level.of}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Top Factors */}
        {profile.topFactors.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Key Factors</h3>
            <ul className="space-y-2">
              {profile.topFactors.map((factor, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span className="text-sm text-gray-700">{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 6-Step Stability Spectrum */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <SpectrumStepper currentLevel={level} />
        </div>

        {/* How to Advance — Roadmap Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-1 text-lg">How to Advance</h3>
          <p className="text-sm text-gray-500 mb-4">{guidance.heading}</p>

          {/* If we have stored actionPlan tasks from the assessment, show them */}
          {hasActionPlan && roadmap?.actionPlan ? (
            <div className="space-y-4">
              {roadmap.actionPlan.immediateTasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-red-700 mb-2">
                    🔴 Immediate (0–24 hours) — {roadmap.actionPlan.immediateTasks.length} task(s)
                  </h4>
                  {roadmap.actionPlan.immediateTasks.map((task, i) => (
                    <div key={i} className="ml-4 mb-2 p-3 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {roadmap.actionPlan.shortTermTasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-orange-700 mb-2">
                    🟠 Short-Term (1–7 days) — {roadmap.actionPlan.shortTermTasks.length} task(s)
                  </h4>
                  {roadmap.actionPlan.shortTermTasks.map((task, i) => (
                    <div key={i} className="ml-4 mb-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {roadmap.actionPlan.mediumTermTasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-blue-700 mb-2">
                    🔵 Medium-Term (30–90 days) — {roadmap.actionPlan.mediumTermTasks.length} task(s)
                  </h4>
                  {roadmap.actionPlan.mediumTermTasks.map((task, i) => (
                    <div key={i} className="ml-4 mb-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Static fallback guidance */
            <ul className="space-y-2">
              {guidance.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700">{step}</span>
                </li>
              ))}
            </ul>
          )}

          {level < 5 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-700">
                <strong>Next milestone:</strong> Level {level + 1} — {LEVEL_LABELS[level + 1]}. 
                Following these steps can help move your stability assessment forward.
              </p>
            </div>
          )}
        </div>

        {/* What Happens Next */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What Happens Next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• A case coordinator will review your assessment</li>
            <li>• You may be contacted to schedule a follow-up conversation</li>
            <li>• Resource referrals will be sent based on your priorities</li>
            <li>• You can return to this profile anytime with your session ID</li>
          </ul>
        </div>

        {/* Chat Placeholder Button (D5) */}
        <div className="relative mb-6">
          <button
            onClick={handleChatClick}
            className="w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="text-xl">💬</span>
            <span>Chat with Care2Connect Guide</span>
            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full ml-1">Coming Soon</span>
          </button>
          {chatToastVisible && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg animate-bounce">
              Chat feature launching soon — stay tuned!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-400">
            Assessment completed {profile.completedAt ? new Date(profile.completedAt).toLocaleDateString() : 'N/A'}
            {' | '}Policy Pack {profile.profile.policyPackVersion ?? 'v1.0.0'}
          </p>
          <Link
            href="/onboarding/v2"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Start a New Assessment
          </Link>
        </div>
      </div>
    </div>
  );
}
