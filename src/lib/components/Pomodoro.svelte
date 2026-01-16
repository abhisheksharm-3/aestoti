<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import {
    RiBrainLine,
    RiCupLine,
    RiMoreFill,
    RiPlayLargeFill,
    RiPauseLargeFill,
    RiSkipForwardFill,
    RiTreeLine,
    RiFullscreenFill
  } from 'svelte-remixicon';
  import * as Drawer from '$lib/components/ui/drawer';
  import Button from '$lib/components/ui/button/button.svelte';
  import DrawerComponent from './DrawerComponent.svelte';
  import DailyGoal from './DailyGoal.svelte';
  import FullscreenMode from './FullscreenMode.svelte';
  import { crossfade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { settings } from '$lib/store';
  import { timer, formattedTime } from '$lib/timer';
  import { sessions } from '$lib/analytics';
  import { tasks, activeTaskId } from '$lib/tasks';
  import { goals } from '$lib/goals';
  import { sounds } from '$lib/sounds';
  import { presets } from '$lib/presets';
  import { themes } from '$lib/themes';
  import { shortcuts } from '$lib/shortcuts';
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

  let drawerOpen = false;
  let isFullscreen = false;
  let previousMode: keyof typeof MODE_TITLES = 'focus';

  $: currentIcon = MODE_ICONS[$timer.currentMode];
  $: currentTitle = MODE_TITLES[$timer.currentMode];
  $: playPauseIcon = $timer.isRunning ? RiPauseLargeFill : RiPlayLargeFill;
  $: activeTask = $tasks.find(t => t.id === $activeTaskId);
  $: themeColor = themes.getCurrent();

  $: if ($timer.isRunning && $timer.currentMode === 'focus') {
    sounds.playAmbient();
  } else {
    sounds.stopAmbient();
  }

  $: {
    if ($timer.currentMode !== previousMode) {
      if ($settings.hasNotification) {
        showCompletionNotifications(previousMode, $timer.currentMode);
        sounds.playNotification();
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
    if (shortcuts.matchesEvent(event, 'openSettings')) {
      event.preventDefault();
      drawerOpen = !drawerOpen;
    } else if (shortcuts.matchesEvent(event, 'toggleTimer')) {
      event.preventDefault();
      handleToggle();
    } else if (shortcuts.matchesEvent(event, 'skipMode')) {
      event.preventDefault();
      handleSkip();
    } else if (shortcuts.matchesEvent(event, 'restartMode')) {
      event.preventDefault();
      timer.restart();
    } else if (shortcuts.matchesEvent(event, 'toggleFullscreen')) {
      event.preventDefault();
      isFullscreen = !isFullscreen;
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
    tasks.initialize();
    goals.initialize();
    sounds.initialize();
    presets.initialize();
    themes.initialize();
    shortcuts.initialize();
    requestNotificationPermission();
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    timer.destroy();
    sounds.stopAmbient();
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

<svelte:head>
  <title>{currentTitle} - {$formattedTime.minutes}:{$formattedTime.seconds} | Aestoti</title>
  <link rel="icon" href="/logo-short.png" />
  <style>
    :root {
      --btn-bg: var(--theme-primary, #FF4C4C);
      --btn-bg-light: color-mix(in srgb, var(--theme-primary, #FF4C4C) 20%, transparent);
      --btn-bg-hover: color-mix(in srgb, var(--theme-primary, #FF4C4C) 70%, transparent);
    }
  </style>
</svelte:head>

{#if isFullscreen}
  <FullscreenMode onExit={() => isFullscreen = false} />
{:else}
  <Drawer.Root bind:open={drawerOpen}>
    <div class="flex flex-col items-center justify-center h-full gap-3">
      <DailyGoal />
      
      <!-- Active Task Display -->
      {#if activeTask}
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm">
          <span class="text-muted-foreground">Working on:</span>
          <span class="font-medium">{activeTask.title}</span>
          <span class="text-xs bg-primary/20 px-2 py-0.5 rounded-full">
            🍅 {activeTask.focusSessionsSpent}
          </span>
        </div>
      {/if}
      
      {#key $timer.currentMode}
        <div
          class="flex items-center text-xl font-bold mb-2 px-4 py-1 rounded-full border"
          style="background: var(--btn-bg-light); border-color: var(--btn-bg)"
          in:receive={{ key: $timer.currentMode }}
          out:send={{ key: $timer.currentMode }}
        >
          <svelte:component this={currentIcon} class="mr-2" />
          {currentTitle}
        </div>
      {/key}
      
      <div
        class="flex flex-col items-center ml-2 text-9xl mb-6 tracking-widest {$timer.isRunning ? 'font-extrabold' : 'font-light'} transition-all duration-300"
      >
        <div>{$formattedTime.minutes}</div>
        <div>{$formattedTime.seconds}</div>
      </div>
      
      <div class="flex space-x-4 items-center">
        <Button
          class="rounded-2xl p-4 text-xl transition-transform duration-300 transform hover:scale-110"
          style="background: var(--btn-bg-light)"
          on:click={() => isFullscreen = true}
          title="Fullscreen (Alt+F)"
        >
          <RiFullscreenFill />
        </Button>
        <Drawer.Trigger>
          <Button
            class="rounded-2xl p-6 text-2xl font-bold transition-transform duration-300 transform hover:scale-110"
            style="background: var(--btn-bg-light)"
          >
            <RiMoreFill />
          </Button>
        </Drawer.Trigger>
        <Button
          class="rounded-3xl p-8 text-3xl transition-transform duration-300 transform hover:scale-110"
          style="background: var(--btn-bg)"
          on:click={handleToggle}
        >
          <svelte:component this={playPauseIcon} />
        </Button>
        <Button
          class="rounded-2xl p-6 text-2xl font-bold transition-transform duration-300 transform hover:scale-110"
          style="background: var(--btn-bg-light)"
          on:click={handleSkip}
        >
          <RiSkipForwardFill />
        </Button>
      </div>
    </div>
    <DrawerComponent />
  </Drawer.Root>
{/if}
