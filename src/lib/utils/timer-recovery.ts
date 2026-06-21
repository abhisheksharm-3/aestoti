import type { PomodoroModeType } from '$lib/types';

/** Serializable timer state, persisted so a reload can resume a live session. */
export type TimerSnapshotType = {
  currentMode: PomodoroModeType;
  focusSessionCount: number;
  isRunning: boolean;
  deadline: number | null;
  modeStartTime: string | null;
};

/** Outcome of evaluating a persisted snapshot: whether to resume, and with how many seconds left. */
export type TimerRecoveryType = {
  resume: boolean;
  remainingSeconds: number;
};

/**
 * Decide what to do with a persisted snapshot on load. Pure so it can be tested
 * without a browser: resume only a session that was running and whose absolute
 * deadline is still in the future; otherwise the caller resets the mode.
 */
export function computeTimerRecovery(
  snap: TimerSnapshotType,
  nowMs: number
): TimerRecoveryType | null {
  if (!snap.isRunning || snap.deadline == null) return null;
  const remaining = Math.round((snap.deadline - nowMs) / 1000);
  return remaining > 0
    ? { resume: true, remainingSeconds: remaining }
    : { resume: false, remainingSeconds: 0 };
}
