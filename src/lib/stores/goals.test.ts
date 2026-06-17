import { describe, it, expect } from 'vitest';
import { computeDailyProgress } from './goals.svelte';
import type { PomodoroSessionType, DailyGoalType } from '$lib/types';

function todayISO(): string {
  return new Date().toISOString();
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString();
}

function focusSession(over: Partial<PomodoroSessionType> = {}): PomodoroSessionType {
  return {
    id: 'x',
    mode: 'focus',
    startTime: todayISO(),
    endTime: todayISO(),
    durationSeconds: 1500,
    isCompleted: true,
    ...over
  };
}

const defaultGoal: DailyGoalType = { targetSessions: 4, isEnabled: true };

describe('computeDailyProgress', () => {
  it('counts only today completed focus sessions', () => {
    const sessions = [
      focusSession(),
      focusSession(),
      focusSession({ startTime: yesterdayISO(), endTime: yesterdayISO() }),
      focusSession({ mode: 'shortBreak' }),
      focusSession({ isCompleted: false })
    ];
    const result = computeDailyProgress(sessions, defaultGoal);
    expect(result.completed).toBe(2);
  });

  it('percentage caps at 100 when completed exceeds target', () => {
    const sessions = Array.from({ length: 10 }, () => focusSession());
    const result = computeDailyProgress(sessions, { targetSessions: 4, isEnabled: true });
    expect(result.percentage).toBe(100);
  });

  it('calculates correct percentage below cap', () => {
    const sessions = [focusSession(), focusSession()];
    const result = computeDailyProgress(sessions, { targetSessions: 4, isEnabled: true });
    expect(result.percentage).toBe(50);
  });

  it('isGoalMet is true when completed >= target', () => {
    const sessions = Array.from({ length: 4 }, () => focusSession());
    const result = computeDailyProgress(sessions, defaultGoal);
    expect(result.isGoalMet).toBe(true);
  });

  it('isGoalMet is false when completed < target', () => {
    const sessions = [focusSession()];
    const result = computeDailyProgress(sessions, defaultGoal);
    expect(result.isGoalMet).toBe(false);
  });

  it('returns percentage 0 when target is 0 (no divide-by-zero)', () => {
    const sessions = [focusSession()];
    const result = computeDailyProgress(sessions, { targetSessions: 0, isEnabled: true });
    expect(result.percentage).toBe(0);
  });

  it('returns 0 completed and 0 percentage for empty sessions', () => {
    const result = computeDailyProgress([], defaultGoal);
    expect(result.completed).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it('returns the target from the goal', () => {
    const result = computeDailyProgress([], defaultGoal);
    expect(result.target).toBe(4);
  });
});
