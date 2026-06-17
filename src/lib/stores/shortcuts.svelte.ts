import { browser } from '$app/environment';
import type { ShortcutType, ShortcutActionType } from '$lib/types';
import { writeStorage, removeStorage } from '$lib/utils/storage';

const STORAGE_KEY = 'aestoti_shortcuts';

export const DEFAULT_SHORTCUTS: ShortcutType[] = [
  { action: 'toggleTimer', key: ' ', hasAlt: false, hasCtrl: false, hasShift: false },
  { action: 'skipMode', key: 'n', hasAlt: true, hasCtrl: false, hasShift: false },
  { action: 'restartMode', key: 'r', hasAlt: true, hasCtrl: false, hasShift: false },
  { action: 'openSettings', key: 's', hasAlt: true, hasCtrl: false, hasShift: false },
  { action: 'toggleFullscreen', key: 'f', hasAlt: true, hasCtrl: false, hasShift: false }
];

export const SHORTCUT_LABELS: Record<ShortcutActionType, string> = {
  toggleTimer: 'Play/Pause Timer',
  skipMode: 'Skip to Next Mode',
  restartMode: 'Restart Current Mode',
  openSettings: 'Open Settings',
  toggleFullscreen: 'Toggle Fullscreen'
};

let current = $state<ShortcutType[]>([...DEFAULT_SHORTCUTS]);

export const shortcuts = {
  get current() { return current; },

  initialize(): void {
    if (!browser) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) current = JSON.parse(stored) as ShortcutType[];
    } catch {
      current = [...DEFAULT_SHORTCUTS];
    }
  },

  updateShortcut(action: ShortcutActionType, shortcut: Omit<ShortcutType, 'action'>): void {
    current = current.map(s => (s.action === action ? { ...shortcut, action } : s));
    writeStorage(STORAGE_KEY, JSON.stringify(current));
  },

  reset(): void {
    current = [...DEFAULT_SHORTCUTS];
    removeStorage(STORAGE_KEY);
  },

  matchesEvent(event: KeyboardEvent, action: ShortcutActionType): boolean {
    const shortcut = current.find(s => s.action === action);
    if (!shortcut) return false;
    const keyMatch =
      event.key.toLowerCase() === shortcut.key.toLowerCase() ||
      (shortcut.key === ' ' && event.code === 'Space');
    return (
      keyMatch &&
      event.altKey === shortcut.hasAlt &&
      event.ctrlKey === shortcut.hasCtrl &&
      event.shiftKey === shortcut.hasShift
    );
  },

  format(shortcut: ShortcutType): string {
    const parts: string[] = [];
    if (shortcut.hasCtrl) parts.push('Ctrl');
    if (shortcut.hasAlt) parts.push('Alt');
    if (shortcut.hasShift) parts.push('Shift');
    parts.push(shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase());
    return parts.join(' + ');
  }
};
