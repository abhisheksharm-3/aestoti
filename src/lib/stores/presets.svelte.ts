import { browser } from '$app/environment';
import type { TimerPresetType, PresetsStateType } from '$lib/types';
import { DEFAULT_PRESETS } from '$lib/config/presets';
import { generateId } from '$lib/utils/id';
import { writeStorage } from '$lib/utils/storage';

const STORAGE_KEY = 'aestoti_presets';

function isValidPreset(value: unknown): value is TimerPresetType {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    ['focusLength', 'shortLength', 'longLength', 'longBreakInterval'].every(
      k => typeof p[k] === 'number' && Number.isFinite(p[k])
    )
  );
}

/** Keep only well-formed custom presets from untrusted localStorage. */
export function sanitizeCustomPresets(raw: unknown): TimerPresetType[] {
  return Array.isArray(raw) ? raw.filter(isValidPreset) : [];
}

let state = $state<PresetsStateType>({ presets: [...DEFAULT_PRESETS], activePresetId: null });

function persist(): void {
  if (!browser) return;
  const customPresets = state.presets.filter(p => !DEFAULT_PRESETS.some(d => d.id === p.id));
  writeStorage(STORAGE_KEY, JSON.stringify({ customPresets, activePresetId: state.activePresetId }));
}

export const presets = {
  get state() { return state; },

  initialize(): void {
    if (!browser) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as {
        customPresets?: unknown;
        activePresetId?: unknown;
      };
      state = {
        presets: [...DEFAULT_PRESETS, ...sanitizeCustomPresets(parsed.customPresets)],
        activePresetId: typeof parsed.activePresetId === 'string' ? parsed.activePresetId : null
      };
    } catch {
      state = { presets: [...DEFAULT_PRESETS], activePresetId: null };
    }
  },

  setActive(presetId: string): TimerPresetType | null {
    const preset = state.presets.find(p => p.id === presetId) ?? null;
    state = { ...state, activePresetId: presetId };
    persist();
    return preset;
  },

  add(preset: Omit<TimerPresetType, 'id'>): void {
    state = {
      ...state,
      presets: [...state.presets, { ...preset, id: generateId('preset') }]
    };
    persist();
  },

  remove(presetId: string): void {
    if (DEFAULT_PRESETS.some(p => p.id === presetId)) return;
    state = {
      presets: state.presets.filter(p => p.id !== presetId),
      activePresetId: state.activePresetId === presetId ? null : state.activePresetId
    };
    persist();
  }
};
