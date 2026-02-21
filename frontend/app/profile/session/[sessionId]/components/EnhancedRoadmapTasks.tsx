"use client";

import { useState, useEffect } from "react";

// Task priority order for sorting
const PRIORITY_ORDER = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
} as const;

// Categories that are most relevant for level advancement
const ADVANCEMENT_CATEGORIES = [
  "housing",
  "financial_stability",
  "employment",
  "healthcare",
  "benefits",
  "safety",
];

interface Task {
  title: string;
  description: string;
  priority?: string;
  category?: string;
  horizon?: "immediate" | "short_term" | "medium_term";
}

interface ActionPlan {
  immediateTasks: Task[];
  shortTermTasks: Task[];
  mediumTermTasks: Task[];
}

interface EnhancedRoadmapTasksProps {
  actionPlan: ActionPlan;
  currentLevel: number;
  nextLevel: number | null;
  sessionId: string;
}

// Local storage helpers
const getTaskCompletion = (sessionId: string, taskId: string): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const key = `c2c_task_${sessionId}`;
    const data = localStorage.getItem(key);
    const completions = data ? JSON.parse(data) : {};
    return completions[taskId] === true;
  } catch {
    return false;
  }
};

const setTaskCompletion = (
  sessionId: string,
  taskId: string,
  completed: boolean,
): void => {
  if (typeof window === "undefined") return;
  try {
    const key = `c2c_task_${sessionId}`;
    const data = localStorage.getItem(key);
    const completions = data ? JSON.parse(data) : {};
    if (completed) {
      completions[taskId] = true;
    } else {
      delete completions[taskId];
    }
    localStorage.setItem(key, JSON.stringify(completions));
  } catch (err) {
    console.error("Failed to save task completion:", err);
  }
};

// Generate deterministic task ID from title and description
const generateTaskId = (task: Task, horizon: string, index: number): string => {
  const text = `${task.title}_${task.description}_${horizon}`.toLowerCase();
  return text.replace(/[^a-z0-9_]/g, "").substring(0, 50) + `_${index}`;
};

// Sort tasks by priority within each horizon
const sortTasksByPriority = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const aPriority =
      PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] || 5;
    const bPriority =
      PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] || 5;
    return aPriority - bPriority;
  });
};

// Identify tasks most relevant to advancement
const getAdvancementTasks = (tasks: Task[], maxTasks: number = 5): Task[] => {
  const scored = tasks.map((task) => {
    let score = 0;
    // Higher priority gets higher score
    if (task.priority === "critical") score += 4;
    else if (task.priority === "high") score += 3;
    else if (task.priority === "medium") score += 2;
    else if (task.priority === "low") score += 1;

    // Advancement categories get bonus score
    if (task.category && ADVANCEMENT_CATEGORIES.includes(task.category)) {
      score += 2;
    }

    return { task, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxTasks)
    .map((item) => item.task);
};

function TaskItem({
  task,
  taskId,
  sessionId,
  isAdvancement = false,
}: {
  task: Task;
  taskId: string;
  sessionId: string;
  isAdvancement?: boolean;
}) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCompleted(getTaskCompletion(sessionId, taskId));
  }, [sessionId, taskId]);

  const handleToggleComplete = () => {
    const newCompleted = !completed;
    setCompleted(newCompleted);
    setTaskCompletion(sessionId, taskId, newCompleted);
  };

  const priorityColor =
    {
      critical: "text-red-600",
      high: "text-orange-600",
      medium: "text-yellow-600",
      low: "text-green-600",
    }[task.priority || ""] || "text-gray-600";

  return (
    <div
      className={`p-3 rounded-lg border transition-opacity ${
        completed
          ? "bg-gray-50 border-gray-200 opacity-75"
          : isAdvancement
            ? "bg-indigo-50 border-indigo-200"
            : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggleComplete}
          role="checkbox"
          aria-checked={completed}
          aria-label={`Mark "${task.title}" as ${completed ? "incomplete" : "complete"}`}
          className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
            completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-blue-400"
          }`}
        >
          {completed && (
            <span className="text-xs" aria-hidden="true">
              ✓
            </span>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p
              className={`text-sm font-medium ${completed ? "line-through text-gray-500" : "text-gray-900"}`}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isAdvancement && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                  Key
                </span>
              )}
              {task.priority && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor} bg-gray-100`}
                  aria-label={`Priority: ${task.priority}`}
                >
                  {task.priority}
                </span>
              )}
            </div>
          </div>
          <p
            className={`text-xs ${completed ? "text-gray-400" : "text-gray-600"}`}
          >
            {task.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EnhancedRoadmapTasks({
  actionPlan,
  currentLevel,
  nextLevel,
  sessionId,
}: EnhancedRoadmapTasksProps) {
  const allTasks = [
    ...actionPlan.immediateTasks.map((t) => ({
      ...t,
      horizon: "immediate" as const,
    })),
    ...actionPlan.shortTermTasks.map((t) => ({
      ...t,
      horizon: "short_term" as const,
    })),
    ...actionPlan.mediumTermTasks.map((t) => ({
      ...t,
      horizon: "medium_term" as const,
    })),
  ];

  // Get tasks most relevant for advancement (if next level exists)
  const advancementTasks = nextLevel ? getAdvancementTasks(allTasks, 5) : [];

  const sortedImmediate = sortTasksByPriority(actionPlan.immediateTasks);
  const sortedShortTerm = sortTasksByPriority(actionPlan.shortTermTasks);
  const sortedMediumTerm = sortTasksByPriority(actionPlan.mediumTermTasks);

  return (
    <div className="space-y-6">
      {/* Advancement Highlights */}
      {advancementTasks.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-indigo-700 mb-3 flex items-center gap-2">
            <span aria-hidden="true">⭐</span> Key Tasks for Level {nextLevel}{" "}
            Advancement
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
              {advancementTasks.length} prioritized
            </span>
          </h4>
          <div className="space-y-2">
            {advancementTasks.map((task, i) => (
              <TaskItem
                key={`advancement_${i}`}
                task={task}
                taskId={generateTaskId(task, "advancement", i)}
                sessionId={sessionId}
                isAdvancement={true}
              />
            ))}
          </div>
          <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <p className="text-xs text-indigo-700">
              These tasks are identified as most relevant for moving from Level{" "}
              {currentLevel} to Level {nextLevel} based on priority and
              category.
            </p>
          </div>
        </div>
      )}

      {/* Immediate Tasks */}
      {sortedImmediate.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-red-700 mb-2">
            <span aria-hidden="true">🔴</span> Immediate (0–24 hours) —{" "}
            {sortedImmediate.length} task(s)
          </h4>
          <div className="ml-4 space-y-2">
            {sortedImmediate.map((task, i) => (
              <TaskItem
                key={`immediate_${i}`}
                task={task}
                taskId={generateTaskId(task, "immediate", i)}
                sessionId={sessionId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Short-Term Tasks */}
      {sortedShortTerm.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-orange-700 mb-2">
            <span aria-hidden="true">🟠</span> Short-Term (1–7 days) —{" "}
            {sortedShortTerm.length} task(s)
          </h4>
          <div className="ml-4 space-y-2">
            {sortedShortTerm.map((task, i) => (
              <TaskItem
                key={`short_term_${i}`}
                task={task}
                taskId={generateTaskId(task, "short_term", i)}
                sessionId={sessionId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Medium-Term Tasks */}
      {sortedMediumTerm.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-blue-700 mb-2">
            <span aria-hidden="true">🔵</span> Medium-Term (30–90 days) —{" "}
            {sortedMediumTerm.length} task(s)
          </h4>
          <div className="ml-4 space-y-2">
            {sortedMediumTerm.map((task, i) => (
              <TaskItem
                key={`medium_term_${i}`}
                task={task}
                taskId={generateTaskId(task, "medium_term", i)}
                sessionId={sessionId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Local Storage Privacy Notice */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Privacy Note:</strong> Task completion status is stored
          locally in your browser only. No personal information is sent to our
          servers when you check tasks as complete.
        </p>
      </div>
    </div>
  );
}
