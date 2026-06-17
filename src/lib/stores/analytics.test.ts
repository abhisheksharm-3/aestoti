import { describe, it, expect, beforeEach } from 'vitest';
import { analytics } from './analytics.svelte';

function todayAt(hours: number, minutes = 0): Date {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d;
}

beforeEach(() => {
  analytics.clearAll();
});

describe('analytics.summary', () => {
  it('totalSessions counts only focus sessions', () => {
    const start = todayAt(9);
    const end = todayAt(9, 25);
    analytics.recordSession('focus', start, end, true);
    analytics.recordSession('shortBreak', todayAt(9, 30), todayAt(9, 35), true);
    expect(analytics.summary.totalSessions).toBe(1);
  });

  it('totalFocusMinutes sums only focus durations', () => {
    analytics.recordSession('focus', todayAt(9), todayAt(9, 25), true);
    analytics.recordSession('focus', todayAt(10), todayAt(10, 25), true);
    analytics.recordSession('shortBreak', todayAt(9, 30), todayAt(9, 35), true);
    expect(analytics.summary.totalFocusMinutes).toBe(50);
  });

  it('sessionsToday counts only today focus sessions', () => {
    analytics.recordSession('focus', todayAt(9), todayAt(9, 25), true);
    // yesterday
    analytics.recordSession('focus', daysAgo(1), new Date(daysAgo(1).getTime() + 25 * 60 * 1000), true);
    expect(analytics.summary.sessionsToday).toBe(1);
  });
});

describe('analytics.summary.currentStreak', () => {
  it('is 1 when there is a focus session today', () => {
    analytics.recordSession('focus', todayAt(9), todayAt(9, 25), true);
    expect(analytics.summary.currentStreak).toBe(1);
  });

  it('stays > 0 when the only session is from yesterday', () => {
    const yStart = daysAgo(1);
    const yEnd = new Date(yStart.getTime() + 25 * 60 * 1000);
    analytics.recordSession('focus', yStart, yEnd, true);
    expect(analytics.summary.currentStreak).toBeGreaterThan(0);
  });

  it('breaks to 0 when the latest session is 2+ days ago', () => {
    const oldStart = daysAgo(2);
    const oldEnd = new Date(oldStart.getTime() + 25 * 60 * 1000);
    analytics.recordSession('focus', oldStart, oldEnd, true);
    expect(analytics.summary.currentStreak).toBe(0);
  });
});

describe('analytics.weeklyFocusScore', () => {
  it('is ~100 for a completed full-length (25min) focus session today', () => {
    const start = todayAt(9);
    const end = new Date(start.getTime() + 25 * 60 * 1000);
    analytics.recordSession('focus', start, end, true);
    // completionBonus=50, durationBonus=50 => 100
    expect(analytics.weeklyFocusScore).toBe(100);
  });

  it('is low/0 for a skipped short-duration focus session', () => {
    const start = todayAt(9);
    // 1 minute only
    const end = new Date(start.getTime() + 60 * 1000);
    analytics.recordSession('focus', start, end, false);
    // completionBonus=0, durationBonus=floor(60/1500 * 50)=2 => 2
    expect(analytics.weeklyFocusScore).toBeLessThanOrEqual(5);
  });

  it('is 0 when there are no sessions', () => {
    expect(analytics.weeklyFocusScore).toBe(0);
  });
});

describe('analytics.addNote', () => {
  it('sets a note on the specified session', () => {
    const start = todayAt(9);
    const end = todayAt(9, 25);
    analytics.recordSession('focus', start, end, true);
    const session = analytics.sessions[analytics.sessions.length - 1];
    analytics.addNote(session.id, 'great focus block');
    const updated = analytics.sessions.find(s => s.id === session.id);
    expect(updated?.note).toBe('great focus block');
  });

  it('does not modify other sessions', () => {
    analytics.recordSession('focus', todayAt(9), todayAt(9, 25), true);
    analytics.recordSession('focus', todayAt(10), todayAt(10, 25), true);
    const [first, second] = analytics.sessions;
    analytics.addNote(second.id, 'only second');
    const updatedFirst = analytics.sessions.find(s => s.id === first.id);
    expect(updatedFirst?.note).toBeUndefined();
  });
});
