<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import {
    RiBrainLine,
    RiCupLine,
    RiMoreFill,
    RiPlayLargeFill,
    RiPauseLargeFill,
    RiSkipForwardFill,
    RiTreeLine
  } from 'svelte-remixicon';
  import * as Drawer from '$lib/components/ui/drawer';
  import Button from '$lib/components/ui/button/button.svelte';
  import DrawerComponent from './DrawerComponent.svelte';
  import { crossfade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { settings } from '$lib/store';
  import { timer, formattedTime } from '$lib/timer';
  import { sessions } from '$lib/analytics';
  import { notifications } from '$lib/notifications';
  import { toast } from 'svelte-sonner';

  const MODE_ICONS = {
    focus: RiBrainLine,
    shortBreak: RiCupLine,
    longBreak: RiTreeLine
  } as const;

  const MODE_TITLES = {
    focus: 'Focus',
    shortBreak: 'Short Break',
    longBreak: 'Long Break'
  } as const;

  let audio: HTMLAudioElement;
  let drawerOpen = false;
  let previousMode: keyof typeof MODE_TITLES = 'focus';

  $: currentIcon = MODE_ICONS[$timer.currentMode];
  $: currentTitle = MODE_TITLES[$timer.currentMode];
  $: playPauseIcon = $timer.isRunning ? RiPauseLargeFill : RiPlayLargeFill;

  $: if ($timer.isRunning && $timer.currentMode === 'focus' && $settings.hasSound) {
    audio?.play().catch(() => {});
    if (audio) audio.loop = true;
  } else if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  $: {
    if ($timer.currentMode !== previousMode) {
      if ($settings.hasNotification && previousMode !== $timer.currentMode) {
        showCompletionNotifications(previousMode, $timer.currentMode);
      }
      previousMode = $timer.currentMode;
    }
  }

  const [send, receive] = crossfade({
    duration: 500,
    fallback(node) {
      const style = getComputedStyle(node);
      const transform = style.transform === 'none' ? '' : style.transform;
      return {
        duration: 600,
        easing: cubicOut,
        css: (t) => `transform: ${transform} scale(${t}); opacity: ${t}`
      };
    }
  });

  function showCompletionNotifications(completedMode: keyof typeof MODE_TITLES, nextMode: keyof typeof MODE_TITLES): void {
    const completedTitle = MODE_TITLES[completedMode];
    const nextTitle = MODE_TITLES[nextMode];
    
    toast.success("Great job! Time's up!", {
      description: `${completedTitle} complete. Ready for ${nextTitle}?`,
      action: {
        label: `Skip ${nextTitle}`,
        onClick: () => timer.skip()
      }
    });

    notifications.showTimerComplete(completedTitle, nextTitle);
  }

  function handleToggle(): void {
    timer.toggle();
  }

  function handleSkip(): void {
    timer.skip();
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.altKey && event.key === 's') {
      event.preventDefault();
      drawerOpen = !drawerOpen;
    } else if (event.key === ' ') {
      event.preventDefault();
      handleToggle();
    } else if (event.altKey && event.key === 'n') {
      event.preventDefault();
      handleSkip();
    }
  }

  async function requestNotificationPermission(): Promise<void> {
    if (notifications.isSupported() && notifications.getPermission() === 'default') {
      await notifications.requestPermission();
    }
  }

  onMount(() => {
    settings.initialize();
    timer.initialize();
    sessions.initialize();
    requestNotificationPermission();
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    timer.destroy();
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

<svelte:head>
  <title>{currentTitle} - {$formattedTime.minutes}:{$formattedTime.seconds} | Aestoti</title>
  <link rel="icon" href="/logo-short.png" />
</svelte:head>

<Drawer.Root bind:open={drawerOpen}>
  <audio bind:this={audio} src="/clock-sound-tick.mp3"></audio>
  <div class="flex flex-col items-center justify-center h-full">
    {#key $timer.currentMode}
      <div
        class="flex items-center text-xl border-white bg-[#FF4C4C26] font-bold mb-8 border px-4 py-1 rounded-full lg:mr-2"
        in:receive={{ key: $timer.currentMode }}
        out:send={{ key: $timer.currentMode }}
      >
        <svelte:component this={currentIcon} class="mr-2" />
        {currentTitle}
      </div>
    {/key}
    <div
      class={`flex flex-col items-center ml-2 text-9xl mb-12 tracking-widest ${$timer.isRunning ? 'font-extrabold transition-all duration-300' : 'font-light transition-all duration-300'}`}
    >
      <div>{$formattedTime.minutes}</div>
      <div>{$formattedTime.seconds}</div>
    </div>
    <div class="flex space-x-4 items-center">
      <Drawer.Trigger>
        <Button
          class="bg-[#FF4C4C26] text-[#471515] dark:text-white rounded-2xl p-6 hover:bg-red-500/70 dark:hover:bg-red-950 text-2xl font-bold transition-transform duration-300 transform hover:scale-110"
        >
          <RiMoreFill />
        </Button>
      </Drawer.Trigger>
      <Button
        class="bg-[#FF4C4Cb5] text-[#471515] dark:text-white rounded-3xl p-8 hover:bg-red-700 text-3xl transition-transform duration-300 transform hover:scale-110"
        on:click={handleToggle}
      >
        <svelte:component this={playPauseIcon} />
      </Button>
      <Button
        class="bg-[#FF4C4C26] text-2xl font-bold text-[#471515] dark:text-white rounded-2xl p-6 hover:bg-red-500/70 dark:hover:bg-red-950 transition-transform duration-300 transform hover:scale-110"
        on:click={handleSkip}
      >
        <RiSkipForwardFill />
      </Button>
    </div>
  </div>
  <DrawerComponent />
</Drawer.Root>
