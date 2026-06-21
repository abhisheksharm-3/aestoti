<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Headphones, Play, Pause } from '@lucide/svelte';
  import { sounds } from '$lib/stores/sounds.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { timer } from '$lib/stores/timer.svelte';
  import { SOUND_PRESETS } from '$lib/config/sounds';
  import { LOFI_STATIONS } from '$lib/config/lofi';

  let isOpen = $state(false);
  let wrapperEl = $state<HTMLDivElement>();

  let selected = $derived(sounds.current.ambientSoundId);
  let hasSelection = $derived(selected !== 'none');
  /** During a running focus block ambient plays automatically; elsewhere the user drives it with the Play/Stop toggle. */
  let focusPlaying = $derived(timer.state.isRunning && timer.state.currentMode === 'focus');

  /** Toggle the ambient preview; pressing play also unmutes globally, since the intent is clearly to hear sound. */
  function togglePlay(): void {
    if (!sounds.isPreviewing && !settings.current.hasSound) settings.updateSetting('hasSound', true);
    sounds.setPreview(!sounds.isPreviewing);
  }

  function handleWindowPointer(event: MouseEvent): void {
    if (isOpen && wrapperEl && !wrapperEl.contains(event.target as Node)) isOpen = false;
  }
  function handleWindowKey(event: KeyboardEvent): void {
    if (isOpen && event.key === 'Escape') isOpen = false;
  }

  /**
   * An idle preview is only audible while the popover is open, so closing it (or
   * unmounting) ends the preview. A running focus block keeps its own ambient
   * going via the Pomodoro effect, independent of the preview flag.
   */
  $effect(() => {
    if (!isOpen) sounds.setPreview(false);
  });
  onDestroy(() => sounds.setPreview(false));
</script>

<svelte:window onclick={handleWindowPointer} onkeydown={handleWindowKey} />

<div class="relative" bind:this={wrapperEl}>
  <button
    onclick={() => (isOpen = !isOpen)}
    aria-haspopup="dialog"
    aria-expanded={isOpen}
    aria-label="Choose ambient sound"
    title="Sound"
    class="grid size-11 place-items-center rounded-md border border-border transition-colors hover:text-foreground {hasSelection
      ? 'text-primary'
      : 'text-muted-foreground'}"
  >
    <Headphones class="size-4" />
  </button>

  {#if isOpen}
    <div
      role="dialog"
      aria-label="Sound"
      class="absolute bottom-[calc(100%+0.5rem)] right-0 z-30 w-72 space-y-4 rounded-lg border border-border bg-card p-4 shadow-xl"
    >
      <div class="flex items-center justify-between">
        <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sound</span>
        {#if focusPlaying && hasSelection}
          <span class="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.15em] text-primary">
            <span class="size-1.5 rounded-full bg-primary"></span>playing
          </span>
        {:else if hasSelection}
          <button
            onclick={togglePlay}
            class="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[12px] font-medium text-foreground transition-colors hover:border-foreground/30"
          >
            {#if sounds.isPreviewing}
              <Pause class="size-3" /> Stop
            {:else}
              <Play class="size-3" /> Play
            {/if}
          </button>
        {/if}
      </div>

      <div class="space-y-2">
        <div class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Ambient</div>
        <div class="grid grid-cols-3 gap-1.5">
          {#each SOUND_PRESETS as preset (preset.id)}
            <button
              onclick={() => sounds.selectAmbient(preset.id)}
              class="flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-left text-[12px] transition-colors {selected ===
              preset.id
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border text-foreground hover:border-foreground/30'}"
            >
              <span class="leading-none">{preset.icon}</span>
              <span class="truncate">{preset.name}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Radio</span>
          <span class="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
            <span class="size-1.5 rounded-full bg-primary"></span>live
          </span>
        </div>
        <div class="grid grid-cols-3 gap-1.5">
          {#each LOFI_STATIONS as station (station.id)}
            <button
              onclick={() => sounds.selectAmbient(station.id)}
              class="flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-left text-[12px] transition-colors {selected ===
              station.id
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border text-foreground hover:border-foreground/30'}"
            >
              <span class="leading-none">{station.icon}</span>
              <span class="truncate">{station.name}</span>
            </button>
          {/each}
        </div>
      </div>

      {#if hasSelection}
        <div class="flex items-center gap-3 border-t border-border pt-3">
          <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Vol</span>
          <input
            type="range"
            min="0"
            max="100"
            value={sounds.current.ambientVolume}
            oninput={(e) => sounds.setAmbientVolume(Number(e.currentTarget.value))}
            class="h-1 flex-1 accent-primary"
            aria-label="Ambient volume"
          />
          <span class="w-9 text-right text-xs tabular-nums text-muted-foreground">{sounds.current.ambientVolume}%</span>
        </div>
      {/if}
    </div>
  {/if}
</div>
