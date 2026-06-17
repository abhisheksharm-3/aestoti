<script lang="ts">
  import { sounds, SOUND_PRESETS } from '$lib/stores/sounds.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { Label } from '$lib/components/ui/label';

  function handleSoundChange(soundId: string): void {
    sounds.setAmbientSound(soundId);
    if (soundId !== 'none') {
      sounds.playAmbient(settings.current.hasSound);
    } else {
      sounds.stopAmbient();
    }
  }
</script>

<div class="space-y-4">
  <Label class="text-sm font-medium">Ambient Sound</Label>

  <div class="grid grid-cols-4 gap-2">
    {#each SOUND_PRESETS as preset (preset.id)}
      <button
        onclick={() => handleSoundChange(preset.id)}
        class="flex flex-col items-center gap-1 p-3 rounded-lg transition-all border {sounds.current.ambientSoundId === preset.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/50'}"
      >
        <span class="text-xl">{preset.icon}</span>
        <span class="text-xs">{preset.name}</span>
      </button>
    {/each}
  </div>

  {#if sounds.current.ambientSoundId !== 'none'}
    <div class="flex items-center gap-4">
      <Label class="text-sm whitespace-nowrap">Volume</Label>
      <input
        type="range"
        min="0"
        max="100"
        value={sounds.current.ambientVolume}
        oninput={(e) => sounds.setAmbientVolume(Number(e.currentTarget.value))}
        class="flex-1 accent-primary"
      />
      <span class="text-sm text-muted-foreground w-12">{sounds.current.ambientVolume}%</span>
    </div>
  {/if}
</div>
