<script lang="ts">
  import { presets, DEFAULT_PRESETS } from '$lib/presets';
  import { settings } from '$lib/store';
  import { timer } from '$lib/timer';
  import { Clock } from 'lucide-svelte';

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
  <h3 class="text-sm font-medium flex items-center gap-2">
    <Clock class="h-4 w-4" />
    Timer Presets
  </h3>
  
  <div class="grid grid-cols-2 gap-2">
    {#each $presets.presets as preset (preset.id)}
      <button
        on:click={() => handlePresetSelect(preset.id)}
        class="flex flex-col p-3 rounded-lg text-left transition-all border {$presets.activePresetId === preset.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/50'}"
      >
        <span class="font-medium text-sm">{preset.name}</span>
        <span class="text-xs opacity-70">
          {preset.focusLength}/{preset.shortLength}/{preset.longLength} min
        </span>
      </button>
    {/each}
  </div>
</div>
