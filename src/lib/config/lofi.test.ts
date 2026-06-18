import { describe, it, expect } from 'vitest';
import { LOFI_STATIONS } from './lofi';
import { SOUND_PRESETS } from './sounds';

describe('LOFI_STATIONS', () => {
  it('defines at least one station', () => {
    expect(LOFI_STATIONS.length).toBeGreaterThan(0);
  });

  it('every station has id, name, icon and an https stream url', () => {
    for (const s of LOFI_STATIONS) {
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.icon).toBeTruthy();
      expect(s.src.startsWith('https://')).toBe(true);
    }
  });

  it('uses unique ids that never collide with the ambient presets', () => {
    const lofiIds = LOFI_STATIONS.map(s => s.id);
    expect(new Set(lofiIds).size).toBe(lofiIds.length);
    const ambientIds = new Set(SOUND_PRESETS.map(p => p.id));
    expect(lofiIds.some(id => ambientIds.has(id))).toBe(false);
  });
});
