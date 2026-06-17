<script lang="ts">
  import { onMount, onDestroy, untrack } from 'svelte';
  import { Play, Pause, SkipForward, Maximize2 } from '@lucide/svelte';
  import { toast } from 'svelte-sonner';
  import { timer, MODE_CONFIG } from '$lib/stores/timer.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { analytics } from '$lib/stores/analytics.svelte';
  import { goals } from '$lib/stores/goals.svelte';
  import { tasksStore } from '$lib/stores/tasks.svelte';
  import { sounds } from '$lib/stores/sounds.svelte';
  import { shortcuts } from '$lib/stores/shortcuts.svelte';
  import { ui } from '$lib/stores/ui.svelte';
  import { notifications } from '$lib/services/notifications';
  import FullscreenMode from './FullscreenMode.svelte';
  import SessionJournal from './SessionJournal.svelte';
  import BreakPrompt from './BreakPrompt.svelte';

  let isJournalVisible = $state(false);
  let isBreakPromptVisible = $state(false);
  let previousMode = $state<keyof typeof MODE_CONFIG>('focus');

  let currentTitle = $derived(MODE_CONFIG[timer.state.currentMode].title);
  let activeTask = $derived(tasksStore.tasks.find((t) => t.id === tasksStore.activeTaskId));
  let blockMinutes = $derived(Math.round(timer.totalSeconds / 60));
  let elapsedPct = $derived(
    timer.totalSeconds > 0
      ? Math.min(100, ((timer.totalSeconds - timer.state.remainingSeconds) / timer.totalSeconds) * 100)
      : 0
  );
  let goalTarget = $derived(goals.current.targetSessions);
  let sessionsToday = $derived(analytics.summary.sessionsToday);
  let streak = $derived(analytics.summary.currentStreak);
  let todayMinutes = $derived.by(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Math.round(
      analytics.sessions
        .filter((s) => s.mode === 'focus' && new Date(s.startTime) >= start)
        .reduce((sum, s) => sum + s.durationSeconds, 0) / 60
    );
  });

  function formatTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  // Wire session-complete callback once at component init
  timer.setOnSessionComplete((mode, startTime, endTime, isCompleted) => {
    analytics.recordSession(mode, startTime, endTime, isCompleted);
    if (mode === 'focus' && isCompleted) {
      if (tasksStore.activeTaskId) tasksStore.incrementSession(tasksStore.activeTaskId);
      isJournalVisible = true;
    }
  });

  // Ambient sound — single source of truth. Plays during a running focus session
  // (or while previewing in the Sound panel), gated by the global sound toggle.
  // Reading the selected sound + volume here makes changing them reconcile live.
  $effect(() => {
    const playingForFocus = timer.state.isRunning && timer.state.currentMode === 'focus';
    const active = (playingForFocus || sounds.previewing) && settings.current.hasSound;
    void sounds.current.ambientSoundId;
    void sounds.current.ambientVolume;
    sounds.syncAmbient(active);
  });

  // Mode change: notifications + break prompt (untracked writes; only currentMode tracked)
  $effect(() => {
    const currentMode = timer.state.currentMode;
    untrack(() => {
      if (currentMode === previousMode) return;
      if (settings.current.hasNotification) {
        const completedTitle = MODE_CONFIG[previousMode].title;
        const nextTitle = MODE_CONFIG[currentMode].title;
        toast.success("Time's up", {
          description: `${completedTitle} complete. Up next: ${nextTitle}.`,
          action: { label: `Skip ${nextTitle}`, onClick: () => timer.skip() }
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
      ui.openPanel('settings');
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
      ui.fullscreen = !ui.fullscreen;
    }
  }

  // Ask for notification permission on first start, never on cold load.
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

{#if ui.fullscreen}
  <FullscreenMode onExit={() => (ui.fullscreen = false)} />
{:else}
  <div class="mx-auto flex h-full w-full max-w-5xl flex-col justify-center px-6 sm:px-10">
    <!-- eyebrow -->
    <div class="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
      <span class="text-foreground">{currentTitle}</span>
      <span class="h-px flex-1 bg-border"></span>
      <span class="tabular-nums">
        Session {String(Math.min(sessionsToday + 1, goalTarget)).padStart(2, '0')} / {String(goalTarget).padStart(2, '0')}
      </span>
      <span class="hidden h-px w-12 bg-border sm:block"></span>
      <span class="hidden tabular-nums sm:inline">{blockMinutes} min block</span>
    </div>

    {#if isBreakPromptVisible}
      <div class="mt-6">
        <BreakPrompt mode={timer.state.currentMode} onDismiss={() => (isBreakPromptVisible = false)} />
      </div>
    {/if}

    <!-- giant time -->
    <div
      class="mt-6 font-semibold leading-[0.78] tracking-[-0.045em] tabular-nums select-none"
      style="font-size: clamp(4.5rem, 21vw, 15rem)"
    >
      <span>{timer.formattedTime.minutes}</span><span class="text-muted-foreground/30">:</span><span
        class="text-primary">{timer.formattedTime.seconds}</span
      >
    </div>

    <!-- progress rule -->
    <div class="mt-8 h-[3px] w-full bg-border">
      <div
        class="h-full bg-primary transition-[width] duration-1000 ease-linear"
        style="width: {elapsedPct}%"
      ></div>
    </div>

    <!-- footer: data + transport -->
    <div class="mt-7 flex flex-col gap-6 border-t border-border pt-6 sm:flex-row sm:items-end sm:justify-between">
      <div class="flex flex-wrap gap-x-12 gap-y-4">
        <button onclick={() => ui.openPanel('tasks')} class="group text-left">
          <div class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Now</div>
          <div class="mt-1.5 text-[15px] font-medium text-foreground transition-colors group-hover:text-primary">
            {#if activeTask}
              {activeTask.title}{#if activeTask.focusSessionsSpent > 0}<span class="ml-2 text-muted-foreground">· {activeTask.focusSessionsSpent}🍅</span>{/if}
            {:else}
              <span class="text-muted-foreground">Pick a task →</span>
            {/if}
          </div>
        </button>
        <button onclick={() => ui.openPanel('stats')} class="group text-left">
          <div class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Today</div>
          <div class="mt-1.5 text-[15px] font-medium tabular-nums text-foreground transition-colors group-hover:text-primary">
            {formatTime(todayMinutes)} · {sessionsToday} sessions · {streak}d streak
          </div>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          onclick={() => (ui.fullscreen = true)}
          class="grid size-11 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Enter fullscreen"
          title="Fullscreen (Alt+F)"
        >
          <Maximize2 class="size-4" />
        </button>
        <button
          onclick={() => timer.skip()}
          class="grid size-11 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Skip to next mode"
          title="Skip (Alt+N)"
        >
          <SkipForward class="size-4" />
        </button>
        <button
          onclick={handleToggleTimer}
          class="inline-flex h-11 items-center gap-2 rounded-md bg-foreground px-7 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
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
{/if}

{#if isJournalVisible}
  <SessionJournal onSubmit={handleJournalSubmit} onDismiss={() => (isJournalVisible = false)} />
{/if}
