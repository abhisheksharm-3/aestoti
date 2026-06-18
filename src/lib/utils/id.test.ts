import { describe, it, expect } from 'vitest';
import { generateId } from './id';

describe('generateId', () => {
  it('prefixes the id with the given prefix', () => {
    expect(generateId('task').startsWith('task-')).toBe(true);
  });

  it('defaults the prefix to "id"', () => {
    expect(generateId().startsWith('id-')).toBe(true);
  });

  it('produces unique ids across a large batch', () => {
    const ids = new Set(Array.from({ length: 5000 }, () => generateId('session')));
    expect(ids.size).toBe(5000);
  });
});
