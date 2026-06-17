<script lang="ts">
  import { onMount, onDestroy, untrack } from 'svelte';
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
  import { crossfade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { toast } from 'svelte-sonner';
  import * as Drawer from '$lib/components/ui/drawer';
  import { Button } from '$lib/components/ui/button';
  import { timer, MODE_CONFIG } from '$lib/stores/timer.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { analytics } from '$lib/stores/analytics.svelte';
  import { tasksStore } from '$lib/stores/tasks.svelte';
  import { sounds } from '$lib/stores/sounds.svelte';
  import { shortcuts } from '$lib/stores/shortcuts.svelte';
  import { notifications } from '$lib/services/notifications';
  import ControlPanel from './ControlPanel.svelte';
  import DailyGoal from './DailyGoal.svelte';
  import FullscreenMode from './FullscreenMode.svelte';
  import ProgressRing from './ProgressRing.svelte';
  import SessionJournal from './SessionJournal.svelte';
  import BreakPrompt from './BreakPrompt.svelte';

  const MODE_ICONS = {
    focus: RiBrainLine,
    shortBreak: RiCupLine,
    longBreak: RiTreeLine
  } as const;

  let isDrawerOpen = $state(false);
  let isFullscreen = $state(false);
  let isJournalVisible = $state(false);
  let isBreakPromptVisible = $state(false);
  let previousMode = $state<keyof typeof MODE_CONFIG>('focus');

  let ModeIcon = $derived(MODE_ICONS[timer.state.currentMode]);
  let currentTitle = $derived(MODE_CONFIG[timer.state.currentMode].title);
  let PlayPauseIcon = $derived(timer.state.isRunning ? RiPauseLargeFill : RiPlayLargeFill);
  let activeTask = $derived(tasksStore.tasks.find(t => t.id === tasksStore.activeTaskId));

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

  // Wire session-complete callback once at component init
  timer.setOnSessionComplete((mode, startTime, endTime, isCompleted) => {
    analytics.recordSession(mode, startTime, endTime, isCompleted);
    if (mode === 'focus' && isCompleted) {
      if (tasksStore.activeTaskId) tasksStore.incrementSession(tasksStore.activeTaskId);
      isJournalVisible = true;
    }
  });

  // Ambient sound
  $effect(() => {
    if (timer.state.isRunning && timer.state.currentMode === 'focus') {
      sounds.playAmbient(settings.current.hasSound);
    } else {
      sounds.stopAmbient();
    }
  });

  // Mode change: notifications + break prompt. Only `timer.state.currentMode` is
  // a tracked dependency; the comparison/state writes run inside untrack so the
  // effect doesn't re-fire on its own `previousMode` write.
  $effect(() => {
    const currentMode = timer.state.currentMode;
    untrack(() => {
      if (currentMode === previousMode) return;
      if (settings.current.hasNotification) {
        const completedTitle = MODE_CONFIG[previousMode].title;
        const nextTitle = MODE_CONFIG[currentMode].title;
        toast.success("Great job! Time's up!", {
          description: `${completedTitle} complete. Ready for ${nextTitle}?`,
          action: { label: `Skip ${nextTitle}`, onclick: () => timer.skip() }
        });
        notifications.showTimerComplete(completedTitle, nextTitle);
        sounds.playNotification();
      }
      isBreakPromptVisible =
        (currentMode === 'shortBreak' || currentMode === 'longBreak') &&
        settings.current.hasBreakPrompts;
      previousMode = currentMode;
    });
  });

  function handleJournalSubmit(note: string): void {
    if (note) {
      const lastSession = analytics.sessions.at(-1);
      if (lastSession) analytics.addNote(lastSession.id, note);
    }
    isJournalVisible = false;
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (shortcuts.matchesEvent(event, 'openSettings')) {
      event.preventDefault();
      isDrawerOpen = !isDrawerOpen;
    } else if (shortcuts.matchesEvent(event, 'toggleTimer')) {
      event.preventDefault();
      handleToggleTimer();
    } else if (shortcuts.matchesEvent(event, 'skipMode')) {
      event.preventDefault();
      timer.skip();
    } else if (shortcuts.matchesEvent(event, 'restartMode')) {
      event.preventDefault();
      timer.restart();
    } else if (shortcuts.matchesEvent(event, 'toggleFullscreen')) {
      event.preventDefault();
      isFullscreen = !isFullscreen;
    }
  }

  // Request notification permission on the FIRST timer start, not on page load.
  // Cold-prompting on load is an anti-pattern browsers and users penalize.
  async function ensureNotificationPermission(): Promise<void> {
    if (
      settings.current.hasNotification &&
      notifications.isSupported() &&
      notifications.getPermission() === 'default'
    ) {
      await notifications.requestPermission();
    }
  }

  function handleToggleTimer(): void {
    if (!timer.state.isRunning) ensureNotificationPermission();
    timer.toggle();
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    timer.destroy();
    sounds.stopAmbient();
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

<svelte:head>
  <title>{currentTitle} - {timer.formattedTime.minutes}:{timer.formattedTime.seconds} | Aestoti</title>
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
  <FullscreenMode onExit={() => (isFullscreen = false)} />
{:else}
  <Drawer.Root bind:open={isDrawerOpen}>
    <div class="flex flex-col items-center justify-center h-full gap-3">
      <DailyGoal />

      {#if activeTask}
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm">
          <span class="text-muted-foreground">Working on:</span>
          <span class="font-medium">{activeTask.title}</span>
          <span class="text-xs bg-primary/20 px-2 py-0.5 rounded-full">
            🍅 {activeTask.focusSessionsSpent}
          </span>
        </div>
      {/if}

      {#key timer.state.currentMode}
        <div
          class="flex items-center text-xl font-bold mb-2 px-4 py-1 rounded-full border"
          style="background: var(--btn-bg-light); border-color: var(--btn-bg)"
          in:receive={{ key: timer.state.currentMode }}
          out:send={{ key: timer.state.currentMode }}
        >
          {@const Icon = ModeIcon}
          <Icon class="mr-2" />
          {currentTitle}
        </div>
      {/key}

      {#if isBreakPromptVisible}
        <BreakPrompt
          mode={timer.state.currentMode}
          onDismiss={() => (isBreakPromptVisible = false)}
        />
      {/if}

      <div class="relative flex items-center justify-center">
        <ProgressRing
          remainingSeconds={timer.state.remainingSeconds}
          totalSeconds={timer.totalSeconds}
          size={240}
          strokeWidth={5}
        />
        <div
          class="absolute flex flex-col items-center ml-2 text-9xl tracking-widest {timer.state.isRunning ? 'font-extrabold' : 'font-light'} transition-all duration-300"
        >
          <div>{timer.formattedTime.minutes}</div>
          <div>{timer.formattedTime.seconds}</div>
        </div>
      </div>

      <div class="flex space-x-4 items-center">
        <Button
          class="rounded-2xl p-4 text-xl transition-transform duration-300 transform hover:scale-110"
          style="background: var(--btn-bg-light)"
          onclick={() => (isFullscreen = true)}
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
          onclick={handleToggleTimer}
        >
          {@const Icon = PlayPauseIcon}
          <Icon />
        </Button>
        <Button
          class="rounded-2xl p-6 text-2xl font-bold transition-transform duration-300 transform hover:scale-110"
          style="background: var(--btn-bg-light)"
          onclick={() => timer.skip()}
        >
          <RiSkipForwardFill />
        </Button>
      </div>
    </div>

    <ControlPanel />
  </Drawer.Root>
{/if}

{#if isJournalVisible}
  <SessionJournal
    onSubmit={handleJournalSubmit}
    onDismiss={() => (isJournalVisible = false)}
  />
{/if}
