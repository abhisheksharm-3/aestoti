import { describe, it, expect } from 'vitest';
import { dayKey } from './date';

describe('dayKey', () => {
  it('formats a local Date as YYYY-MM-DD', () => {
    // constructed in local time, so the key is the same local day in any tz
    expect(dayKey(new Date(2024, 0, 5, 9, 30))).toBe('2024-01-05');
  });

  it('zero-pads month and day', () => {
    expect(dayKey(new Date(2024, 2, 3, 0, 0))).toBe('2024-03-03');
  });

  it('keeps a late-evening time on the same local day (no UTC rollover)', () => {
    expect(dayKey(new Date(2024, 5, 17, 23, 59))).toBe('2024-06-17');
  });

  it('treats two times on the same local day as one key', () => {
    expect(dayKey(new Date(2024, 5, 17, 1, 0))).toBe(dayKey(new Date(2024, 5, 17, 22, 0)));
  });

  it('accepts an ISO string and buckets it by local day', () => {
    const iso = new Date(2024, 5, 17, 20, 0).toISOString();
    expect(dayKey(iso)).toBe('2024-06-17');
  });
});
