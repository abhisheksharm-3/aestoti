import { browser } from '$app/environment';
import type { SettingsType } from '$lib/types';

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

let current = $state<SettingsType>({ ...DEFAULT_SETTINGS });

export const settings = {
  get current() { return current; },

  initialize(): void {
    if (!browser) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) current = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) as SettingsType };
    } catch {
      current = { ...DEFAULT_SETTINGS };
    }
  },

  updateSetting<K extends keyof SettingsType>(key: K, value: SettingsType[K]): void {
    const clamp = CLAMP_RULES[key];
    const clamped =
      clamp && typeof value === 'number'
        ? (Math.min(clamp[1], Math.max(clamp[0], value)) as SettingsType[K])
        : value;
    current = { ...current, [key]: clamped };
    if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  },

  reset(): void {
    current = { ...DEFAULT_SETTINGS };
    if (browser) localStorage.removeItem(STORAGE_KEY);
  }
};
