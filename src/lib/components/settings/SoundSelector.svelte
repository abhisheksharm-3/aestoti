<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Play, Pause } from '@lucide/svelte';
  import { sounds } from '$lib/stores/sounds.svelte';
  import { SOUND_PRESETS } from '$lib/config/sounds';

  let selected = $derived(sounds.current.ambientSoundId);
  let hasSound = $derived(selected !== 'none');

  function pick(soundId: string): void {
    sounds.setAmbientSound(soundId);
    if (soundId === 'none') sounds.setPreview(false);
  }

  function togglePreview(): void {
    sounds.setPreview(!sounds.previewing);
  }

  // Stop the preview when the panel closes.
  onDestroy(() => sounds.setPreview(false));
</script>

<div class="space-y-8">
  <section class="space-y-3">
    <div class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Ambient sound</div>
    <div class="grid grid-cols-3 gap-2">
      {#each SOUND_PRESETS as preset (preset.id)}
        <button
          onclick={() => pick(preset.id)}
          class="flex flex-col items-start gap-2 rounded-md border p-3 text-left transition-colors {selected ===
          preset.id
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-foreground/30'}"
        >
          <span class="text-lg leading-none">{preset.icon}</span>
          <span class="text-[13px] font-medium {selected === preset.id ? 'text-primary' : 'text-foreground'}">
            {preset.name}
          </span>
        </button>
      {/each}
    </div>
  </section>

  {#if hasSound}
    <section class="space-y-4 border-t border-border pt-6">
      <div class="flex items-center justify-between">
        <div class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Preview</div>
        <button
          onclick={togglePreview}
          class="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-foreground/30"
        >
          {#if sounds.previewing}
            <Pause class="size-3.5" /> Stop
          {:else}
            <Play class="size-3.5" /> Play
          {/if}
        </button>
      </div>

      <div class="flex items-center gap-4">
        <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Volume</span>
        <input
          type="range"
          min="0"
          max="100"
          value={sounds.current.ambientVolume}
          oninput={(e) => sounds.setAmbientVolume(Number(e.currentTarget.value))}
          class="h-1 flex-1 accent-primary"
          aria-label="Ambient volume"
        />
        <span class="w-10 text-right text-sm tabular-nums text-muted-foreground">{sounds.current.ambientVolume}%</span>
      </div>
    </section>
  {/if}
</div>
