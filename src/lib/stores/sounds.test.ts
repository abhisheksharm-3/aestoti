import { describe, it, expect } from 'vitest';
import { sanitizeSounds } from './sounds.svelte';

describe('sanitizeSounds', () => {
  it('fills defaults for an empty object', () => {
    const result = sanitizeSounds({});
    expect(result).toEqual({
      ambientSoundId: 'none',
      ambientVolume: 50,
      notificationSoundId: 'bell',
      notificationVolume: 80
    });
  });

  it('clamps out-of-range volumes into 0–100', () => {
    expect(sanitizeSounds({ ambientVolume: 9999 }).ambientVolume).toBe(100);
    expect(sanitizeSounds({ notificationVolume: -5 }).notificationVolume).toBe(0);
  });

  it('falls back to defaults for non-finite or non-numeric volumes', () => {
    expect(sanitizeSounds({ ambientVolume: NaN }).ambientVolume).toBe(50);
    expect(sanitizeSounds({ notificationVolume: 'loud' as unknown as number }).notificationVolume).toBe(80);
  });

  it('rejects non-string sound ids', () => {
    const result = sanitizeSounds({ ambientSoundId: 42 as unknown as string });
    expect(result.ambientSoundId).toBe('none');
  });

  it('preserves valid values', () => {
    const result = sanitizeSounds({ ambientSoundId: 'rain', ambientVolume: 30 });
    expect(result.ambientSoundId).toBe('rain');
    expect(result.ambientVolume).toBe(30);
  });
});
