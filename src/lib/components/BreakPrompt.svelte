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

  let prompt = $state(pickPrompt(mode));
</script>

<div class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted/60 border border-muted max-w-sm">
  <span class="text-2xl">{prompt.emoji}</span>
  <p class="text-sm font-medium flex-1">{prompt.text}</p>
  <button
    onclick={onDismiss}
    class="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
  >
    ✕
  </button>
</div>
