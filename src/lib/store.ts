import { writable } from 'svelte/store';
import type { SettingsType } from './types';

const SETTINGS_STORAGE_KEY = 'aestoti_settings';

const DEFAULT_SETTINGS: SettingsType = {
  isAutoTime: false,
  hasSound: true,
  hasNotification: true,
  focusLength: 25,
  longBreakInterval: 3,
  shortLength: 5,
  longLength: 15
};

/**
 * Loads settings from localStorage
 */
function loadSettings(): SettingsType {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!stored) return DEFAULT_SETTINGS;

  return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
}

/**
 * Creates the settings store with localStorage persistence
 */
function createSettingsStore() {
  const { subscribe, set, update } = writable<SettingsType>(DEFAULT_SETTINGS);

  return {
    subscribe,

    /**
     * Initializes settings from localStorage
     */
    initialize(): void {
      set(loadSettings());
    },

    /**
     * Updates a single setting
     */
    updateSetting<K extends keyof SettingsType>(key: K, value: SettingsType[K]): void {
      update(current => {
        const updated = { ...current, [key]: value };
        if (typeof window !== 'undefined') {
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
      });
    },

    /**
     * Resets settings to defaults
     */
    reset(): void {
      set(DEFAULT_SETTINGS);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SETTINGS_STORAGE_KEY);
      }
    }
  };
}

export const settings = createSettingsStore();
