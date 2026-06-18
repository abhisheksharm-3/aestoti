import { describe, it, expect } from 'vitest';
import { formatDuration } from './format';

describe('formatDuration', () => {
  it('formats minutes under an hour', () => {
    expect(formatDuration(5)).toBe('5m');
  });

  it('formats zero', () => {
    expect(formatDuration(0)).toBe('0m');
  });

  it('formats an exact hour', () => {
    expect(formatDuration(60)).toBe('1h 0m');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(125)).toBe('2h 5m');
  });
});
