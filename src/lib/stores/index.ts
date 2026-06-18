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
 * Hydrate every persisted store from localStorage, in one place. ORDER MATTERS
 * only for `settings` → `timer`: the timer reads persisted mode durations from
 * settings when computing its initial `remainingSeconds` (and restoring a
 * running session). The rest (analytics, tasks, goals, sounds, presets, themes,
 * shortcuts) are order-independent. `ui` is intentionally excluded — it holds
 * ephemeral, non-persisted state. Call once on the client.
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
