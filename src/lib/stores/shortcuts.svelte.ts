import { browser } from '$app/environment';
import type { ShortcutType, ShortcutActionType } from '$lib/types';
import { DEFAULT_SHORTCUTS } from '$lib/config/shortcuts';
import { writeStorage, removeStorage } from '$lib/utils/storage';

const STORAGE_KEY = 'aestoti_shortcuts';

const ACTIONS = new Set(DEFAULT_SHORTCUTS.map(s => s.action));

function isValidShortcut(value: unknown): value is ShortcutType {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.action === 'string' &&
    ACTIONS.has(s.action as ShortcutActionType) &&
    typeof s.key === 'string' &&
    typeof s.hasAlt === 'boolean' &&
    typeof s.hasCtrl === 'boolean' &&
    typeof s.hasShift === 'boolean'
  );
}

/**
 * Start from the full default set and override with any valid stored bindings,
 * so every action is always present even if storage is partial or corrupted.
 */
export function sanitizeShortcuts(raw: unknown): ShortcutType[] {
  const byAction = new Map(DEFAULT_SHORTCUTS.map(s => [s.action, s]));
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (isValidShortcut(entry)) byAction.set(entry.action, entry);
    }
  }
  return DEFAULT_SHORTCUTS.map(d => byAction.get(d.action) as ShortcutType);
}

let current = $state<ShortcutType[]>([...DEFAULT_SHORTCUTS]);

export const shortcuts = {
  get current() { return current; },

  initialize(): void {
    if (!browser) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) current = sanitizeShortcuts(JSON.parse(stored));
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
