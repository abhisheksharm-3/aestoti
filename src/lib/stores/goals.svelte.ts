import { browser } from '$app/environment';
import type { DailyGoalType, DailyProgressType, PomodoroSessionType } from '$lib/types';
import { writeStorage } from '$lib/utils/storage';

const STORAGE_KEY = 'aestoti_goals';
const DEFAULT_GOAL: DailyGoalType = { targetSessions: 8, isEnabled: true };

let current = $state<DailyGoalType>({ ...DEFAULT_GOAL });

function persist(): void {
  writeStorage(STORAGE_KEY, JSON.stringify(current));
}

export const goals = {
  get current() { return current; },

  initialize(): void {
    if (!browser) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Partial<DailyGoalType>;
      const target = Number(parsed.targetSessions);
      current = {
        targetSessions: Number.isFinite(target)
          ? Math.min(24, Math.max(1, target))
          : DEFAULT_GOAL.targetSessions,
        isEnabled: typeof parsed.isEnabled === 'boolean' ? parsed.isEnabled : DEFAULT_GOAL.isEnabled
      };
    } catch {
      current = { ...DEFAULT_GOAL };
    }
  },

  /** Set the daily session goal, clamped to 1–24; ignores non-finite input. */
  setTarget(target: number): void {
    if (!Number.isFinite(target)) return;
    current = { ...current, targetSessions: Math.min(24, Math.max(1, target)) };
    persist();
  },

  toggle(): void {
    current = { ...current, isEnabled: !current.isEnabled };
    persist();
  }
};

/** Compute today's goal progress — completed focus sessions against the target — from a session list. */
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
