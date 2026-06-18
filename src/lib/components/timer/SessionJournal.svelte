<script lang="ts">
  import { onMount } from 'svelte';
  import { trapFocus } from '$lib/actions/focus-trap';

  let {
    onSubmit,
    onDismiss
  }: {
    onSubmit: (note: string) => void;
    onDismiss: () => void;
  } = $props();

  let note = $state('');
  let inputEl = $state<HTMLInputElement | undefined>(undefined);
  let countdown = $state(10);

  function handleSubmit(): void {
    onSubmit(note.trim());
    note = '';
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') handleSubmit();
    if (event.key === 'Escape') onDismiss();
  }

  onMount(() => {
    inputEl?.focus();
    const id = window.setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        clearInterval(id);
        onDismiss();
      }
    }, 1000);
    return () => clearInterval(id);
  });
</script>

<div
  class="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur px-6 py-4"
  role="dialog"
  aria-modal="true"
  tabindex="-1"
  aria-label="Save a note for the session you just finished"
  use:trapFocus
>
  <div class="mx-auto max-w-md space-y-3">
    <div class="flex items-center justify-between">
      <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Session Note</span>
      <span class="font-mono text-[10px] tabular-nums text-muted-foreground">Auto-dismiss in {countdown}s</span>
    </div>
    <div class="flex gap-2">
      <input
        bind:this={inputEl}
        bind:value={note}
        onkeydown={handleKeydown}
        type="text"
        placeholder="One line summary..."
        aria-label="Session note"
        class="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <button
        onclick={handleSubmit}
        class="h-9 rounded-md bg-foreground px-4 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
      >
        Save
      </button>
      <button
        onclick={onDismiss}
        class="h-9 rounded-md border border-border px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Skip
      </button>
    </div>
  </div>
</div>
