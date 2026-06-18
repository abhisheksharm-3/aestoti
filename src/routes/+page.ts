import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { initializeStores } from '$lib/stores';

export const load: PageLoad = async () => {
  if (browser) initializeStores();
  return {};
};
