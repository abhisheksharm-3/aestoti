import type { ShortcutType, ShortcutActionType } from '$lib/types';

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
