import { browser } from '$app/environment';
import type { PomodoroSessionType, AnalyticsSummaryType, PomodoroModeType } from '$lib/types';
import { generateId } from '$lib/utils/id';
import { dayKey } from '$lib/utils/date';
import { focusOnly, calculateStreak, sessionFocusScore } from '$lib/utils/analytics-utils';
import { parseSessionsImport } from '$lib/utils/import-utils';
import { writeStorage, removeStorage } from '$lib/utils/storage';

const STORAGE_KEY = 'aestoti_sessions';

let sessions = $state<PomodoroSessionType[]>([]);

/**
 * Aggregate focus stats. `longestSession` uses `reduce` rather than
 * `Math.max(...spread)` so a large history can't overflow the call stack.
 */
const summary = $derived.by<AnalyticsSummaryType>(() => {
  const focus = focusOnly(sessions);
  const totalMinutes = focus.reduce((sum, s) => sum + Math.floor(s.durationSeconds / 60), 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const longestSession = focus.reduce((max, s) => Math.max(max, s.durationSeconds), 0);

  return {
    totalSessions: focus.length,
    totalFocusMinutes: totalMinutes,
    averageSessionMinutes: focus.length > 0 ? Math.round(totalMinutes / focus.length) : 0,
    longestSessionMinutes: Math.floor(longestSession / 60),
    totalDays: new Set(focus.map(s => dayKey(s.startTime))).size,
    sessionsToday: focus.filter(s => new Date(s.startTime) >= today).length,
    sessionsThisWeek: focus.filter(s => new Date(s.startTime) >= weekAgo).length,
    currentStreak: calculateStreak(focus)
  };
});

/** Average focus score (0–100) across focus sessions started in the last 7 days. */
const weeklyFocusScore = $derived.by(() => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  const recent = focusOnly(sessions).filter(s => new Date(s.startTime) >= weekAgo);
  if (recent.length === 0) return 0;
  return Math.round(recent.reduce((sum, s) => sum + sessionFocusScore(s), 0) / recent.length);
});

export const analytics = {
  get sessions() {
    return sessions;
  },

  get summary() {
    return summary;
  },

  get weeklyFocusScore() {
    return weeklyFocusScore;
  },

  /** Hydrate sessions from storage through the import validator, so load and import enforce one shape. */
  initialize(): void {
    if (!browser) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) sessions = parseSessionsImport(stored);
    } catch {
      sessions = [];
    }
  },

  recordSession(
    mode: PomodoroModeType,
    startTime: Date,
    endTime: Date,
    isCompleted: boolean
  ): void {
    const session: PomodoroSessionType = {
      id: generateId('session'),
      mode,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationSeconds: Math.floor((endTime.getTime() - startTime.getTime()) / 1000),
      isCompleted
    };
    sessions = [...sessions, session];
    writeStorage(STORAGE_KEY, JSON.stringify(sessions));
  },

  /**
   * Restore sessions from an exported file. `replace` overwrites everything;
   * otherwise incoming sessions are merged, skipping ids already present.
   * Returns how many sessions were added.
   */
  importSessions(incoming: PomodoroSessionType[], replace = false): number {
    if (replace) {
      sessions = [...incoming];
      writeStorage(STORAGE_KEY, JSON.stringify(sessions));
      return incoming.length;
    }
    const existingIds = new Set(sessions.map(s => s.id));
    const fresh = incoming.filter(s => !existingIds.has(s.id));
    sessions = [...sessions, ...fresh];
    writeStorage(STORAGE_KEY, JSON.stringify(sessions));
    return fresh.length;
  },

  addNote(sessionId: string, note: string): void {
    sessions = sessions.map(s => (s.id === sessionId ? { ...s, note } : s));
    writeStorage(STORAGE_KEY, JSON.stringify(sessions));
  },

  clearAll(): void {
    sessions = [];
    removeStorage(STORAGE_KEY);
  }
};
