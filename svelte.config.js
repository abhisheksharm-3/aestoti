import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    // SvelteKit hashes/nonces its own inline scripts; styles allow 'unsafe-inline'
    // because Svelte emits inline style attributes (gradients, timer sizing).
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['self'],
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline'],
        'img-src': ['self', 'data:'],
        'font-src': ['self'],
        'media-src': ['self', 'https://*.somafm.com'],
        'connect-src': ['self'],
        'manifest-src': ['self'],
        'worker-src': ['self'],
        'object-src': ['none'],
        'base-uri': ['self'],
        'frame-ancestors': ['none']
      }
    }
  }
};

export default config;
