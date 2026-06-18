<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Play, Pause } from '@lucide/svelte';
  import { sounds } from '$lib/stores/sounds.svelte';
  import { SOUND_PRESETS } from '$lib/config/sounds';
  import { LOFI_STATIONS } from '$lib/config/lofi';

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
    <div class="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Ambient sound</div>
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

  <section class="space-y-3">
    <div class="flex items-center gap-2">
      <div class="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Radio</div>
      <span class="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
        <span class="size-1.5 rounded-full bg-primary"></span>live
      </span>
    </div>
    <div class="grid grid-cols-3 gap-2">
      {#each LOFI_STATIONS as station (station.id)}
        <button
          onclick={() => pick(station.id)}
          class="flex flex-col items-start gap-2 rounded-md border p-3 text-left transition-colors {selected ===
          station.id
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-foreground/30'}"
        >
          <span class="text-lg leading-none">{station.icon}</span>
          <span class="text-[13px] font-medium {selected === station.id ? 'text-primary' : 'text-foreground'}">
            {station.name}
          </span>
        </button>
      {/each}
    </div>
    <p class="font-mono text-[10px] text-muted-foreground">Streamed live via SomaFM · needs a connection</p>
  </section>

  {#if hasSound}
    <section class="space-y-4 border-t border-border/70 pt-6">
      <div class="flex items-center justify-between">
        <div class="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Preview</div>
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
        <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Volume</span>
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
