import { browser } from '$app/environment';
import type { SettingsType } from '$lib/types';
import { writeStorage, removeStorage } from '$lib/utils/storage';

const STORAGE_KEY = 'aestoti_settings';

const DEFAULT_SETTINGS: SettingsType = {
  isAutoTime: false,
  hasSound: true,
  hasNotification: true,
  hasBreakPrompts: true,
  focusLength: 25,
  longBreakInterval: 3,
  shortLength: 5,
  longLength: 15
};

const CLAMP_RULES: Partial<Record<keyof SettingsType, [number, number]>> = {
  focusLength: [1, 180],
  shortLength: [1, 60],
  longLength: [1, 120],
  longBreakInterval: [1, 10]
};

/** Clamp a numeric setting into its valid range, falling back to the default for non-finite or non-numeric input from tampered storage. */
function clampNumber<K extends keyof SettingsType>(key: K, value: unknown): number {
  const fallback = DEFAULT_SETTINGS[key] as number;
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const rule = CLAMP_RULES[key];
  return rule ? Math.min(rule[1], Math.max(rule[0], value)) : value;
}

/** Merge over defaults and force every clamped numeric into its valid range. */
export function sanitizeSettings(raw: Partial<SettingsType>): SettingsType {
  const merged = { ...DEFAULT_SETTINGS, ...raw };
  for (const key of Object.keys(CLAMP_RULES) as (keyof SettingsType)[]) {
    (merged[key] as number) = clampNumber(key, merged[key]);
  }
  return merged;
}

let current = $state<SettingsType>({ ...DEFAULT_SETTINGS });

export const settings = {
  get current() { return current; },

  initialize(): void {
    if (!browser) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) current = sanitizeSettings(JSON.parse(stored) as Partial<SettingsType>);
    } catch {
      current = { ...DEFAULT_SETTINGS };
    }
  },

  /** Update one setting, clamping numerics into range and ignoring non-finite values. */
  updateSetting<K extends keyof SettingsType>(key: K, value: SettingsType[K]): void {
    let next = value;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) return;
      next = clampNumber(key, value) as SettingsType[K];
    }
    current = { ...current, [key]: next };
    writeStorage(STORAGE_KEY, JSON.stringify(current));
  },

  reset(): void {
    current = { ...DEFAULT_SETTINGS };
    removeStorage(STORAGE_KEY);
  }
};
