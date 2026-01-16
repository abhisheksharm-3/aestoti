<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { timer, formattedTime } from '$lib/timer';
  import { Minimize2, Maximize2, Play, Pause, SkipForward } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';

  export let onExit: () => void;

  const MODE_TITLES = {
    focus: 'Focus',
    shortBreak: 'Short Break',
    longBreak: 'Long Break'
  } as const;

  let containerEl: HTMLDivElement;

  $: currentTitle = MODE_TITLES[$timer.currentMode];
  $: progressPercent = $timer.isRunning 
    ? 100 - (($timer.remainingSeconds / (25 * 60)) * 100)
    : 0;

  async function enterFullscreen(): Promise<void> {
    try {
      if (containerEl && document.fullscreenElement !== containerEl) {
        await containerEl.requestFullscreen();
      }
    } catch (e) {
      console.log('Fullscreen not supported');
    }
  }

  async function exitFullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.log('Exit fullscreen failed');
    }
    onExit();
  }

  function handleFullscreenChange(): void {
    if (!document.fullscreenElement) {
      onExit();
    }
  }

  onMount(() => {
    enterFullscreen();
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
  <!-- Exit button -->
  <button
    on:click={exitFullscreen}
    class="absolute top-8 right-8 p-3 rounded-full hover:bg-white/10 transition-colors"
    title="Exit fullscreen (Esc)"
  >
    <Minimize2 class="h-8 w-8" />
  </button>

  <!-- Main content -->
  <div class="text-center space-y-12">
    <!-- Mode indicator -->
    <div class="text-3xl font-light tracking-widest opacity-60 uppercase">
      {currentTitle}
    </div>

    <!-- Timer display -->
    <div class="relative">
      <div
        class="text-[16rem] leading-none font-thin tracking-wider tabular-nums"
        class:font-normal={$timer.isRunning}
      >
        {$formattedTime.minutes}:{$formattedTime.seconds}
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-center gap-8 pt-8">
      <Button
        variant="ghost"
        class="rounded-full w-20 h-20 border-2 border-white/30 hover:bg-white/10 hover:border-white/50"
        on:click={() => timer.toggle()}
      >
        {#if $timer.isRunning}
          <Pause class="h-10 w-10" />
        {:else}
          <Play class="h-10 w-10 ml-1" />
        {/if}
      </Button>
      <Button
        variant="ghost"
        class="rounded-full w-14 h-14 border border-white/20 hover:bg-white/10"
        on:click={() => timer.skip()}
      >
        <SkipForward class="h-6 w-6" />
      </Button>
    </div>
  </div>

  <!-- Keyboard hint -->
  <div class="absolute bottom-8 text-sm opacity-40">
    Press <kbd class="px-2 py-1 bg-white/10 rounded">Esc</kbd> to exit • 
    <kbd class="px-2 py-1 bg-white/10 rounded">Space</kbd> to play/pause
  </div>
</div>
