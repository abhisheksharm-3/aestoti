import { describe, it, expect } from 'vitest';
import { exportToCSV, exportToJSON } from './export-utils';
import type { PomodoroSessionType } from '$lib/types';

function session(over: Partial<PomodoroSessionType> = {}): PomodoroSessionType {
  return {
    id: 'test-id',
    mode: 'focus',
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    durationSeconds: 1500,
    isCompleted: true,
    ...over
  };
}

describe('exportToCSV', () => {
  it('includes Note column in header', () => {
    const csv = exportToCSV([]);
    const header = csv.split('\n')[0];
    expect(header).toContain('Note');
  });

  it('includes all expected headers', () => {
    const csv = exportToCSV([]);
    const header = csv.split('\n')[0];
    expect(header).toBe('ID,Mode,Start Time,End Time,Duration (min),Completed,Note');
  });

  it('rounds durationSeconds to minutes', () => {
    const csv = exportToCSV([session({ durationSeconds: 1560 })]);
    const row = csv.split('\n')[1];
    expect(row).toContain('26');
  });

  it('rounds fractional seconds correctly', () => {
    const csv = exportToCSV([session({ durationSeconds: 1530 })]);
    const row = csv.split('\n')[1];
    // 1530 / 60 = 25.5 -> Math.round = 26
    expect(row).toContain('26');
  });

  it('maps isCompleted true to Yes', () => {
    const csv = exportToCSV([session({ isCompleted: true })]);
    expect(csv).toContain('Yes');
  });

  it('maps isCompleted false to No', () => {
    const csv = exportToCSV([session({ isCompleted: false })]);
    expect(csv).toContain('No');
  });

  it('includes session note in output', () => {
    const csv = exportToCSV([session({ note: 'great session' })]);
    expect(csv).toContain('great session');
  });

  it('uses empty string when note is absent', () => {
    const s = session();
    delete s.note;
    const csv = exportToCSV([s]);
    const row = csv.split('\n')[1];
    // Last column should be empty
    expect(row.endsWith(',')).toBe(true);
  });

  it('produces one row per session plus header', () => {
    const csv = exportToCSV([session(), session(), session()]);
    expect(csv.split('\n')).toHaveLength(4);
  });

  it('returns only the header row for empty input', () => {
    const csv = exportToCSV([]);
    expect(csv.split('\n')).toHaveLength(1);
  });
});

describe('exportToJSON', () => {
  it('round-trips sessions via JSON.parse', () => {
    const sessions = [
      session({ id: 'a', note: 'hello' }),
      session({ id: 'b', isCompleted: false })
    ];
    const json = exportToJSON(sessions);
    const parsed = JSON.parse(json) as PomodoroSessionType[];
    expect(parsed).toHaveLength(2);
    expect(parsed[0].id).toBe('a');
    expect(parsed[0].note).toBe('hello');
    expect(parsed[1].isCompleted).toBe(false);
  });

  it('produces valid JSON for empty array', () => {
    const json = exportToJSON([]);
    expect(JSON.parse(json)).toEqual([]);
  });
});
