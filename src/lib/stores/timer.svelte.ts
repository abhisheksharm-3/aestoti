import { browser } from '$app/environment';
import { settings } from './settings.svelte';
import { writeStorage } from '$lib/utils/storage';
import type { PomodoroModeType, TimerStateType, SessionCompleteCallbackType } from '$lib/types';

const STORAGE_KEY = 'aestoti_timer';

/** Serializable timer state, persisted so a reload can resume a live session. */
export type TimerSnapshot = {
  currentMode: PomodoroModeType;
  focusSessionCount: number;
  isRunning: boolean;
  deadline: number | null;
  modeStartTime: string | null;
};

/**
 * Decide what to do with a persisted snapshot on load. Pure so it can be tested
 * without a browser: resume only a session that was running and whose absolute
 * deadline is still in the future; otherwise the caller resets the mode.
 */
export function computeTimerRecovery(
  snap: TimerSnapshot,
  nowMs: number
): { resume: boolean; remainingSeconds: number } | null {
  if (!snap.isRunning || snap.deadline == null) return null;
  const remaining = Math.round((snap.deadline - nowMs) / 1000);
  return remaining > 0
    ? { resume: true, remainingSeconds: remaining }
    : { resume: false, remainingSeconds: 0 };
}

let state = $state<TimerStateType>({
  currentMode: 'focus',
  remainingSeconds: 25 * 60,
  isRunning: false,
  focusSessionCount: 0
});

let intervalId: number | undefined;
let modeStartTime: Date | undefined;
let deadline: number | undefined;
let onSessionComplete: SessionCompleteCallbackType | undefined;
let visibilityHandler: (() => void) | null = null;
// True when the most recent mode change came from a natural timer completion,
// false when it came from a manual skip — so the UI only chimes on completion.
let lastTransitionCompleted = false;

function getModeDuration(mode: PomodoroModeType): number {
  const s = settings.current;
  switch (mode) {
    case 'focus': return s.focusLength * 60;
    case 'shortBreak': return s.shortLength * 60;
    case 'longBreak': return s.longLength * 60;
  }
}

function getNextMode(mode: PomodoroModeType, focusCount: number): PomodoroModeType {
  if (mode !== 'focus') return 'focus';
  return (focusCount + 1) % settings.current.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
}

function stopInterval(): void {
  if (intervalId) { clearInterval(intervalId); intervalId = undefined; }
}

function persistRunState(): void {
  if (!browser) return;
  const snap: TimerSnapshot = {
    currentMode: state.currentMode,
    focusSessionCount: state.focusSessionCount,
    isRunning: state.isRunning,
    deadline: deadline ?? null,
    modeStartTime: modeStartTime ? modeStartTime.toISOString() : null
  };
  writeStorage(STORAGE_KEY, JSON.stringify(snap));
}

function restoreRunState(): void {
  let snap: TimerSnapshot | null = null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) snap = JSON.parse(stored) as TimerSnapshot;
  } catch {
    snap = null;
  }
  if (!snap) {
    state.remainingSeconds = getModeDuration('focus');
    return;
  }
  // Restore mode + cadence so the long-break rhythm survives a reload.
  state.currentMode = snap.currentMode;
  state.focusSessionCount = snap.focusSessionCount;
  const recovery = computeTimerRecovery(snap, Date.now());
  const fullDuration = getModeDuration(state.currentMode);
  // Resume only a plausible deadline. A remaining span longer than the mode's
  // own length means a stale/tampered snapshot (e.g. the clock moved backward);
  // resuming it would later record a wildly inflated session, so reset instead.
  if (recovery?.resume && recovery.remainingSeconds <= fullDuration) {
    state.remainingSeconds = recovery.remainingSeconds;
    // Keep the original start time so the resumed session records its true span.
    modeStartTime = snap.modeStartTime ? new Date(snap.modeStartTime) : new Date();
    timer.start();
  } else {
    state.remainingSeconds = fullDuration;
  }
}

export const timer = {
  get state() { return state; },

  get formattedTime(): { minutes: string; seconds: string } {
    return {
      minutes: String(Math.floor(state.remainingSeconds / 60)).padStart(2, '0'),
      seconds: String(state.remainingSeconds % 60).padStart(2, '0')
    };
  },

  get totalSeconds(): number {
    return getModeDuration(state.currentMode);
  },

  get lastTransitionCompleted(): boolean {
    return lastTransitionCompleted;
  },

  setOnSessionComplete(callback: SessionCompleteCallbackType): void {
    onSessionComplete = callback;
  },

  initialize(): void {
    if (browser) restoreRunState();
    else state.remainingSeconds = getModeDuration('focus');
    // Guard against re-adding on re-init (client nav / HMR) — see destroy().
    if (browser && !visibilityHandler) {
      visibilityHandler = () => {
        if (!document.hidden) timer.resync();
      };
      document.addEventListener('visibilitychange', visibilityHandler);
    }
  },

  start(): void {
    if (!browser) return;
    if (!modeStartTime) modeStartTime = new Date();
    deadline = Date.now() + state.remainingSeconds * 1000;
    state.isRunning = true;
    persistRunState();
    // Repaint from the wall clock — do NOT count down a local variable.
    intervalId = window.setInterval(() => {
      // Bail if the mode was already completed (e.g. by resync) and the deadline
      // cleared — prevents a queued tick from double-firing handleModeComplete.
      if (deadline === undefined) return;
      const remaining = Math.round((deadline - Date.now()) / 1000);
      if (remaining <= 0) {
        state.remainingSeconds = 0;
        this.handleModeComplete(true);
        return;
      }
      state.remainingSeconds = remaining;
    }, 250);
  },

  pause(): void {
    if (deadline !== undefined) {
      state.remainingSeconds = Math.max(0, Math.round((deadline - Date.now()) / 1000));
    }
    stopInterval();
    deadline = undefined;
    state.isRunning = false;
    persistRunState();
  },

  resync(): void {
    if (!state.isRunning || deadline === undefined) return;
    const remaining = Math.round((deadline - Date.now()) / 1000);
    if (remaining <= 0) {
      state.remainingSeconds = 0;
      this.handleModeComplete(true);
    } else {
      state.remainingSeconds = remaining;
    }
  },

  toggle(): void {
    state.isRunning ? this.pause() : this.start();
  },

  handleModeComplete(isCompleted: boolean): void {
    stopInterval();
    state.isRunning = false;
    lastTransitionCompleted = true;
    if (modeStartTime) onSessionComplete?.(state.currentMode, modeStartTime, new Date(), isCompleted);
    const newFocusCount =
      state.currentMode === 'focus' ? state.focusSessionCount + 1 : state.focusSessionCount;
    const nextMode = getNextMode(state.currentMode, state.focusSessionCount);
    state.currentMode = nextMode;
    state.remainingSeconds = getModeDuration(nextMode);
    state.focusSessionCount = newFocusCount;
    modeStartTime = undefined;
    deadline = undefined;
    if (settings.current.isAutoTime) this.start();
    else persistRunState();
  },

  skip(): void {
    stopInterval();
    state.isRunning = false;
    lastTransitionCompleted = false;
    if (modeStartTime) onSessionComplete?.(state.currentMode, modeStartTime, new Date(), false);
    // A skipped (abandoned) focus does NOT earn progress toward the long break,
    // so the cadence counter is left untouched and a skip always lands on a short
    // break. Only handleModeComplete (a finished focus) advances focusSessionCount.
    const nextMode: PomodoroModeType = state.currentMode === 'focus' ? 'shortBreak' : 'focus';
    state.currentMode = nextMode;
    state.remainingSeconds = getModeDuration(nextMode);
    modeStartTime = undefined;
    deadline = undefined;
    persistRunState();
  },

  restart(): void {
    const wasRunning = state.isRunning;
    stopInterval();
    state.isRunning = false;
    state.remainingSeconds = getModeDuration(state.currentMode);
    modeStartTime = undefined;
    deadline = undefined;
    if (wasRunning) this.start();
    else persistRunState();
  },

  syncWithSettings(): void {
    if (!state.isRunning && !modeStartTime) {
      state.remainingSeconds = getModeDuration(state.currentMode);
    }
  },

  destroy(): void {
    stopInterval();
    if (browser && visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler);
      visibilityHandler = null;
    }
  }
};
