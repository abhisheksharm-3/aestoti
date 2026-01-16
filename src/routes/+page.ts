import type { Load } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { settings } from '$lib/store';
import { sessions } from '$lib/analytics';

export const load: Load = async () => {
  if (browser) {
    settings.initialize();
    sessions.initialize();
  }
  return {};
};
