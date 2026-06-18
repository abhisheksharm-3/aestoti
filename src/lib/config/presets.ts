import type { TimerPresetType } from '$lib/types';

export const DEFAULT_PRESETS: TimerPresetType[] = [
  { id: 'classic', name: 'Classic', focusLength: 25, shortLength: 5, longLength: 15, longBreakInterval: 4 },
  { id: 'short', name: 'Short Sprint', focusLength: 15, shortLength: 3, longLength: 10, longBreakInterval: 4 },
  { id: 'long', name: 'Deep Work', focusLength: 50, shortLength: 10, longLength: 30, longBreakInterval: 2 },
  { id: 'ultrashort', name: 'Quick Focus', focusLength: 10, shortLength: 2, longLength: 5, longBreakInterval: 4 }
];
