import { browser } from '$app/environment';
import type { DailyGoalType, DailyProgressType, PomodoroSessionType } from '$lib/types';

const STORAGE_KEY = 'aestoti_goals';
const DEFAULT_GOAL: DailyGoalType = { targetSessions: 8, isEnabled: true };

let current = $state<DailyGoalType>({ ...DEFAULT_GOAL });

function persist(): void {
  if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export const goals = {
  get current() { return current; },

  initialize(): void {
    if (!browser) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) current = { ...DEFAULT_GOAL, ...JSON.parse(stored) as DailyGoalType };
    } catch {
      current = { ...DEFAULT_GOAL };
    }
  },

  setTarget(target: number): void {
    current = { ...current, targetSessions: Math.max(1, target) };
    persist();
  },

  toggle(): void {
    current = { ...current, isEnabled: !current.isEnabled };
    persist();
  }
};

/** Pure function — call inside $derived in components */
export function computeDailyProgress(
  sessions: PomodoroSessionType[],
  goal: DailyGoalType
): DailyProgressType {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completed = sessions.filter(
    s => s.mode === 'focus' && s.isCompleted && new Date(s.startTime) >= today
  ).length;
  const percentage =
    goal.targetSessions > 0
      ? Math.min(100, Math.round((completed / goal.targetSessions) * 100))
      : 0;
  return { completed, target: goal.targetSessions, percentage, isGoalMet: completed >= goal.targetSessions };
}
