import type { TimerSnapshotType, TimerRecoveryType } from '$lib/types';

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
