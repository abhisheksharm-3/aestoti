<script lang="ts">
  import '../app.css';
  import { ModeWatcher, toggleMode } from 'mode-watcher';
  import { Toaster } from '$lib/components/ui/sonner';
  import { ui } from '$lib/stores/ui.svelte';
  import CommandPalette from '$lib/components/CommandPalette.svelte';
  import PanelHost from '$lib/components/PanelHost.svelte';
  import { Command, SunMoon, Settings2 } from '@lucide/svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  function handleKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      ui.toggleCommand();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
<ModeWatcher defaultMode="light" />
<Toaster />

<div
  class="pointer-events-none fixed inset-0 -z-10"
  style="background: radial-gradient(64rem 42rem at 50% -12%, hsl(var(--primary) / 0.10), transparent 70%)"
></div>

<div class="flex h-svh flex-col">
  <header class="flex items-center justify-between px-5 py-4 sm:px-8">
    <a href="/" class="font-display text-3xl italic leading-none tracking-tight text-foreground">
      aestoti<span class="text-primary">.</span>
    </a>
    <div class="flex items-center gap-2">
      <button
        onclick={() => ui.toggleCommand()}
        class="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Open command menu"
      >
        <Command class="size-3.5" />
        <span class="hidden sm:inline">Command</span>
        <kbd class="rounded bg-muted px-1.5 py-0.5 text-[10px] tracking-wide">⌘K</kbd>
      </button>
      <button
        onclick={() => ui.openPanel('settings')}
        class="grid size-9 place-items-center rounded-lg border border-border bg-card/60 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Open settings"
        title="Settings"
      >
        <Settings2 class="size-4" />
      </button>
      <button
        onclick={() => toggleMode()}
        class="grid size-9 place-items-center rounded-lg border border-border bg-card/60 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Toggle light or dark theme"
      >
        <SunMoon class="size-4" />
      </button>
    </div>
  </header>

  <main class="min-h-0 flex-1">
    {@render children()}
  </main>
</div>

<CommandPalette />
<PanelHost />
