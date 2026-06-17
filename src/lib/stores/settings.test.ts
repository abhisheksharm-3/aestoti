import { describe, it, expect, beforeEach } from 'vitest';
import { settings } from './settings.svelte';

beforeEach(() => {
  settings.reset();
});

describe('settings.updateSetting clamping', () => {
  describe('focusLength [1, 180]', () => {
    it('clamps below-min to 1', () => {
      settings.updateSetting('focusLength', 0);
      expect(settings.current.focusLength).toBe(1);
    });

    it('clamps negative to 1', () => {
      settings.updateSetting('focusLength', -10);
      expect(settings.current.focusLength).toBe(1);
    });

    it('clamps above-max to 180', () => {
      settings.updateSetting('focusLength', 999);
      expect(settings.current.focusLength).toBe(180);
    });

    it('accepts a value within range', () => {
      settings.updateSetting('focusLength', 30);
      expect(settings.current.focusLength).toBe(30);
    });
  });

  describe('shortLength [1, 60]', () => {
    it('clamps below-min to 1', () => {
      settings.updateSetting('shortLength', 0);
      expect(settings.current.shortLength).toBe(1);
    });

    it('clamps above-max to 60', () => {
      settings.updateSetting('shortLength', 100);
      expect(settings.current.shortLength).toBe(60);
    });

    it('accepts a value within range', () => {
      settings.updateSetting('shortLength', 10);
      expect(settings.current.shortLength).toBe(10);
    });
  });

  describe('longLength [1, 120]', () => {
    it('clamps below-min to 1', () => {
      settings.updateSetting('longLength', 0);
      expect(settings.current.longLength).toBe(1);
    });

    it('clamps above-max to 120', () => {
      settings.updateSetting('longLength', 200);
      expect(settings.current.longLength).toBe(120);
    });

    it('accepts a value within range', () => {
      settings.updateSetting('longLength', 20);
      expect(settings.current.longLength).toBe(20);
    });
  });

  describe('longBreakInterval [1, 10]', () => {
    it('clamps below-min to 1', () => {
      settings.updateSetting('longBreakInterval', 0);
      expect(settings.current.longBreakInterval).toBe(1);
    });

    it('clamps above-max to 10', () => {
      settings.updateSetting('longBreakInterval', 50);
      expect(settings.current.longBreakInterval).toBe(10);
    });

    it('accepts a value within range', () => {
      settings.updateSetting('longBreakInterval', 4);
      expect(settings.current.longBreakInterval).toBe(4);
    });
  });

  describe('boolean setting (hasSound)', () => {
    it('updates to false without clamping', () => {
      settings.updateSetting('hasSound', false);
      expect(settings.current.hasSound).toBe(false);
    });

    it('updates to true without clamping', () => {
      settings.updateSetting('hasSound', false);
      settings.updateSetting('hasSound', true);
      expect(settings.current.hasSound).toBe(true);
    });
  });
});

describe('settings.reset', () => {
  it('restores defaults after changes', () => {
    settings.updateSetting('focusLength', 45);
    settings.updateSetting('hasSound', false);
    settings.reset();
    expect(settings.current.focusLength).toBe(25);
    expect(settings.current.hasSound).toBe(true);
  });
});
