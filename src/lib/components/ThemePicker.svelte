<script lang="ts">
  import { themes, THEMES } from '$lib/themes';
</script>

<div class="space-y-3">
  <h3 class="text-sm font-medium">Color Theme</h3>
  
  <div class="grid grid-cols-3 gap-2">
    {#each THEMES as theme (theme.id)}
      <button
        on:click={() => themes.setTheme(theme.id)}
        class="flex items-center gap-2 p-3 rounded-lg transition-all border {$themes === theme.id ? 'border-2 border-foreground bg-muted' : 'border-border bg-card hover:border-foreground/30'}"
      >
        <div
          class="w-5 h-5 rounded-full border-2 border-white shadow-sm"
          style="background-color: {theme.primary}"
        ></div>
        <span class="text-sm font-medium">{theme.name}</span>
      </button>
    {/each}
  </div>
</div>
