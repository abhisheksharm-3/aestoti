<script lang="ts">
  import { untrack } from 'svelte';
  import { X } from '@lucide/svelte';
  import type { PomodoroModeType } from '$lib/types';

  let {
    mode,
    onDismiss
  }: {
    mode: PomodoroModeType;
    onDismiss: () => void;
  } = $props();

  const SHORT_BREAK_PROMPTS = [
    'Take three slow breaths',
    'Drink a glass of water',
    'Look 20 feet away for 20 seconds',
    'Stretch your neck and shoulders'
  ];

  const LONG_BREAK_PROMPTS = [
    'Take a short walk',
    'Grab a healthy snack',
    'Step outside for fresh air',
    'Rest your eyes — no screens'
  ];

  /** Pick a random rest suggestion for the given break mode. */
  function pickPrompt(m: PomodoroModeType): string {
    const list = m === 'longBreak' ? LONG_BREAK_PROMPTS : SHORT_BREAK_PROMPTS;
    return list[Math.floor(Math.random() * list.length)];
  }

  /**
   * Pick a fresh prompt once per mode change. A $derived would be impure
   * (Math.random re-rolls on unrelated invalidations), so an effect keyed on
   * `mode` is used; the initializer reads `mode` untracked since the effect owns
   * later updates.
   */
  let prompt = $state(untrack(() => pickPrompt(mode)));
  $effect(() => {
    prompt = pickPrompt(mode);
  });
</script>

<div class="flex items-center gap-4 border-y border-border py-3">
  <span class="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">A moment</span>
  <p class="flex-1 text-sm text-foreground">{prompt}</p>
  <button
    onclick={onDismiss}
    aria-label="Dismiss break suggestion"
    class="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
  >
    <X class="size-4" />
  </button>
</div>
