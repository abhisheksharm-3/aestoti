import { describe, it, expect } from 'vitest';
import { goals } from './goals.svelte';

describe('goals.setTarget', () => {
  it('clamps below 1 to 1', () => {
    goals.setTarget(0);
    expect(goals.current.targetSessions).toBe(1);
  });

  it('clamps above 24 to 24', () => {
    goals.setTarget(99);
    expect(goals.current.targetSessions).toBe(24);
  });

  it('ignores NaN and keeps the previous target', () => {
    goals.setTarget(6);
    goals.setTarget(NaN);
    expect(goals.current.targetSessions).toBe(6);
  });

  it('accepts an in-range value', () => {
    goals.setTarget(10);
    expect(goals.current.targetSessions).toBe(10);
  });
});
