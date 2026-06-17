<script lang="ts">
  import { onMount } from 'svelte';

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

<div class="fixed bottom-0 inset-x-0 z-40 p-4 bg-background/95 backdrop-blur border-t shadow-lg">
  <div class="max-w-md mx-auto space-y-3">
    <div class="flex items-center justify-between">
      <p class="text-sm font-medium">What did you get done?</p>
      <span class="text-xs text-muted-foreground">Auto-dismiss in {countdown}s</span>
    </div>
    <div class="flex gap-2">
      <input
        bind:this={inputEl}
        bind:value={note}
        onkeydown={handleKeydown}
        type="text"
        placeholder="One line summary..."
        class="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <button
        onclick={handleSubmit}
        class="px-4 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Save
      </button>
      <button
        onclick={onDismiss}
        class="px-3 h-9 rounded-md border text-sm hover:bg-muted transition-colors"
      >
        Skip
      </button>
    </div>
  </div>
</div>
