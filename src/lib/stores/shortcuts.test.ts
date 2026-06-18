import { describe, it, expect } from 'vitest';
import { sanitizeShortcuts } from './shortcuts.svelte';
import { DEFAULT_SHORTCUTS } from '$lib/config/shortcuts';

describe('sanitizeShortcuts', () => {
  it('returns all defaults for garbage input', () => {
    expect(sanitizeShortcuts('nope').map(s => s.action).sort()).toEqual(
      DEFAULT_SHORTCUTS.map(s => s.action).sort()
    );
    expect(sanitizeShortcuts(null)).toHaveLength(DEFAULT_SHORTCUTS.length);
  });

  it('always returns every action even when stored data omits some', () => {
    const partial = [{ action: 'toggleTimer', key: 'p', hasAlt: false, hasCtrl: false, hasShift: false }];
    const out = sanitizeShortcuts(partial);
    expect(out).toHaveLength(DEFAULT_SHORTCUTS.length);
    expect(out.find(s => s.action === 'toggleTimer')?.key).toBe('p');
  });

  it('ignores malformed overrides and unknown actions', () => {
    const bad = [
      { action: 'toggleTimer', key: 123 },
      { action: 'bogus', key: 'x', hasAlt: false, hasCtrl: false, hasShift: false }
    ];
    const out = sanitizeShortcuts(bad);
    // malformed toggleTimer override ignored -> default space key retained
    expect(out.find(s => s.action === 'toggleTimer')?.key).toBe(' ');
    expect(out.some(s => (s.action as string) === 'bogus')).toBe(false);
  });
});
