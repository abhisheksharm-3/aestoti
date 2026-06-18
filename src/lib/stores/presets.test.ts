import { describe, it, expect } from 'vitest';
import { sanitizeCustomPresets } from './presets.svelte';
import type { TimerPresetType } from '$lib/types';

function preset(over: Partial<TimerPresetType> = {}): TimerPresetType {
  return { id: 'a', name: 'A', focusLength: 25, shortLength: 5, longLength: 15, longBreakInterval: 4, ...over };
}

describe('sanitizeCustomPresets', () => {
  it('returns [] for non-array input', () => {
    expect(sanitizeCustomPresets(undefined)).toEqual([]);
    expect(sanitizeCustomPresets({ customPresets: [] })).toEqual([]);
  });

  it('keeps well-formed presets', () => {
    expect(sanitizeCustomPresets([preset({ id: 'x' })]).map(p => p.id)).toEqual(['x']);
  });

  it('drops presets with non-numeric or missing fields', () => {
    const dirty = [
      preset({ id: 'ok' }),
      { ...preset({ id: 'bad-num' }), focusLength: 'long' },
      { id: 'missing-fields', name: 'X' }
    ];
    expect(sanitizeCustomPresets(dirty).map(p => p.id)).toEqual(['ok']);
  });
});
