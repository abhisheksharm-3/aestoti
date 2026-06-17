import { browser } from '$app/environment';
import { settings } from './settings.svelte';
import type { PomodoroModeType, TimerStateType, SessionCompleteCallbackType } from '$lib/types';

export const MODE_CONFIG = {
  focus: { title: 'Focus', color: 'focus' },
  shortBreak: { title: 'Short Break', color: 'break' },
  longBreak: { title: 'Long Break', color: 'break' }
} as const;

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

  setOnSessionComplete(callback: SessionCompleteCallbackType): void {
    onSessionComplete = callback;
  },

  initialize(): void {
    state.remainingSeconds = getModeDuration('focus');
    if (browser) {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) this.resync();
      });
    }
  },

  start(): void {
    if (!browser) return;
    if (!modeStartTime) modeStartTime = new Date();
    deadline = Date.now() + state.remainingSeconds * 1000;
    state.isRunning = true;
    // Repaint from the wall clock — do NOT count down a local variable.
    intervalId = window.setInterval(() => {
      const remaining = Math.round(((deadline ?? Date.now()) - Date.now()) / 1000);
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
  },

  skip(): void {
    stopInterval();
    state.isRunning = false;
    if (modeStartTime) onSessionComplete?.(state.currentMode, modeStartTime, new Date(), false);
    // A skipped (abandoned) focus does NOT earn progress toward the long break,
    // so the cadence counter is left untouched and a skip always lands on a short
    // break. Only handleModeComplete (a finished focus) advances focusSessionCount.
    const nextMode: PomodoroModeType = state.currentMode === 'focus' ? 'shortBreak' : 'focus';
    state.currentMode = nextMode;
    state.remainingSeconds = getModeDuration(nextMode);
    modeStartTime = undefined;
    deadline = undefined;
  },

  restart(): void {
    const wasRunning = state.isRunning;
    stopInterval();
    state.isRunning = false;
    state.remainingSeconds = getModeDuration(state.currentMode);
    modeStartTime = undefined;
    deadline = undefined;
    if (wasRunning) this.start();
  },

  syncWithSettings(): void {
    if (!state.isRunning && !modeStartTime) {
      state.remainingSeconds = getModeDuration(state.currentMode);
    }
  },

  destroy(): void {
    stopInterval();
  }
};
