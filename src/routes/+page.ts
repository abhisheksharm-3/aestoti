import type { Load } from '@sveltejs/kit';
import { settings } from '$lib/store';
import { browser } from '$app/environment';

export const load: Load = async () => {
  if (browser) {
    // Ensure settings are loaded from localStorage on page load
    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
      settings.set(JSON.parse(storedSettings));
    }
  }

  return {};
};
