<script lang="ts">
  import type { PomodoroModeType } from '$lib/types';

  let {
    mode,
    onDismiss
  }: {
    mode: PomodoroModeType;
    onDismiss: () => void;
  } = $props();

  const SHORT_BREAK_PROMPTS = [
    { emoji: '🧘', text: 'Take 3 deep breaths' },
    { emoji: '💧', text: 'Drink a glass of water' },
    { emoji: '👀', text: 'Look 20 feet away for 20 seconds' },
    { emoji: '🤸', text: 'Stretch your neck and shoulders' }
  ];

  const LONG_BREAK_PROMPTS = [
    { emoji: '🚶', text: 'Take a short walk' },
    { emoji: '🍎', text: 'Grab a healthy snack' },
    { emoji: '🌿', text: 'Step outside for fresh air' },
    { emoji: '😴', text: 'Rest your eyes — no screens' }
  ];

  function pickPrompt(m: PomodoroModeType): { emoji: string; text: string } {
    const list = m === 'longBreak' ? LONG_BREAK_PROMPTS : SHORT_BREAK_PROMPTS;
    return list[Math.floor(Math.random() * list.length)];
  }

  let prompt = $derived(pickPrompt(mode));
</script>

<div class="flex items-center gap-3 rounded-md border border-border bg-secondary/50 px-4 py-3 max-w-sm">
  <span class="text-base leading-none">{prompt.emoji}</span>
  <p class="flex-1 text-sm text-foreground">{prompt.text}</p>
  <button
    onclick={onDismiss}
    aria-label="Dismiss"
    class="shrink-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
  >
    ✕
  </button>
</div>
