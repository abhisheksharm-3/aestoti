# Aestoti

A focus timer you actually reach for — an editorial, distraction-free Pomodoro with tasks, insights, ambient sound, and themes. Installable as a PWA, and everything stays on your device.

## Features

- **Wall-clock timer** — focus / short break / long break that stays accurate even when the tab is in the background (it tracks a deadline, not a ticking counter).
- **Tasks** — pick what you're working on; pomodoro count is tracked per task.
- **Insights** — daily goal, current streak, a 7-day focus score, a 16-week activity heatmap, and most-productive-hours. Export your sessions to CSV or JSON.
- **Ambient sound** — rain, forest, ocean, fireplace, or a clock tick, with live preview and volume control.
- **Appearance** — six color themes plus light / dark, applied across the whole UI.
- **Command palette (⌘K)**, customizable keyboard shortcuts, a full-screen focus mode, a post-session journal, and gentle break prompts.
- **PWA** — install it to your dock or home screen; the app shell works offline.
- **Private by design** — all data lives in your browser's `localStorage`. No account, no server, no tracking.

## Tech

SvelteKit 2 · Svelte 5 (runes) · TypeScript · Tailwind CSS v4 · bits-ui / shadcn-svelte · Vite · `@vite-pwa/sveltekit`

## Develop

```bash
npm install
npm run dev        # start the dev server
npm run check      # type-check with svelte-check
npm run build      # production build
npm run preview    # preview the production build
```

## Deploy

The project uses `@sveltejs/adapter-auto`. For a specific target (Vercel, Netlify, Cloudflare, Node, or a static host) install the matching SvelteKit adapter and deploy the build output — see the [SvelteKit adapters docs](https://svelte.dev/docs/kit/adapters).

## License

[MIT](./LICENSE) © Abhishek Sharma
