<script lang="ts">
  import '../app.css';
  import { ModeWatcher } from 'mode-watcher';
  import { Toaster } from '$lib/components/ui/sonner';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<div class="h-screen lg:px-10">
  <nav class="flex items-center justify-center p-8">
    <a href="/" class="font-display text-4xl italic leading-none tracking-tight text-foreground">
      aestoti<span class="text-primary">.</span>
    </a>
  </nav>
  <ModeWatcher />
  <Toaster />
  {@render children()}
</div>
