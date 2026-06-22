import { browser } from '$app/environment';
import { settings } from './settings.svelte';
import { writeStorage } from '$lib/utils/storage';
import type {
  PomodoroModeType,
  TimerStateType,
  SessionCompleteCallbackType,
  TimerSnapshotType
} from '$lib/types';
import { computeTimerRecovery } from '$lib/utils/timer-recovery';

const STORAGE_KEY = 'aestoti_timer';

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
/** True when the last mode change came from a natural completion, false on a manual skip — so the UI only chimes on completion. */
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
  const snap: TimerSnapshotType = {
    currentMode: state.currentMode,
    focusSessionCount: state.focusSessionCount,
    isRunning: state.isRunning,
    deadline: deadline ?? null,
    modeStartTime: modeStartTime ? modeStartTime.toISOString() : null
  };
  writeStorage(STORAGE_KEY, JSON.stringify(snap));
}

/**
 * Rehydrate timer state from storage. Restores the mode and long-break cadence,
 * and resumes a running session only when its remaining time is plausible — a
 * span longer than the mode's own length signals a stale snapshot (e.g. a
 * backward clock change) and is reset rather than resumed, so a phantom
 * multi-hour session is never recorded. A resumed session keeps its original
 * start time so its recorded span stays true.
 */
function restoreRunState(): void {
  let snap: TimerSnapshotType | null = null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) snap = JSON.parse(stored) as TimerSnapshotType;
  } catch {
    snap = null;
  }
  if (!snap) {
    state.remainingSeconds = getModeDuration('focus');
    return;
  }
  state.currentMode = snap.currentMode;
  state.focusSessionCount = snap.focusSessionCount;
  const recovery = computeTimerRecovery(snap, Date.now());
  const fullDuration = getModeDuration(state.currentMode);
  if (recovery?.resume && recovery.remainingSeconds <= fullDuration) {
    state.remainingSeconds = recovery.remainingSeconds;
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

  /** Whole-minute length of the current mode's block, for display. */
  get totalMinutes(): number {
    return Math.round(getModeDuration(state.currentMode) / 60);
  },

  /** Elapsed progress through the current block, clamped to 0–100. */
  get progressPercent(): number {
    const total = getModeDuration(state.currentMode);
    return total > 0 ? Math.min(100, ((total - state.remainingSeconds) / total) * 100) : 0;
  },

  get lastTransitionCompleted(): boolean {
    return lastTransitionCompleted;
  },

  setOnSessionComplete(callback: SessionCompleteCallbackType): void {
    onSessionComplete = callback;
  },

  /**
   * Hydrate from storage and attach a visibility listener that resyncs the
   * countdown when the tab regains focus. The listener is added once (guarded
   * against client-nav / HMR re-init) and removed in destroy().
   */
  initialize(): void {
    if (browser) restoreRunState();
    else state.remainingSeconds = getModeDuration('focus');
    if (browser && !visibilityHandler) {
      visibilityHandler = () => {
        if (!document.hidden) timer.resync();
      };
      document.addEventListener('visibilitychange', visibilityHandler);
    }
  },

  /**
   * Start (or resume) the countdown from an absolute wall-clock deadline, so the
   * display stays accurate across tab suspension instead of drifting off a local
   * counter. The tick bails when the deadline has been cleared (e.g. already
   * completed by resync), preventing a queued interval from firing
   * handleModeComplete a second time.
   */
  start(): void {
    if (!browser) return;
    if (!modeStartTime) modeStartTime = new Date();
    deadline = Date.now() + state.remainingSeconds * 1000;
    state.isRunning = true;
    persistRunState();
    intervalId = window.setInterval(() => {
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

  /**
   * Abandon the current mode without completing it. A skipped focus earns no
   * progress toward the long break — the cadence counter is left untouched, so a
   * skip always lands on a short break; only a finished focus advances it.
   */
  skip(): void {
    stopInterval();
    state.isRunning = false;
    lastTransitionCompleted = false;
    if (modeStartTime) onSessionComplete?.(state.currentMode, modeStartTime, new Date(), false);
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
