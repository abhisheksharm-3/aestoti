import { describe, it, expect } from 'vitest';
import {
  calculateHourlyProductivity,
  getMostProductiveHour,
  formatHour
} from './analytics-utils';
import type { PomodoroSessionType } from '$lib/types';

function session(over: Partial<PomodoroSessionType> = {}): PomodoroSessionType {
  const now = new Date().toISOString();
  return {
    id: 'x',
    mode: 'focus',
    startTime: now,
    endTime: now,
    durationSeconds: 1500,
    isCompleted: true,
    ...over
  };
}

describe('formatHour', () => {
  it('formats midnight, noon, am and pm', () => {
    expect(formatHour(0)).toBe('12 AM');
    expect(formatHour(12)).toBe('12 PM');
    expect(formatHour(9)).toBe('9 AM');
    expect(formatHour(13)).toBe('1 PM');
    expect(formatHour(23)).toBe('11 PM');
  });
});

describe('calculateHourlyProductivity', () => {
  it('buckets focus sessions by hour and ignores breaks', () => {
    const at9 = new Date();
    at9.setHours(9, 0, 0, 0);
    const sessions = [
      session({ startTime: at9.toISOString(), durationSeconds: 1500 }),
      session({ startTime: at9.toISOString(), durationSeconds: 1500 }),
      session({ mode: 'shortBreak', startTime: at9.toISOString(), durationSeconds: 300 })
    ];
    const hourly = calculateHourlyProductivity(sessions);
    expect(hourly).toHaveLength(24);
    expect(hourly[9].sessionCount).toBe(2);
    expect(hourly[9].totalMinutes).toBe(50);
    expect(getMostProductiveHour(hourly)).toBe(9);
  });

  it('returns hour 0 as most productive when there is no data', () => {
    expect(getMostProductiveHour(calculateHourlyProductivity([]))).toBe(0);
  });
});
