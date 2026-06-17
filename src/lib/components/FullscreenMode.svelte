<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { timer, MODE_CONFIG } from '$lib/stores/timer.svelte';
  import { Minimize2, Play, Pause, SkipForward } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import ProgressRing from './ProgressRing.svelte';

  let { onExit }: { onExit: () => void } = $props();

  let containerEl = $state<HTMLDivElement | undefined>(undefined);

  let currentTitle = $derived(MODE_CONFIG[timer.state.currentMode].title);

  async function handleEnterFullscreen(): Promise<void> {
    if (containerEl && document.fullscreenElement !== containerEl) {
      await containerEl.requestFullscreen();
    }
  }

  async function handleExitFullscreen(): Promise<void> {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
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

<div
  bind:this={containerEl}
  class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white"
>
  <button
    onclick={handleExitFullscreen}
    class="absolute top-8 right-8 p-3 rounded-full hover:bg-white/10 transition-colors"
    title="Exit fullscreen (Esc)"
  >
    <Minimize2 class="h-8 w-8" />
  </button>

  <div class="text-center space-y-12">
    <div class="text-3xl font-light tracking-widest opacity-60 uppercase">{currentTitle}</div>

    <div class="relative flex items-center justify-center">
      <ProgressRing
        remainingSeconds={timer.state.remainingSeconds}
        totalSeconds={timer.totalSeconds}
        size={320}
        strokeWidth={6}
        color="rgba(255,255,255,0.8)"
        trackColor="rgba(255,255,255,0.1)"
      />
      <div
        class="absolute text-[8rem] leading-none font-thin tracking-wider tabular-nums"
        class:font-normal={timer.state.isRunning}
      >
        {timer.formattedTime.minutes}:{timer.formattedTime.seconds}
      </div>
    </div>

    <div class="flex items-center justify-center gap-8 pt-8">
      <Button
        variant="ghost"
        class="rounded-full w-20 h-20 border-2 border-white/30 hover:bg-white/10 hover:border-white/50"
        onclick={() => timer.toggle()}
      >
        {#if timer.state.isRunning}
          <Pause class="h-10 w-10" />
        {:else}
          <Play class="h-10 w-10 ml-1" />
        {/if}
      </Button>
      <Button
        variant="ghost"
        class="rounded-full w-14 h-14 border border-white/20 hover:bg-white/10"
        onclick={() => timer.skip()}
      >
        <SkipForward class="h-6 w-6" />
      </Button>
    </div>
  </div>

  <div class="absolute bottom-8 text-sm opacity-40">
    Press <kbd class="px-2 py-1 bg-white/10 rounded">Esc</kbd> to exit •
    <kbd class="px-2 py-1 bg-white/10 rounded">Space</kbd> to play/pause
  </div>
</div>
