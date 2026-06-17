<script lang="ts">
  import { shortcuts, SHORTCUT_LABELS } from '$lib/stores/shortcuts.svelte';
  import { Button } from '$lib/components/ui/button';
  import type { ShortcutActionType } from '$lib/types';

  let recordingAction = $state<ShortcutActionType | null>(null);

  function handleStartRecording(action: ShortcutActionType): void {
    recordingAction = action;
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (!recordingAction) return;
    event.preventDefault();
    event.stopPropagation();

    if (event.key === 'Escape') {
      recordingAction = null;
      return;
    }

    shortcuts.updateShortcut(recordingAction, {
      key: event.key,
      hasAlt: event.altKey,
      hasCtrl: event.ctrlKey,
      hasShift: event.shiftKey
    });
    recordingAction = null;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <div class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Keyboard Shortcuts</div>
    <Button variant="ghost" size="sm" onclick={() => shortcuts.reset()}>Reset</Button>
  </div>

  <div class="divide-y divide-border">
    {#each shortcuts.current as shortcut (shortcut.action)}
      <div class="flex items-center justify-between py-3">
        <span class="text-sm text-foreground">{SHORTCUT_LABELS[shortcut.action]}</span>
        <button
          onclick={() => handleStartRecording(shortcut.action)}
          class="min-w-20 rounded-md border px-3 py-1 text-center font-mono text-[11px] transition-colors {recordingAction === shortcut.action
            ? 'animate-pulse border-primary text-primary'
            : 'border-border text-muted-foreground hover:text-foreground'}"
        >
          {recordingAction === shortcut.action ? 'Press key...' : shortcuts.format(shortcut)}
        </button>
      </div>
    {/each}
  </div>

  <p class="font-mono text-[10px] text-muted-foreground">Click a shortcut to reassign. Press Escape to cancel.</p>
</div>
