import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { settings } from '$lib/stores/settings.svelte';
import { analytics } from '$lib/stores/analytics.svelte';
import { tasksStore } from '$lib/stores/tasks.svelte';
import { goals } from '$lib/stores/goals.svelte';
import { sounds } from '$lib/stores/sounds.svelte';
import { presets } from '$lib/stores/presets.svelte';
import { themes } from '$lib/stores/themes.svelte';
import { shortcuts } from '$lib/stores/shortcuts.svelte';
import { timer } from '$lib/stores/timer.svelte';

export const load: PageLoad = async () => {
  if (browser) {
    settings.initialize();
    timer.initialize();
    analytics.initialize();
    tasksStore.initialize();
    goals.initialize();
    sounds.initialize();
    presets.initialize();
    themes.initialize();
    shortcuts.initialize();
  }
  return {};
};
