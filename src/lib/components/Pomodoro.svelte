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
  <title>{timer.formattedTime.minutes}:{timer.formattedTime.seconds} · {currentTitle} | Aestoti</title>
  <link rel="icon" href="/logo-short.png" />
</svelte:head>

{#if isFullscreen}
  <FullscreenMode onExit={() => (isFullscreen = false)} />
{:else}
  <Drawer.Root bind:open={isDrawerOpen}>
    <div class="flex flex-col items-center justify-center h-full gap-5 px-4">
      <DailyGoal />

      {#key timer.state.currentMode}
        <div
          class="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-medium tracking-wide"
          in:receive={{ key: timer.state.currentMode }}
          out:send={{ key: timer.state.currentMode }}
        >
          <ModeIcon class="h-4 w-4 text-primary" />
          <span>{currentTitle}</span>
        </div>
      {/key}

      {#if activeTask}
        <div class="flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-sm text-muted-foreground">
          <span class="h-1.5 w-1.5 rounded-full bg-primary"></span>
          <span>Working on</span>
          <span class="font-semibold text-foreground">{activeTask.title}</span>
          {#if activeTask.focusSessionsSpent > 0}
            <span class="text-xs">🍅 {activeTask.focusSessionsSpent}</span>
          {/if}
        </div>
      {/if}

      {#if isBreakPromptVisible}
        <BreakPrompt
          mode={timer.state.currentMode}
          onDismiss={() => (isBreakPromptVisible = false)}
        />
      {/if}

      <div class="relative my-1 flex items-center justify-center">
        {#if timer.state.isRunning}
          <div class="pointer-events-none absolute h-40 w-40 rounded-full bg-primary/20 blur-3xl motion-safe:animate-pulse"></div>
        {/if}
        <ProgressRing
          remainingSeconds={timer.state.remainingSeconds}
          totalSeconds={timer.totalSeconds}
          size={300}
          strokeWidth={6}
        />
        <div class="absolute flex flex-col items-center">
          <div class="text-7xl font-medium leading-none tracking-tight tabular-nums sm:text-8xl">
            {timer.formattedTime.minutes}:{timer.formattedTime.seconds}
          </div>
          <div class="mt-3 text-[11px] uppercase tracking-[0.3em] text-primary">{currentTitle}</div>
        </div>
      </div>

      <div class="flex items-center gap-2" aria-hidden="true">
        {#each Array.from({ length: settings.current.longBreakInterval }) as _, i}
          <span
            class="h-1.5 w-1.5 rounded-full transition-colors {i < timer.state.focusSessionCount % settings.current.longBreakInterval
              ? 'bg-primary'
              : 'bg-border'}"
          ></span>
        {/each}
      </div>

      <div class="mt-1 flex items-center gap-3">
        <button
          onclick={() => (isFullscreen = true)}
          class="grid h-12 w-12 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Enter fullscreen"
          title="Fullscreen (Alt+F)"
        >
          <RiFullscreenFill class="h-5 w-5" />
        </button>
        <button
          onclick={handleToggleTimer}
          class="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-105 motion-safe:hover:scale-105"
          aria-label={timer.state.isRunning ? 'Pause timer' : 'Start timer'}
        >
          <PlayPauseIcon class="h-7 w-7" />
        </button>
        <button
          onclick={() => timer.skip()}
          class="grid h-12 w-12 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Skip to next mode"
          title="Skip (Alt+N)"
        >
          <RiSkipForwardFill class="h-5 w-5" />
        </button>
        <button
          onclick={() => (isDrawerOpen = true)}
          class="grid h-12 w-12 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Open control panel"
          title="Settings (Alt+S)"
        >
          <RiMoreFill class="h-5 w-5" />
        </button>
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
