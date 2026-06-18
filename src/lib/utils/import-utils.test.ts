import { describe, it, expect } from 'vitest';
import { parseSessionsImport } from './import-utils';
import type { PomodoroSessionType } from '$lib/types';

function valid(over: Partial<PomodoroSessionType> = {}): PomodoroSessionType {
  return {
    id: 'a',
    mode: 'focus',
    startTime: '2024-06-17T09:00:00.000Z',
    endTime: '2024-06-17T09:25:00.000Z',
    durationSeconds: 1500,
    isCompleted: true,
    ...over
  };
}

describe('parseSessionsImport', () => {
  it('throws on non-JSON text', () => {
    expect(() => parseSessionsImport('not json')).toThrow();
  });

  it('throws when the top level is not an array', () => {
    expect(() => parseSessionsImport(JSON.stringify({ sessions: [] }))).toThrow();
  });

  it('parses a valid exported array', () => {
    const out = parseSessionsImport(JSON.stringify([valid({ id: 'a' }), valid({ id: 'b' })]));
    expect(out).toHaveLength(2);
    expect(out[0].id).toBe('a');
  });

  it('keeps an optional note', () => {
    const out = parseSessionsImport(JSON.stringify([valid({ note: 'kept' })]));
    expect(out[0].note).toBe('kept');
  });

  it('skips entries with missing or wrong-typed fields', () => {
    const dirty = [
      valid({ id: 'ok' }),
      { id: 'no-mode', startTime: 'x', endTime: 'y', durationSeconds: 1, isCompleted: true },
      { ...valid({ id: 'bad-mode' }), mode: 'lunch' },
      { ...valid({ id: 'bad-duration' }), durationSeconds: 'lots' },
      null
    ];
    const out = parseSessionsImport(JSON.stringify(dirty));
    expect(out.map(s => s.id)).toEqual(['ok']);
  });
});
