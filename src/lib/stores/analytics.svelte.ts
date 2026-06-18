import { browser } from '$app/environment';
import type { PomodoroSessionType, AnalyticsSummaryType, PomodoroModeType } from '$lib/types';
import { generateId } from '$lib/utils/id';
import { dayKey } from '$lib/utils/date';
import { writeStorage, removeStorage } from '$lib/utils/storage';

const STORAGE_KEY = 'aestoti_sessions';
const DEFAULT_FOCUS_SECONDS = 25 * 60;

let sessions = $state<PomodoroSessionType[]>([]);

function focusOnly(list: PomodoroSessionType[]): PomodoroSessionType[] {
  return list.filter(s => s.mode === 'focus');
}

function calculateStreak(list: PomodoroSessionType[]): number {
  if (list.length === 0) return 0;
  // Local day keys (YYYY-MM-DD) sort lexicographically; reverse for newest-first.
  const uniqueDays = [...new Set(list.map(s => dayKey(s.startTime)))].sort().reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  // Keep the streak alive while today is still in progress: it only breaks once
  // the most recent active day is older than yesterday.
  if (uniqueDays[0] !== dayKey(today) && uniqueDays[0] !== dayKey(yesterday)) {
    return 0;
  }
  // Parse the anchor as a local midnight (append time so it isn't read as UTC).
  const anchor = new Date(`${uniqueDays[0]}T00:00:00`);
  let streak = 0;
  for (let i = 0; i < uniqueDays.length; i++) {
    const expected = new Date(anchor);
    expected.setDate(anchor.getDate() - i);
    if (uniqueDays[i] === dayKey(expected)) streak++;
    else break;
  }
  return streak;
}

function sessionFocusScore(session: PomodoroSessionType): number {
  const completionBonus = session.isCompleted ? 50 : 0;
  const durationBonus = Math.min(
    50,
    Math.floor((session.durationSeconds / DEFAULT_FOCUS_SECONDS) * 50)
  );
  return completionBonus + durationBonus;
}

export const analytics = {
  get sessions() { return sessions; },

  get summary(): AnalyticsSummaryType {
    const focus = focusOnly(sessions);
    const totalMinutes = focus.reduce((sum, s) => sum + Math.floor(s.durationSeconds / 60), 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    // reduce (not Math.max(...spread)) so a very large history can't overflow the call stack.
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
  },

  get weeklyFocusScore(): number {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    const recent = focusOnly(sessions).filter(s => new Date(s.startTime) >= weekAgo);
    if (recent.length === 0) return 0;
    return Math.round(recent.reduce((sum, s) => sum + sessionFocusScore(s), 0) / recent.length);
  },

  initialize(): void {
    if (!browser) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) sessions = JSON.parse(stored) as PomodoroSessionType[];
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
