import { describe, it, expect } from 'vitest';
import { sanitizeTasks } from './tasks.svelte';
import type { TaskType } from '$lib/types';

function task(over: Partial<TaskType> = {}): TaskType {
  return {
    id: 'a',
    title: 't',
    isCompleted: false,
    createdAt: '2024-06-17T00:00:00.000Z',
    completedAt: null,
    focusSessionsSpent: 0,
    ...over
  };
}

describe('sanitizeTasks', () => {
  it('returns [] for non-array input', () => {
    expect(sanitizeTasks({})).toEqual([]);
    expect(sanitizeTasks(null)).toEqual([]);
    expect(sanitizeTasks('nope')).toEqual([]);
  });

  it('keeps well-formed tasks', () => {
    expect(sanitizeTasks([task({ id: 'x' }), task({ id: 'y' })]).map(t => t.id)).toEqual(['x', 'y']);
  });

  it('drops entries with missing or wrong-typed fields', () => {
    const dirty = [
      task({ id: 'ok' }),
      { id: 'no-title' },
      { ...task({ id: 'bad-bool' }), isCompleted: 'yes' },
      { ...task({ id: 'bad-num' }), focusSessionsSpent: 'lots' },
      null
    ];
    expect(sanitizeTasks(dirty).map(t => t.id)).toEqual(['ok']);
  });
});
