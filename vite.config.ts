import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Aestoti — Focus Timer',
        short_name: 'Aestoti',
        description:
          'A focus timer you reach for daily: Pomodoro sessions, tasks, streaks, and stats — all on your device.',
        theme_color: '#C4411F',
        background_color: '#F4EFE6',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      // Precache the app shell for instant offline load. The large ambient
      // .mp3 files in /sounds/ stay on-demand, but the small notification cue
      // (root-level) is precached so the timer-complete chime works offline.
      workbox: { globPatterns: ['**/*.{js,css,html,png,svg,woff2}', '**/clock-sound-tick.mp3'] }
    })
  ],
  // @lucide/svelte ships .svelte icon files; Vite must compile them for SSR.
  ssr: { noExternal: ['@lucide/svelte'] }
});
