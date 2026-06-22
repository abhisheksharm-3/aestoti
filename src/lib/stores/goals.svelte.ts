import { browser } from '$app/environment';
import type { DailyGoalType } from '$lib/types';
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
