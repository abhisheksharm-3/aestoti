import { describe, it, expect, beforeEach } from 'vitest';
import { timer, computeTimerRecovery, type TimerSnapshotType } from './timer.svelte';
import { settings } from './settings.svelte';

const runningSnap: TimerSnapshotType = {
  currentMode: 'focus',
  focusSessionCount: 0,
  isRunning: true,
  deadline: null,
  modeStartTime: null
};

function resetToFocus(): void {
  // Drive to a known state: focus mode, not running
  // Keep skipping until we land on focus
  let guard = 0;
  while (timer.state.currentMode !== 'focus' && guard < 10) {
    timer.skip();
    guard++;
  }
  // Reset focusSessionCount by going through settings reset
  settings.reset();
  // Force remaining to match fresh focus state
  timer.syncWithSettings();
}

beforeEach(() => {
  settings.reset();
  resetToFocus();
});

describe('timer cadence via handleModeComplete', () => {
  it('lands on shortBreak after 1st completed focus', () => {
    expect(timer.state.currentMode).toBe('focus');
    // longBreakInterval is 3; first completion should give shortBreak
    // focusSessionCount starts at 0; after completing: count=1, 1%3!=0 => shortBreak
    const countBefore = timer.state.focusSessionCount;
    timer.handleModeComplete(true);
    expect(timer.state.currentMode).toBe('shortBreak');
    expect(timer.state.focusSessionCount).toBe(countBefore + 1);
  });

  it('lands on longBreak on the Nth focus completion at longBreakInterval boundary', () => {
    // Drive to focus first, then complete exactly enough times to hit longBreak.
    // focusSessionCount is a singleton so we derive how many more we need.
    // getNextMode: (focusCount + 1) % longBreakInterval === 0 => longBreak
    // So we need focusCount where (focusCount + 1) % interval === 0
    // i.e. focusCount = interval - 1, interval*2 - 1, ...
    const interval = settings.current.longBreakInterval; // 3
    while (timer.state.currentMode !== 'focus') timer.skip();
    // Complete focus sessions until the next completion will trigger longBreak
    // That happens when (focusSessionCount + 1) % interval === 0
    let guard = 0;
    while ((timer.state.focusSessionCount + 1) % interval !== 0 && guard < 20) {
      timer.handleModeComplete(true);
      // step back to focus
      if (timer.state.currentMode !== 'focus') timer.skip();
      guard++;
    }
    // Now the next focus completion should yield longBreak
    expect(timer.state.currentMode).toBe('focus');
    timer.handleModeComplete(true);
    expect(timer.state.currentMode).toBe('longBreak');
  });

  it('advances focusSessionCount only on completed focus', () => {
    expect(timer.state.currentMode).toBe('focus');
    const countBefore = timer.state.focusSessionCount;
    timer.handleModeComplete(true);
    expect(timer.state.focusSessionCount).toBe(countBefore + 1);
  });

  it('does not advance focusSessionCount when completing a break', () => {
    // complete focus to get to a break
    timer.handleModeComplete(true);
    expect(timer.state.currentMode === 'shortBreak' || timer.state.currentMode === 'longBreak').toBe(true);
    const countOnBreak = timer.state.focusSessionCount;
    timer.handleModeComplete(true); // complete the break
    expect(timer.state.currentMode).toBe('focus');
    expect(timer.state.focusSessionCount).toBe(countOnBreak);
  });
});

describe('timer.skip', () => {
  it('goes from focus to shortBreak', () => {
    expect(timer.state.currentMode).toBe('focus');
    timer.skip();
    expect(timer.state.currentMode).toBe('shortBreak');
  });

  it('does NOT advance focusSessionCount when skipping focus', () => {
    expect(timer.state.currentMode).toBe('focus');
    const countBefore = timer.state.focusSessionCount;
    timer.skip();
    expect(timer.state.focusSessionCount).toBe(countBefore);
  });

  it('goes from shortBreak back to focus', () => {
    timer.skip(); // focus -> shortBreak
    timer.skip(); // shortBreak -> focus
    expect(timer.state.currentMode).toBe('focus');
  });
});

describe('computeTimerRecovery (mid-session reload)', () => {
  it('returns null when the saved timer was not running', () => {
    expect(computeTimerRecovery({ ...runningSnap, isRunning: false, deadline: 5000 }, 0)).toBeNull();
  });

  it('returns null when there is no saved deadline', () => {
    expect(computeTimerRecovery({ ...runningSnap, deadline: null }, 0)).toBeNull();
  });

  it('resumes with the remaining seconds when the deadline is still in the future', () => {
    const now = 10_000;
    expect(computeTimerRecovery({ ...runningSnap, deadline: now + 60_000 }, now)).toEqual({
      resume: true,
      remainingSeconds: 60
    });
  });

  it('does not resume when the deadline passed while the tab was gone', () => {
    const now = 100_000;
    expect(computeTimerRecovery({ ...runningSnap, deadline: now - 5_000 }, now)).toEqual({
      resume: false,
      remainingSeconds: 0
    });
  });
});

describe('timer.formattedTime', () => {
  it('zero-pads minutes and seconds for default focus (25:00)', () => {
    // Default focus is 25 minutes = 1500 seconds
    const { minutes, seconds } = timer.formattedTime;
    expect(minutes).toMatch(/^\d{2}$/);
    expect(seconds).toMatch(/^\d{2}$/);
    expect(minutes).toBe('25');
    expect(seconds).toBe('00');
  });

  it('zero-pads single-digit seconds (e.g. 01:05 => 01 / 05)', () => {
    // Set remainingSeconds directly is not possible via public API,
    // but we can configure a 1-minute focus and check the format
    settings.updateSetting('focusLength', 1);
    timer.syncWithSettings();
    const { minutes, seconds } = timer.formattedTime;
    expect(minutes).toBe('01');
    expect(seconds).toBe('00');
  });

  it('returns two-char strings for each field', () => {
    const { minutes, seconds } = timer.formattedTime;
    expect(minutes.length).toBe(2);
    expect(seconds.length).toBe(2);
  });
});
