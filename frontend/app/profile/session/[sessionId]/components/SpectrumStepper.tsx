"use client";

import React from "react";

/* ─────────────────────────────────────────────────────────────
   SpectrumStepper — 6-Step Stability Spectrum (Level 0 → 5)
   
   Visual stepper showing the client's current position on the
   Care2Connect stability spectrum. Lower levels = higher need.
   ───────────────────────────────────────────────────────────── */

interface SpectrumStepperProps {
  currentLevel: number;
}

const LEVELS: {
  level: number;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  ringColor: string;
}[] = [
  {
    level: 0,
    label: "Crisis",
    color: "text-red-700",
    bgColor: "bg-red-600",
    borderColor: "border-red-600",
    ringColor: "ring-red-300",
  },
  {
    level: 1,
    label: "Severe Risk",
    color: "text-red-600",
    bgColor: "bg-red-500",
    borderColor: "border-red-500",
    ringColor: "ring-red-200",
  },
  {
    level: 2,
    label: "High Risk",
    color: "text-orange-600",
    bgColor: "bg-orange-500",
    borderColor: "border-orange-500",
    ringColor: "ring-orange-200",
  },
  {
    level: 3,
    label: "Moderate Risk",
    color: "text-yellow-600",
    bgColor: "bg-yellow-500",
    borderColor: "border-yellow-500",
    ringColor: "ring-yellow-200",
  },
  {
    level: 4,
    label: "Low Risk",
    color: "text-green-600",
    bgColor: "bg-green-500",
    borderColor: "border-green-500",
    ringColor: "ring-green-200",
  },
  {
    level: 5,
    label: "Stable",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500",
    borderColor: "border-emerald-600",
    ringColor: "ring-emerald-200",
  },
];

export default function SpectrumStepper({
  currentLevel,
}: SpectrumStepperProps) {
  const clampedLevel = Math.max(0, Math.min(5, currentLevel));

  return (
    <div className="w-full" role="region" aria-label="Stability Spectrum">
      <h3 className="font-semibold text-gray-900 mb-4 text-lg">
        Your Stability Spectrum
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        The 6-step spectrum shows where you are on the path to housing
        stability. Each level represents a stage — from crisis to stable.
      </p>

      {/* Desktop / Horizontal view */}
      <div className="hidden sm:block">
        <div className="relative flex items-center justify-between">
          {/* Connector line */}
          <div
            className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full"
            aria-hidden="true"
          />
          <div
            className="absolute top-5 left-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${(clampedLevel / 5) * 100}%` }}
            role="progressbar"
            aria-valuenow={clampedLevel}
            aria-valuemin={0}
            aria-valuemax={5}
            aria-label={`Progress: Level ${clampedLevel} of 5`}
          />

          {LEVELS.map(({ level, label, bgColor, ringColor }) => {
            const isCurrent = level === clampedLevel;
            const isPast = level < clampedLevel;
            const isFuture = level > clampedLevel;

            return (
              <div
                key={level}
                className="relative flex flex-col items-center z-10"
                style={{ width: "16.666%" }}
              >
                {/* Node */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-300
                    ${
                      isCurrent
                        ? `${bgColor} text-white ring-4 ${ringColor} scale-125 shadow-lg`
                        : isPast
                          ? `${bgColor} text-white opacity-80`
                          : "bg-gray-200 text-gray-400"
                    }
                  `}
                  aria-label={
                    isCurrent
                      ? `Level ${level}: ${label} — current level`
                      : isPast
                        ? `Level ${level}: ${label} — completed`
                        : `Level ${level}: ${label} — future`
                  }
                >
                  {isPast ? <span aria-hidden="true">✓</span> : level}
                </div>
                {/* Label */}
                <span
                  className={`
                  mt-2 text-xs font-medium text-center leading-tight
                  ${isCurrent ? "text-gray-900 font-bold" : isFuture ? "text-gray-400" : "text-gray-600"}
                `}
                >
                  {label}
                </span>
                {isCurrent && (
                  <span
                    className="mt-1 text-[10px] font-semibold text-blue-600 uppercase tracking-wide"
                    aria-hidden="true"
                  >
                    You are here
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile / Vertical view */}
      <div
        className="sm:hidden space-y-2"
        role="list"
        aria-label="Stability levels"
      >
        {LEVELS.map(({ level, label, color, bgColor, borderColor }) => {
          const isCurrent = level === clampedLevel;
          const isPast = level < clampedLevel;
          const isFuture = level > clampedLevel;

          return (
            <div
              key={level}
              className={`
                flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                ${
                  isCurrent
                    ? `${borderColor} bg-white shadow-md`
                    : isPast
                      ? "border-gray-200 bg-gray-50"
                      : "border-gray-100 bg-gray-50 opacity-60"
                }
              `}
              role="listitem"
              aria-current={isCurrent ? "step" : undefined}
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                  ${
                    isCurrent
                      ? `${bgColor} text-white`
                      : isPast
                        ? `${bgColor} text-white opacity-70`
                        : "bg-gray-200 text-gray-400"
                  }
                `}
                aria-label={
                  isCurrent
                    ? `Level ${level}: ${label} — current`
                    : isPast
                      ? `Level ${level}: ${label} — completed`
                      : `Level ${level}: ${label} — future`
                }
              >
                {isPast ? <span aria-hidden="true">✓</span> : level}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm font-medium ${isCurrent ? color : isFuture ? "text-gray-400" : "text-gray-600"}`}
                >
                  Level {level}: {label}
                </span>
                {isCurrent && (
                  <span
                    className="ml-2 text-[10px] font-semibold text-blue-600 uppercase"
                    aria-hidden="true"
                  >
                    ← You are here
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
