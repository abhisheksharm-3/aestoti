<script lang="ts">
  import { presets } from '$lib/stores/presets.svelte';
  import { DEFAULT_PRESETS } from '$lib/config/presets';
  import { settings } from '$lib/stores/settings.svelte';
  import { timer } from '$lib/stores/timer.svelte';

  function handlePresetSelect(presetId: string): void {
    const preset = presets.setActive(presetId);
    if (preset) {
      settings.updateSetting('focusLength', preset.focusLength);
      settings.updateSetting('shortLength', preset.shortLength);
      settings.updateSetting('longLength', preset.longLength);
      settings.updateSetting('longBreakInterval', preset.longBreakInterval);
      timer.syncWithSettings();
    }
  }
</script>

<div class="space-y-3">
  <div class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Timer Presets</div>

  <div class="mt-3 grid grid-cols-2 gap-2">
    {#each presets.state.presets as preset (preset.id)}
      <button
        onclick={() => handlePresetSelect(preset.id)}
        class="flex flex-col items-start gap-1 rounded-md border p-3 text-left transition-colors {presets.state.activePresetId === preset.id
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-foreground/30'}"
      >
        <span class="text-sm font-medium {presets.state.activePresetId === preset.id ? 'text-primary' : 'text-foreground'}">{preset.name}</span>
        <span class="font-mono text-[11px] tabular-nums text-muted-foreground">
          {preset.focusLength}/{preset.shortLength}/{preset.longLength} min
        </span>
      </button>
    {/each}
  </div>
</div>
