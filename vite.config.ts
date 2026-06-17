import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  // @lucide/svelte ships .svelte icon files; Vite must compile them for SSR
  // rather than letting Node's loader try to read them raw.
  ssr: { noExternal: ['@lucide/svelte'] }
});
