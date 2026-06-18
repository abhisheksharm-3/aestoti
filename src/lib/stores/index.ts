import { settings } from './settings.svelte';
import { timer } from './timer.svelte';
import { analytics } from './analytics.svelte';
import { tasks } from './tasks.svelte';
import { goals } from './goals.svelte';
import { sounds } from './sounds.svelte';
import { presets } from './presets.svelte';
import { themes } from './themes.svelte';
import { shortcuts } from './shortcuts.svelte';
import { ui } from './ui.svelte';

/**
 * Hydrate every store from localStorage. ORDER MATTERS: `settings` must run
 * before `timer`, since the timer reads the persisted mode durations from
 * settings when it computes its initial `remainingSeconds`. Keep this the one
 * place that owns store boot order — call it once on the client.
 */
export function initializeStores(): void {
  settings.initialize();
  timer.initialize();
  analytics.initialize();
  tasks.initialize();
  goals.initialize();
  sounds.initialize();
  presets.initialize();
  themes.initialize();
  shortcuts.initialize();
}

export { settings, timer, analytics, tasks, goals, sounds, presets, themes, shortcuts, ui };
