import { writable, get } from 'svelte/store';
import type { ShortcutType, ShortcutActionType } from './types';

const STORAGE_KEY = 'aestoti_shortcuts';

/**
 * Default keyboard shortcuts
 */
export const DEFAULT_SHORTCUTS: ShortcutType[] = [
    { action: 'toggleTimer', key: ' ', hasAlt: false, hasCtrl: false, hasShift: false },
    { action: 'skipMode', key: 'n', hasAlt: true, hasCtrl: false, hasShift: false },
    { action: 'restartMode', key: 'r', hasAlt: true, hasCtrl: false, hasShift: false },
    { action: 'openSettings', key: 's', hasAlt: true, hasCtrl: false, hasShift: false },
    { action: 'toggleFullscreen', key: 'f', hasAlt: true, hasCtrl: false, hasShift: false }
];

/**
 * Shortcut action labels
 */
export const SHORTCUT_LABELS: Record<ShortcutActionType, string> = {
    toggleTimer: 'Play/Pause Timer',
    skipMode: 'Skip to Next Mode',
    restartMode: 'Restart Current Mode',
    openSettings: 'Open Settings',
    toggleFullscreen: 'Toggle Fullscreen'
};

/**
 * Loads shortcuts from localStorage
 */
function loadShortcuts(): ShortcutType[] {
    if (typeof window === 'undefined') return DEFAULT_SHORTCUTS;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SHORTCUTS;
    return JSON.parse(stored);
}

/**
 * Creates the shortcuts store
 */
function createShortcutsStore() {
    const { subscribe, set, update } = writable<ShortcutType[]>(DEFAULT_SHORTCUTS);

    return {
        subscribe,

        /**
         * Initializes store from localStorage
         */
        initialize(): void {
            set(loadShortcuts());
        },

        /**
         * Updates a shortcut
         */
        updateShortcut(action: ShortcutActionType, shortcut: Omit<ShortcutType, 'action'>): void {
            update(shortcuts => {
                const updated = shortcuts.map(s =>
                    s.action === action ? { ...shortcut, action } : s
                );
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                }
                return updated;
            });
        },

        /**
         * Resets shortcuts to defaults
         */
        reset(): void {
            set(DEFAULT_SHORTCUTS);
            if (typeof window !== 'undefined') {
                localStorage.removeItem(STORAGE_KEY);
            }
        },

        /**
         * Checks if event matches a shortcut
         */
        matchesEvent(event: KeyboardEvent, action: ShortcutActionType): boolean {
            const shortcuts = get({ subscribe });
            const shortcut = shortcuts.find(s => s.action === action);
            if (!shortcut) return false;

            const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
                (shortcut.key === ' ' && event.code === 'Space');

            return keyMatch &&
                event.altKey === shortcut.hasAlt &&
                event.ctrlKey === shortcut.hasCtrl &&
                event.shiftKey === shortcut.hasShift;
        },

        /**
         * Formats shortcut for display
         */
        format(shortcut: ShortcutType): string {
            const parts: string[] = [];
            if (shortcut.hasCtrl) parts.push('Ctrl');
            if (shortcut.hasAlt) parts.push('Alt');
            if (shortcut.hasShift) parts.push('Shift');

            const keyLabel = shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase();
            parts.push(keyLabel);

            return parts.join(' + ');
        }
    };
}

export const shortcuts = createShortcutsStore();
