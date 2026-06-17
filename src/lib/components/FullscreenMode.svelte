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

<!-- Respects the app theme: bg-background / text-foreground + --primary accent. -->
<div
  bind:this={containerEl}
  class="fixed inset-0 z-50 flex flex-col bg-background px-8 py-7 text-foreground sm:px-14 sm:py-10"
>
  <!-- eyebrow -->
  <div class="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:gap-5 sm:text-xs">
    <span class="text-foreground">{currentTitle}</span>
    <span class="h-px flex-1 bg-border"></span>
    <span class="tabular-nums">{blockMinutes} min block</span>
    <button
      onclick={handleExitFullscreen}
      class="ml-2 grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
      title="Exit fullscreen (Esc)"
      aria-label="Exit fullscreen"
    >
      <Minimize2 class="size-4" />
    </button>
  </div>

  <!-- giant time, centered in remaining space -->
  <div class="flex flex-1 items-center justify-center">
    <div
      class="font-semibold leading-[0.78] tracking-[-0.045em] tabular-nums select-none"
      style="font-size: clamp(5rem, 26vw, 24rem)"
    >
      <span>{timer.formattedTime.minutes}</span><span class="text-muted-foreground/30">:</span><span
        class="text-primary">{timer.formattedTime.seconds}</span
      >
    </div>
  </div>

  <!-- progress rule -->
  <div
    class="h-[3px] w-full bg-border"
    role="progressbar"
    aria-label="{currentTitle} progress"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(elapsedPct)}
  >
    <div class="h-full bg-primary transition-[width] duration-1000 ease-linear" style="width: {elapsedPct}%"></div>
  </div>

  <!-- transport + hint -->
  <div class="mt-7 flex items-center justify-between gap-4">
    <div class="hidden font-mono text-xs tracking-wide text-muted-foreground sm:block">
      <kbd class="rounded bg-secondary px-1.5 py-0.5">Esc</kbd> exit
      <span class="mx-2 text-muted-foreground/50">·</span>
      <kbd class="rounded bg-secondary px-1.5 py-0.5">Space</kbd> play / pause
    </div>
    <div class="flex flex-1 items-center justify-end gap-3">
      <button
        onclick={() => timer.skip()}
        class="grid size-12 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Skip to next mode"
      >
        <SkipForward class="size-5" />
      </button>
      <button
        onclick={() => timer.toggle()}
        class="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
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
