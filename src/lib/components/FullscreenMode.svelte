<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { timer, MODE_CONFIG } from '$lib/stores/timer.svelte';
  import { Minimize2, Play, Pause, SkipForward } from '@lucide/svelte';

  let { onExit }: { onExit: () => void } = $props();

  let containerEl = $state<HTMLDivElement | undefined>(undefined);

  let currentTitle = $derived(MODE_CONFIG[timer.state.currentMode].title);
  let blockMinutes = $derived(Math.round(timer.totalSeconds / 60));
  let elapsedPct = $derived(
    timer.totalSeconds > 0
      ? Math.min(100, ((timer.totalSeconds - timer.state.remainingSeconds) / timer.totalSeconds) * 100)
      : 0
  );

  async function handleEnterFullscreen(): Promise<void> {
    if (containerEl && document.fullscreenElement !== containerEl) {
      await containerEl.requestFullscreen().catch(() => {});
    }
  }

  async function handleExitFullscreen(): Promise<void> {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    }
    onExit();
  }

  function handleFullscreenChange(): void {
    if (!document.fullscreenElement) onExit();
  }

  onMount(() => {
    handleEnterFullscreen();
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  });

  onDestroy(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  });
</script>

<!-- Always the dramatic "ink" canvas, regardless of theme: fullscreen = deep focus. -->
<div
  bind:this={containerEl}
  class="fixed inset-0 z-50 flex flex-col bg-[#100c0b] px-8 py-7 text-[#f2ebe2] sm:px-14 sm:py-10"
  style="--fs-accent: #e0633b"
>
  <!-- eyebrow -->
  <div class="flex items-center gap-5 font-mono text-xs uppercase tracking-[0.24em] text-white/45">
    <span class="text-white/80">{currentTitle}</span>
    <span class="h-px flex-1 bg-white/12"></span>
    <span class="tabular-nums">{blockMinutes} min block</span>
    <button
      onclick={handleExitFullscreen}
      class="ml-3 grid size-9 place-items-center rounded-md border border-white/15 text-white/55 transition-colors hover:text-white"
      title="Exit fullscreen (Esc)"
      aria-label="Exit fullscreen"
    >
      <Minimize2 class="size-4" />
    </button>
  </div>

  <!-- giant time, centered in the remaining space -->
  <div class="flex flex-1 items-center justify-center">
    <div
      class="font-semibold leading-[0.78] tracking-[-0.045em] tabular-nums select-none"
      style="font-size: clamp(6rem, 27vw, 24rem)"
    >
      <span>{timer.formattedTime.minutes}</span><span class="text-white/20">:</span><span
        style="color: var(--fs-accent)">{timer.formattedTime.seconds}</span
      >
    </div>
  </div>

  <!-- progress rule -->
  <div class="h-[3px] w-full bg-white/12">
    <div
      class="h-full transition-[width] duration-1000 ease-linear"
      style="width: {elapsedPct}%; background: var(--fs-accent)"
    ></div>
  </div>

  <!-- transport + hint -->
  <div class="mt-7 flex items-center justify-between">
    <div class="font-mono text-xs tracking-wide text-white/35">
      <kbd class="rounded bg-white/10 px-1.5 py-0.5">Esc</kbd> exit
      <span class="mx-2 text-white/20">·</span>
      <kbd class="rounded bg-white/10 px-1.5 py-0.5">Space</kbd> play / pause
    </div>
    <div class="flex items-center gap-3">
      <button
        onclick={() => timer.skip()}
        class="grid size-12 place-items-center rounded-md border border-white/15 text-white/60 transition-colors hover:text-white"
        aria-label="Skip to next mode"
      >
        <SkipForward class="size-5" />
      </button>
      <button
        onclick={() => timer.toggle()}
        class="inline-flex h-12 items-center gap-2 rounded-md px-8 text-sm font-semibold text-[#100c0b] transition-transform hover:scale-[1.02]"
        style="background: var(--fs-accent)"
        aria-label={timer.state.isRunning ? 'Pause timer' : 'Start timer'}
      >
        {#if timer.state.isRunning}
          <Pause class="size-4" /> Pause
        {:else}
          <Play class="size-4" /> Start
        {/if}
      </button>
    </div>
  </div>
</div>
