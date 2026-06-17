<script lang="ts">
  import { themes, THEMES } from '$lib/stores/themes.svelte';
</script>

<div class="space-y-3">
  <div class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Color</div>

  <div class="mt-3 grid grid-cols-3 gap-2">
    {#each THEMES as theme (theme.id)}
      <button
        onclick={() => themes.setTheme(theme.id)}
        class="flex items-center gap-2 rounded-md border p-3 transition-colors {themes.activeId === theme.id
          ? 'border-primary bg-secondary'
          : 'border-border hover:border-foreground/30'}"
      >
        <div
          class="h-4 w-4 rounded-sm border border-border"
          style="background-color: {theme.primary}"
        ></div>
        <span class="text-sm font-medium {themes.activeId === theme.id ? 'text-primary' : 'text-foreground'}">{theme.name}</span>
      </button>
    {/each}
  </div>
</div>
