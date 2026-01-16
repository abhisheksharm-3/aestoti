import { writable, get } from 'svelte/store';
import type { TimerPresetType } from './types';

const STORAGE_KEY = 'aestoti_presets';

/**
 * Default timer presets
 */
export const DEFAULT_PRESETS: TimerPresetType[] = [
    { id: 'classic', name: 'Classic', focusLength: 25, shortLength: 5, longLength: 15, longBreakInterval: 4 },
    { id: 'short', name: 'Short Sprint', focusLength: 15, shortLength: 3, longLength: 10, longBreakInterval: 4 },
    { id: 'long', name: 'Deep Work', focusLength: 50, shortLength: 10, longLength: 30, longBreakInterval: 2 },
    { id: 'ultrashort', name: 'Quick Focus', focusLength: 10, shortLength: 2, longLength: 5, longBreakInterval: 4 }
];

type PresetsStateType = {
    presets: TimerPresetType[];
    activePresetId: string | null;
};

/**
 * Loads presets from localStorage
 */
function loadPresets(): PresetsStateType {
    if (typeof window === 'undefined') {
        return { presets: DEFAULT_PRESETS, activePresetId: null };
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        return { presets: DEFAULT_PRESETS, activePresetId: null };
    }
    const parsed = JSON.parse(stored);
    return {
        presets: [...DEFAULT_PRESETS, ...(parsed.customPresets || [])],
        activePresetId: parsed.activePresetId || null
    };
}

/**
 * Generates unique preset ID
 */
function generateId(): string {
    return `preset-${Date.now()}`;
}

/**
 * Creates the presets store
 */
function createPresetsStore() {
    const { subscribe, set, update } = writable<PresetsStateType>({
        presets: DEFAULT_PRESETS,
        activePresetId: null
    });

    function save(state: PresetsStateType): void {
        if (typeof window === 'undefined') return;
        const customPresets = state.presets.filter(
            p => !DEFAULT_PRESETS.some(d => d.id === p.id)
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            customPresets,
            activePresetId: state.activePresetId
        }));
    }

    return {
        subscribe,

        /**
         * Initializes store from localStorage
         */
        initialize(): void {
            set(loadPresets());
        },

        /**
         * Sets the active preset
         */
        setActive(presetId: string): TimerPresetType | null {
            let preset: TimerPresetType | null = null;
            update(state => {
                preset = state.presets.find(p => p.id === presetId) || null;
                const updated = { ...state, activePresetId: presetId };
                save(updated);
                return updated;
            });
            return preset;
        },

        /**
         * Adds a custom preset
         */
        add(preset: Omit<TimerPresetType, 'id'>): void {
            update(state => {
                const newPreset: TimerPresetType = { ...preset, id: generateId() };
                const updated = {
                    ...state,
                    presets: [...state.presets, newPreset]
                };
                save(updated);
                return updated;
            });
        },

        /**
         * Removes a custom preset
         */
        remove(presetId: string): void {
            if (DEFAULT_PRESETS.some(p => p.id === presetId)) return;

            update(state => {
                const updated = {
                    ...state,
                    presets: state.presets.filter(p => p.id !== presetId),
                    activePresetId: state.activePresetId === presetId ? null : state.activePresetId
                };
                save(updated);
                return updated;
            });
        },

        /**
         * Gets a preset by ID
         */
        getById(presetId: string): TimerPresetType | undefined {
            return get({ subscribe }).presets.find(p => p.id === presetId);
        }
    };
}

export const presets = createPresetsStore();
