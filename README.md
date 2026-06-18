# Aestoti

A focus timer you actually reach for — an editorial, distraction-free Pomodoro with tasks, insights, ambient sound, and themes. Installable as a PWA, and everything stays on your device.

## Features

- **Accurate timer** — focus / short break / long break that tracks a wall-clock deadline rather than a ticking counter, so it stays correct when the tab is backgrounded — and **resumes a running session after a reload**.
- **Tasks** — pick what you're working on; pomodoro count is tracked per task.
- **Insights** — a configurable daily goal, current streak, a 7-day focus score, an activity heatmap with month labels, and most-productive-hours. **Import or export** your sessions as JSON, or export CSV.
- **Sound** — ambient loops (rain, forest, ocean, fireplace, clock tick) and **live lofi & chill radio** stations, with a quick picker right on the timer (and in fullscreen), live preview, and volume control.
- **Fullscreen focus** — a distraction-free mode with an optional **wall-clock mode** that shows the current time of day (with optional seconds) while the timer keeps running underneath.
- **Appearance** — six color themes plus light / dark, applied across the whole UI.
- **Command palette (⌘K)**, customizable keyboard shortcuts, a post-session journal, and gentle break prompts.
- **PWA** — install it to your dock or home screen; the app shell and notification cue work offline.
- **Private by design** — all data lives in your browser's `localStorage`, validated on load. No account, no server, no tracking.

## Tech

SvelteKit 2 · Svelte 5 (runes) · TypeScript · Tailwind CSS v4 · bits-ui / shadcn-svelte · Vite · Vitest · `@vite-pwa/sveltekit`

## Develop

```bash
npm install
npm run dev        # start the dev server
npm run check      # type-check with svelte-check
npm test           # run the unit tests (Vitest)
npm run build      # production build
npm run preview    # preview the production build
```

## Deploy

Deployed on Vercel via `@sveltejs/adapter-vercel`. To target another platform (Netlify, Cloudflare, Node, or a static host), swap in the matching SvelteKit adapter in `svelte.config.js` — see the [SvelteKit adapters docs](https://svelte.dev/docs/kit/adapters).

## License

[MIT](./LICENSE) © Abhishek Sharma
